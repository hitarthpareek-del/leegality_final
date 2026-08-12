const express = require("express");

const router = express.Router();

const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const loadCurrentUser = require("../middleware/loadCurrentUser");
const requireAdmin = require("../middleware/requireAdmin");
const companyMiddleware = require("../middleware/companyMiddleware");

const {
  submitSigningRequest,
} = require("../controllers/signController");

router.use(verifyFirebaseToken);
router.use(loadCurrentUser);
router.use(requireAdmin);
router.use(companyMiddleware);

router.post(
  "/request",
  submitSigningRequest
);

module.exports = router;