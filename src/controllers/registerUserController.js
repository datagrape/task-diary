// src/controllers/registerUserController.js
const bcrypt = require('bcrypt');
const registerUserService = require('../services/registerUserService');

exports.createUser = async (req, res, next) => {
  const { email, password } = req.body || {};

  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await registerUserService.createUser(normalizedEmail, hashed, 'User', 'Free');
    return res.status(201).json(user);
  } catch (err) {
    return next(err); // centralized handler below will shape the response
  }
};
