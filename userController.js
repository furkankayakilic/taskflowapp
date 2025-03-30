const jwt = require('jsonwebtoken');
const { User, Project, Task } = require('../models');
const { Op } = require('sequelize');

// JWT token oluşturma
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Kullanıcı kaydı
const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanımda.' });
    }

    // Kullanıcı oluştur
    const user = await User.create({
      username,
      email,
      password,
      fullName
    });

    // Token oluştur
    const token = generateToken(user);

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(400).json({ message: 'Kullanıcı oluşturulamadı.', error: error.message });
  }
};

// Kullanıcı girişi
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz email veya şifre.' });
    }

    // Şifreyi kontrol et
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Geçersiz email veya şifre.' });
    }

    // Token oluştur
    const token = generateToken(user);

    res.json({
      message: 'Giriş başarılı.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(400).json({ message: 'Giriş yapılamadı.', error: error.message });
  }
};

// Kullanıcı bilgilerini getir
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Kullanıcı bilgileri alınamadı.', error: error.message });
  }
};

// Kullanıcı bilgilerini güncelle
const updateProfile = async (req, res) => {
  try {
    const { fullName, username, email } = req.body;
    const user = await User.findByPk(req.user.id);

    // Email değişikliği varsa kontrol et
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu email adresi zaten kullanımda.' });
      }
    }

    // Kullanıcı bilgilerini güncelle
    await user.update({
      fullName: fullName || user.fullName,
      username: username || user.username,
      email: email || user.email
    });

    res.json({
      message: 'Profil başarıyla güncellendi.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Profil güncellenemedi.', error: error.message });
  }
};

// Şifre değiştir
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    // Mevcut şifreyi kontrol et
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Mevcut şifre yanlış.' });
    }

    // Yeni şifreyi güncelle
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (error) {
    res.status(400).json({ message: 'Şifre güncellenemedi.', error: error.message });
  }
};

// Kullanıcı istatistiklerini getir
const getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Proje istatistikleri
    const totalProjects = await Project.count({
      where: {
        '$members.id$': userId
      },
      include: [{
        model: User,
        as: 'members',
        through: { attributes: [] },
        attributes: []
      }]
    });

    const activeProjects = await Project.count({
      where: {
        '$members.id$': userId,
        status: 'active'
      },
      include: [{
        model: User,
        as: 'members',
        through: { attributes: [] },
        attributes: []
      }]
    });

    const completedProjects = await Project.count({
      where: {
        '$members.id$': userId,
        status: 'completed'
      },
      include: [{
        model: User,
        as: 'members',
        through: { attributes: [] },
        attributes: []
      }]
    });

    // Görev istatistikleri
    const totalTasks = await Task.count({
      where: {
        [Op.or]: [
          { assignedTo: userId },
          { createdBy: userId }
        ]
      }
    });

    const completedTasks = await Task.count({
      where: {
        [Op.or]: [
          { assignedTo: userId },
          { createdBy: userId }
        ],
        status: 'done'
      }
    });

    res.json({
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks
    });
  } catch (error) {
    console.error('Profile stats error:', error);
    res.status(400).json({ message: 'İstatistikler alınamadı.', error: error.message });
  }
};

// Kullanıcı aktivitelerini getir
const getProfileActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    // Proje aktiviteleri
    const projectActivities = await Project.findAll({
      include: [{
        model: User,
        as: 'members',
        where: { id: userId },
        through: { attributes: [] },
        attributes: []
      }],
      order: [['updatedAt', 'DESC']],
      limit: 5
    });

    // Görev aktiviteleri
    const taskActivities = await Task.findAll({
      where: {
        [Op.or]: [
          { assignedTo: userId },
          { createdBy: userId }
        ]
      },
      order: [['updatedAt', 'DESC']],
      limit: 5
    });

    // Aktiviteleri birleştir ve sırala
    const activities = [
      ...projectActivities.map(project => ({
        id: project.id,
        type: 'project',
        title: project.name,
        action: project.status === 'completed' ? 'Proje tamamlandı' : 'Proje güncellendi',
        date: project.updatedAt
      })),
      ...taskActivities.map(task => ({
        id: task.id,
        type: 'task',
        title: task.title,
        action: task.status === 'done' ? 'Görev tamamlandı' : 'Görev güncellendi',
        date: task.updatedAt
      }))
    ].sort((a, b) => b.date - a.date).slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error('Profile activity error:', error);
    res.status(400).json({ message: 'Aktiviteler alınamadı.', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getProfileStats,
  getProfileActivity
}; 