const {
  createSigningRequest,
} = require("../services/signService");

const submitSigningRequest = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.file) {
      return res.status(400).json({
        success: false,
        message: "file is required",
      });
    }

    const response =
    await createSigningRequest(
        req.company,
        req.query.type,
        req.body
    );

    res.json(response);

  } catch (error) {

    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message: "Signing request failed",
      error:
        error.response?.data ||
        error.message,
    });

  }
};

module.exports = {
  submitSigningRequest,
};