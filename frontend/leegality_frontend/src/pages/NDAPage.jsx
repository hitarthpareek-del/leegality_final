import { useState, useEffect, } from "react";
import axios from "axios";
import Header from "../components/Layout/Header";
import useAuth from "../context/useAuth";
import useCompany from "../context/useCompany";
import ToastMessage from "../components/Common/ToastMessage";
import { getMembers } from "../services/memberService";
import { getInvitees } from "../services/inviteeService";
import { useRef } from "react";

export default function NDAPage() {
    const { user } = useAuth();
    const { selectedCompany } = useCompany();
    const [invitees, setInvitees] = useState([]);
    const [availableInvitees, setAvailableInvitees] = useState([]);
    const memberSearchRef = useRef(null);

    const [members, setMembers] = useState([]);
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);

    const [loading, setLoading] = useState(false);


    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        bg: "success",
    });

    const [form, setForm] = useState({
        documentName: "",
        agreementDate: "",
        employeeName: "",
        address: "",
        department: "",
        irn: "",

        witness1: "",
        witness2: "",

        invitee1Name: "",
        invitee1Email: "",
        invitee1Phone: "",

        invitee2Name: "",
        invitee2Email: "",
        invitee2Phone: "",

        invitee3Name: "",
        invitee3Email: "",
        invitee3Phone: "",

        invitee4Name: "",
        invitee4Email: "",
        invitee4Phone: "",
    });

    const showToast = (title, message, bg = "success") => {
        setToast({
            show: true,
            title,
            message,
            bg,
        });
    };

    useEffect(() => {
        if (selectedCompany) {
            loadInvitees();
            loadMembers();
        }
    }, [selectedCompany]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                memberSearchRef.current &&
                !memberSearchRef.current.contains(e.target)
            ) {
                setShowMemberDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    async function loadMembers() {
        try {
            const data = await getMembers(
                user.token,
                selectedCompany
            );

            setMembers(data.data || []);
        } catch (err) {
            console.error(err);
        }
    }


    async function loadInvitees() {
        try {
            const data = await getInvitees(
                user.token,
                selectedCompany
            );

            setAvailableInvitees(data);
        } catch (err) {
            console.error(err);
        }
    }

    function addInvitee(invitee) {
        if (invitees.find((i) => i.id === invitee.id)) {
            return;
        }

        setInvitees((prev) => [...prev, invitee]);
    }

    function removeInvitee(index) {
        setInvitees((prev) =>
            prev.filter((_, i) => i !== index)
        );
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };

            // Keep employee details synced with Invitee 1
            if (name === "employeeName") {
                updated.documentName = value ? `NDA - ${value}` : "";
                updated.invitee1Name = value;
            }

            if (name === "address") {
                // Nothing else to sync
            }

            return updated;
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        // Validation for all required fields
        setLoading(true);
        try {
            const payload = {
                file: {
                    name: form.documentName,

                    fields: [
                        {
                            id: "1774614590185",
                            name: "Date of agreement signing",
                            type: "text",
                            value: form.agreementDate,
                            required: false,
                        },
                        {
                            id: "1774614714636",
                            name: "Full name of employee",
                            type: "text",
                            value: form.employeeName,
                            required: false,
                        },
                        {
                            id: "1774614714637",
                            name: "Full residential address of employee",
                            type: "text",
                            value: form.address,
                            required: false,
                        },
                        {
                            id: "1774617911627",
                            name: "Employee Name",
                            type: "text",
                            value: form.employeeName,
                            required: false,
                        },
                        {
                            id: "1774619511853",
                            name: "Witness 1 Name",
                            type: "text",
                            value: form.witness1,
                            required: false,
                        },
                        {
                            id: "1774619511854",
                            name: "Witness 2 Name",
                            type: "text",
                            value: form.witness2,
                            required: false,
                        },
                        {
                            id: "1774618460220",
                            name: "Full name of employee (UNDERTAKING)",
                            type: "text",
                            value: form.employeeName,
                            required: false,
                        },
                        {
                            id: "1774619511856",
                            name: "Full residential address of employee (UNDERTAKING)",
                            type: "text",
                            value: form.address,
                            required: false,
                        },
                        {
                            id: "1774619511857",
                            name: "Department of the employee (UNDERTAKING)",
                            type: "text",
                            value: form.department,
                            required: false,
                        },
                        {
                            id: "1774619511859",
                            name: "Employee Name under signature part (UNDERTAKING)",
                            type: "text",
                            value: form.employeeName,
                            required: false,
                        },
                    ],
                },

                invitees: [
                    {
                        name: form.invitee1Name,
                        email: form.invitee1Email,
                        phone: form.invitee1Phone,
                    },

                    ...invitees.map((i) => ({
                        name: i.full_name,
                        email: i.email,
                        phone: i.phone_number,
                    })),
                ].filter((i) => i.name),

                irn: form.irn,
            };

            const response = await axios.post(
                "http://localhost:5000/api/sign/request?type=nda",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        "X-Company": selectedCompany,
                    },
                }
            );

            showToast("Success", "Document Created Successfully", "success");

            console.log(response.data);
        } catch (err) {
            console.error(err);

            showToast("Error",
                err.response?.data?.message ||
                "Unable to create signing request.", "error"
            );
        }

        setLoading(false);
    }

    const filteredMembers = form.employeeName.trim()
        ? members.filter((member) =>
            member.full_name
                ?.toLowerCase()
                .includes(form.employeeName.toLowerCase())
        )
        : [];

    return (
        <>
            <Header
                title="Send NDA"
                subtitle="Create and send an NDA for electronic signing"
                backDisable={false}
            />

            <div className="container-fluid px-3 px-lg-4 py-3">
                <form onSubmit={handleSubmit}>
                    <div className="card border-0 shadow-sm">

                        {/* Header */}
                        <div className="card-header bg-white border-bottom px-4 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="mb-1 fw-semibold">
                                        NDA Agreement
                                    </h5>

                                    <small className="text-muted">
                                        Enter document details and signing parties
                                    </small>
                                </div>

                                <span className="badge bg-light text-dark border px-3 py-2">
                                    {selectedCompany}
                                </span>
                            </div>
                        </div>

                        <div className="card-body p-3 p-lg-4">

                            <div className="row g-4">

                                {/* ========================================= */}
                                {/* LEFT COLUMN */}
                                {/* ========================================= */}

                                <div className="col-lg-5">



                                    {/* Document Details */}
                                    <div className="mb-4">

                                        <SectionTitle
                                            number="01"
                                            title="Document Details"
                                        />

                                        <div className="row g-3">

                                            <div className="col-12">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Document Name
                                                    <span className="text-danger ms-1">
                                                        *
                                                    </span>
                                                </label>

                                                <input
                                                    className="form-control bg-light"
                                                    name="documentName"
                                                    value={form.documentName}
                                                    placeholder="Auto-generated"
                                                    readOnly
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Agreement Date
                                                </label>

                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="agreementDate"
                                                    value={form.agreementDate}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    IRN
                                                </label>

                                                <input
                                                    className="form-control"
                                                    name="irn"
                                                    value={form.irn}
                                                    onChange={handleChange}
                                                    placeholder="Optional"
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    {/* Employee Details */}
                                    <div className="mb-4">

                                        <SectionTitle
                                            number="02"
                                            title="Employee Details"
                                        />

                                        <div className="row g-3">

                                            <div className="col-md-7 position-relative " ref={memberSearchRef}>
                                                <label className="form-label small fw-semibold mb-1">
                                                    Employee Name
                                                    <span className="text-danger ms-1">*</span>
                                                </label>

                                                <input
                                                    className="form-control"
                                                    name="employeeName"
                                                    value={form.employeeName}
                                                    placeholder="Search employee..."
                                                    autoComplete="off"
                                                    required
                                                    onFocus={() => setShowMemberDropdown(true)}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        setShowMemberDropdown(true);
                                                    }}
                                                />

                                                {showMemberDropdown &&
                                                    form.employeeName && (
                                                        <div
                                                            className="list-group position-absolute w-100 shadow"
                                                            style={{
                                                                zIndex: 1000,
                                                                maxHeight: 250,
                                                                overflowY: "auto",
                                                            }}
                                                        >
                                                            {filteredMembers.length > 0 ? (
                                                                filteredMembers.map((member) => (
                                                                    <button
                                                                        key={member.id}
                                                                        type="button"
                                                                        className="list-group-item list-group-item-action"
                                                                        onClick={() => {
                                                                            setForm((prev) => ({
                                                                                ...prev,
                                                                                documentName: `NDA - ${member.full_name}`,
                                                                                employeeName: member.full_name || "",
                                                                                address: member.present_address || "",
                                                                                department: member.designation || "",
                                                                                invitee1Name: member.full_name || "",
                                                                                invitee1Email: member.email || "",
                                                                                invitee1Phone: member.phone_number || "",
                                                                            }));

                                                                            setShowMemberDropdown(false);
                                                                        }}
                                                                    >
                                                                        <div className="fw-semibold">
                                                                            {member.full_name}
                                                                        </div>

                                                                        <small className="text-muted d-block">
                                                                            {member.email}
                                                                        </small>

                                                                        <small className="text-muted">
                                                                            {member.designation}
                                                                        </small>
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="list-group-item">
                                                                    No members found
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                            </div>

                                            <div className="col-md-5">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Department
                                                </label>

                                                <input
                                                    className="form-control"
                                                    name="department"
                                                    value={form.department}
                                                    onChange={handleChange}
                                                    placeholder="Department"
                                                    required
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Residential Address
                                                </label>

                                                <textarea
                                                    rows="2"
                                                    className="form-control"
                                                    name="address"
                                                    value={form.address}
                                                    onChange={handleChange}
                                                    placeholder="Enter employee residential address"
                                                    required
                                                />
                                            </div>

                                        </div>
                                    </div>



                                </div>

                                {/* ========================================= */}
                                {/* RIGHT COLUMN */}
                                {/* ========================================= */}
                                <div className="col-lg-7">

                                    {/* Witness Details */}
                                    <div className="mb-4">

                                        <SectionTitle
                                            number="03"
                                            title="Witness Details"
                                        />

                                        <div className="row g-3">

                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Witness 1
                                                </label>

                                                <input
                                                    className="form-control"
                                                    name="witness1"
                                                    value={form.witness1}
                                                    onChange={handleChange}
                                                    placeholder="Full name"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold mb-1">
                                                    Witness 2
                                                </label>

                                                <input
                                                    className="form-control"
                                                    name="witness2"
                                                    value={form.witness2}
                                                    onChange={handleChange}
                                                    placeholder="Full name"
                                                    required
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    <SectionTitle
                                        number="04"
                                        title="Signing Parties"
                                        rightText="Up to 4 invitees"
                                    />

                                    <div className="row g-2">

                                        <div className="col-md-6">
                                            <InviteeCard
                                                title="Member (Invitee 1)"
                                                name={form.invitee1Name}
                                                email={form.invitee1Email}
                                                phone={form.invitee1Phone}
                                            />
                                        </div>

                                        {invitees.map((invitee, index) => (
                                            <div
                                                className="col-md-6"
                                                key={invitee.id}
                                            >
                                                <SelectedInviteeCard
                                                    invitee={invitee}
                                                    index={index + 2}
                                                    onRemove={() => removeInvitee(index)}
                                                />
                                            </div>
                                        ))}

                                        {invitees.length < 3 && (
                                            <div className="col-md-6">
                                                <AddInviteeCard
                                                    invitees={availableInvitees}
                                                    selectedInvitees={invitees}
                                                    employeeEmail={form.invitee1Email}
                                                    onSelect={addInvitee}
                                                />
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* ========================================= */}
                        {/* ACTION BAR */}
                        {/* ========================================= */}

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

                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <span className="me-2">
                                                    ✓
                                                </span>

                                                Send NDA for Signing
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
/* INVITEE CARD */
/* ========================================================= */

function InviteeCard({
    title,
    name,
    email,
    phone,
}) {
    return (
        <div className="border rounded-3 bg-light p-3 h-100">

            <div className="mb-3">
                <div className="fw-semibold">
                    {title}
                </div>

                <small className="text-muted">
                    Automatically synced from Employee Details
                </small>
            </div>

            <input
                className="form-control form-control-sm mb-2"
                value={name}
                readOnly
            />

            <input
                className="form-control form-control-sm mb-2"
                value={email}
                readOnly
            />

            <input
                className="form-control form-control-sm"
                value={phone}
                readOnly
            />

        </div>
    );
}

function SelectedInviteeCard({
    invitee,
    index,
    onRemove,
}) {
    return (
        <div className="border rounded-3 bg-light p-3 h-100">

            <div className="d-flex justify-content-between align-items-start mb-3">

                <div>
                    <div className="fw-semibold">
                        Invitee {index}
                    </div>

                    <small className="text-muted">
                        Signing Party
                    </small>
                </div>

                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={onRemove}
                >
                    ×
                </button>

            </div>

            <input
                className="form-control form-control-sm mb-2"
                value={invitee.full_name}
                readOnly
            />

            <input
                className="form-control form-control-sm mb-2"
                value={invitee.email}
                readOnly
            />

            <input
                className="form-control form-control-sm"
                value={invitee.phone_number}
                readOnly
            />

        </div>
    );
}

function AddInviteeCard({
    invitees,
    selectedInvitees,
    employeeEmail,
    onSelect,
}) {
    const [search, setSearch] = useState("");

    const filtered = invitees.filter((i) => {
        const alreadySelected = selectedInvitees.some(
            (s) => s.id === i.id
        );

        const isEmployee =
            employeeEmail &&
            i.email?.toLowerCase() === employeeEmail.toLowerCase();

        return (
            !alreadySelected &&
            !isEmployee &&
            i.full_name
                ?.toLowerCase()
                .includes(search.toLowerCase())
        );
    });

    return (
        <div className="border rounded-3 bg-light p-3 h-100">

            <div className="fw-semibold text-center mb-3">
                + Add Invitee
            </div>

            <input
                className="form-control form-control-sm"
                placeholder="Search invitee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
                <div
                    className="border rounded mt-2 bg-white"
                    style={{
                        maxHeight: 220,
                        overflowY: "auto",
                    }}
                >
                    {filtered.map((invitee) => (
                        <button
                            key={invitee.id}
                            type="button"
                            className="dropdown-item py-2"
                            onClick={() => {
                                onSelect(invitee);
                                setSearch("");
                            }}
                        >
                            <div className="fw-semibold">
                                {invitee.full_name}
                            </div>

                            <small className="text-muted d-block">
                                {invitee.email}
                            </small>

                            <small className="text-muted">
                                {invitee.designation}
                            </small>
                        </button>
                    ))}

                    {filtered.length === 0 && (
                        <div className="p-2 text-muted small">
                            No invitees found
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}