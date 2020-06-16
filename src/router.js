const express = require('express')
const router = express.Router()
const validator = require("../middlewares/validator");


//Home
const homeController = require('../controllers/homeController');
router.get('/', homeController.renderPage);


//Teacher
const teacherController = require('../controllers/teacherController');
router.get('/enseignants', teacherController.renderPage);
router.get('/enseignants/ajouter', teacherController.formAdd);
router.get('/enseignants/modifier/:id', teacherController.formEdit);
router.put('/enseignants/store', validator.teacherRequest, teacherController.store);
router.put('/enseignants/edit/:id', validator.teacherRequest, teacherController.edit);
router.delete('/enseignants/delete/:id', teacherController.delete);
router.post('/enseignants/duplicate/:id', teacherController.duplicate);

//Status
const statusController = require('../controllers/statusController');
router.get('/statuts', statusController.renderPage);
router.get('/statuts/ajouter', statusController.formAdd);
router.get('/statuts/modifier/:id', statusController.formEdit);
router.put('/statuts/store', validator.statusRequest, statusController.store);
router.put('/statuts/edit/:id', validator.statusRequest, statusController.edit);
router.post('/statuts/duplicate/:id', statusController.duplicate);
router.delete('/statuts/delete/:id', statusController.delete);

//Decomposition
const decompositionController = require('../controllers/decompositionController');
router.get('/decompositions', decompositionController.renderPage);
router.get('/decompositions/ajouter', decompositionController.formAdd);
router.get('/decompositions/modifier/:id', decompositionController.formEdit);
router.put('/decompositions/store', validator.decompositionRequest, decompositionController.store);
router.put('/decompositions/edit/:id', validator.decompositionRequest, decompositionController.edit);
router.get('/decompositions/afficher/:id', decompositionController.viewOne);
router.get('/decompositions/elements/:id/ajouter/parent/:idParent', decompositionController.formAddElement);
router.put('/decompositions/elements/:id/ajouter', validator.addBuildingElementsRequest, decompositionController.addElement);
router.put('/decompositions/elements/:id/modifier/:idElement', validator.editBuildingElementsRequest, decompositionController.editElement)
router.get('/decompositions/elements/:id/modifier/:idElement', decompositionController.formEditElement);
//Ajax
router.get('/decompositions/elements/:id/liste', decompositionController.listElements);


//Project
const projectController = require('../controllers/projectController');
router.get('/projets', projectController.renderPage);
router.get('/projets/archives', projectController.renderPageArchive);
router.get('/projets/ajouter', projectController.formAdd);
router.get('/projets/modifier/:id', projectController.formEdit);
router.get('/projets/intervenants/:id', projectController.renderPageSpeakers);
router.put('/projets/store', validator.projectRequest, projectController.store);
router.put('/projets/edit/:id', validator.projectRequest, projectController.edit);
router.post('/projets/archivate/:id', projectController.archivate);
router.post('/projets/restore/:id', projectController.restore);
router.get('/projets/:id/bilan', projectController.renderPageBilan);
router.get('/projets/:id/calculer-bilan', projectController.calculateBilan);

//Speaker
const speakerController = require('../controllers/speakerController');
//Ajax
router.get('/projets/intervenants/:id/listes', speakerController.listTeachers);
router.put('/projets/intervenants/store', validator.speakerRequest, speakerController.store);
router.delete('/projets/intervenants/delete/:id', speakerController.remove);
router.put('/projets/intervenants/edit/:id',validator.speakerRequest, speakerController.edit);

//Formation
const formationController = require('../controllers/formationController');
router.get('/projets/:idProject/formation/render/:id', formationController.renderPage);
router.get('/projets/:idProject/formation/ajouter', formationController.formAdd);
router.get('/projets/:idProject/formation/modifier/:id', formationController.formEdit);
router.put('/projets/:idProject/formation/store', validator.addFormationRequest, formationController.store);
router.put('/projets/:idProject/formation/edit/:id', validator.editFormationRequest, formationController.edit);
router.delete('/formation/delete/:id', formationController.delete);
router.get('/formation/:id/element/:idElement/modifier', formationController.formEditElement);
router.put('/formation/:id/element/:idElement/edit', formationController.editElement);
router.get('/formation/:id/element/ajouter/parent/:idParent', formationController.formAddElement);
router.put('/formation/:id/element/store', formationController.storeElement);
router.put('/formation/:id/periode/store', formationController.storePeriod);
//Ajax
router.get('/formations/:id/elements', formationController.listElements);

//Volume
const volumeController = require('../controllers/volumeController');
//Ajax
router.get('/elements/:idElement/initialiser', volumeController.initialize);
router.get('/elements/:idElement/volumes', volumeController.getVolumes);
router.put('/elements/hebdomadaire/:idElement/modifier', validator.editWeeklyElementRequest, volumeController.editWeeklyVolume);
router.put('/periodes/:idPeriod/elements/global/modifier', validator.editGlobalsElementsRequest, volumeController.editGlobalVolume);
router.post('/elements/:idElement/ajouter-intervenant', volumeController.addSpeaker);
router.post('/elements/:idElement/retirer-intervenant', volumeController.removeSpeaker);
router.get('/elements/:idElement/interventions', volumeController.getListsSpeakers);
router.get('/formations/:idFormation/periodes/:idPeriod/saisies-globales', volumeController.getAllGlobalsByPeriod);
router.get('/formations/:idFormation/elements/:idElement/get', volumeController.getElement);




module.exports = router;