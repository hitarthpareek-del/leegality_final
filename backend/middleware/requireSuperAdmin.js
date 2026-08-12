function requireSuperAdmin(req, res, next) {
  if (req.currentUser.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Superadmin access required.",
    });
  }

  next();
}

module.exports = requireSuperAdmin;