const Store = require('../models/storeModel');
const Employee = require('../models/employeeModel');
const bcrypt = require('bcryptjs');

exports.createStoreWithManager = async (req, res) => {
  try {
    const {
      name, address, phone, website,
      openTime, status, email, password
    } = req.body;

    // Step 1: Create Store
    const store = await Store.create({
      name, address, phone, website, openTime, status
    });

    // Step 2: Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 3: Create Manager linked to Store
    const manager = await Employee.create({
      name: name + ' Manager',
      email,
      password: hashedPassword,
      role: 'manager',
      storeId: store._id
    });

    res.status(201).json({
      message: 'Store and Manager created successfully',
      store,
      manager
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
