function requireAdmin(req, res, next) {
  const role = req.currentUser.role;

  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
}

module.exports = requireAdmin;