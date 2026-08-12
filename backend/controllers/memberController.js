const memberService = require("../services/memberServices");

/**
 * Create Member
 */
async function createMember(req, res) {
  try {
    const files = req.files || {};

    const getFilePath = (field) =>
      files[field]?.[0]?.path.replace(/\\/g, "/") || null;

    const memberData = {
      ...req.body,

      aadhar_copy: getFilePath("aadhar_copy"),
      pan_copy: getFilePath("pan_copy"),
      passport_photo: getFilePath("passport_photo"),
      cancelled_cheque: getFilePath("cancelled_cheque"),
      dob_proof: getFilePath("dob_proof"),
      education_certificate: getFilePath("education_certificate"),
      salary_slips: getFilePath("salary_slips"),
      relieving_letter: getFilePath("relieving_letter"),
      resume: getFilePath("resume"),
    };

    // Email
    if (!/^\S+@\S+\.\S+$/.test(memberData.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    // Phone
    if (!/^[6-9]\d{9}$/.test(memberData.phone_number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number.",
      });
    }

    // Emergency Phone
    if (!/^[6-9]\d{9}$/.test(memberData.emergency_contact_number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid emergency contact number.",
      });
    }

    // Aadhaar
    if (!/^\d{12}$/.test(memberData.aadhar_number)) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number must contain exactly 12 digits.",
      });
    }

    // PAN
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(memberData.pan_number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN number.",
      });
    }

    /* ---------------- Required Text Fields ---------------- */

    const requiredFields = [
      "email",
      "title",
      "first_name",
      "last_name",
      "full_name",
      "gender",
      "date_of_birth",
      "nationality",
      "guardian_name",
      "guardian_relationship",
      "phone_number",
      "emergency_contact_person",
      "emergency_contact_number",
      "aadhar_address",
      "present_address",
      "permanent_address",
      "pan_number",
      "aadhar_number",
      "highest_qualification",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = memberData[field];

      return (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      );
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
        missingFields,
      });
    }

    /* ---------------- Required Documents ---------------- */

    const requiredFiles = [
      "aadhar_copy",
      "pan_copy",
      "passport_photo",
      "cancelled_cheque",
      "dob_proof",
      "education_certificate",
      "salary_slips",
      "relieving_letter",
      "resume",
    ];

    const missingFiles = requiredFiles.filter(
      (field) => !memberData[field]
    );

    if (missingFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload all required documents.",
        missingFiles,
      });
    }

    /* ---------------- Save Member ---------------- */

    const id = await memberService.createMember(memberData);

    return res.status(201).json({
      success: true,
      message: "Member created successfully.",
      id,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create member.",
    });
  }
}

/**
 * Get All Members
 */
async function getMembers(req, res) {
  try {

    const members = await memberService.getMembers();

    return res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch members.",
    });
  }
}

/**
 * Get Member Details
 */
async function getMemberById(req, res) {
  try {
    ;

    const member = await memberService.getMemberById(
      req.params.id,
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    return res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch member.",
    });
  }
}

/**
 * Delete Member
 */
async function deactivateMember(req, res) {
  try {

    await memberService.deactivateMember(req.params.id);

    return res.json({
      success: true,
      message: "Member deactivated successfully.",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete member.",
    });
  }
}

async function activateMember(req, res) {
  try {
    await memberService.activateMember(req.params.id);

    return res.json({
      success: true,
      message: "Member activated successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to activate member.",
    });
  }
}

async function getInactiveMembers(req, res) {
  try {
    const members = await memberService.getInactiveMembers();

    return res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inactive members.",
    });
  }
}

async function updateHrDetails(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required.",
      });
    }

    const result = await memberService.updateHrDetails(id, req.body);

    return res.status(200).json({
      success: true,
      message: "HR details updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("updateHrDetails error:", error);

    if (error.message === "Member not found.") {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update HR details.",
      error: error.message,
    });
  }
}

async function updateMemberStatus(req, res) {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    await memberService.updateMemberStatus(
      req.params.id,
      status
    );

    return res.json({
      success: true,
      message: "Member status updated successfully.",
    });

  } catch (error) {
    console.error(error);

    if (error.message === "Invalid status.") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update member status.",
    });
  }
}

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  deactivateMember,
  activateMember,
  getInactiveMembers,
  updateHrDetails,
  updateMemberStatus
};