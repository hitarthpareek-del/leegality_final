const db = require("../config/db");

/**
 * Create Member
 */
async function createMember(memberData) {
    const {
        email,
        title,
        first_name,
        last_name,
        full_name,

        gender,
        date_of_birth,
        nationality,

        company = null,
        employee_code = null,
        designation = null,
        offer_letter_date = null,
        joining_date = null,

        guardian_name,
        guardian_relationship,

        phone_number,
        emergency_contact_person,
        emergency_contact_number,

        aadhar_address,
        present_address,
        permanent_address,

        pan_number,
        aadhar_number,

        highest_qualification,

        aadhar_copy = null,
        pan_copy = null,
        passport_photo = null,
        cancelled_cheque = null,
        dob_proof = null,
        education_certificate = null,
        salary_slips = null,
        relieving_letter = null,
        resume = null,

        remarks = null,
        status = "Pending",
    } = memberData;

    const query = `
    INSERT INTO member_details (

      email,
   
      title,
      first_name,
      last_name,
      full_name,

      gender,
      date_of_birth,
      nationality,

      company,
      employee_code,
      designation,
      offer_letter_date,
      joining_date,

      guardian_name,
      guardian_relationship,

      phone_number,
      emergency_contact_person,
      emergency_contact_number,

      aadhar_address,
      present_address,
      permanent_address,

      pan_number,
      aadhar_number,

      highest_qualification,

      aadhar_copy,
      pan_copy,
      passport_photo,
      cancelled_cheque,
      dob_proof,
      education_certificate,
      salary_slips,
      relieving_letter,
      resume,

      remarks,
      status

    )
    VALUES (
      ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `;

    const values = [
        email,
        title,
        first_name,
        last_name,
        full_name,

        gender,
        date_of_birth,
        nationality,

        company,
        employee_code,
        designation,
        offer_letter_date,
        joining_date,

        guardian_name,
        guardian_relationship,

        phone_number,
        emergency_contact_person,
        emergency_contact_number,

        aadhar_address,
        present_address,
        permanent_address,

        pan_number,
        aadhar_number,

        highest_qualification,

        aadhar_copy,
        pan_copy,
        passport_photo,
        cancelled_cheque,
        dob_proof,
        education_certificate,
        salary_slips,
        relieving_letter,
        resume,

        remarks,
        status || "Pending",
    ];

    const [result] = await db.execute(query, values);

    return result.insertId;
}


/**
 * Get all members for one company
 */
async function getMembers() {

    const [rows] = await db.execute(
        `
        SELECT *
FROM member_details
WHERE is_active = TRUE
ORDER BY created_at DESC;
        `
    );

    return rows;
}

/**
 * Get one member
 */
async function getMemberById(id) {
    const [rows] = await db.execute(
        `
    SELECT *
FROM member_details
WHERE id = ?
AND is_active = TRUE;
    `,
        [id]
    );

    return rows[0];
}

/**
 * Delete Member
 */
async function deactivateMember(id) {
  const [result] = await db.execute(
    `
      UPDATE member_details
      SET is_active = FALSE
      WHERE id = ?
    `,
    [id]
  );

  return result;
}

async function activateMember(id) {
  const [result] = await db.execute(
    `
    UPDATE member_details
    SET is_active = TRUE
    WHERE id = ?
    `,
    [id]
  );

  return result;
}

    async function getInactiveMembers() {
    const [rows] = await db.execute(
        `
        SELECT *
        FROM member_details
        WHERE is_active = FALSE
        ORDER BY created_at DESC;
        `
    );

    return rows;
    }

async function updateHrDetails(id, data) {
  const {
    company = null,
    employee_code = null,
    designation = null,
    offer_letter_date = null,
    joining_date = null,
    remarks = null,
    status = "Pending",
  } = data;

  const [result] = await db.execute(
    `
    UPDATE member_details
    SET
      company = ?,
      employee_code = ?,
      designation = ?,
      offer_letter_date = ?,
      joining_date = ?,
      remarks = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [
      company,
      employee_code,
      designation,
      offer_letter_date,
      joining_date,
      remarks,
      status,
      id,
    ]
  );

  if (result.affectedRows === 0) {
    throw new Error("Member not found.");
  }

  return result;
}

async function updateMemberStatus(id, status) {
  const allowedStatuses = [
    "Pending",
    "In Review",
    "Completed",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status.");
  }

  const [result] = await db.execute(
    `
    UPDATE member_details
    SET
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [status, id]
  );

  return result;
}



module.exports = {
    createMember,
    getMembers,
    getMemberById,
    deactivateMember,
    activateMember,
    getInactiveMembers,
    updateHrDetails,
    updateMemberStatus
};