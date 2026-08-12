const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const loadCurrentUser = require("../middleware/loadCurrentUser");
const requireAdmin = require("../middleware/requireAdmin");

const upload = require("../middleware/upload");

const {
  createMember,
  getMembers,
  getMemberById,
  deactivateMember,
  activateMember,
  getInactiveMembers,
  updateHrDetails,
  updateMemberStatus
} = require("../controllers/memberController");

router.post(
  "/",
  upload.fields([
    { name: "aadhar_copy", maxCount: 1 },
    { name: "pan_copy", maxCount: 1 },
    { name: "passport_photo", maxCount: 1 },
    { name: "cancelled_cheque", maxCount: 1 },
    { name: "dob_proof", maxCount: 1 },
    { name: "education_certificate", maxCount: 1 },
    { name: "salary_slips", maxCount: 1 },
    { name: "relieving_letter", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  createMember
);

router.use(verifyFirebaseToken);
router.use(loadCurrentUser);
router.use(requireAdmin);



router.get("/", getMembers);

router.get("/inactive", getInactiveMembers);

router.patch("/:id/status", updateMemberStatus);

router.put("/:id/hr", updateHrDetails);

router.get("/:id", getMemberById);

router.patch("/:id/deactivate", deactivateMember);

router.patch("/:id/activate", activateMember);



module.exports = router;