const express = require("express");

const router = express.Router();

const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const authController = require("../controllers/authController");

router.get("/login", verifyFirebaseToken, authController.login);

module.exports = router;