// ============================================================
// Address Model — in-memory implementation simulating Mongoose API
// ============================================================

const { addresses, generateAddressId } = require('./dbStore');

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

class Address {
  constructor(data) {
    this._id = data._id || null;
    this.user = data.user;
    this.label = data.label || 'Home';
    this.street = data.street;
    this.city = data.city;
    this.state = data.state;
    this.zip = data.zip;
    this.country = data.country || 'India';
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    if (!this._id) {
      this._id = generateAddressId();
      addresses.push(this.toPlainObject());
    } else {
      const idx = addresses.findIndex(a => a._id === this._id);
      if (idx !== -1) {
        addresses[idx] = this.toPlainObject();
      } else {
        addresses.push(this.toPlainObject());
      }
    }
    return this;
  }

  toPlainObject() {
    return {
      _id: this._id,
      user: this.user,
      label: this.label,
      street: this.street,
      city: this.city,
      state: this.state,
      zip: this.zip,
      country: this.country,
      createdAt: this.createdAt,
    };
  }

  // --- Static methods ---

  static find(filter = {}) {
    let matchedAddresses = [...addresses];

    if (filter.user) {
      const userIdStr = (typeof filter.user === 'object' && filter.user._id)
        ? filter.user._id.toString()
        : filter.user.toString();

      matchedAddresses = matchedAddresses.filter(addr => {
        const addrUserIdStr = addr.user ? addr.user.toString() : '';
        return addrUserIdStr === userIdStr;
      });
    }

    return new Query(matchedAddresses.map(a => new Address(a)));
  }

  static async findById(id) {
    if (!id) return null;
    const addr = addresses.find(a => a._id === id.toString());
    return addr ? new Address(addr) : null;
  }

  static async create(addressData) {
    const addr = new Address(addressData);
    await addr.save();
    return addr;
  }

  static async findByIdAndDelete(id) {
    const idx = addresses.findIndex(a => a._id === id.toString());
    if (idx !== -1) {
      const deleted = addresses.splice(idx, 1)[0];
      return new Address(deleted);
    }
    return null;
  }

  static async deleteMany(filter = {}) {
    if (filter.user) {
      const userIdStr = (typeof filter.user === 'object' && filter.user._id)
        ? filter.user._id.toString()
        : filter.user.toString();

      let i = addresses.length;
      while (i--) {
        const addrUserIdStr = addresses[i].user ? addresses[i].user.toString() : '';
        if (addrUserIdStr === userIdStr) {
          addresses.splice(i, 1);
        }
      }
    }
    return { deletedCount: 0 };
  }
}

module.exports = Address;
