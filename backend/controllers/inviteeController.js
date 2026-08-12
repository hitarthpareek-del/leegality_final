const inviteeService = require("../services/inviteeService");

async function getInvitees(req, res) {
  try {
    const company = req.headers["x-company"];

    if (!company) {
      return res.status(400).json({
        message: "Company header is required",
      });
    }

    const invitees =
      await inviteeService.getInvitees(company);

    res.json({
      success: true,
      data: invitees,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch invitees",
    });
  }
}

module.exports = {
  getInvitees,
};