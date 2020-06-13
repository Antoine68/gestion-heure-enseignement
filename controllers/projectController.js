let { validationResult } = require('express-validator');
let Project = require('../models/Project');
let Formation = require('../models/Formation');
let Teacher = require('../models/Teacher');
let Status = require('../models/Status');
let Speaker = require('../models/Speaker');
let PedagogicalElement = require('../models/PedagogicalElement');
let {Volume, WeeklyVolume, GlobalVolume} = require('../models/Volume');
let GroupTeacher = require('../models/GroupTeacher');
let Promise = require('bluebird');
let mongoose = require('mongoose');



exports.renderPage = (req, res) => {
    Project.find({archived: false}).populate('formations').sort([['start_year', -1]]).then(projects => {
        res.render("project/index", { "title": "Projets", projects: projects });
    });
}

exports.renderPageArchive = (req, res) => {
    Project.find({archived: true}).populate('formations').sort([['start_date', -1]]).then(projects => {
        res.render("project/archive", { "title": "Projets archivés", projects: projects });
    });
}

exports.renderPageSpeakers = (req, res) =>{
    let id = req.params.id;
    Project.findOne({_id: id}).then(project => {
        res.render("project/speaker", { 
            "title": "Projet: "+ project.title +" - Intervenants",
            project: project,
        });
    });
}

exports.renderPageBilan = (req, res) => {
    let id = req.params.id;
    Project.findOne({_id:id, archived: false}).then(project => {
        res.render("project/bilan", { "title": "Bilan récapitulatif: " + project.title, project: project });
    });
}

exports.calculateBilan = (req, res) => {
    let id = req.params.id;
    Project.findOne({_id:id, archived: false}).then(project => {
        let bilan = [];
        let speakerCounter = 0;
        Speaker.find({project: project._id}).populate({path: "teacher", populate: "status"}).then(speakers => {
            speakers.forEach(function(speaker, index, array){
                let elementCounter = 0;
                let dataSpeaker = {};
                dataSpeaker['speaker'] = speaker;
                dataSpeaker['global'] = {TP:0, TD:0 , CM:0, PARTIEL:0, HSUPP:0, HETD:0};
                PedagogicalElement.find({ project: project._id, interventions: { $in : speaker._id}, input_type: {$ne: "aucun"}}).populate("volumes groups_teachers interventions").then(elements => {
                    elements.forEach(function(element){
                        if(element.input_type === "hebdomadaire"){
                            for(let i=0; i<element.volumes.length; i++){
                                let volume = element.volumes[i];
                                let groupsTeachersForVolume = element.groups_teachers.find(g => g.week === volume.week && g.speaker.toString() === speaker._id.toString());
                                for(key in element.courses_types.toObject()){
                                    if(typeof groupsTeachersForVolume !== "undefined" ){
                                        let v = volume.hour[key];
                                        let g = groupsTeachersForVolume.group_number[key];
                                        if(v !== null && g !== null){
                                            dataSpeaker['global'][key] += v * g;
                                        }
                                    }
                                }
                            }
                        }else if(element.input_type === "global") {
                            let speakerVolume = element.volumes.find(v => v.speaker.toString() === speaker._id.toString());
                            if(typeof speakerVolume !== "undefined") {
                                for(let key in element.courses_types.toObject()){
                                    if(key){
                                        let v = speakerVolume.volume[key];
                                        let f = element.forfait[key];
                                        if(v !== null && f !== null){
                                            dataSpeaker['global'][key] += v * f;
                                        }
                                    }
                                }
                            }
                        }
                        elementCounter++;
                        if(elementCounter === elements.length){
                            if(speaker.teacher.status.algorithm === 1) {
                                calculateAlgorithm1(dataSpeaker);
                            } else if(speaker.teacher.status.algorithm === 2) {
                                calculateAlgorithm2(dataSpeaker);
                            }
                            speakerCounter++;
                        }
                    })
                    if(elements.length === 0){
                        if(speaker.teacher.status.algorithm === 1) {
                            calculateAlgorithm1(dataSpeaker);
                        } else if(speaker.teacher.status.algorithm === 2) {
                            calculateAlgorithm2(dataSpeaker);
                        }
                        speakerCounter++;
                    }
                    bilan.push(dataSpeaker);
                    if(speakerCounter === speakers.length) {
                        res.status(200).json({
                            bilan: bilan,
                        })
                    }
                    
                })
            })
        });
    });

}

function calculateAlgorithm1(dataSpeaker){
    let htot = (1.5 * dataSpeaker['global'].CM) + dataSpeaker['global'].TP + (dataSpeaker['global'].TD + dataSpeaker['global'].PARTIEL);
    dataSpeaker['global'].HETD = htot;
    let display = "success";
    if(htot < dataSpeaker.speaker.min_mandatory_hour) {
        display = "warning";
    } else if(htot > dataSpeaker.speaker.max_mandatory_hour){
        let hsupp = htot - dataSpeaker.speaker.min_mandatory_hour;
        dataSpeaker['global'].HSUPP = hsupp;
        if(hsupp < dataSpeaker.speaker.min_additional_hour){
            display = "warning";
        }else if(hsupp > dataSpeaker.speaker.max_additional_hour) {
            display = "danger";
        }
    }
    dataSpeaker['global']['display'] = display;
    
}

function calculateAlgorithm2(dataSpeaker){
    let htot = (1.5 * dataSpeaker['global'].CM) + dataSpeaker['global'].TP + (dataSpeaker['global'].TD + dataSpeaker['global'].PARTIEL);
    dataSpeaker['global'].HETD = htot;
    let display = "success";
    if(htot < dataSpeaker.speaker.min_mandatory_hour) {
        display = "warning";
    } else if(htot > dataSpeaker.speaker.max_mandatory_hour){
        let hmod = (1.5 * dataSpeaker['global'].CM) + dataSpeaker['global'].TD + (dataSpeaker['global'].TP/1.5);
        let ratio = 1.0 - (dataSpeaker.speaker.max_mandatory_hour/htot);
        let hsupp = hmod * ratio;
        dataSpeaker['global'].HSUPP = hsupp;
        if(hsupp < dataSpeaker.speaker.min_additional_hour){
            display = "warning";
        }else if(hsupp > dataSpeaker.speaker.max_additional_hour) {
            display = "danger";
        }
    }
    dataSpeaker['global']['display'] = display;
}


exports.formAdd = (req, res, next) => {
    Project.find({}).then(projects => {
        res.render("project/add_edit", {
            title: "Ajouter un projet",
            action: "/projets/store",
            duplicateProjects: projects,
        });
    })
    
}

exports.formEdit = (req, res, next) => {
    let id = req.params.id;
    Project.findOne({_id: id})
        .then(project => res.render("project/add_edit", {
            title: "Modifier un projet",
            action: "/projets/edit/"+id,
            project: project
        }))
        .catch(error => res.status(404).json({error}));    
}

exports.store = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        Project.find({}).then(projects => {
            res.status(422).render("project/add_edit", {
                title: "Ajouter un projet",
                action: "/projets/store",
                duplicateProjects: projects,
                errors: errors.array(), 
                old: req.body
            });
        })
    }else {
        let newProject = new Project({
            title:  req.body.title,
            start_year: req.body.start_year,
            end_year: req.body.end_year,
        });
        newProject.save(function (error) {
            if (error) {res.status(404).json({error})}
            if(req.body.duplicate_project !== "null"){
                let duplicate_groups = false;
                if(typeof req.body.duplicate_groups !== "undefined") {
                    duplicate_groups = true;
                }
                Project.findOne({_id: req.body.duplicate_project}).populate({path: "speakers formations", populate: { path: 'element' }}).then(project => {
                    duplicateSpeakers(project.speakers, newProject).then(newSpeakers => {
                        duplicateFormations(project.formations, newSpeakers, newProject, duplicate_groups).then(res.redirect('/projets'));
                    })
                        
                })
            } else{
                res.redirect('/projets');
            }
        });
    }
   
}

async function duplicateSpeakers(speakers, newProject) {
    let newSpeakers = [];
    for (let speaker of speakers) {
        let newSpeaker = speaker;
        newSpeaker._id = mongoose.Types.ObjectId();
        newSpeaker.isNew = true;
        newSpeaker.project = newProject._id;
        await newSpeaker.save(function() {
            newSpeakers.push(newSpeaker);
        });
    }
    return newSpeakers;
}

async function duplicateFormations(formations, newSpeakers, newProject, duplicate_groups) {
    for (let formation of formations) {
        let newFormation = formation;
        newFormation._id = mongoose.Types.ObjectId();
        newFormation.isNew = true;
        newFormation.project = newProject._id;
        await newFormation.save(async function() {
            let root = formation.element;
            await root.getChildrenTree({options:{populate:{path:'volumes groups_teachers interventions', populate: { path: 'teacher' }}}}, async function(err, periods){
                let newRoot = formation.element;
                newRoot._id = mongoose.Types.ObjectId();
                newRoot.isNew = true;
                newRoot.formation = newFormation._id;
                await newRoot.save(async function() {
                    for(let period of periods){
                        await duplicateElement(period, newRoot, newSpeakers, newProject, duplicate_groups);
                    }
                })
            })
        });
    }
}

async function duplicateElement(element, newParent, newSpeakers, newProject, duplicate_groups) {
    let newElement = new PedagogicalElement({
        title: element.title,
        nickname: element.nickname,
        reference: element.reference,
        buildingElement:  element.buildingElement,
        __t: element.__t,
        week: element.week,
        forfait: element.forfait,
        courses_types: element.courses_types,
        input_type: element.input_type,
        order: element.order, 
        project: newProject._id
    });
    newElement.parent = newParent._id;
    await newElement.save(async function(){
        for(let intervention of element.interventions) {
            let i = newSpeakers.find(s => s.teacher.toString() === intervention.teacher._id.toString());
            if(typeof i !== "undefined") {
                newElement.interventions.push(i._id);
                await newElement.save();
            }
        }
        if(newElement.input_type === "hebdomadaire") {
            await WeeklyVolume.find({pedagogical_element: element._id}).then(async (weeklyVolumes) => {
                for(let volume of weeklyVolumes) {
                    let newVolume = volume;
                    newVolume._id = mongoose.Types.ObjectId();
                    newVolume.isNew = true;
                    newVolume.pedagogical_element = newElement._id;
                    await newVolume.save();
                }
            })
            if(duplicate_groups) {
                await GroupTeacher.find({pedagogical_element: element._id}).populate("speaker").then(async (groups) => {
                    for(let group of groups) {
                        let s = newSpeakers.find(s => group.speaker.teacher.toString() === s.teacher._id.toString());
                        if(typeof s !== "undefined") {
                            let newGroup = group;
                            newGroup._id = mongoose.Types.ObjectId();
                            newGroup.isNew = true;
                            newGroup.pedagogical_element = newElement._id;
                            newGroup.speaker = s._id;
                            await newGroup.save();
                        }
                    }
                })
            }
        }
        for(let children of element.children) {
            await duplicateElement(children, newElement, newSpeakers, newProject, duplicate_groups);
        }
    })
}

exports.edit = (req, res, next) => {
    let id = req.params.id;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("project/add_edit", {
            title: "Modifier un projet",
            action: "/projets/edit/"+ id,
            errors: errors.array(), 
            old: req.body
        });
    }
    Project.updateOne({ _id: id }, {
        title:  req.body.title,
        start_year: req.body.start_year,
        end_year: req.body.end_year,
    })
        .then(() => res.redirect('/projets'))
        .catch(error => res.status(400).json({ error }));
}

exports.archivate = (req, res, next) => {
    let id = req.params.id;
    Project.updateOne({ _id: id }, {
        archived: true
    })
        .then(() => res.redirect('/projets'))
        .catch(error => res.status(400).json({ error }));
}

exports.restore = (req, res, next) => {
    let id = req.params.id;
    Project.updateOne({ _id: id }, {
        archived: false
    })
        .then(() => res.redirect('/projets/archives'))
        .catch(error => res.status(400).json({ error }));
}

exports.delete = (req, res, next) => {
    let id = req.params.id;
    Project.findOneAndRemove({ _id : id})
    .then(() => {
        res.redirect('/projets');
    })
    .catch(error => res.status(404).json({error}));    
}