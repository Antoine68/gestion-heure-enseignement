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
    check('algorithm')
        .notEmpty().withMessage("algorithme requis")
        .custom((algorithm, {req}) => {
            return algorithm.toString() === "1" || algorithm.toString() === "2";
        }).withMessage("algorithme requis"),
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

exports.editWeeklyElementRequest = [
    check('volumes')
        .notEmpty().isArray().withMessage("volumes requis")
        .custom((volumes, {req}) => {
            let PedagogicalElement = require('../models/PedagogicalElement');
            return PedagogicalElement.findOne({_id: req.params.idElement, input_type: "hebdomadaire"}).then(element =>{
                if(element === null){
                    return Promise.reject('L\'élément n\'est pas valide');
                }else {
                    let getPeriod = element.getAncestors({__t: 'PedagogicalPeriod'});
                    let getWeek = getPeriod.then(elements => {
                        let period = elements[0];
                        return period.week;
                    }).catch(error => { throw error});
                    return getWeek.then(week => {
                        for(let volume of volumes) {
                            if(isNaN(volume.week) || parseInt(volume.week) < 1 || parseInt(volume.week) > week){
                                return Promise.reject('Numéro de semaine (' + volume.week + ') invailde');
                            }
                            for(let key in volume.courses_types){
                                if(element.courses_types[key]){
                                    if(isNaN(volume.courses_types[key]) || parseFloat(volume.courses_types[key]) < 0.0 || parseFloat(volume.courses_types[key]) > 50.0){
                                        return Promise.reject('Le volume d\'heures doit être compris entre 0.0 et 50.0');
                                    }
                                } else {
                                    return Promise.reject('Type de cours non autorisé pour cet élément (' + key + ')');
                                }
                            }
                        }
                        return Promise.resolve();
                    });
                }
            });
        }),
    check('speakers')
        .isArray().withMessage("intervenants requis")
        .custom((speakers, {req}) => {
            let PedagogicalElement = require('../models/PedagogicalElement');
            return PedagogicalElement.findOne({_id: req.params.idElement, input_type: "hebdomadaire"}).then(element =>{
                if(element === null){
                    return Promise.reject('L\'élément n\'est pas valide');
                }else {
                    let getPeriod = element.getAncestors({__t: 'PedagogicalPeriod'});
                    let getWeek = getPeriod.then(elements => {
                        let period = elements[0];
                        return period.week;
                    }).catch(error => { throw error});
                    return getWeek.then(week => {
                        for(let speaker of speakers) {
                            if(!element.interventions.includes(speaker.id)){
                                return Promise.reject('Un ou plusieurs intervenants n\'interviennent pas dans cet élément');
                            }
                            for(let group of speaker.groups){
                                if(isNaN(group.week) || parseInt(group.week) < 1 || parseInt(group.week) > week){
                                    return Promise.reject('Numéro de semaine (' + group.week + ') invailde');
                                }
                                for(let key in group.courses_types){
                                    if(element.courses_types[key]){
                                        if(isNaN(group.courses_types[key]) || parseInt(group.courses_types[key]) < 0 || parseFloat(group.courses_types[key]) > element.number_groups[key]){
                                            return Promise.reject('Le nombre de groupes des intervenants doit être compris entre 0 et ' + element.number_groups[key] + ' pour le type de cours: ' + key);
                                        }
                                    } else {
                                        return Promise.reject('Type de cours non autorisé pour cet élément (' + key + ')');
                                    }
                                }

                            }
                        }
                        return Promise.resolve();
                    });
                }
            });
        }),
];

exports.editGlobalsElementsRequest = [
    check("subjects")
        .notEmpty().isArray().withMessage("Matières requises")
        .custom((subjects, {req} ) => {
            let PedagogicalElement = require('../models/PedagogicalElement');
            return PedagogicalElement.findOne({_id: req.params.idPeriod , __t:"PedagogicalPeriod"}).then(period => {
                let getGloabalsElements = period.getChildren({input_type: "global"}, {}, {}, true);
                return getGloabalsElements.then(globalsElements => {
                    for(let subject of subjects) {
                        let element = globalsElements.find(g => g._id.toString() === subject.id.toString());
                        if(typeof element === "undefined") {
                            return Promise.reject('Element global introuvable pour cette période');
                        }
                        for(let speaker of subject.speakers){
                            if(!element.interventions.includes(speaker.id)) {
                                return Promise.reject('Un ou plusieurs intervenants n\'interviennent pas dans un élément');
                            }
                            for(let key in speaker.courses_types){
                                if(element.courses_types[key]){
                                    if(isNaN(speaker.courses_types[key]) || parseFloat(speaker.courses_types[key]) < 0.0 || parseFloat(speaker.courses_types[key]) > 50.0){
                                        return Promise.reject('Le volume d\'heures doit être compris entre 0.0 et 50.0');
                                    }
                                } else {
                                    return Promise.reject('Type de cours non autorisé pour un élément (' + key + ')');
                                }
                            }

                        }
                    }
                    return Promise.resolve();
                })
            })
        })
];