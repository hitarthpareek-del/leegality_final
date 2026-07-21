const pool = require("../config/db");
const { getSuperAdminCount } = require("../services/userService");


exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be true or false",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        id,
        email,
        role,
        is_active
      FROM user_roles
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const target = rows[0];

    // Don't allow disabling yourself
    if (
      target.email.toLowerCase() ===
      req.currentUser.email.toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot disable your own account.",
      });
    }

    // Prevent disabling the last active superadmin
    if (
      target.role === "superadmin" &&
      target.is_active &&
      is_active === false
    ) {
      const count = await getSuperAdminCount();

      if (count <= 1) {
        return res.status(400).json({
          success: false,
          message: "At least one active superadmin is required.",
        });
      }
    }

    await pool.query(
      `
      UPDATE user_roles
      SET is_active = ?
      WHERE id = ?
      `,
      [is_active, id]
    );

    res.json({
      success: true,
      message: is_active
        ? "User enabled successfully."
        : "User disabled successfully.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.getUsers = async (req, res) => {
  try {
 const [users] = await pool.query(`
  SELECT
    id,
    email,
    role,
    is_active,
    created_at,
    updated_at
  FROM user_roles
  ORDER BY created_at DESC
`);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    let { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required",
      });
    }

    email = email.trim().toLowerCase();

    if (!["admin", "superadmin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Check if user already exists
    const [existing] = await pool.query(
      "SELECT id, is_active FROM user_roles WHERE email = ?",
      [email]
    );

    // User exists
    if (existing.length > 0) {
      // Already active
      if (existing[0].is_active) {
        return res.status(409).json({
          success: false,
          message: "User already exists",
        });
      }

      // Reactivate user
      await pool.query(
        `
        UPDATE user_roles
        SET
            role = ?,
            is_active = TRUE
        WHERE email = ?
        `,
        [role, email]
      );

      return res.json({
        success: true,
        message: "User reactivated successfully",
      });
    }

    // New user
    await pool.query(
      `
      INSERT INTO user_roles(email, role)
      VALUES(?, ?)
      `,
      [email, role]
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "superadmin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const [existing] = await pool.query(
      `
      SELECT id,email,role
      FROM user_roles
      WHERE id=?
      `,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const target = existing[0];

    // Cannot change your own role
    if (target.email === req.currentUser.email) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    // Prevent removing the last superadmin
    if (
      target.role === "superadmin" &&
      role === "admin"
    ) {
      const count = await getSuperAdminCount();

      if (count <= 1) {
        return res.status(400).json({
          success: false,
          message: "At least one active superadmin is required.",
        });
      }
    }

    await pool.query(
      `
      UPDATE user_roles
      SET role=?
      WHERE id=?
      `,
      [role, id]
    );

    res.json({
      success: true,
      message: "Role updated successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};