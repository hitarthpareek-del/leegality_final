import { useEffect, useMemo, useState } from "react";
import useAuth from "../context/useAuth";
import ToastMessage from "../components/Common/ToastMessage";
import Header from "../components/Layout/Header"

import {
    getMembers,
    updateMemberStatus,
    updateHrDetails,
    deactivateMember,
} from "../services/memberService";

export default function MembersPage() {
    const { user } = useAuth();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [companyFilter, setCompanyFilter] = useState("");

    const [selectedMember, setSelectedMember] = useState(null);

    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [updatingHr, setUpdatingHr] = useState(false);
    const [deactivating, setDeactivating] = useState(null);

    const [editForm, setEditForm] = useState({
        company: "",
        employee_code: "",
        designation: "",
        offer_letter_date: "",
        joining_date: "",
        remarks: "",
        status: "Pending",
    });

    const [toast, setToast] = useState({
        show: false,
        title: "",
        message: "",
        bg: "success",
    });

    const showToast = (title, message, bg = "success") => {
        setToast({
            show: true,
            title,
            message,
            bg,
        });
    };

    /* ---------------------------------------------------
       Load Members - ACTIVE ONLY
    --------------------------------------------------- */

    const loadMembers = async () => {
        try {
            setLoading(true);

            const response = await getMembers();

            if (response.success) {
                const activeMembers = response.data
                    .filter(
                        (member) =>
                            Number(member.is_active) === 1
                    )
                    .sort(
                        (a, b) =>
                            new Date(b.created_at) -
                            new Date(a.created_at)
                    );

                setMembers(activeMembers);
            }
        } catch (error) {
            console.error(
                "Failed to load members:",
                error
            );

            showToast(
                "Error",
                error.response?.data?.message ||
                "Failed to load members.",
                "danger"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadMembers();
        }
    }, [user]);

    /* ---------------------------------------------------
       Open Member
    --------------------------------------------------- */

    const openMember = (member) => {
        setSelectedMember(member);

        setEditForm({
            company: member.company || "",

            employee_code:
                member.employee_code || "",

            designation:
                member.designation || "",

            offer_letter_date:
                member.offer_letter_date
                    ? String(
                        member.offer_letter_date
                    ).substring(0, 10)
                    : "",

            joining_date:
                member.joining_date
                    ? String(
                        member.joining_date
                    ).substring(0, 10)
                    : "",

            remarks:
                member.remarks || "",

            status:
                member.status || "Pending",
        });
    };

    /* ---------------------------------------------------
       Edit Form Change
    --------------------------------------------------- */

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* ---------------------------------------------------
       Update HR Details
    --------------------------------------------------- */

    const handleHrUpdate = async () => {
        if (!selectedMember?.id) {
            showToast(
                "Error",
                "Member ID is missing.",
                "danger"
            );
            return;
        }

        try {
            setUpdatingHr(true);

            const payload = {
                company:
                    editForm.company?.trim() || null,

                employee_code:
                    editForm.employee_code?.trim() ||
                    null,

                designation:
                    editForm.designation?.trim() ||
                    null,

                offer_letter_date:
                    editForm.offer_letter_date || null,

                joining_date:
                    editForm.joining_date || null,

                remarks:
                    editForm.remarks?.trim() || null,

                status:
                    editForm.status || "Pending",
            };

            console.log(
                "Updating member HR details:",
                selectedMember.id,
                payload
            );

            const response = await updateHrDetails(
                selectedMember.id,
                payload
            );

            console.log(
                "HR update response:",
                response
            );

            /*
             * Backend returns the MySQL result, not
             * the complete updated member.
             *
             * Therefore update the local member using
             * the payload that was successfully sent.
             */

            const updatedMember = {
                ...selectedMember,

                company: payload.company,

                employee_code:
                    payload.employee_code,

                designation:
                    payload.designation,

                offer_letter_date:
                    payload.offer_letter_date,

                joining_date:
                    payload.joining_date,

                remarks:
                    payload.remarks,

                status:
                    payload.status,

                updated_at:
                    new Date().toISOString(),
            };

            /* Update table */

            setMembers((prev) =>
                prev.map((member) =>
                    Number(member.id) ===
                        Number(selectedMember.id)
                        ? {
                            ...member,
                            ...updatedMember,
                        }
                        : member
                )
            );

            /* Update modal */

            setSelectedMember(updatedMember);

            /* Keep form in sync */

            setEditForm({
                company:
                    payload.company || "",

                employee_code:
                    payload.employee_code || "",

                designation:
                    payload.designation || "",

                offer_letter_date:
                    payload.offer_letter_date || "",

                joining_date:
                    payload.joining_date || "",

                remarks:
                    payload.remarks || "",

                status:
                    payload.status || "Pending",
            });

            showToast(
                "Updated",
                "Member HR details updated successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "HR UPDATE ERROR:",
                error
            );

            console.error(
                "Response:",
                error.response?.data
            );

            showToast(
                "Error",
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to update member details.",
                "danger"
            );
        } finally {
            setUpdatingHr(false);
        }
    };

    /* ---------------------------------------------------
       Status Update
    --------------------------------------------------- */

    const handleStatusChange = async (
        memberId,
        newStatus
    ) => {
        try {
            setUpdatingStatus(memberId);

            await updateMemberStatus(
                memberId,
                newStatus
            );

            setMembers((prev) =>
                prev.map((member) =>
                    Number(member.id) ===
                        Number(memberId)
                        ? {
                            ...member,
                            status: newStatus,
                        }
                        : member
                )
            );

            setSelectedMember((prev) =>
                prev &&
                    Number(prev.id) ===
                    Number(memberId)
                    ? {
                        ...prev,
                        status: newStatus,
                    }
                    : prev
            );

            setEditForm((prev) => ({
                ...prev,
                status: newStatus,
            }));

            showToast(
                "Status Updated",
                "Member status updated successfully."
            );
        } catch (error) {
            console.error(error);

            showToast(
                "Error",
                error.response?.data?.message ||
                "Failed to update status.",
                "danger"
            );
        } finally {
            setUpdatingStatus(null);
        }
    };

    /* ---------------------------------------------------
       Deactivate Member
    --------------------------------------------------- */

    const handleDeactivate = async (memberId) => {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate this member?"
        );

        if (!confirmed) return;

        try {
            setDeactivating(memberId);

            await deactivateMember(memberId);

            setMembers((prev) =>
                prev.filter(
                    (member) =>
                        Number(member.id) !==
                        Number(memberId)
                )
            );

            setSelectedMember((prev) =>
                prev &&
                    Number(prev.id) ===
                    Number(memberId)
                    ? null
                    : prev
            );

            showToast(
                "Member Deactivated",
                "Member has been deactivated successfully."
            );
        } catch (error) {
            console.error(error);

            showToast(
                "Error",
                error.response?.data?.message ||
                "Failed to deactivate member.",
                "danger"
            );
        } finally {
            setDeactivating(null);
        }
    };

    /* ---------------------------------------------------
       Filtering
    --------------------------------------------------- */

    const filteredMembers = useMemo(() => {
        const searchValue = search
            .trim()
            .toLowerCase();

        return members.filter((member) => {
            const matchesSearch =
                !searchValue ||
                [
                    member.full_name,
                    member.email,
                    member.phone_number,
                    member.employee_code,
                    member.designation,
                    member.company,
                    member.pan_number,
                    member.aadhar_number,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value)
                            .toLowerCase()
                            .includes(searchValue)
                    );

            const matchesStatus =
                !statusFilter ||
                member.status === statusFilter;

            const matchesCompany =
                !companyFilter ||
                member.company?.toLowerCase() ===
                companyFilter.toLowerCase();

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCompany
            );
        });
    }, [
        members,
        search,
        statusFilter,
        companyFilter,
    ]);

    /* ---------------------------------------------------
       Date Formatting
    --------------------------------------------------- */

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-GB"
        );
    };

    /* ---------------------------------------------------
       Status Badge
    --------------------------------------------------- */

const getStatusClass = (status) => {
    switch (status) {
        case "Pending":
            return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";

        case "In Review":
            return "bg-info-subtle text-info-emphasis border border-info-subtle";

        case "Completed":
            return "bg-success-subtle text-success-emphasis border border-success-subtle";

        default:
            return "bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle";
    }
};
    /* ---------------------------------------------------
       Documents
    --------------------------------------------------- */

    const documentFields = [
        ["aadhar_copy", "Aadhaar"],
        ["pan_copy", "PAN"],
        ["passport_photo", "Photo"],
        ["cancelled_cheque", "Cheque"],
        ["dob_proof", "DOB Proof"],
        ["education_certificate", "Education"],
        ["salary_slips", "Salary Slips"],
        ["relieving_letter", "Relieving Letter"],
        ["resume", "Resume"],
    ];

    const getDocumentUrl = (path) => {
        if (!path) return null;

        /*
         * Add your backend document URL here
         * when document viewing is implemented.
         */

        return null;
    };

    return (
        <>
    {/* Header */}
        <Header title="Members"/>
            <div className="container-fluid py-3">
                {/* Filters */}

                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-2">

                        <div className="row g-2">

                            <div className="col-lg-5">
                                <div className="input-group input-group-sm">

                                    <span className="input-group-text bg-white">
                                        <i className="bi bi-search"></i>
                                    </span>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search member..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                    />

                                    {search && (
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() =>
                                                setSearch("")
                                            }
                                        >
                                            <i className="bi bi-x"></i>
                                        </button>
                                    )}

                                </div>
                            </div>

                            <div className="col-lg-2">
                                <select
                                    className="form-select form-select-sm"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        All Status
                                    </option>

                                    <option value="Pending">
                                        Pending
                                    </option>

                                    <option value="In Review">
                                        In Review
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>
                                </select>
                            </div>

                            <div className="col-lg-2">
                                <select
                                    className="form-select form-select-sm"
                                    value={companyFilter}
                                    onChange={(e) =>
                                        setCompanyFilter(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        All Companies
                                    </option>

                                    <option value="Akar Limited">
                                        Akar
                                    </option>

                                    <option value="Mediccapress">
                                        Mediccapress
                                    </option>
                                </select>
                            </div>

                            <div className="col-lg-1">
                                <button
                                    className="btn btn-outline-secondary btn-sm w-100"
                                    onClick={() => {
                                        setSearch("");
                                        setStatusFilter("");
                                        setCompanyFilter("");
                                    }}
                                    title="Clear filters"
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>

                        </div>

                    </div>
                </div>

                {/* Table */}

                <div className="card border-0 shadow-sm">

                    <div className="table-responsive">

                        <table className="table table-hover table-sm align-middle mb-0">

                            <thead className="table-light">

                                <tr>
                                    <th className="ps-3">
                                        #
                                    </th>
                                    <th>Member</th>
                                    <th>Company</th>
                                    <th>
                                        Employee Code
                                    </th>
                                    <th>
                                        Designation
                                    </th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Active</th>
                                    <th className="text-end pe-3">
                                        Action
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="text-center py-5"
                                        >
                                            <div
                                                className="spinner-border spinner-border-sm"
                                                role="status"
                                            ></div>

                                            <span className="ms-2">
                                                Loading members...
                                            </span>
                                        </td>
                                    </tr>
                                ) : filteredMembers.length ===
                                    0 ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="text-center py-5 text-muted"
                                        >
                                            No members found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map(
                                        (
                                            member,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    member.id
                                                }
                                                style={{
                                                    cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                    openMember(
                                                        member
                                                    )
                                                }
                                            >

                                                <td className="ps-3 text-muted">
                                                    {
                                                        index +
                                                        1
                                                    }
                                                </td>

                                                <td>
                                                    <div className="fw-semibold small">
                                                        {
                                                            member.title
                                                        }{" "}
                                                        {
                                                            member.full_name
                                                        }
                                                    </div>

                                                    <div className="text-muted small">
                                                        {
                                                            member.email
                                                        }
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="small">
                                                        {
                                                            member.company ||
                                                            "-"
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="small">
                                                        {
                                                            member.employee_code ||
                                                            "-"
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="small">
                                                        {
                                                            member.designation ||
                                                            "-"
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="small">
                                                        {
                                                            member.phone_number
                                                        }
                                                    </div>
                                                </td>

                                                <td
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <select
                                                        className={`form-select form-select-sm ${getStatusClass(
                                                            member.status
                                                        )}`}
                                                        value={
                                                            member.status ||
                                                            "Pending"
                                                        }
                                                        disabled={
                                                            updatingStatus ===
                                                            member.id
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            handleStatusChange(
                                                                member.id,
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        style={{
                                                            width: "125px",
                                                            
                                                        }}
                                                    >
                                                        <option value="Pending">
                                                            Pending
                                                        </option>

                                                        <option value="In Review">
                                                            In Review
                                                        </option>

                                                        <option value="Completed">
                                                            Completed
                                                        </option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <span className="small text-muted">
                                                        {formatDate(
                                                            member.created_at
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                        Active
                                                    </span>
                                                </td>

                                                <td
                                                    className="text-end pe-3"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-1"
                                                        title="View details"
                                                        onClick={() =>
                                                            openMember(
                                                                member
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Deactivate member"
                                                        disabled={
                                                            deactivating ===
                                                            member.id
                                                        }
                                                        onClick={() =>
                                                            handleDeactivate(
                                                                member.id
                                                            )
                                                        }
                                                    >
                                                        {deactivating ===
                                                            member.id ? (
                                                            <span
                                                                className="spinner-border spinner-border-sm"
                                                                role="status"
                                                            ></span>
                                                        ) : (
                                                            <i className="bi bi-person-x"></i>
                                                        )}
                                                    </button>
                                                </td>

                                            </tr>
                                        )
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

            {/* MEMBER DETAILS MODAL */}

            {selectedMember && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0,0,0,0.5)",
                    }}
                    onClick={() =>
                        setSelectedMember(null)
                    }
                >

                    <div
                        className="modal-dialog modal-xl modal-dialog-scrollable"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-content">

                            <div className="modal-header py-2">

                                <div>
                                    <h6 className="modal-title fw-semibold mb-0">
                                        {
                                            selectedMember.title
                                        }{" "}
                                        {
                                            selectedMember.full_name
                                        }
                                    </h6>

                                    <small className="text-muted">
                                        Member ID: #
                                        {
                                            selectedMember.id
                                        }
                                    </small>
                                </div>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() =>
                                        setSelectedMember(
                                            null
                                        )
                                    }
                                ></button>

                            </div>

                            <div className="modal-body p-3">

                                {/* Editable Employment */}

                                <div className="border rounded p-3 mb-3">

                                    <div className="border-bottom mb-3 pb-1">
                                        <small className="fw-semibold text-secondary">
                                            Employment Details
                                        </small>
                                    </div>

                                    <div className="row g-3">

                                        {/* COMPANY */}

                                        <div className="col-md-4">
                                            <label className="form-label small mb-1">
                                                Company
                                            </label>

                                            <select
                                                name="company"
                                                className="form-select form-select-sm"
                                                value={
                                                    editForm.company
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            >
                                                <option value="">
                                                    Select Company
                                                </option>

                                                <option value="Akar Limited">
                                                    Akar Limited
                                                </option>

                                                <option value="Mediccapress">
                                                    Mediccapress
                                                </option>
                                            </select>
                                        </div>

                                        {/* EMPLOYEE CODE */}

                                        <div className="col-md-4">
                                            <label className="form-label small mb-1">
                                                Employee Code
                                            </label>

                                            <input
                                                type="text"
                                                name="employee_code"
                                                className="form-control form-control-sm"
                                                value={
                                                    editForm.employee_code
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />
                                        </div>

                                        {/* DESIGNATION */}

                                        <div className="col-md-4">
                                            <label className="form-label small mb-1">
                                                Designation
                                            </label>

                                            <input
                                                type="text"
                                                name="designation"
                                                className="form-control form-control-sm"
                                                value={
                                                    editForm.designation
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />
                                        </div>

                                        {/* STATUS */}

                                        <div className="col-md-4">
                                            <label className="form-label small mb-1">
                                                Status
                                            </label>

                                            <select
                                                name="status"
                                                className="form-select form-select-sm"
                                                value={
                                                    editForm.status
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            >
                                                <option value="Pending">
                                                    Pending
                                                </option>

                                                <option value="In Review">
                                                    In Review
                                                </option>

                                                <option value="Completed">
                                                    Completed
                                                </option>
                                            </select>
                                        </div>

                                        {/* OFFER LETTER DATE */}

                                        <div className="col-md-4">
                                            <label className="form-label small mb-1">
                                                Offer Letter Date
                                            </label>

                                            <input
                                                type="date"
                                                name="offer_letter_date"
                                                className="form-control form-control-sm"
                                                value={
                                                    editForm.offer_letter_date
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />
                                        </div>

                                        {/* JOINING DATE */}

                                        <div className="col-md-4">
                                            <label className="form-label small mb-1">
                                                Joining Date
                                            </label>

                                            <input
                                                type="date"
                                                name="joining_date"
                                                className="form-control form-control-sm"
                                                value={
                                                    editForm.joining_date
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />
                                        </div>

                                        {/* REMARKS */}

                                        <div className="col-12">
                                            <label className="form-label small mb-1">
                                                Remarks
                                            </label>

                                            <textarea
                                                name="remarks"
                                                className="form-control form-control-sm"
                                                rows="3"
                                                value={
                                                    editForm.remarks
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />
                                        </div>

                                    </div>

                                    <div className="d-flex justify-content-end mt-3">

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            disabled={
                                                updatingHr
                                            }
                                            onClick={
                                                handleHrUpdate
                                            }
                                        >
                                            {updatingHr ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-1"
                                                        role="status"
                                                    />

                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check2 me-1"></i>
                                                    Update Details
                                                </>
                                            )}
                                        </button>

                                    </div>

                                </div>

                                {/* Top Summary */}

                                <div className="row g-2 mb-3">

                                    <div className="col-md-3">
                                        <div className="border rounded p-2">
                                            <small className="text-muted d-block">
                                                Company
                                            </small>

                                            <strong className="small">
                                                {
                                                    editForm.company ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="border rounded p-2">
                                            <small className="text-muted d-block">
                                                Employee Code
                                            </small>

                                            <strong className="small">
                                                {
                                                    editForm.employee_code ||
                                                    "-"
                                                }
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="border rounded p-2">
                                            <small className="text-muted d-block">
                                                Status
                                            </small>

                                            <span
                                                className={`badge ${getStatusClass(
                                                    editForm.status
                                                )}`}
                                            >
                                                {
                                                    editForm.status
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="border rounded p-2">
                                            <small className="text-muted d-block">
                                                Created
                                            </small>

                                            <strong className="small">
                                                {formatDate(
                                                    selectedMember.created_at
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                </div>

                                {/* PERSONAL */}

                                <DetailSection title="Personal Information">
                                    <DetailGrid
                                        items={[
                                            [
                                                "Full Name",
                                                selectedMember.full_name,
                                            ],
                                            [
                                                "Title",
                                                selectedMember.title,
                                            ],
                                            [
                                                "First Name",
                                                selectedMember.first_name,
                                            ],
                                            [
                                                "Last Name",
                                                selectedMember.last_name,
                                            ],
                                            [
                                                "Gender",
                                                selectedMember.gender,
                                            ],
                                            [
                                                "Date of Birth",
                                                formatDate(
                                                    selectedMember.date_of_birth
                                                ),
                                            ],
                                            [
                                                "Nationality",
                                                selectedMember.nationality,
                                            ],
                                            [
                                                "Email",
                                                selectedMember.email,
                                            ],
                                            [
                                                "Phone",
                                                selectedMember.phone_number,
                                            ],
                                        ]}
                                    />
                                </DetailSection>

                                {/* GUARDIAN */}

                                <DetailSection title="Guardian & Emergency Contact">
                                    <DetailGrid
                                        items={[
                                            [
                                                "Guardian Name",
                                                selectedMember.guardian_name,
                                            ],
                                            [
                                                "Relationship",
                                                selectedMember.guardian_relationship,
                                            ],
                                            [
                                                "Emergency Contact",
                                                selectedMember.emergency_contact_person,
                                            ],
                                            [
                                                "Emergency Number",
                                                selectedMember.emergency_contact_number,
                                            ],
                                        ]}
                                    />
                                </DetailSection>

                                {/* ADDRESSES */}

                                <DetailSection title="Addresses">
                                    <DetailGrid
                                        items={[
                                            [
                                                "Aadhaar Address",
                                                selectedMember.aadhar_address,
                                                true,
                                            ],
                                            [
                                                "Present Address",
                                                selectedMember.present_address,
                                                true,
                                            ],
                                            [
                                                "Permanent Address",
                                                selectedMember.permanent_address,
                                                true,
                                            ],
                                        ]}
                                    />
                                </DetailSection>

                                {/* IDENTITY */}

                                <DetailSection title="Identity & Qualification">
                                    <DetailGrid
                                        items={[
                                            [
                                                "PAN",
                                                selectedMember.pan_number,
                                            ],
                                            [
                                                "Aadhaar",
                                                selectedMember.aadhar_number,
                                            ],
                                            [
                                                "Highest Qualification",
                                                selectedMember.highest_qualification,
                                            ],
                                        ]}
                                    />
                                </DetailSection>

                                {/* DOCUMENTS */}

                                <DetailSection title="Documents">

                                    <div className="row g-2">

                                        {documentFields.map(
                                            ([field, label]) => {
                                                const hasDocument =
                                                    Boolean(
                                                        selectedMember[
                                                        field
                                                        ]
                                                    );

                                                return (
                                                    <div
                                                        className="col-md-4 col-lg-3"
                                                        key={field}
                                                    >
                                                        <div className="border rounded px-2 py-1 d-flex justify-content-between align-items-center">

                                                            <small>
                                                                {
                                                                    label
                                                                }
                                                            </small>

                                                            {hasDocument ? (
                                                                <button
                                                                    className="btn btn-sm btn-light py-0"
                                                                    title={`View ${label}`}
                                                                    onClick={() => {
                                                                        const url =
                                                                            getDocumentUrl(
                                                                                selectedMember[
                                                                                field
                                                                                ]
                                                                            );

                                                                        if (
                                                                            url
                                                                        ) {
                                                                            window.open(
                                                                                url,
                                                                                "_blank"
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    <i className="bi bi-eye"></i>
                                                                </button>
                                                            ) : (
                                                                <small className="text-muted">
                                                                    N/A
                                                                </small>
                                                            )}

                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}

                                    </div>

                                </DetailSection>

                                {/* REMARKS */}

                                <DetailSection title="Remarks">

                                    <div className="border rounded p-2 small">
                                        {
                                            editForm.remarks ||
                                            "No remarks."
                                        }
                                    </div>

                                </DetailSection>

                            </div>

                            <div className="modal-footer py-2">

                                <span className="me-auto small text-muted">
                                    Last updated:{" "}
                                    {formatDate(
                                        selectedMember.updated_at
                                    )}
                                </span>

                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    disabled={
                                        deactivating ===
                                        selectedMember.id
                                    }
                                    onClick={() =>
                                        handleDeactivate(
                                            selectedMember.id
                                        )
                                    }
                                >
                                    {deactivating ===
                                        selectedMember.id ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-1"
                                                role="status"
                                            ></span>

                                            Deactivating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-person-x me-1"></i>
                                            Deactivate
                                        </>
                                    )}
                                </button>

                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() =>
                                        setSelectedMember(
                                            null
                                        )
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            <ToastMessage
                show={toast.show}
                onClose={() =>
                    setToast((prev) => ({
                        ...prev,
                        show: false,
                    }))
                }
                title={toast.title}
                message={toast.message}
                bg={toast.bg}
            />
        </>
    );
}

/* ======================================================
   Detail Section
====================================================== */

function DetailSection({ title, children }) {
    return (
        <div className="border rounded p-3 mb-3">

            <div className="border-bottom mb-3 pb-1">
                <small className="fw-semibold text-secondary">
                    {title}
                </small>
            </div>

            <div className="row g-2">
                {children}
            </div>

        </div>
    );
}

/* ======================================================
   Detail Grid
====================================================== */

function DetailGrid({ items }) {
    return (
        <>
            {items.map(
                ([label, value, fullWidth], index) => (
                    <div
                        key={index}
                        className={
                            fullWidth
                                ? "col-12"
                                : "col-md-4 col-lg-3"
                        }
                    >
                        <small
                            className="text-muted d-block"
                            style={{
                                fontSize: "10px",
                            }}
                        >
                            {label}
                        </small>

                        <div
                            className="small text-break"
                            style={{
                                lineHeight: "1.25",
                            }}
                        >
                            {value || "-"}
                        </div>
                    </div>
                )
            )}
        </>
    );
}