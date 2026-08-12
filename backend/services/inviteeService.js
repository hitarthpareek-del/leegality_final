const db = require("../config/db");

async function getInvitees(company) {
  const [rows] = await db.execute(
    `
    SELECT
      id,
      full_name,
      email,
      phone_number,
      designation
    FROM invitees
    WHERE company = ?
      AND status = 'Active'
    ORDER BY full_name
    `,
    [company]
  );

  return rows;
}

module.exports = {
  getInvitees,
};