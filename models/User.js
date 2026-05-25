// ============================================================
// User Model — in-memory implementation simulating Mongoose API
// ============================================================

const bcrypt = require('bcryptjs');
const { users, generateUserId } = require('./dbStore');

class Query {
  constructor(data) {
    this.data = data;
  }

  sort(sortOptions) {
    if (!sortOptions) return this;
    const key = Object.keys(sortOptions)[0];
    const direction = sortOptions[key];
    this.data.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      if (valA < valB) return direction === -1 ? 1 : -1;
      if (valA > valB) return direction === -1 ? -1 : 1;
      return 0;
    });
    return this;
  }

  then(onFulfilled, onRejected) {
    return Promise.resolve(this.data).then(onFulfilled, onRejected);
  }
}

class User {
  constructor(data) {
    this._id = data._id || null;
    this.name = data.name;
    this.email = data.email ? data.email.toLowerCase() : data.email;
    this.password = data.password;
    this.role = data.role || 'user';
    this.createdAt = data.createdAt || new Date();
    
    // Track original password to check for modifications
    this._originalPassword = data.password;
  }

  isModified(field) {
    if (field === 'password') {
      return this.password !== this._originalPassword;
    }
    return false;
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  async save() {
    if (this.password && this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      this._originalPassword = this.password;
    }

    if (!this._id) {
      this._id = generateUserId();
      users.push(this.toPlainObject());
    } else {
      const idx = users.findIndex(u => u._id === this._id);
      if (idx !== -1) {
        users[idx] = this.toPlainObject();
      } else {
        users.push(this.toPlainObject());
      }
    }
    return this;
  }

  toPlainObject() {
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      createdAt: this.createdAt,
    };
  }

  // --- Static methods ---

  static async findOne(query) {
    const key = Object.keys(query)[0];
    if (!key) return null;
    
    let targetVal = query[key];
    if (typeof targetVal === 'string') targetVal = targetVal.toLowerCase();

    const u = users.find(user => {
      let userVal = user[key];
      if (typeof userVal === 'string') userVal = userVal.toLowerCase();
      return userVal === targetVal;
    });

    return u ? new User(u) : null;
  }

  static async findById(id) {
    if (!id) return null;
    const u = users.find(user => user._id === id.toString());
    return u ? new User(u) : null;
  }

  static async create(userData) {
    const user = new User(userData);
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      user._originalPassword = user.password;
    }
    await user.save();
    return user;
  }

  static find(filter = {}) {
    let matchedUsers = [...users];
    if (filter.$or) {
      matchedUsers = matchedUsers.filter(u => {
        return filter.$or.some(condition => {
          const key = Object.keys(condition)[0];
          const value = condition[key];
          if (value instanceof RegExp) {
            return value.test(u[key]);
          }
          return u[key] === value;
        });
      });
    }
    return new Query(matchedUsers.map(u => new User(u)));
  }

  static async findByIdAndDelete(id) {
    const idx = users.findIndex(u => u._id === id.toString());
    if (idx !== -1) {
      const deleted = users.splice(idx, 1)[0];
      return new User(deleted);
    }
    return null;
  }
}

module.exports = User;
