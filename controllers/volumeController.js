let Formation = require('../models/Formation');
let Speakers = require('../models/Speaker');
let Project = require('../models/Project');
let Decomposition = require('../models/Decomposition');
let BuildingElement = require('../models/BuildingElement');
let {PedagogicalElement, PedagogicalPeriod} = require('../models/PedagogicalElement');
let {Volume, WeeklyVolume, GlobalVolume} = require('../models/Volume');
let GroupTeacher = require('../models/GroupTeacher');
let { validationResult } = require('express-validator');


exports.formEdit = (req, res, next) => {
    let idFormation = req.params.idFormation;
    let idElement = req.params.idElement;
    Formation.findOne({_id: idFormation}).populate("buildingElement").then(formation => {
        PedagogicalElement.findOne({_id: idElement, input_type: {$ne: "aucun"}}).then(element => {
            let page = "";
            let name = element.title || element.buildingElement.title;
            if(element.input_type === "hebdomadaire"){
                page = "formation/weekly_input";
                
            }else if(element.input_type === "global"){
                page = "formation/weekly_input";
            }
            res.render(page, {
                title: "Gérer les saisies - Element: " + name ,
                formation: formation,
                element:element
            });
        })
        .catch(error => res.status(404).json({error}));  
    })
}



exports.initialize = (req, res, next) => {
    let idElement = req.params.idElement;
    PedagogicalElement.findOne({_id: idElement, input_type: {$ne: "aucun"}}).then(element => {
        element.getAncestors({__t: 'PedagogicalPeriod'}, function(err, periods){
            res.json({
                week: periods[0].week,
                courses_types: element.courses_types,
            });
        });
    })     
    .catch(error => res.status(404).json({error})); 
}

exports.getVolumes = (req, res, next) => {
    let idElement = req.params.idElement;
    PedagogicalElement.findOne({_id: idElement, input_type: {$ne: "aucun"}}).populate("volumes").then(element => {
        res.json({
            volumes: element.volumes,
        })       
    })
}

exports.editWeeklyVolume = (req, res, next) => {
    let idElement = req.params.idElement;
    let volumes = req.body;
    PedagogicalElement.findOne({_id: idElement, input_type: "hebdomadaire"}).then(element => {
        for(week in volumes){
            let newVolume = {
                hour: {
                    TP: volumes[week].TP || undefined,
                    TD: volumes[week].TD || undefined,
                    CM: volumes[week].CM || undefined,
                    PARTIEL: volumes[week].PARTIEL || undefined
                }
            }
            WeeklyVolume.findOneAndUpdate({pedagogical_element: element._id, week: week}, newVolume, {new: true, upsert: true, useFindAndModify: false }, (error, doc) => {});
        } 
    })
        .then(obj => res.sendStatus(200))
        .catch(error => res.status(404).json({error}));  
}
exports.editGroupTeacher = (req, res, next) => {
    let idElement = req.params.idElement;
    let idSpeaker = req.body.speaker;
    let groups = req.body.groups;
    PedagogicalElement.findOne({_id: idElement, input_type: "hebdomadaire"}).then(element => {
        Speakers.findOne({_id: idSpeaker}).then(speaker => {
            for(week in groups){
                let newGroupNumber = {
                    group_number: {
                        TP: groups[week].TP || undefined,
                        TD: groups[week].TD || undefined,
                        CM: groups[week].CM || undefined,
                        PARTIEL: groups[week].PARTIEL || undefined
                    }
                }
                GroupTeacher.findOneAndUpdate({pedagogical_element: element._id, week: week, speaker: speaker._id}, newGroupNumber, {new: true, upsert: true, useFindAndModify: false }, (error, doc) => {});
            } 
        })
        
    })
        .then(obj => res.sendStatus(200))
        .catch(error => res.status(404).json({error}));  
}
exports.getListsSpeakers = (req, res, next) => {
    let idElement = req.params.idElement;
    PedagogicalElement.findOne({_id: idElement, input_type: {$ne: "aucun"}}).populate({path:"interventions", populate: {path: "teacher"}}).populate("groups_teachers").then(element => {
        let idsSpeakers = [];
        for(let i=0; i<element.interventions.length; i++){
            idsSpeakers.push(element.interventions[i]._id);
        }
        Speakers.find({_id: {$nin: idsSpeakers}, project: element.project}).populate({path: "teacher", populate: {path :"status", model: "Status"}}).sort([['last_name', 1], ['first_name', 1]]).then(speakers => {
            res.json({
                used_speakers: element.interventions,
                unused_speakers: speakers,
                groups_teachers: element.groups_teachers
            })
        });        
    })
}

exports.addSpeaker = (req, res, next) => {
    let idElement = req.params.idElement;
    PedagogicalElement.findOne({_id: idElement, input_type: {$ne: "aucun"}}).then(element => {
        Speakers.findOne({_id: req.body.speaker, project: element.project}).then(speaker => {
            element.interventions.push(speaker._id);
            element.save()
                .then(obj => res.sendStatus(200))
                .catch(error => res.status(404).json({error}));  
        })
    })
}

exports.removeSpeaker = (req, res, next) => {
    let idElement = req.params.idElement;
    PedagogicalElement.findOne({_id: idElement, input_type: {$ne: "aucun"}}).then(element => {
        Speakers.findOne({_id: req.body.speaker, project: element.project}).then(speaker => {
            GroupTeacher.deleteMany({speaker: speaker._id},function(err, result){
                Volume.deleteMany({speaker: speaker._id}, function(err, result){
                    element.interventions.pull(speaker._id);
                    element.save()
                        .then(obj => res.sendStatus(200))
                        .catch(error => res.status(404).json({error})); 
                })
            })
        })
    })
}