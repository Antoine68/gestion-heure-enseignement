let { validationResult } = require('express-validator');
let Teacher = require('../models/Teacher');
let Status = require('../models/Status');

exports.renderPage = (req, res, next) => {
    Teacher.find({}).sort([['created_at', -1]]).populate('status').then(teachers => {
        res.render("teacher/index", { "title": "Enseignants", teachers: teachers });
    });
}

exports.formAdd = (req, res, next) => {
    Status.find({}).then(status => res.render("teacher/add_edit", {
        title: "Ajouter un enseignant",
        action: "/enseignants/store",
        status: status
        })
    )
    .catch(error => res.status(404).json({error}));
}

exports.formEdit = (req, res, next) => {
    let id = req.params.id;
    Teacher.findOne({_id: id})
        .then(teacher => 
            Status.find({}).then(status => res.render("teacher/add_edit", {
                title: "Modifier un enseignant",
                action: "/enseignants/edit/"+id,
                teacher: teacher,
                status: status
                })
            )
            .catch(error => res.status(404).json({error}))
        )
        .catch(error => res.status(404).json({error}));    
}

exports.store = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return Status.find({}).then(status => 
            res.status(422).render("teacher/add_edit", {
                title: "Ajouter un enseignant",
                action: "/enseignants/store",
                errors: errors.array(), 
                old: req.body,
                status: status
            })
        )   
        .catch(error => res.status(404).json({error}));  
    }
    let teacher = new Teacher({
        first_name:  req.body.first_name,
        last_name: req.body.last_name,
        nickname: req.body.nickname,
        email: req.body.email,
        status: req.body.status
    });
    teacher.save(function (error, fluffy) {
        if (error) {res.status(404).json({error})}
        res.redirect('/enseignants');
    });
}

exports.edit = (req, res, next) => {
    let id = req.params.id;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("teacher/add_edit", {
            title: "Modifier un enseignant",
            action: "/enseignants/edit/"+ id,
            errors: errors.array(), 
            old: req.body
        });
    }
    Teacher.updateOne({ _id: id }, {
        first_name:  req.body.first_name,
        last_name: req.body.last_name,
        nickname: req.body.nickname,
        email: req.body.email,
        status: req.body.status
    })
        .then(() => res.redirect('/enseignants'))
        .catch(error => res.status(400).json({ error }));
}

exports.duplicate = (req, res, next) => {
    let id = req.params.id;
    Teacher.findOne({_id: id}).then(t => {
        let teacher = {
            first_name:  t.first_name,
            last_name: t.last_name,
            nickname: t.nickname,
            email: t.email,
            status: t.status
        };
        Status.find({}).then(status => res.render("teacher/add_edit", {
                title: "Ajouter un enseignant",
                action: "/enseignants/store",
                status: status,
                teacher: teacher
            })
        )
    })
    .catch(error => res.status(400).json({ error }));
    
}

exports.delete = (req, res, next) => {
    let id = req.params.id;
    Teacher.findOneAndRemove({ _id : id})
    .then(() => {
        res.redirect('/enseignants');
    })
    .catch(error => res.status(404).json({error}));    
}