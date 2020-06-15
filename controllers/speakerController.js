let { validationResult } = require('express-validator');
let Project = require('../models/Project');
let Teacher = require('../models/Teacher');
let Speaker = require('../models/Speaker');
let {Volume, WeeklyVolume, GlobalVolume} = require('../models/Volume');
let GroupTeacher = require('../models/GroupTeacher');
let PedagogicalElement = require('../models/PedagogicalElement');


exports.store = (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).json({errors});
    }
    let speaker = new Speaker({
        project: req.body.id_project,
        teacher: req.body.id_teacher, 
        min_mandatory_hour: req.body.min_mandatory_hour, 
        max_mandatory_hour: req.body.max_mandatory_hour,
        min_additional_hour: req.body.min_additional_hour,
        max_additional_hour: req.body.max_additional_hour
    })

    speaker.save(function (error) {
        if (error) {res.status(404).json({error})}
        res.sendStatus(200);
    });  
}

exports.remove = (req, res) => {
    let idSpeaker = req.params.id;
    Speaker.deleteOne({_id: idSpeaker}).then(obj => {
        Volume.deleteMany({speaker: idSpeaker}).then(obj => {
            GroupTeacher.deleteMany({speaker: idSpeaker}).then(obj => {
                PedagogicalElement.update({},{ $pull: { interventions: { $in: [ idSpeaker ] }}},{ multi: true }).then(obj => {
                    res.sendStatus(200)
                })
                
            })
        })
    })
    .catch(error => res.status(404).json({error}));            
}

exports.edit = (req, res) => {
    let idSpeaker = req.params.id;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).json({errors});
    }
    Speaker.updateOne({ _id: idSpeaker }, 
    { 
        min_mandatory_hour: req.body.min_mandatory_hour, 
        max_mandatory_hour: req.body.max_mandatory_hour,
        min_additional_hour: req.body.min_additional_hour,
        max_additional_hour: req.body.max_additional_hour 
    })
        .then(obj => res.sendStatus(200))
        .catch(error => res.status(404).json({error}));    
}

exports.listTeachers = (req, res) => {
    let id = req.params.id;
    Speaker.find({project: id}).sort([['created_at', -1]]).populate({path: "teacher", populate: {path :"status", model: "Status"}}).then(speakers => {
        let idsSpeakers = [];
        for(let i=0; i<speakers.length; i++){
            idsSpeakers.push(speakers[i].teacher._id);
        }
        Teacher.find({_id: {$nin: idsSpeakers}}).sort([['last_name', 1], ['first_name', 1]]).populate('status').then(teachers => {
            res.json({ 
                usedTeachers: speakers,
                unusedTeachers: teachers
            });
        });
    })
}