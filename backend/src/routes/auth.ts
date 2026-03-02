import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import pool from '../config/database';
import { register, login } from '../controllers/auth';

const router = express.Router();

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

router.post('/register', register);
router.post('/login', login);

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [resetToken, resetTokenExpiry, email]
    );

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Şifre Sıfırlama İsteği',
      html: `
        <h1>Şifre Sıfırlama</h1>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${resetLink}">Şifremi Sıfırla</a>
        <p>Bu bağlantı 1 saat süreyle geçerlidir.</p>
        <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu.' });
  }
});

// Reset password with token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user with valid reset token
    const userResult = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = $2',
      [hashedPassword, token]
    );

    res.json({ message: 'Şifreniz başarıyla güncellendi.' });
  } catch (error) {
    console.error('Error in reset password:', error);
    res.status(500).json({ message: 'Şifre güncelleme sırasında bir hata oluştu.' });
  }
});

export default router; 