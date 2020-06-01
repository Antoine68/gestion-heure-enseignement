const { check } = require('express-validator');

exports.loginRequest = [
    check('email').isEmail().withMessage("email invalide"),
    check('password').notEmpty().withMessage("mot de passe requis")
];


exports.teacherRequest = [
    check('last_name').notEmpty().withMessage("nom de l'enseignant requis"),
    check('first_name').notEmpty().withMessage("prénom de l'enseignant requis"),
    check('nickname')
        .notEmpty().withMessage("surnom de l'enseignant requis")
        .isLength({ max:4 }).withMessage("le surnom doit faire au maximum 4 caractères"),
    check('email').isEmail().withMessage("email invalide"),
    check('status')
        .notEmpty().withMessage("Le status est requis")
        .isMongoId().withMessage("Le status n'est pas valide")
        .custom((id) => {
            let query = require('../models/Status').findOne({_id: id});
            return query.exec().then(status => {
                if(status === null){
                    return Promise.reject('Le status n\'est pas valide');
                }
            })
        })
];

exports.statusRequest = [
    check('name').notEmpty().withMessage("nom du statut requis"),
    check('nickname')
        .notEmpty().withMessage("surnom du statut requis")
        .isLength({ max:4 }).withMessage("le surnom doit faire au maximum 4 caractères"),
    check('max_mandatory_hour')
        .notEmpty().withMessage("L'heure maximum obligatoire est requis")
        .isFloat().withMessage("L'heure maximum obligatoire doit être un nombre")
        .custom((num, {req}) => {
            return parseFloat(num) >=  0.0;
        }).withMessage("L'heure maximum obligatoire doit être supèrieure ou égale à 0"),
    check('min_mandatory_hour')
        .notEmpty().withMessage("L'heure minimum obligatoire est requis")
        .isFloat().withMessage("L'heure minimum obligatoire doit être un nombre")
        .custom((num, {req}) => {
            return parseFloat(num) >=  0.0;
        }).withMessage("L'heure minimum obligatoire doit être supèrieure ou égale à 0")
        .custom((min, {req}) => {
            return parseFloat(min) <= parseFloat(req.body.max_mandatory_hour)
        }).withMessage("L'heure minimum obligatoire doit être infèrieure ou égale à l'heure maximum"),
    check('max_additional_hour')
        .notEmpty().withMessage("L'heure maximum supplémentaire est requis")
        .isFloat().withMessage("L'heure maximum supplémentaire doit être un nombre")
        .custom((num, {req}) => {
            return parseFloat(num) >=  0.0;
        }).withMessage("L'heure maximum supplémentaire doit être supèrieure ou égale à 0"),
    check('min_additional_hour')
        .notEmpty().withMessage("L'heure minimum supplémentaire est requis")
        .isFloat().withMessage("L'heure minimum supplémentaire doit être un nombre")
        .custom((num, {req}) => {
            return parseFloat(num) >=  0.0;
        }).withMessage("L'heure minimum supplémentaire doit être supèrieure ou égale à 0")
        .custom((min, {req}) => {
            return parseFloat(min) <= parseFloat(req.body.max_additional_hour)
        }).withMessage("L'heure minimum supplémentaire doit être infèrieure ou égale à l'heure maximum"),  
];

exports.projectRequest = [
    check('title').notEmpty().withMessage("nom du statut requis"),
    check('start_year')
        .notEmpty().withMessage("L'année de début est requis")
        .isNumeric().withMessage("L'année de début doit être un nombre"),
    check('end_year')
        .notEmpty().withMessage("L'année de fin est requis")
        .isNumeric().withMessage("L'année de fin doit être un nombre")
        .custom((end, {req}) => {
            return end >= req.body.start_year
        }).withMessage("L'année de fin doit être suppérieur ou égale à l'année de début"),
];

exports.speakerRequest = [
    check('max_mandatory_hour')
        .notEmpty().withMessage("L'heure maximum obligatoire est requis")
        .isFloat().withMessage("L'heure maximum obligatoire doit être un nombre")
        .custom((num, {req}) => {
            return parseFloat(num) >=  0.0;
        }).withMessage("L'heure maximum obligatoire doit être supèrieure ou égale à 0"),
    check('min_mandatory_hour')
        .notEmpty().withMessage("L'heure minimum obligatoire est requis")
        .isFloat().withMessage("L'heure minimum obligatoire doit être un nombre")
        .custom((num, {req}) => {
            return parseFloat(num) >=  0.0;
        }).withMessage("L'heure minimum obligatoire doit être supèrieure ou égale à 0")
        .custom((min, {req}) => {
            return parseFloat(min) <= parseFloat(req.body.max_mandatory_hour)
        }).withMessage("L'heure minimum obligatoire doit être infèrieure ou égale à l'heure maximum"),
    check('max_additional_hour')
        .notEmpty().withMessage("L'heure maximum supplémentaire est requis")
        .isFloat().withMessage("L'heure maximum supplémentaire doit être un nombre")
        .custom((num, {req}) => {
            return parseFloat(num) >=  0.0;
        }).withMessage("L'heure maximum supplémentaire doit être supèrieure ou égale à 0"),
    check('min_additional_hour')
        .notEmpty().withMessage("L'heure minimum supplémentaire est requis")
        .isFloat().withMessage("L'heure minimum supplémentaire doit être un nombre")
        .custom((num, {req}) => {
            return parseFloat(num) >=  0.0;
        }).withMessage("L'heure minimum supplémentaire doit être supèrieure ou égale à 0")
        .custom((min, {req}) => {
            return parseFloat(min) <= parseFloat(req.body.max_additional_hour)
        }).withMessage("L'heure minimum supplémentaire doit être infèrieure ou égale à l'heure maximum")
];

exports.addBuildingElementsRequest = [
    check('title').notEmpty().withMessage("nom de l'élément requis"),
    check('nickname')
        .notEmpty().withMessage("surnom de l'élément requis"),
    check('order')
        .isNumeric().withMessage("ordre invalide")
        .notEmpty().withMessage("l'ordre de l'élément requis"),
    check('reference').notEmpty().withMessage("reference de l'élément requis"),
    check('tp_hour').optional({ checkFalsy:true }).isFloat().withMessage("Le nombre d'heure de TP doit être un nombre"),
    check('td_hour').optional({ checkFalsy:true }).isFloat().withMessage("Le nombre d'heure de TD doit être un nombre"),
    check('cm_hour').optional({ checkFalsy:true }).isFloat().withMessage("Le nombre d'heure de CM doit être un nombre"),
    check('parent')
        .notEmpty().withMessage("Le parent est requis")
        .isMongoId().withMessage("Le parent n'est pas valide")
        .custom((id) => {
            let query = require('../models/BuildingElement').findOne({_id: id});
            return query.exec().then(element => {
                if(element === null){
                    return Promise.reject('Le parent n\'est pas valide');
                }
            })
    })
];

exports.editBuildingElementsRequest = [
    check('title').notEmpty().withMessage("nom de l'élément requis"),
    check('nickname')
        .notEmpty().withMessage("surnom de l'élément requis"),
    check('order')
        .isNumeric().withMessage("ordre invalide")
        .notEmpty().withMessage("l'ordre de l'élément requis"),
    check('reference').notEmpty().withMessage("reference de l'élément requis"),
    check('tp_hour').optional({ checkFalsy:true }).isFloat().withMessage("Le nombre d'heure de TP doit être un nombre"),
    check('td_hour').optional({ checkFalsy:true }).isFloat().withMessage("Le nombre d'heure de TD doit être un nombre"),
    check('cm_hour').optional({ checkFalsy:true }).isFloat().withMessage("Le nombre d'heure de CM doit être un nombre"),
];

exports.decompositionRequest = [
    check('name').notEmpty().withMessage("nom  requis"),
    check('nickname')
        .notEmpty().withMessage("surnom requis")
];

exports.addFormationRequest = [
    check('name').notEmpty().withMessage("nom  requis"),
    check('nickname').notEmpty().withMessage("surnom requis"),
    check('decomposition')
        .notEmpty().withMessage("La decomposition est requis")
        .isMongoId().withMessage("La decomposition n'est pas valide")
        .custom((id) => {
            let query = require('../models/Decomposition').findOne({_id: id});
            return query.exec().then(element => {
                if(element === null){
                    return Promise.reject('La decomposition n\'est pas valide');
                }
            })
        })
];

exports.editFormationRequest = [
    check('name').notEmpty().withMessage("nom  requis"),
    check('nickname')
        .notEmpty().withMessage("surnom requis")
];