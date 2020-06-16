let Formation = require('../models/Formation');
let Speaker = require('../models/Speaker');
let Project = require('../models/Project');
let Decomposition = require('../models/Decomposition');
let BuildingElement = require('../models/BuildingElement');
let PedagogicalElement = require('../models/PedagogicalElement');
let {Volume, WeeklyVolume, GlobalVolume} = require('../models/Volume');
let GroupTeacher = require('../models/GroupTeacher');
let { validationResult } = require('express-validator');


exports.getAllGlobalsByPeriod = (req, res, next) => {
    let idPeriod = req.params.idPeriod;
    PedagogicalElement.findOne({_id: idPeriod, __t: "PedagogicalPeriod"}).then(period => {
        period.getChildren({input_type: "global"},{},{populate:{path:'buildingElement volumes interventions', populate: { path: 'teacher'}}},true, function(err, globals){
            let formatedGlobals = concateneGlobals(globals);
            res.status(200).json({
                period: period,
                globals: globals,
                formatedGlobals: formatedGlobals,
            })
        })
    })

}

function concateneGlobals(globalsArray){
    let formatedGlobals = [];
    for(let i=0; i<globalsArray.length; i++){
        for(let j=0; j<globalsArray[i].interventions.length; j++){
            let data = formatedGlobals.find(g => g.speaker._id === globalsArray[i].interventions[j]._id);
            if(typeof data === "undefined"){
                data = {};
                data["speaker"] = globalsArray[i].interventions[j];
                data["subjects"] = {};
                data["totals"] = {};
                for(let key in globalsArray[i].courses_types.toObject()) {
                    data["totals"][key] = 0;
                    data["subjects"][key] = {}
                }
                formatedGlobals.push(data);
            }
            
            for(let key in globalsArray[i].courses_types.toObject()) {
                if(globalsArray[i].courses_types[key]) {
                    data["subjects"][key][globalsArray[i]._id] = null;
                    let volumes = globalsArray[i].volumes;
                    let volume = volumes.find(v => v.speaker.toString() === globalsArray[i].interventions[j]._id.toString());
                    if(typeof volume !== "undefined"){
                        volume = volume.toObject();
                        data["subjects"][key][globalsArray[i]._id] = volume.volume[key];
                        data["totals"][key] += volume.volume[key] * globalsArray[i].forfait[key] ;
                    }
                }
            }
        }
    }
    return formatedGlobals;
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
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).json({errors});
    }
    let idElement = req.params.idElement;
    let requestVolumes = req.body.volumes;
    let requestSpeakers = req.body.speakers;
    PedagogicalElement.findOne({_id: idElement, input_type: "hebdomadaire"}).then(element => {
        for(let volume of requestVolumes){
            if(!isNaN(volume.week)){
                let newVolume = {
                    hour: {
                        TP: volume["courses_types"].TP ? volume["courses_types"].TP.replace(/\s/g, '') : undefined,
                        TD: volume["courses_types"].TD ? volume["courses_types"].TD.replace(/\s/g, '') : undefined,
                        CM: volume["courses_types"].CM ? volume["courses_types"].CM.replace(/\s/g, '') : undefined,
                        PARTIEL: volume["courses_types"].PARTIEL ? volume["courses_types"].PARTIEL.replace(/\s/g, '') : undefined
                    }
                }
                WeeklyVolume.findOneAndUpdate({pedagogical_element: element._id, week: volume.week}, newVolume, {new: true, upsert: true, useFindAndModify: false }, (error, doc) => {});
            }
            
        }
        for(let requestSpeaker of requestSpeakers){
            Speaker.findOne({_id: requestSpeaker.id}).then(speaker => {
                for(let values of requestSpeaker.groups){
                    if(!isNaN(values.week)){
                        let newGroupNumber = {
                            group_number: {
                                TP: values["courses_types"].TP ? values["courses_types"].TP.replace(/\s/g, '') : undefined,
                                TD: values["courses_types"].TD ? values["courses_types"].TD.replace(/\s/g, '') : undefined,
                                CM: values["courses_types"].CM ? values["courses_types"].CM.replace(/\s/g, '') : undefined,
                                PARTIEL: values["courses_types"].PARTIEL ? values["courses_types"].PARTIEL.replace(/\s/g, '') : undefined
                            }
                        }
                        GroupTeacher.findOneAndUpdate({pedagogical_element: element._id, week: values.week, speaker: speaker._id}, newGroupNumber, {new: true, upsert: true, useFindAndModify: false }, (error, doc) => {});
                    }
                } 
            })

        }
    })
        .then(obj => res.sendStatus(200))
        .catch(error => res.status(403).json({error}));  
}

exports.editGlobalVolume = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).json({errors});
    }
    let subjects = req.body.subjects;
    elementCounter = 0;
    for(let subject of subjects) {
        PedagogicalElement.findOne({_id: subject.id, input_type:"global"}).then(element => {
            for(let requestSpeaker of subject.speakers){
                Speaker.findOne({_id: requestSpeaker.id}).then(speaker => {
                    let newVolume = {
                        TP: requestSpeaker["courses_types"].TP ? requestSpeaker["courses_types"].TP.replace(/\s/g, '') : undefined,
                        TD: requestSpeaker["courses_types"].TD ? requestSpeaker["courses_types"].TD.replace(/\s/g, '') : undefined,
                        CM: requestSpeaker["courses_types"].CM ? requestSpeaker["courses_types"].CM.replace(/\s/g, '') : undefined,
                        PARTIEL: requestSpeaker["courses_types"].PARTIEL ? requestSpeaker["courses_types"].PARTIEL.replace(/\s/g, '') : undefined
                    }
                    GlobalVolume.findOneAndUpdate({pedagogical_element: element._id, speaker:speaker._id}, {volume: newVolume}, {new: true, upsert: true, useFindAndModify: false }, (error, doc) => {});
                })
            }
        })
        elementCounter++;
        if(elementCounter === subjects.length){
            res.sendStatus(200);
        }
    }
   
    
}

exports.getListsSpeakers = (req, res, next) => {
    let idElement = req.params.idElement;
    PedagogicalElement.findOne({_id: idElement, input_type: {$ne: "aucun"}}).populate({path:"interventions", populate: {path: "teacher", populate: {path :"status", model: "Status"}}}).populate("groups_teachers").then(element => {
        let idsSpeakers = [];
        for(let i=0; i<element.interventions.length; i++){
            idsSpeakers.push(element.interventions[i]._id);
        }
        Speaker.find({_id: {$nin: idsSpeakers}, project: element.project}).populate({path: "teacher", populate: {path :"status", model: "Status"}}).sort([['last_name', 1], ['first_name', 1]]).then(speakers => {
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
        Speaker.findOne({_id: req.body.speaker, project: element.project}).then(speaker => {
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
        Speaker.findOne({_id: req.body.speaker, project: element.project}).then(speaker => {
            GlobalVolume.deleteMany({speaker: speaker._id, pedagogical_element: element._id}, function (err, result) {
                GroupTeacher.deleteMany({speaker: speaker._id, pedagogical_element: element._id},function(err, result){
                    element.interventions.pull(speaker._id);
                    element.save()
                        .then(obj => res.sendStatus(200))
                        .catch(error => res.status(404).json({error})); 
                
                })
            })
        })
    })
}

exports.getElement = (req, res, next) => {
    let idElement = req.params.idElement;
    PedagogicalElement.findOne({_id: idElement}).populate({path:'buildingElement volumes groups_teachers interventions', populate: { path: 'teacher' }}).then(element => {
        element.getAncestors({__t: 'PedagogicalPeriod'}, function(err, periods){
            let period = periods[0];
            PedagogicalElement.findOne({_id: period._id, __t: 'PedagogicalPeriod'}).then(period => {
                if(element.input_type === "global") {
                    period.getChildren({input_type: "global"},{},{populate:{path:'buildingElement volumes interventions', populate: { path: 'teacher'}}},true, function(err, globals){
                        let formatedGlobals = concateneGlobals(globals);
                        res.status(200).json({
                            type: element.input_type,
                            period: period,
                            globals: globals,
                            formatedGlobals: formatedGlobals,
                        })
                    })
                }else if(element.input_type === "hebdomadaire") {
                    calculateWeeklyTotal(element, period.week);
                    let objectElement = element.toObject();
                    objectElement.buildingElement = element.buildingElement;
                    objectElement.volumes = element.volumes;
                    objectElement.groups_teachers = element.groups_teachers;
                    objectElement.totalsBySpeaker = element.totalsBySpeaker;
                    objectElement.totals = element.totals;
                    res.status(200).json({
                        type: element.input_type,
                        week: period.week,
                        element: objectElement,
                    })
                }

            })
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
            for(key in element.courses_types.toObject()) {
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
}