// ============================================================
// dbStore.js — In-memory database store for users and addresses
// ============================================================

const bcrypt = require('bcryptjs');

// In-memory collections
const users = [];
const addresses = [];

// ID generation helpers
let lastUserId = 0;
let lastAddressId = 0;

const generateUserId = () => `user_${++lastUserId}_${Date.now()}`;
const generateAddressId = () => `addr_${++lastAddressId}_${Date.now()}`;

// Seed default users
const seedData = () => {
  const salt = bcrypt.genSaltSync(10);

  // 1. Admin account: admin@gmail.com / 1234
  users.push({
    _id: generateUserId(),
    name: 'System Admin',
    email: 'admin@gmail.com',
    password: bcrypt.hashSync('1234', salt),
    role: 'admin',
    createdAt: new Date(),
  });

  // 2. User account: user@gamil.com / 1234
  users.push({
    _id: generateUserId(),
    name: 'Standard User',
    email: 'user@gamil.com',
    password: bcrypt.hashSync('1234', salt),
    role: 'user',
    createdAt: new Date(),
  });

  // 3. User account: user@gmail.com / 1234 (convenience spelling)
  users.push({
    _id: generateUserId(),
    name: 'Standard User (Gmail)',
    email: 'user@gmail.com',
    password: bcrypt.hashSync('1234', salt),
    role: 'user',
    createdAt: new Date(),
  });
};

// Initialize seeding
seedData();

module.exports = {
  users,
  addresses,
  generateUserId,
  generateAddressId,
};
