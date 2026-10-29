const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const mailer = require('../config/mailer');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email dan password wajib diisi',
    });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, nama, email, password, role, phone FROM users WHERE email = ? LIMIT 1',
      [email.trim()]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        message: 'Email atau kata sandi salah',
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({
        message: 'Email atau kata sandi salah',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET belum diset di file .env');

      return res.status(500).json({
        message: 'Konfigurasi server belum lengkap',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        nama: user.nama,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );

    return res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);

    return res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
  }
}

async function register(req, res) {
  const {
    nama,
    email,
    password,
    phone,
  } = req.body

  // Role selalu 'bendahara' — tidak boleh diatur dari request body
  // karena siapa pun bisa mengirim role: 'admin' jika tidak dibatasi
  const role = 'bendahara'

  if (!nama || !email || !password) {
    return res.status(400).json({
      message: 'Nama, email, dan password wajib diisi',
    })
  }

  try {
    const cleanEmail = email.trim().toLowerCase();

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: 'Email sudah terdaftar',
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users
       (nama, email, password, role, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nama.trim(),
        cleanEmail,
        hash,
        role,
        phone || null,
      ]
    );

    return res.status(201).json({
      message: 'Akun berhasil dibuat',
      id: result.insertId,
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);

    return res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
  }
}

async function me(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'Token tidak valid',
      });
    }

    const [rows] = await pool.query(
      `SELECT id, nama, email, role, phone
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User tidak ditemukan',
      });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('ME ERROR:', err);

    return res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email wajib diisi' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, nama, email FROM users WHERE email = ? LIMIT 1',
      [email.trim().toLowerCase()]
    );

    // Always respond 200 to prevent user enumeration
    if (rows.length === 0) {
      return res.status(200).json({
        message: 'Jika email terdaftar, link reset password telah dikirim.',
      });
    }

    const user = rows[0];
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [hashedToken, expires, user.id]
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;

    await mailer.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Reset Password Akun TEFA RPL',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;border-radius:8px;border-top:3px solid #123C72">
          <h2 style="color:#123C72;margin:0 0 8px">Reset Password</h2>
          <p style="color:#374151;margin:0 0 16px">Halo <strong>${user.nama}</strong>,</p>
          <p style="color:#374151;margin:0 0 24px">Kami menerima permintaan reset password untuk akun TEFA RPL kamu. Klik tombol di bawah untuk membuat password baru.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#123C72;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px">Reset Password</a>
          <p style="color:#6b7280;font-size:12px;margin:24px 0 0">Link ini berlaku selama <strong>1 jam</strong>. Jika kamu tidak meminta reset password, abaikan email ini.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          <p style="color:#9ca3af;font-size:11px;margin:0">TEFA RPL — Sistem Manajemen Keuangan</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: 'Jika email terdaftar, link reset password telah dikirim.',
    });
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token dan password wajib diisi' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password minimal 8 karakter' });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const [rows] = await pool.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1',
      [hashedToken]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hash, rows[0].id]
    );

    return res.status(200).json({ message: 'Password berhasil direset.' });
  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = {
  login,
  register,
  me,
  forgotPassword,
  resetPassword,
};

