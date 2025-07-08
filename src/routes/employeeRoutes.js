const express = require("express");
const router = express.Router();
const employeeController = require("../controller/employeeController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// 🟢 Login route
router.post("/login", employeeController.loginEmployee);
router.get("/profile", authenticate, employeeController.getEmployeeProfile);
router.patch("/reset-password", authenticate, employeeController.resetPassword);

// Manager creates cook
router.post(
  "/create-cook",
  authenticate,
  authorize("manager"),
  employeeController.createCook
);
module.exports = router;
