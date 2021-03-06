let Formation = require('../models/Formation');
let Project = require('../models/Project');
let Decomposition = require('../models/Decomposition');
let BuildingElement = require('../models/BuildingElement');
let PedagogicalElement = require('../models/PedagogicalElement');
let { validationResult } = require('express-validator');
let {Volume, WeeklyVolume, GlobalVolume} = require('../models/Volume');
let GroupTeacher = require('../models/GroupTeacher');



exports.formAdd = (req, res) => {
    let idProject = req.params.idProject;
    Project.findOne({_id: idProject}).then(project => {
        Decomposition.find({}).then(decompositions => {
            res.render("formation/add_edit", { 
                title: "Projet "+ project.title + " - Ajouter une formation",
                decompositions: decompositions,
                action: "/projets/"+ project._id + "/formation/store"
            });
        });
    });
}

exports.formEdit = (req, res) => {
    let id = req.params.id;
    let idProject = req.params.idProject;
    Project.findOne({_id: idProject}).then(project => {
        Formation.findOne({_id: id, project: project._id}).then(formation => {
            res.render("formation/add_edit", { 
                title: "Projet "+ project.title + " - Modifier une formation",
                formation: formation,
                action: "/projets/"+ project._id + "/formation/edit/"+formation._id
            });
        })
    })
    
}

exports.store = (req, res) => {
    let idProject = req.params.idProject;
    Project.findOne({_id: idProject}).then(project => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            Decomposition.find({}).then(decompositions => {
                return res.status(422).render("formation/add_edit", { 
                    title: "Projet "+ project.title + " - Modifier une formation",
                    action: "/projets/"+ project._id + "/formation/store",
                    errors: errors.array(), 
                    old: req.body,
                    decompositions: decompositions,
                });
            });
        }else {
            let formation = new Formation({
                name: req.body.name,
                nickname: req.body.nickname,
                project: idProject
            });
            Decomposition.findOne({_id: req.body.decomposition}).populate("element").then(decomposition => {
                let root = decomposition.element;
                rootPedagogicalElement = new PedagogicalElement({
                    formation : formation,
                    project: idProject,
                    buildingElement: root,
                });
                rootPedagogicalElement.save(function(){
                    root.getChildrenTree(function(err, tree){
                        for(let i=0; i<tree.length; i++){
                            let period = tree[i];
                            pedagogicalPeriod = new PedagogicalElement({
                                __t: "PedagogicalPeriod",
                                buildingElement: period._id,
                                order: period.order,
                                project: idProject,
                                week: 1,
                            });
                            pedagogicalPeriod.parent = rootPedagogicalElement;
                            let promise = pedagogicalPeriod.save();
                            promise.then(function(pedagogicalElement) {
                                for(let j=0; j<period.children.length; j++){
                                    copyBuildingElement(pedagogicalElement, period.children[j]);
                                }
                            })
                        }
                    });
                });         
            });
            formation.save(function (error) {
                if (error) {res.status(404).json({error})}
                res.redirect('/projets');
            });

        }
        
    })    
}

function copyBuildingElement(parent, buildingElement){
    pedagogicalElement = new PedagogicalElement({
        buildingElement: buildingElement._id,
        order: buildingElement.order,
        project: parent.project,
    });
    pedagogicalElement.parent = parent;
    let promise = pedagogicalElement.save();
    promise.then(function(pedagogicalElement) {
        for(let j=0; j< buildingElement.children.length; j++){
            copyBuildingElement(pedagogicalElement, buildingElement.children[j]);
        }
    })
}

exports.edit = (req, res) => {
    let id = req.params.id;
    let idProject = req.params.idProject;
    Project.findOne({_id: idProject}).then(project => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render("formation/add_edit", { 
                title: "Projet "+ project.title + " - Modifier une formation",
                action: "/projets/"+ project._id + "/formation/edit/"+id,
                errors: errors.array(), 
                old: req.body
            });
        }
        Formation.updateOne({ _id: id, project: project._id }, {
            name:  req.body.name,
            nickname: req.body.nickname,
        })
            .then(() => res.redirect('/projets'))
            .catch(error => res.status(400).json({ error }));
    })
    
}

exports.delete = (req, res, next) => {
    let id = req.params.id;
    Formation.findOne({ _id : id}).populate("element")
    .then(formation => {
        let root = formation.element;
        root.getChildren({},{},{populate:"volumes groups_teachers"}, true, async function(err, childrens) {
            for(let i=0; i<childrens.length; i++) {
                for(let j=0; j<childrens[i].volumes.length; j++) {
                    await childrens[i].volumes[j].remove();
                }
                for(let j=0; j<childrens[i].groups_teachers.length; j++) {
                    await childrens[i].groups_teachers[j].remove();
                }
                await childrens[i].remove();
            }
            await root.remove();
            await formation.remove();
            res.redirect('/projets');
        });
    })
    .catch(error => res.status(404).json({error}));    
}


exports.renderPage = (req, res, next) => {
    let id = req.params.id;
    let idProject = req.params.idProject;
    Project.findOne({_id: idProject}).then(project => {
        Formation.findOne({_id: id, project: project._id}).then(formation => {
            res.render("formation/view_one",{
                title: "Projet "+ project.title + " - Formation "+ formation.name,
                formation: formation
            });
        })
    })
}

exports.listElements = (req, res) => {
    let id = req.params.id;
    Formation.findOne({_id: id}).populate({path: "element", populate: {path :"buildingElement", model: "BuildingElement"}}).then(formation => {
        let root = formation.element;         
        root.getChildrenTree({options:{populate:{path:'buildingElement volumes groups_teachers interventions', populate: { path: 'teacher' }}}},function(err, tree){
            for(let i=0; i<tree.length; i++){
                calculateWeeklyTotal(tree[i], tree[i].week);
            }
            res.json({
                root: root,
                tree: tree
            });
        })
    })
}

function calculateWeeklyTotal(element, week){
    if(element.input_type === "hebdomadaire"){
        if(typeof element.totalsBySpeaker === "undefined"){
            element.totalsBySpeaker = [];
        }
        let totals = {};
        for(key in element.courses_types) {
            totals[key] = 0;
            if(element.courses_types[key]) {
                for(let i=1; i<=week; i++){
                    let volume = element.volumes.find(v => v.week === i);
                    if(typeof volume !== "undefined" && volume.hour[key] !== null){
                        totals[key] += volume.hour[key];
                    }
                }
            }
        }
        element.totals = totals;
        let speakers = element.interventions;
        for(let i=0; i<speakers.length; i++){
            let totalsTeacher = {};
            for(key in element.courses_types) {
                totalsTeacher[key] = 0;
                if(element.courses_types[key]) {
                    for(let j=1; j<=week; j++){
                        let group = element.groups_teachers.find(g => (g.week === j && g.speaker.toString() === speakers[i]._id.toString()));
                        let volume = element.volumes.find(v => v.week === j);
                        if(typeof group !== "undefined" && group.group_number[key] !== null){
                            if(typeof volume !== "undefined" && volume.hour[key] !== null){
                                totalsTeacher[key] += group.group_number[key] * volume.hour[key];
                            }
                        }
                    }
                }
            }
            element.totalsBySpeaker.push({speaker: speakers[i], totals: totalsTeacher});
        }
        
    }
    for(let i=0; i<element.children.length; i++){
        calculateWeeklyTotal(element.children[i], week);
    }
}

exports.formAddElement = (req, res) => {
    let id = req.params.id;
    let idParent = req.params.idParent;
    Formation.findOne({_id: id}).populate("element").then(formation => {
        PedagogicalElement.findOne({_id: idParent, input_type: "aucun"}).then(parent => {
            if(parent.level === 1){
                res.render("formation/add_element",{
                    title: "Formation "+ formation.name + " - Ajouter une p??riode",
                    type: "period",
                    action: "/formation/" + formation._id + "/periode/store",
                    formation: formation,
                    parent: parent
                });
            }else{
                formation.element.getChildren({input_type: "aucun"}, {}, {populate:'buildingElement'}, true, function(err, elements){
                    res.render("formation/add_element",{
                        title: "Formation "+ formation.name + " - Ajouter un ??l??ment",
                        type: "element",
                        action: "/formation/" + formation._id + "/element/store",
                        elements: elements,
                        parent: parent,
                        formation: formation
                    });
                })
            }

        })
    })
}

exports.storeElement = (req, res) => {
    let id = req.params.id;
    Formation.findOne({_id: id}).then(formation => {
        let element = new PedagogicalElement({
            title: req.body.title,
            nickname: req.body.nickname,
            reference: req.body.reference,
            order: req.body.order,
            project: formation.project,
            input_type: req.body.input_type,
            hour_volume: {
                TP: req.body.tp_hour,
                TD: req.body.td_hour,
                CM: req.body.cm_hour,
            },
            number_groups : {
                TP: req.body.tp_groups,
                TD: req.body.td_groups,
                CM: req.body.cm_groups,
                PARTIEL: req.body.partiel_groups
            },
        });
        element.parent = req.body.parent;
        if(req.body.input_type !== "aucun") {
            element.courses_types = {
                TP: typeof req.body.courses_types !== "undefined" && req.body.courses_types.includes("TP") ,
                TD: typeof req.body.courses_types !== "undefined" && req.body.courses_types.includes("TD") ,
                CM: typeof req.body.courses_types !== "undefined" && req.body.courses_types.includes("CM") ,
                PARTIEL: typeof req.body.courses_types !== "undefined" && req.body.courses_types.includes("PARTIEL") 
            }

        }
        if(req.body.input_type === "global") {
            element.forfait = {
                TP: req.body.tp_forfait || 0,
                TD: req.body.td_forfait || 0,
                CM: req.body.cm_forfait || 0,
                PARTIEL: req.body.partiel_forfait || 0
            };
        }
        element.save(function(error){
            if (error) {res.status(404).json({error})}
            res.redirect('/projets/'+ formation.project + '/formation/render/'+ formation._id);
        });
    });
}

exports.storePeriod = (req, res) => {
    let id = req.params.id;
    Formation.findOne({_id: id}).populate("element").then(formation => {
        let period = new PedagogicalElement({
            __t: "PedagogicalPeriod",
            title: req.body.title,
            nickname: req.body.nickname,
            reference: req.body.reference,
            order: req.body.order,
            project: formation.project,
            week: req.body.week,
            hour_volume: {
                TP: req.body.tp_hour,
                TD: req.body.td_hour,
                CM: req.body.cm_hour,
            },
            number_groups : {
                TP: req.body.tp_groups,
                TD: req.body.td_groups,
                CM: req.body.cm_groups,
                PARTIEL: req.body.partiel_groups
            },
        });
        period.parent = formation.element;
        period.save(function(error){
            if (error) {res.status(404).json({error})}
            res.redirect('/projets/'+ formation.project + '/formation/render/'+ formation._id);
        });
    });
}

exports.formEditElement = (req, res) => {
    let id = req.params.id;
    let idElement = req.params.idElement;
    Formation.findOne({_id: id}).then(formation => {
        PedagogicalElement.findOne({_id: idElement}).populate("buildingElement").then(element => {
            element.getChildren(function(err,childrens){
                let title = "Formation "+ formation.name + " - Modifier un ??l??ment";
                let type = "element";
                if(element.__t === "PedagogicalPeriod"){
                    title = "Formation "+ formation.name + " - Modifier une p??riode";
                    type = "period";
                }
                return res.render("formation/edit_element",{
                    title: title,
                    type: type,
                    childrens: childrens,
                    formation: formation,
                    action: "/formation/" + formation._id + "/element/"+ element._id + "/edit",
                    element: element
                });
            })
        })
    })
}

exports.editElement = (req, res) => {
    let id = req.params.id;
    let idElement = req.params.idElement;
    Formation.findOne({_id: id}).then(formation => {
        PedagogicalElement.findOne({_id: idElement}).populate("buildingElement").then(element => {
            let updateElement = {
                title: req.body.title || undefined,
                nickname: req.body.nickname || undefined,
                reference: req.body.reference || undefined,
                order: req.body.order,
                input_type: req.body.input_type,
                hour_volume: {
                    TP: req.body.tp_hour,
                    TD: req.body.td_hour,
                    CM: req.body.cm_hour,
                },
                forfait : {
                    TP: req.body.tp_forfait || 0,
                    TD: req.body.td_forfait || 0,
                    CM: req.body.cm_forfait || 0,
                    PARTIEL: req.body.partiel_forfait || 0
                },
                number_groups : {
                    TP: (typeof req.body.courses_types !== "undefined" && req.body.courses_types.includes("TP")) ? req.body.tp_groups : 0,
                    TD: (typeof req.body.courses_types !== "undefined" && req.body.courses_types.includes("TD")) ? req.body.td_groups : 0,
                    CM: (typeof req.body.courses_types !== "undefined" && req.body.courses_types.includes("CM")) ? req.body.cm_groups : 0,
                    PARTIEL: (typeof req.body.courses_types !== "undefined" && req.body.courses_types.includes("PARTIEL")) ? req.body.partiel_groups : 0
                },
                courses_types: {
                    TP: typeof req.body.courses_types !== "undefined" && req.body.courses_types.includes("TP") ,
                    TD: typeof req.body.courses_types !== "undefined" && req.body.courses_types.includes("TD") ,
                    CM: typeof req.body.courses_types !== "undefined" && req.body.courses_types.includes("CM") ,
                    PARTIEL: typeof req.body.courses_types !== "undefined" && req.body.courses_types.includes("PARTIEL") 
                }
            }
            if(element.input_type !== req.body.input_type){
                Volume.deleteMany({pedagogical_element: element._id}, function (err, result) {
                    GroupTeacher.deleteMany({pedagogical_element: element._id},function(err, result){})
                })   
            }
            if(element.__t === "PedagogicalPeriod"){
                updateElement.week = req.body.week;
                if(req.body.week < element.week){
                    let diff = element.week - req.body.week;
                    element.getChildren({input_type: "hebdomadaire"}, {}, {}, true, function(err, childrens){
                        for(let i=0; i<childrens.length; i++){
                            for(let j=element.week; j>element.week-diff; j--){
                                WeeklyVolume.deleteMany({week: j, pedagogical_element: childrens[i]._id}, function (err, result) {
                                    GroupTeacher.deleteMany({week: j, pedagogical_element: childrens[i]._id},function(err, result){})
                                }) 
                            }
                        }
                    });
                }
            }
            element.update(updateElement, function(error){
                if (error) {res.status(404).json({error})}
                res.redirect('/projets/'+ formation.project + '/formation/render/'+ formation._id);
            })
        })
    })
}