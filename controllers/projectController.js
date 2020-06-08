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



exports.renderPage = (req, res) => {
    Project.find({archived: false}).populate('formations').sort([['start_date', -1]]).then(projects => {
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
    res.render("project/add_edit", {
        title: "Ajouter un projet",
        action: "/projets/store"
    });
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
        return res.status(422).render("project/add_edit", {
            title: "Ajouter un projet",
            action: "/projets/store",
            errors: errors.array(), 
            old: req.body
        });
    }
    let project = new Project({
        title:  req.body.title,
        start_year: req.body.start_year,
        end_year: req.body.end_year,
    });
    project.save(function (error) {
        if (error) {res.status(404).json({error})}
        res.redirect('/projets');
    });
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