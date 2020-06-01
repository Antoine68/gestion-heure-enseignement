let { validationResult } = require('express-validator');
let Project = require('../models/Project');
let Formation = require('../models/Formation');
let Teacher = require('../models/Teacher');
let Status = require('../models/Status');
let Speaker = require('../models/Speaker');


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