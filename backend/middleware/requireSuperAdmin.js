const pool = require("../config/db");

async function requireSuperAdmin(req, res, next) {
  try {
    const email = req.user.email.trim().toLowerCase();

    const [rows] = await pool.query(
      `
      SELECT
        id,
        email,
        role,
        is_active
      FROM user_roles
      WHERE email = ?
      `,
      [email]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUser = rows[0];

    if (!currentUser.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is disabled.",
      });
    }

    if (currentUser.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Superadmin access required.",
      });
    }

    req.currentUser = currentUser;

    next();

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

module.exports = requireSuperAdmin;