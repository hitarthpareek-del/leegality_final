const express = require("express");

const router = express.Router();

const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const requireSuperAdmin = require("../middleware/requireSuperAdmin");
const loadCurrentUser = require("../middleware/loadCurrentUser");

const userController = require("../controllers/userController");

router.get(
  "/",
  verifyFirebaseToken,
  loadCurrentUser,
  requireSuperAdmin,
  userController.getUsers
);

router.post(
  "/",
  verifyFirebaseToken,
  loadCurrentUser,
  requireSuperAdmin,
  userController.createUser
);

router.put(
  "/:id",
  verifyFirebaseToken,
  loadCurrentUser,
  requireSuperAdmin,
  userController.updateRole
);

router.patch(
  "/:id/status",
  verifyFirebaseToken,
  loadCurrentUser,
  requireSuperAdmin,
  userController.updateUserStatus
);

module.exports = router;