const express = require("express");

const router = express.Router();

const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const requireSuperAdmin = require("../middleware/requireSuperAdmin");

const userController = require("../controllers/userController");

router.get(
  "/",
  verifyFirebaseToken,
  requireSuperAdmin,
  userController.getUsers
);

router.post(
  "/",
  verifyFirebaseToken,
  requireSuperAdmin,
  userController.createUser
);

router.put(
  "/:id",
  verifyFirebaseToken,
  requireSuperAdmin,
  userController.updateRole
);

router.patch(
  "/:id/status",
  verifyFirebaseToken,
  requireSuperAdmin,
  userController.updateUserStatus
);

module.exports = router;