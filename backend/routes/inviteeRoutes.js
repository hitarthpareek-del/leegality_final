const express = require("express");

const router = express.Router();
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const loadCurrentUser = require("../middleware/loadCurrentUser");
const requireAdmin = require("../middleware/requireAdmin");
const inviteeController = require("../controllers/inviteeController");


router.use(verifyFirebaseToken);
router.use(loadCurrentUser);
router.use(requireAdmin);

router.get("/", inviteeController.getInvitees);

module.exports = router;