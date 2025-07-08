const Employee = require("../models/employeeModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔐 Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Manager creates Cook assigned to their store
exports.createCook = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // // Ensure only a manager can access this — add route guard in router
    // if (req.user.role !== 'manager') {
    //   return res.status(403).json({ message: 'Only managers can create cooks' });
    // }

    const existing = await Employee.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const cook = await Employee.create({
      name,
      email,
      password: hashedPassword,
      role: "cook",
      storeId: req.user.storeId,
    });

    res.status(201).json({ message: "Cook created", cook });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👤 Employee Login Controller
exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(employee._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        storeId: employee.storeId,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔐 Get authenticated user's role, email, and store info
exports.getEmployeeProfile = async (req, res) => {
  try {
    // `req.user.id` should come from authentication middleware after token verification
    const employee = await Employee.findById(req.user.id).select(
      "email role storeId"
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      email: employee.email,
      role: employee.role,
      storeId: employee.storeId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔒 Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const employee = await Employee.findById(req.user.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    const isMatch = await bcrypt.compare(currentPassword, employee.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
