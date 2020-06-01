let BuildingElement = require('../models/BuildingElement');
let Decomposition = require('../models/Decomposition');
let moment = require('moment');
let { validationResult } = require('express-validator');

/*let bp = new BuildingElement({
    decomposition: "5ebe99d30b157e53a8da9ac5",
    title: "DUT Informatique" 
});
bp.save(function(){
    /*let be = new BuildingElement({
        title: "Semestre 1"
    });
    be.parent = bp;
    be.save(function(){
        let be1 = new BuildingElement({
            title: "test1" 
        });
        be1.parent = be;
        be1.save(function(){
            let be2 = new BuildingElement({
                title: "Semestre 2"
            });
            be2.parent = bp;
            be2.save();
            console.log(be1.level); 
        });
    }); 
});
*/

exports.renderPage = (req, res) => {
    Decomposition.find({}).sort([['created_at', -1]]).then(decompositions => {
        res.render("decomposition/index", { "title": "Décompositions", decompositions: decompositions, moment: moment });
    });
    
}

exports.formAdd = (req, res) => {
    res.render("decomposition/add_edit", { 
        title: "Ajouter une décomposition",
        action: "/decompositions/store" 
    });    
}

exports.formEdit = (req, res) => {
    let id = req.params.id;
    Decomposition.findOne({_id: id }).then(decomposition => {
        res.render("decomposition/add_edit", { 
            title: "Modifier une décomposition",
            action: "/decompositions/edit/" + decomposition._id,
            decomposition: decomposition
        });
    });
}

exports.store = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("decomposition/add_edit", {
            title: "Ajouter une décomposition",
            action: "/decompositions/store",
            errors: errors.array(), 
            old: req.body
        });
    }
    let decomposition = new Decomposition({
        name:  req.body.name,
        nickname: req.body.nickname
    });
    decomposition.save(function (error, decomposition) {
        if (error) {
            res.status(404).json({error})
        }else{
            let root = BuildingElement({
                title:  req.body.name,
                nickname: req.body.nickname,
                decomposition: decomposition._id
            })
            root.save(function (error) {
                if (error) {res.status(404).json({error})}
                res.redirect('/decompositions/afficher/'+decomposition._id);
            });

        }
    });
}

exports.edit = (req, res, next) => {
    let id = req.params.id;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("decomposition/add_edit", {
            title: "Modifier une décomposition",
            action: "/decompositions/edit/"+ id,
            errors: errors.array(), 
            old: req.body
        });
    }
    Decomposition.updateOne({ _id: id }, {
        name:  req.body.name,
        nickname: req.body.nickname,
    })
        .then(() => res.redirect('/decompositions'))
        .catch(error => res.status(400).json({ error }));
}

exports.viewOne = (req, res) => {
    let id = req.params.id;
    Decomposition.findOne({_id: id}).then(decomposition => {
        res.render("decomposition/view_one", { "title": "Décomposition " + decomposition.name, decomposition: decomposition, moment: moment });
    });
}

exports.listElements = (req, res) => {
    let id = req.params.id;
    Decomposition.findOne({_id: id}).populate("element").then(decomposition => {
        let root = decomposition.element;         
        root.getChildrenTree(function(err, tree){
            res.json({
                root: root,
                tree: tree
            });
        })
    });
}

exports.formEditElement = (req, res) => {
    let id = req.params.id;
    let idElement = req.params.idElement;
    Decomposition.findOne({_id: id}).populate("element").then(decomposition => {
        let root = decomposition.element;         
        root.getChildrenTree(function(err, elements){
            BuildingElement.findOne({_id: idElement}).then(element => {
                res.render("decomposition/add_edit_element",{
                    title: "Modifier un élément constitutif - décomposition "+ decomposition.name,
                    action: "/decompositions/elements/"+  decomposition._id +"/modifier/"+ idElement,
                    root: root,
                    elements: elements,
                    element: element,
                    idDecomposition: id,
                    hierarchy: false
                });
            })
        })
    });
}

exports.formAddElement = (req, res) => {
    let id = req.params.id;
    let idParent = req.params.idParent;
    Decomposition.findOne({_id: id}).populate("element").then(decomposition => {
        let root = decomposition.element;         
        root.getChildren(true, function(err, elements){
            BuildingElement.findOne({_id: idParent}).then(parent => {
                res.render("decomposition/add_edit_element",{
                    title: "Ajouter un élément constitutif - décomposition "+ decomposition.name,
                    action: "/decompositions/elements/"+  decomposition._id +"/ajouter",
                    root: root,
                    elements: elements,
                    parent: parent,
                    idDecomposition: id,
                    hierarchy: true
                });
            })
            
        })
    });
}

exports.addElement = (req, res) => {
    let id = req.params.id;
    Decomposition.findOne({_id: id}).populate("element").then(decomposition => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            let root = decomposition.element;         
            root.getChildren(true, function(err, elements){
                res.status(422).render("decomposition/add_edit_element", {
                    title: "Ajouter un élément constitutif - décomposition "+ decomposition.name,
                    action: "/decompositions/elements/"+  decomposition._id +"/ajouter",
                    errors: errors.array(), 
                    elements: elements,
                    root: root,
                    idDecomposition: decomposition._id,
                    hierarchy: true,
                    old: req.body
                });
            });
        }else{
            BuildingElement.findOne({_id: req.body.parent}).then(parent => {
                let element = new BuildingElement({
                    title: req.body.title,
                    nickname: req.body.nickname,
                    reference: req.body.reference,
                    order: req.body.order,
                    hour_volume: {
                        TP: req.body.tp_hour,
                        TD: req.body.td_hour,
                        CM: req.body.cm_hour,
                    }
                });
                element.parent = parent;
                element.save(function(error, fluffy){
                    if (error) {res.status(404).json({error})}
                    res.redirect('/decompositions/afficher/'+ decomposition._id);
                });
            })
        }
    });
}


exports.editElement = (req, res) => {
    let id = req.params.id;
    let idElement = req.params.idElement;
    Decomposition.findOne({_id: id}).populate("element").then(decomposition => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            let root = decomposition.element;         
            root.getChildren(true, function(err, elements){
                res.status(422).render("decomposition/add_edit_element", {
                    title: "Editer un élément constitutif - décomposition "+ decomposition.name,
                    action: "/decompositions/elements/"+  decomposition._id +"/modifier/"+ idElement,
                    errors: errors.array(), 
                    elements: elements,
                    root: root,
                    idDecomposition: decomposition._id,
                    hierarchy: false,
                    old: req.body
                });
            });
        }else{
            BuildingElement.findOne({_id: req.body.parent}).then(parent => {
                BuildingElement.findOne({_id: idElement}).then(element => {
                    element.parent = parent;
                    element.update({
                        title: req.body.title,
                        nickname: req.body.nickname,
                        reference: req.body.reference,
                        order: req.body.order,
                        hour_volume: {
                            TP: req.body.tp_hour,
                            TD: req.body.td_hour,
                            CM: req.body.cm_hour,
                        }
                    }, function(error, element){
                        if (error) {res.status(404).json({error})}else{
                            res.redirect('/decompositions/afficher/'+ decomposition._id);
                        }
                       
                    });
                })
            })
        }
    });
}