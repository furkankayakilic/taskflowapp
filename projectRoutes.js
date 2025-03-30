const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// Tüm proje rotaları için auth middleware'i kullan
router.use(auth);

// Proje CRUD işlemleri
router.post('/', projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.put('/:id/archive', projectController.archiveProject);

// Proje üye yönetimi
router.post('/:id/members', projectController.addProjectMember);
router.delete('/:id/members', projectController.removeProjectMember);

// Proje silme route'u
router.delete('/:id', projectController.deleteProject);

module.exports = router; 