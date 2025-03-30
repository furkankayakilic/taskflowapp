const { Project, User, Task } = require('../models');

// Proje oluşturma
const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, priority, color, status } = req.body;

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      priority,
      color,
      status,
      createdBy: req.user.id
    });

    // Proje oluşturan kişiyi otomatik olarak projeye ekle
    await project.addMember(req.user.id);

    res.status(201).json({
      message: 'Proje başarıyla oluşturuldu.',
      project
    });
  } catch (error) {
    console.error('Proje oluşturma hatası:', error);
    res.status(400).json({ 
      message: 'Proje oluşturulamadı.', 
      error: error.message 
    });
  }
};

// Tüm projeleri getir
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'fullName', 'avatar']
        }
      ],
      where: {
        isArchived: false
      }
    });

    res.json(projects);
  } catch (error) {
    res.status(400).json({ message: 'Projeler alınamadı.', error: error.message });
  }
};

// Tek bir projeyi getir
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'fullName', 'avatar']
        },
        {
          model: Task,
          as: 'tasks',
          include: [
            {
              model: User,
              as: 'assignedToUser',
              attributes: ['id', 'username', 'fullName', 'avatar']
            }
          ]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı.' });
    }

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: 'Proje bilgileri alınamadı.', error: error.message });
  }
};

// Projeyi güncelle
const updateProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, priority, color } = req.body;
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı.' });
    }

    await project.update({
      name: name || project.name,
      description: description || project.description,
      startDate: startDate || project.startDate,
      endDate: endDate || project.endDate,
      status: status || project.status,
      priority: priority || project.priority,
      color: color || project.color
    });

    res.json({
      message: 'Proje başarıyla güncellendi.',
      project
    });
  } catch (error) {
    res.status(400).json({ message: 'Proje güncellenemedi.', error: error.message });
  }
};

// Projeyi arşivle
const archiveProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı.' });
    }

    await project.update({ isArchived: true });

    res.json({ message: 'Proje başarıyla arşivlendi.' });
  } catch (error) {
    res.status(400).json({ message: 'Proje arşivlenemedi.', error: error.message });
  }
};

// Projeye üye ekle
const addProjectMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı.' });
    }

    await project.addMember(userId);

    res.json({ message: 'Üye başarıyla projeye eklendi.' });
  } catch (error) {
    res.status(400).json({ message: 'Üye projeye eklenemedi.', error: error.message });
  }
};

// Projeden üye çıkar
const removeProjectMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı.' });
    }

    await project.removeMember(userId);

    res.json({ message: 'Üye başarıyla projeden çıkarıldı.' });
  } catch (error) {
    res.status(400).json({ message: 'Üye projeden çıkarılamadı.', error: error.message });
  }
};

// Projeyi sil
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id']
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı.' });
    }

    // Projeyi oluşturan kişi, admin veya proje üyesi kontrolü
    const isProjectCreator = project.createdBy === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isProjectMember = project.members.some(member => member.id === req.user.id);

    if (!isProjectCreator && !isAdmin && !isProjectMember) {
      return res.status(403).json({ message: 'Bu projeyi silme yetkiniz yok.' });
    }

    await project.destroy();

    res.json({ message: 'Proje başarıyla silindi.' });
  } catch (error) {
    console.error('Proje silme hatası:', error);
    res.status(400).json({ message: 'Proje silinemedi.', error: error.message });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  archiveProject,
  addProjectMember,
  removeProjectMember,
  deleteProject
}; 