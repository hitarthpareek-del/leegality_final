import { useState } from "react";
import axios from "axios";
import Header from "../components/Layout/Header";
import ToastMessage from "../components/Common/ToastMessage";
import { API_URL } from "../services/config";

export default function UserDetailsFormPage() {

    const [loading, setLoading] = useState(false);
    const [sameAsAadhar, setSameAsAadhar] = useState({
        present: false,
        permanent: false,
    });

    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        bg: "success",
    });

    const [form, setForm] = useState({
        email: "",
        title: "",
        full_name: "",
        gender: "",
        date_of_birth: "",
        nationality: "",
        guardian_name: "",
        guardian_relationship: "",
        phone_number: "",
        emergency_contact_person: "",
        emergency_contact_number: "",
        aadhar_address: "",
        present_address: "",
        permanent_address: "",
        pan_number: "",
        aadhar_number: "",
        highest_qualification: "",
        company: "",
        status: "Pending",
    });

    const [otherValues, setOtherValues] = useState({
        title_other: "",
        guardian_relationship_other: "",
        highest_qualification_other: "",
    });

    const [files, setFiles] = useState({
        aadhar_copy: null,
        pan_copy: null,
        passport_photo: null,
        cancelled_cheque: null,
        dob_proof: null,
        education_certificate: null,
        salary_slips: null,
        relieving_letter: null,
        resume: null,
    });

    const guardianRelationshipOptions = [
        "Father",
        "Mother",
        "Spouse",
        "Other",
    ];

    const qualificationOptions = [
        "High School",
        "Diploma",
        "Bachelor of Science",
        "Bachelor of Engineering",
        "Bachelor of Commerce",
        "Bachelor of Arts",
        "Master of Science",
        "Master of Engineering",
        "Master of Business Administration",
        "Other",
    ];

    const showToast = (title, message, bg = "success") => {
        setToast({
            show: true,
            title,
            message,
            bg,
        });
    };
    function handleChange(e) {
        const { name, value } = e.target;

        if (name.endsWith("_other")) {
            setOtherValues((prev) => ({
                ...prev,
                [name]: value,
            }));
            return;
        }

        setForm((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };

            // Keep addresses synced with Aadhaar Address
            if (name === "aadhar_address") {
                if (sameAsAadhar.present) {
                    updated.present_address = value;
                }

                if (sameAsAadhar.permanent) {
                    updated.permanent_address = value;
                }
            }

            return updated;
        });
    }

    function handleSameAddress(type) {
        setSameAsAadhar((prev) => {
            const checked = !prev[type];

            if (checked) {
                setForm((current) => ({
                    ...current,
                    [type === "present"
                        ? "present_address"
                        : "permanent_address"]: current.aadhar_address,
                }));
            }

            return {
                ...prev,
                [type]: checked,
            };
        });
    }

    function handleFileChange(e) {
        const { name, files: fileList } = e.target;
        if (fileList && fileList[0]) {
            setFiles((prev) => ({
                ...prev,
                [name]: fileList[0],
            }));
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Merge "other" values into main fields if they are selected
        const finalForm = { ...form };
        const nameParts = finalForm.full_name.trim().split(/\s+/);

        finalForm.first_name = nameParts[0] || "";

        finalForm.last_name =
            nameParts.length > 1
                ? nameParts.slice(1).join(" ")
                : "";

        if (form.title === "Other" && !otherValues.title_other) {
            showToast("Error", "Please specify title", "warning");
            return;
        }
        if (form.title === "Other") {
            finalForm.title = otherValues.title_other;
        }

        if (form.guardian_relationship === "Other" && !otherValues.guardian_relationship_other) {
            showToast("Error", "Please specify guardian relationship", "warning");
            return;
        }
        if (form.guardian_relationship === "Other") {
            finalForm.guardian_relationship = otherValues.guardian_relationship_other;
        }

        if (form.highest_qualification === "Other" && !otherValues.highest_qualification_other) {
            showToast("Error", "Please specify highest qualification", "warning");
            return;
        }
        if (form.highest_qualification === "Other") {
            finalForm.highest_qualification = otherValues.highest_qualification_other;
        }

        // Validation for all required fields
        const requiredFields = [
            "email",
            "title",
            "full_name",
            "gender",
            "date_of_birth",
            "nationality",
            "guardian_name",
            "guardian_relationship",
            "phone_number",
            "emergency_contact_person",
            "emergency_contact_number",
            "aadhar_address",
            "present_address",
            "permanent_address",
            "pan_number",
            "aadhar_number",
            "highest_qualification",
            "company", // <-- Add
        ];

        const missingFields = requiredFields.filter((field) => {
            const value = finalForm[field];
            return value === "" || value === null || value === undefined;
        });

        console.log("Final Form:", finalForm);
        console.log("Missing Fields:", missingFields);

        if (missingFields.length > 0) {
            showToast("Error", "Please fill in all required fields", "warning");
            return;
        }

        // Validation for all files
        const requiredFiles = Object.keys(files);
        const missingFiles = requiredFiles.filter((key) => !files[key]);

        if (missingFiles.length > 0) {
            showToast("Error", "Please upload all required documents", "warning");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            // Append all text fields
            Object.keys(finalForm).forEach((key) => {
                if (finalForm[key]) {
                    formData.append(key, finalForm[key]);
                }
            });

            // Append all files
            Object.keys(files).forEach((key) => {
                if (files[key]) {
                    formData.append(key, files[key]);
                }
            });

            const response = await axios.post(
                `${API_URL}/members`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            showToast("Success", "User Details Submitted Successfully", "success");


            // Reset form
            setForm({
                email: "",
                title: "",
                full_name: "",
                gender: "",
                date_of_birth: "",
                nationality: "",
                guardian_name: "",
                guardian_relationship: "",
                phone_number: "",
                emergency_contact_person: "",
                emergency_contact_number: "",
                aadhar_address: "",
                present_address: "",
                permanent_address: "",
                pan_number: "",
                aadhar_number: "",
                highest_qualification: "",
                company: "",
                status: "Pending",
            });

            setOtherValues({
                title_other: "",
                guardian_relationship_other: "",
                highest_qualification_other: "",
            });

            setFiles({
                aadhar_copy: null,
                pan_copy: null,
                passport_photo: null,
                cancelled_cheque: null,
                dob_proof: null,
                education_certificate: null,
                salary_slips: null,
                relieving_letter: null,
                resume: null,
            });
        } catch (err) {
            console.error(err);
            showToast("Fill Correct Details", err.response?.data?.message || "Unable to submit user details.", "warning");
        }

        setLoading(false);
    }

    return (
        <>
            <Header
                title="Form"
                subtitle="hide-profile"
                backDisable={false}
            />

            <div className="container-fluid px-3 px-lg-4 py-3">
                <form onSubmit={handleSubmit}>
                    <div className="card border-0 shadow-sm">
                        {/* Header */}
                        <div className="card-header bg-white border-bottom px-4 py-3">
                            <div>
                                <h5 className="mb-1 fw-semibold">
                                    Member Registration
                                </h5>

                                <small className="text-muted">
                                    Complete your profile with personal and
                                    professional details
                                </small>
                            </div>
                        </div>

                        <div className="card-body p-3 p-lg-4">
                            <div className="row g-4">
                                {/* LEFT COLUMN */}
                                <div className="col-lg-5">
                                    {/* Contact Information */}
                                    <div className="mb-4">
                                        <SectionTitle
                                            number="01"
                                            title="Contact Information"
                                        />

                                        <div className="row g-3">
                                            <div className="col-md-8">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Email Address
                                                    <span className="text-danger ms-1">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    placeholder="john@example.com"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Phone Number
                                                    <span className="text-danger ms-1">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    className="form-control"
                                                    name="phone_number"
                                                    value={form.phone_number}
                                                    onChange={handleChange}
                                                    placeholder="9876543210"
                                                    required
                                                />
                                            </div>


                                        </div>
                                    </div>

                                    {/* Personal Information */}
                                    <div className="mb-4">
                                        <SectionTitle
                                            number="02"
                                            title="Personal Information"
                                        />

                                        <div className="row g-3">

                                            <div className="col-md-3">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Title
                                                    <span className="text-danger ms-1">
                                                        *
                                                    </span>
                                                </label>

                                                <select
                                                    className="form-select"
                                                    name="title"
                                                    value={form.title}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">
                                                        Select
                                                    </option>
                                                    <option value="Mr">
                                                        Mr
                                                    </option>
                                                    <option value="Mrs">
                                                        Mrs
                                                    </option>
                                                    <option value="Ms">
                                                        Ms
                                                    </option>
                                                    <option value="Dr">
                                                        Dr
                                                    </option>
                                                    <option value="Other">
                                                        Other
                                                    </option>
                                                </select>

                                                {form.title === "Other" && (
                                                    <input
                                                        type="text"
                                                        className="form-control mt-2"
                                                        name="title_other"
                                                        value={form.title_other}
                                                        onChange={handleChange}
                                                        placeholder="Please specify"
                                                    />
                                                )}
                                            </div>



                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Full Name
                                                    <span className="text-danger ms-1">*</span>
                                                </label>

                                                <input
                                                    className="form-control"
                                                    name="full_name"
                                                    value={form.full_name}
                                                    onChange={handleChange}
                                                    placeholder="Enter full name"
                                                    required
                                                />


                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Gender
                                                    <span className="text-danger ms-1">
                                                        *
                                                    </span>
                                                </label>

                                                <select
                                                    className="form-select"
                                                    name="gender"
                                                    value={form.gender}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">
                                                        Select
                                                    </option>
                                                    <option value="Male">
                                                        Male
                                                    </option>
                                                    <option value="Female">
                                                        Female
                                                    </option>
                                                    <option value="Other">
                                                        Other
                                                    </option>
                                                </select>
                                            </div>


                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Date of Birth
                                                    <span className="text-danger ms-1">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="date_of_birth"
                                                    value={form.date_of_birth}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>



                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Nationality
                                                    <span className="text-danger ms-1">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    className="form-control"
                                                    name="nationality"
                                                    value={form.nationality}
                                                    onChange={handleChange}
                                                    placeholder="Indian"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Highest Qualification
                                                    <span className="text-danger ms-1">*</span>
                                                </label>

                                                <select
                                                    className="form-select"
                                                    name="highest_qualification"
                                                    value={form.highest_qualification}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Select</option>

                                                    {qualificationOptions.map((qual) => (
                                                        <option key={qual} value={qual}>
                                                            {qual}
                                                        </option>
                                                    ))}
                                                </select>

                                                {form.highest_qualification === "Other" && (
                                                    <input
                                                        type="text"
                                                        className="form-control mt-2"
                                                        name="highest_qualification_other"
                                                        value={otherValues.highest_qualification_other}
                                                        onChange={handleChange}
                                                        placeholder="Please specify"
                                                        required
                                                    />
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Company
                                                    <span className="text-danger ms-1">*</span>
                                                </label>

                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="company"
                                                    value={form.company}
                                                    onChange={handleChange}
                                                    placeholder="Enter company name"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Guardian Information */}
                                    <div className="mb-4">
                                        <SectionTitle
                                            number="03"
                                            title="Guardian Information"
                                        />

                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Guardian Name
                                                    <span className="text-danger ms-1">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    className="form-control"
                                                    name="guardian_name"
                                                    value={form.guardian_name}
                                                    onChange={handleChange}
                                                    placeholder="Full name"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Relationship
                                                    <span className="text-danger ms-1">
                                                        *
                                                    </span>
                                                </label>

                                                <select
                                                    className="form-select"
                                                    name="guardian_relationship"
                                                    value={form.guardian_relationship}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">
                                                        Select
                                                    </option>
                                                    {guardianRelationshipOptions.map(
                                                        (rel) => (
                                                            <option
                                                                key={rel}
                                                                value={rel}
                                                            >
                                                                {rel}
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                                {form.guardian_relationship === "Other" && (
                                                    <input
                                                        type="text"
                                                        className="form-control mt-2"
                                                        name="guardian_relationship_other"
                                                        value={form.guardian_relationship_other}
                                                        onChange={handleChange}
                                                        placeholder="Please specify"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Identification & Emergency */}
                                    <div className="mb-4">
                                        <SectionTitle
                                            number="04"
                                            title="Emergency Contact"
                                        />

                                        <div className="row g-3">


                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Emergency Contact
                                                    Person
                                                    <span className="text-danger ms-1">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    className="form-control"
                                                    name="emergency_contact_person"
                                                    value={
                                                        form.emergency_contact_person
                                                    }
                                                    onChange={handleChange}
                                                    placeholder="Full name"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Emergency Contact Number
                                                    <span className="text-danger ms-1">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    className="form-control"
                                                    name="emergency_contact_number"
                                                    value={
                                                        form.emergency_contact_number
                                                    }
                                                    onChange={handleChange}
                                                    placeholder="Phone number"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="col-lg-7">
                                    {/* Address Information */}
                                    <div className="mb-4">
                                        <SectionTitle
                                            number="05"
                                            title="Address Information"
                                        />

                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Aadhaar Address
                                                    <span className="text-danger ms-1">
                                                        *
                                                    </span>
                                                </label>

                                                <textarea
                                                    rows="2"
                                                    className="form-control"
                                                    name="aadhar_address"
                                                    value={form.aadhar_address}
                                                    onChange={handleChange}
                                                    placeholder="Enter aadhaar registered address"
                                                    required
                                                />
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <label className="form-label small fw-semibold mb-0">
                                                    Present Address
                                                    <span className="text-danger ms-1">*</span>
                                                </label>

                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={sameAsAadhar.present}
                                                        onChange={() => handleSameAddress("present")}
                                                        id="samePresent"
                                                    />

                                                    <label
                                                        className="form-check-label small"
                                                        htmlFor="samePresent"
                                                    >
                                                        Same as Aadhaar Address
                                                    </label>
                                                </div>


                                            </div>
                                            <textarea
                                                rows="2"
                                                className="form-control"
                                                name="present_address"
                                                value={form.present_address}
                                                onChange={handleChange}
                                                placeholder="Enter current residential address"
                                                readOnly={sameAsAadhar.present}
                                                required
                                            />

                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <label className="form-label small fw-semibold mb-0">
                                                    Permanent Address
                                                    <span className="text-danger ms-1">*</span>
                                                </label>

                                                <div className="form-check m-0">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={sameAsAadhar.permanent}
                                                        onChange={() => handleSameAddress("permanent")}
                                                        id="samePermanent"
                                                    />

                                                    <label
                                                        className="form-check-label small"
                                                        htmlFor="samePermanent"
                                                    >
                                                        Same as Aadhaar Address
                                                    </label>
                                                </div>
                                            </div>
                                            <textarea
                                                rows="2"
                                                className="form-control"
                                                name="permanent_address"
                                                value={form.permanent_address}
                                                onChange={handleChange}
                                                placeholder="Enter permanent residential address"
                                                readOnly={sameAsAadhar.permanent}
                                                required
                                            />
                                        </div>
                                    </div>


                                    {/* Document Uploads */}
                                    <div>
                                        <SectionTitle
                                            number="06"
                                            title="Document Uploads"
                                            rightText="All required"
                                        />

                                        <div className="row g-3">
                                            {[{
                                                key: "pan_copy",
                                                label: "PAN Copy",
                                            },

                                            {
                                                key: "aadhar_copy",
                                                label: "Aadhaar Copy",
                                            },
                                            {
                                                key: "passport_photo",
                                                label: "Passport Photo",
                                            },
                                            {
                                                key: "dob_proof",
                                                label: "DOB Proof",
                                            },
                                            {
                                                key: "cancelled_cheque",
                                                label: "Cancelled Cheque",
                                            },
                                            {
                                                key: "education_certificate",
                                                label: "Education Certificate",
                                            },
                                            {
                                                key: "salary_slips",
                                                label: "Salary Slips",
                                            },
                                            {
                                                key: "relieving_letter",
                                                label: "Relieving Letter",
                                            },
                                            {
                                                key: "resume",
                                                label: "Resume",
                                            },
                                            ].map((doc) => (
                                                <div
                                                    className="col-md-6"
                                                    key={doc.key}
                                                >
                                                    <FileUploadCard
                                                        fileKey={doc.key}
                                                        label={doc.label}
                                                        file={files[doc.key]}
                                                        handleFileChange={handleFileChange}
                                                        form={form}
                                                        handleChange={handleChange}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ACTION BAR */}
                        <div className="card-footer bg-white border-top px-4 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="text-muted small">
                                    <span className="text-danger">*</span>{" "}
                                    Required fields
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-light border px-4"
                                        onClick={() =>
                                            window.history.back()
                                        }
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-success px-4"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                />

                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <span className="me-2">
                                                    ✓
                                                </span>

                                                Submit Details
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <ToastMessage
                show={toast.show}
                title={toast.title}
                message={toast.message}
                bg={toast.bg}
                onClose={() =>
                    setToast((prev) => ({
                        ...prev,
                        show: false,
                    }))
                }
            />
        </>
    );
}

/* ========================================================= */
/* SECTION TITLE */
/* ========================================================= */

function SectionTitle({ number, title, rightText }) {
    return (
        <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
                <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success fw-semibold me-2"
                    style={{
                        width: "28px",
                        height: "28px",
                        fontSize: "12px",
                    }}
                >
                    {number}
                </span>

                <h6 className="mb-0 fw-semibold">
                    {title}
                </h6>
            </div>

            {rightText && (
                <small className="text-muted">
                    {rightText}
                </small>
            )}
        </div>
    );
}

/* ========================================================= */
/* FILE UPLOAD CARD */
/* ========================================================= */

function FileUploadCard({
    fileKey,
    label,
    file,
    handleFileChange,
    form,
    handleChange,
}) {
    return (
        <div className="border rounded-3 p-3 h-100 bg-light">
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <div className="fw-semibold small">
                        {label}
                        <span className="text-danger ms-1">*</span>
                    </div>

                    <div
                        className="text-muted"
                        style={{ fontSize: "11px" }}
                    >
                        Upload document
                    </div>
                </div>

                {fileKey === "pan_copy" && (
                    <div style={{ width: "180px" }}>
                        <input
                            className="form-control form-control-sm"
                            name="pan_number"
                            value={form.pan_number}
                            onChange={handleChange}
                            placeholder="PAN Number"
                            required
                        />
                    </div>
                )}

                {fileKey === "aadhar_copy" && (
                    <div style={{ width: "180px" }}>
                        <input
                            className="form-control form-control-sm"
                            name="aadhar_number"
                            value={form.aadhar_number}
                            onChange={handleChange}
                            placeholder="Aadhaar Number"
                            required
                        />
                    </div>
                )}
            </div>

            <div className="mb-2">
                <input
                    type="file"
                    className="form-control form-control-sm"
                    name={fileKey}
                    onChange={handleFileChange}
                    accept="*/*"
                    required
                />
            </div>

            {file && (
                <div className="alert alert-success alert-sm py-2 px-2 mb-0">
                    <small>
                        <i className="bi bi-check-circle-fill me-1"></i>
                        {file.name}
                    </small>
                </div>
            )}
        </div>
    );
}