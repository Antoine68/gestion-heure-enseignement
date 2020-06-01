let Formation = require('../models/Formation');
let Project = require('../models/Project');
let Decomposition = require('../models/Decomposition');
let BuildingElement = require('../models/BuildingElement');
let {PedagogicalElement, PedagogicalPeriod} = require('../models/PedagogicalElement');
let { validationResult } = require('express-validator');



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
                    input_type: "aucun",
                    buildingElement: root,
                });
                rootPedagogicalElement.save(function(){
                    root.getChildrenTree(function(err, tree){
                        for(let i=0; i<tree.length; i++){
                            let period = tree[i];
                            pedagogicalPeriod = new PedagogicalPeriod({
                                buildingElement: period._id,
                                order: period.order,
                                project: idProject,
                                input_type: "aucun",
                                week: 1,
                                forfait : {
                                    TP: 0,
                                    TD: 0,
                                    CM: 0,
                                    PARTIEL: 0
                                },
                                number_groups : {
                                    TP: 1,
                                    TD: 1,
                                    CM: 1,
                                    PARTIEL: 1
                                },
                                courses_types: {
                                    TP: true,
                                    TD: true,
                                    CM: true,
                                    PARTIEL: true
                                }
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
        input_type: "aucun",
        forfait : {
            TP: 0,
            TD: 0,
            CM: 0,
            PARTIEL: 0
        },
        number_groups : {
            TP: 1,
            TD: 1,
            CM: 1,
            PARTIEL: 1
        },
        courses_types: {
            TP: true,
            TD: true,
            CM: true,
            PARTIEL: true
        }
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
        root.getChildren(true, function(err, childrens) {
            for(let i=0; i<childrens.length; i++){
                childrens[i].remove();
            }
        });
        root.remove();
        formation.remove();
        res.redirect('/projets');
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
            speakers[i].totals = totalsTeacher;
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
                    title: "Formation "+ formation.name + " - Ajouter une période",
                    type: "period",
                    action: "/formation/" + formation._id + "/periode/store",
                    formation: formation,
                    parent: parent
                });
            }else{
                formation.element.getChildren({input_type: "aucun"}, {}, {populate:'buildingElement'}, true, function(err, elements){
                    res.render("formation/add_element",{
                        title: "Formation "+ formation.name + " - Ajouter un élément",
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
            forfait : {
                TP: 0,
                TD: 0,
                CM: 0,
                PARTIEL: 0
            },
            number_groups : {
                TP: req.body.tp_groups,
                TD: req.body.td_groups,
                CM: req.body.cm_groups,
                PARTIEL: req.body.partiel_groups
            },
            courses_types: {
                TP: true,
                TD: true,
                CM: true,
                PARTIEL: true
            }
        });
        element.parent = req.body.parent;
        if(req.body.input_type === "hebdomadaire") {
            element.courses_types = {
                TP: typeof req.body.courses_types !== "undefinded" && req.body.courses_types.includes("TP") ,
                TD: typeof req.body.courses_types !== "undefinded" && req.body.courses_types.includes("TD") ,
                CM: typeof req.body.courses_types !== "undefinded" && req.body.courses_types.includes("CM") ,
                PARTIEL: typeof req.body.courses_types !== "undefinded" && req.body.courses_types.includes("PARTIEL") 
            }

        }else if(req.body.input_type === "global") {
            element.courses_types = {
                TP: typeof req.body.courses_types !== "undefinded" && req.body.courses_types.includes("TP") ,
                TD: typeof req.body.courses_types !== "undefinded" && req.body.courses_types.includes("TD") ,
                CM: typeof req.body.courses_types !== "undefinded" && req.body.courses_types.includes("CM") ,
                PARTIEL: typeof req.body.courses_types !== "undefinded" && req.body.courses_types.includes("PARTIEL") 
            };
            element.forfait = {
                TP: req.body.tp_forfait,
                TD: req.body.td_forfait,
                CM: req.body.cm_forfait,
                PARTIEL: req.body.partiel_forfait
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
        let period = new PedagogicalPeriod({
            title: req.body.title,
            nickname: req.body.nickname,
            reference: req.body.reference,
            order: req.body.order,
            project: formation.project,
            input_type: "aucun",
            week: req.body.week,
            forfait : {
                TP: 0,
                TD: 0,
                CM: 0,
                PARTIEL: 0
            },
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
            courses_types: {
                TP: true,
                TD: true,
                CM: true,
                PARTIEL: true
            }
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
                let title = "Formation "+ formation.name + " - Modifier un élément";
                let type = "element";
                if(element.__t === "PedagogicalPeriod"){
                    title = "Formation "+ formation.name + " - Modifier une période";
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

exports.formEditElemet = (req, res) => {
    let id = req.params.id;
    let idElement = req.params.idElement;
    Formation.findOne({_id: id}).then(formation => {
        PedagogicalElement.findOne({_id: idElement}).populate("buildingElement").then(element => {
            let updateElement = {

            }




            let title = "Formation "+ formation.name + " - Modifier un élément";
            let type = "element";
            if(element.__t === "PedagogicalPeriod"){
                title = "Formation "+ formation.name + " - Modifier une période";
                type = "period";
            }
            res.render("formation/edit_element",{
                title: title,
                type: type,
                formation: formation,
                action: "/formation/" + formation._id + "/element/"+ element._id + "/edit",
                element: element
            });
        })
    })
}