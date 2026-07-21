const pool = require("../config/db");

exports.login = async (req, res) => {
  try {
    const email = req.user.email;

    const [rows] = await pool.query(
  `
  SELECT role
  FROM user_roles
  WHERE email = ?
  AND is_active = TRUE
  `,
  [email]
);

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "User not authorized",
      });
    }

    res.json({
      success: true,
      email,
      role: rows[0].role,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};