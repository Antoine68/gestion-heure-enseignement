let { validationResult } = require('express-validator');
let Status = require('../models/Status');

exports.renderPage = (req, res, next) => {
    Status.find({}).populate('num_teachers').sort([['created_at', -1]]).then(status => {
        res.render("status/index", { "title": "Statuts", status: status });
    });
}

exports.formAdd = (req, res, next) => {
    res.render("status/add_edit", {
        title: "Ajouter un statut",
        action: "/statuts/store"
    });
}

exports.formEdit = (req, res, next) => {
    let id = req.params.id;
    Status.findOne({_id: id})
        .then(status => res.render("status/add_edit", {
            title: "Modifier un statut",
            action: "/statuts/edit/"+id,
            status: status
        }))
        .catch(error => res.status(404).json({error}));    
}

exports.store = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("status/add_edit", {
            title: "Ajouter un statut",
            action: "/statuts/store",
            errors: errors.array(), 
            old: req.body
        });
    }
    let status = new Status({
        name:  req.body.name,
        nickname: req.body.nickname,
        min_mandatory_hour: req.body.min_mandatory_hour,
        max_mandatory_hour : req.body.max_mandatory_hour,
        min_additional_hour: req.body.min_additional_hour,
        max_additional_hour: req.body.max_additional_hour
    });
    status.save(function (error, fluffy) {
        if (error) {res.status(404).json({error})}
        res.redirect('/statuts');
    });
}

exports.edit = (req, res, next) => {
    let id = req.params.id;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("status/add_edit", {
            title: "Modifier un statut",
            action: "/statuts/edit/"+ id,
            errors: errors.array(), 
            old: req.body
        });
    }
    Status.updateOne({ _id: id }, {
        name:  req.body.name,
        nickname: req.body.nickname,
        min_mandatory_hour: req.body.min_mandatory_hour,
        max_mandatory_hour : req.body.max_mandatory_hour,
        min_additional_hour: req.body.min_additional_hour,
        max_additional_hour: req.body.max_additional_hour
    })
        .then(() => res.redirect('/statuts'))
        .catch(error => res.status(400).json({ error }));
}

exports.duplicate = (req, res, next) => {
    let id = req.params.id;
    Status.findOne({_id: id}).then(s => {
        let status = {
            name:  s.name,
            nickname: s.nickname,
            min_mandatory_hour: s.min_mandatory_hour,
            max_mandatory_hour : s.max_mandatory_hour,
            min_additional_hour: s.min_additional_hour,
            max_additional_hour:s.max_additional_hour
        };
        res.render("status/add_edit", {
            title: "Ajouter un statut",
            action: "/statuts/store",
            status: status
        });
    })
    .catch(error => res.status(400).json({ error }));
    
}

exports.delete = (req, res, next) => {
    let id = req.params.id;
    Status.findOneAndRemove({ _id : id})
    .then(() => {
        res.redirect('/statuts');
    })
    .catch(error => res.status(404).json({error}));    
}