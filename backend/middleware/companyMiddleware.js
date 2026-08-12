const companies = require("../config/companies");

function companyMiddleware(req, res, next) {
  const companyName = req.header("X-Company");

  if (!companyName) {
    return res.status(400).json({
      success: false,
      message: "Company header is required.",
    });
  }

  const company = companies[companyName];

  if (!company) {
    return res.status(400).json({
      success: false,
      message: "Invalid company selected.",
    });
  }

  req.company = company;

  next();
}

module.exports = companyMiddleware;