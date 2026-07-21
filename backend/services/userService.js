const pool = require("../config/db");

async function getSuperAdminCount() {
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM user_roles
    WHERE role = 'superadmin'
    AND is_active = TRUE
  `);

  return rows[0].total;
}

module.exports = {
  getSuperAdminCount,
};