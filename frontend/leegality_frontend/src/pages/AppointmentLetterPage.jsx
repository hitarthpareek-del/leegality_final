import { useState } from "react";
import axios from "axios";
import Header from "../components/Layout/Header";
import useAuth from "../context/useAuth";
import useCompany from "../context/useCompany";
import ToastMessage from "../components/Common/ToastMessage";
import { getInvitees } from "../services/inviteeService";
import { useEffect } from "react";
import { getMembers } from "../services/memberService";

export default function AppointmentLetterPage() {
  const { user } = useAuth();
  const { selectedCompany } = useCompany();

  const [members, setMembers] = useState([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const [invitees, setInvitees] = useState([]);
  const [availableInvitees, setAvailableInvitees] = useState([]);

  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    bg: "success",
  });

  useEffect(() => {
    loadInvitees();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadInvitees();
      loadMembers();
    }
  }, [selectedCompany]);

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


  function addInvitee(invitee) {
    if (
      invitees.find((i) => i.id === invitee.id)
    ) {
      return;
    }

    setInvitees((prev) => [...prev, invitee]);
  }

  function removeInvitee(index) {
    setInvitees((prev) =>
      prev.filter((_, i) => i !== index)
    );
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

  const [form, setForm] = useState({
    // Document Details
    documentName: "",
    irn: "",

    // Employee Details
    employeeName: "",
    address: "",
    contactNumber: "",
    emailId: "",
    dateOfBirth: "",

    // Job Details
    jobTitle: "",
    joiningDate: "",
    workLocation: "",

    // Compensation Details
    basicMonthly: "",
    basicAnnual: "",
    hraMonthly: "",
    hraAnnual: "",
    specialAllowanceMonthly: "",
    specialAllowanceAnnual: "",
    medicalExpensesMonthly: "",
    medicalExpensesAnnual: "",
    educationalAllowanceMonthly: "",
    educationalAllowanceAnnual: "",
    conveyanceMonthly: "",
    conveyanceAnnual: "",
    performanceLinkMonthly: "",
    performanceLinkAnnual: "",
    providentFundMonthly: "",
    providentFundAnnual: "",
    gratuityMonthly: "",
    gratuityAnnual: "",
    totalMonthly: "",
    totalAnnual: "",
    totalFixedCTCMonthly: "",
    totalFixedCTCAnnual: "",
    monthlyInHand: "",
    ctcAmount: "",
    ctcEffectiveDate: "",

    // Signatory Details
    authorizadSignatoryName: "Rahul Jain",
    authorizadSignatoryDesignation: "Director",

    // Annexure Details
    annexureEmployeeName: "",
    annexureDesignation: "",
    annexureDOJ: "",
    annexureCTC: "",
    annexureCTCEffectiveDate: "",

    // Invitees
    invitee1Name: "",
    invitee1Email: "",
    invitee1Phone: "",

  });

  const filteredMembers = members.filter((member) =>
    member.full_name
      ?.toLowerCase()
      .includes(form.employeeName.toLowerCase())
  );


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

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "employeeName") {
        updated.invitee1Name = value;

        // Auto-generate document name
        updated.documentName = value ? `APL - ${value}` : "";
      }

      // Keep Invitee 1 synced with Employee Details
      if (name === "employeeName") {
        updated.invitee1Name = value;
      }

      if (name === "emailId") {
        updated.invitee1Email = value;
      }

      if (name === "contactNumber") {
        updated.invitee1Phone = value;
      }

      return updated;
    });
  }

  function handleTotalFixedCTCChange(e) {
    const totalFixedCTCAnnual = parseFloat(e.target.value) || 0;

    // Calculate annual values with fixed allowances
    const basicAnnual = totalFixedCTCAnnual / 2;
    const hraAnnual = totalFixedCTCAnnual / 4;
    const medicalAnnual = 15000;
    const educationAnnual = 2400;
    const conveyanceAnnual = 19200;
    const providentAnnual = 21600;
    const gratuityAnnual = basicAnnual * 0.0481;

    // Calculate Special Allowance = Fixed CTC - (Basic + HRA + Medical + Education + Conveyance + Provident Fund + Gratuity)
    const specialAllowanceAnnual =
      totalFixedCTCAnnual - (basicAnnual + hraAnnual + medicalAnnual + educationAnnual + conveyanceAnnual + providentAnnual + gratuityAnnual);

    // Calculate monthly values
    const basicMonthly = basicAnnual / 12;
    const hraMonthly = hraAnnual / 12;
    const medicalMonthly = medicalAnnual / 12;
    const educationMonthly = educationAnnual / 12;
    const conveyanceMonthly = conveyanceAnnual / 12;
    const providentMonthly = providentAnnual / 12;
    const gratuityMonthly = gratuityAnnual / 12;
    const specialAllowanceMonthly = specialAllowanceAnnual / 12;

    // Total Fixed CTC (already set) = Fixed CTC
    const totalFixedCTCMonthly = totalFixedCTCAnnual / 12;

    // Get current performance link to calculate total CTC
    const performanceLinkAnnual = parseFloat(form.performanceLinkAnnual) || 0;
    const totalAnnual = totalFixedCTCAnnual + performanceLinkAnnual;
    const totalMonthly = totalAnnual / 12;

    setForm((prev) => ({
      ...prev,
      totalFixedCTCAnnual: e.target.value,
      totalFixedCTCMonthly:
        totalFixedCTCAnnual > 0
          ? totalFixedCTCMonthly.toFixed(2)
          : "",

      basicAnnual:
        basicAnnual > 0 ? basicAnnual.toFixed(2) : "",
      basicMonthly:
        basicMonthly > 0 ? basicMonthly.toFixed(2) : "",

      hraAnnual:
        hraAnnual > 0 ? hraAnnual.toFixed(2) : "",
      hraMonthly:
        hraMonthly > 0 ? hraMonthly.toFixed(2) : "",

      specialAllowanceAnnual:
        specialAllowanceAnnual > 0
          ? specialAllowanceAnnual.toFixed(2)
          : "",
      specialAllowanceMonthly:
        specialAllowanceMonthly > 0
          ? specialAllowanceMonthly.toFixed(2)
          : "",

      medicalExpensesAnnual:
        totalFixedCTCAnnual > 0
          ? medicalAnnual.toFixed(2)
          : "",
      medicalExpensesMonthly:
        totalFixedCTCAnnual > 0
          ? medicalMonthly.toFixed(2)
          : "",

      educationalAllowanceAnnual:
        totalFixedCTCAnnual > 0
          ? educationAnnual.toFixed(2)
          : "",
      educationalAllowanceMonthly:
        totalFixedCTCAnnual > 0
          ? educationMonthly.toFixed(2)
          : "",

      conveyanceAnnual:
        totalFixedCTCAnnual > 0
          ? conveyanceAnnual.toFixed(2)
          : "",
      conveyanceMonthly:
        totalFixedCTCAnnual > 0
          ? conveyanceMonthly.toFixed(2)
          : "",

      providentFundAnnual:
        totalFixedCTCAnnual > 0
          ? providentAnnual.toFixed(2)
          : "",
      providentFundMonthly:
        totalFixedCTCAnnual > 0
          ? providentMonthly.toFixed(2)
          : "",

      gratuityAnnual:
        gratuityAnnual > 0
          ? gratuityAnnual.toFixed(2)
          : "",
      gratuityMonthly:
        gratuityMonthly > 0
          ? gratuityMonthly.toFixed(2)
          : "",

      totalAnnual:
        totalAnnual > 0
          ? totalAnnual.toFixed(2)
          : "",

      totalMonthly:
        totalMonthly > 0
          ? totalMonthly.toFixed(2)
          : "",

      // Keep Annexure CTC synced with Total Annual CTC
      annexureCTC:
        totalAnnual > 0
          ? totalAnnual.toFixed(2)
          : "",
    }));
  }

  function handlePerformanceLinkChange(e) {
    const performanceLinkAnnual = parseFloat(e.target.value) || 0;
    const performanceLinkMonthly = performanceLinkAnnual / 12;
    const totalFixedCTCAnnual =
      parseFloat(form.totalFixedCTCAnnual) || 0;

    const totalAnnual =
      totalFixedCTCAnnual + performanceLinkAnnual;

    const totalMonthly = totalAnnual / 12;

    setForm((prev) => ({
      ...prev,

      performanceLinkAnnual: e.target.value,

      performanceLinkMonthly:
        performanceLinkMonthly > 0
          ? performanceLinkMonthly.toFixed(2)
          : "",

      totalAnnual:
        totalAnnual > 0
          ? totalAnnual.toFixed(2)
          : "",

      totalMonthly:
        totalMonthly > 0
          ? totalMonthly.toFixed(2)
          : "",

      // Same value as Total Annual CTC
      annexureCTC:
        totalAnnual > 0
          ? totalAnnual.toFixed(2)
          : "",
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const payload = {
        file: {
          name: form.documentName,

          fields: [
            {
              id: "1774612935369",
              name: "Full name of the employee",
              type: "text",
              value: form.employeeName,
              required: true,
            },
            {
              id: "1774612950757",
              name: "Residential Address of the employee",
              type: "text",
              value: form.address,
              required: true,
            },
            {
              id: "1774612969002",
              name: "Contact number of employee",
              type: "text",
              value: form.contactNumber,
              required: true,
            },
            {
              id: "1774612979379",
              name: "Email id of employee",
              type: "text",
              value: form.emailId,
              required: true,
            },
            {
              id: "1774613087824",
              name: "Job title/role offered",
              type: "text",
              value: form.jobTitle,
              required: true,
            },
            {
              id: "1774613074391",
              name: "Full name of employee",
              type: "text",
              value: form.employeeName,
              required: true,
            },
            {
              id: "1774614525025",
              name: "Job title/role offered of the employee",
              type: "text",
              value: form.jobTitle,
              required: true,
            },
            {
              id: "1774614525026",
              name: "Employee's joining date",
              type: "text",
              value: form.joiningDate,
              required: true,
            },
            {
              id: "1774620180774",
              name: "Work location/office",
              type: "text",
              value: form.workLocation,
              required: true,
            },
            {
              id: "1774619964580",
              name: "Employee's date of birth",
              type: "text",
              value: form.dateOfBirth,
              required: true,
            },
            {
              id: "1774620180777",
              name: "Authorized Signatory Name",
              type: "text",
              value: form.authorizadSignatoryName,
              required: true,
            },
            {
              id: "1774620180776",
              name: "Employee Name under signature part",
              type: "text",
              value: form.employeeName,
              required: true,
            },
            {
              id: "1774620180778",
              name: "Authorized Signatory Designation",
              type: "text",
              value: form.authorizadSignatoryDesignation,
              required: true,
            },
            {
              id: "1774620180780",
              name: "Employee Name (Annexure-I)",
              type: "text",
              value: form.annexureEmployeeName,
              required: true,
            },
            {
              id: "1774620180781",
              name: "Employee Designation (Annexure-I)",
              type: "text",
              value: form.annexureDesignation,
              required: true,
            },
            {
              id: "1774620180782",
              name: "Employee DOJ (Annexure-I)",
              type: "text",
              value: form.annexureDOJ,
              required: true,
            },
            {
              id: "1774620180783",
              name: "Employee CTC in Rs. (Annexure-I)",
              type: "text",
              value: form.annexureCTC,
              required: true,
            },
            {
              id: "1774620180784",
              name: "Employee CTC w.e.f. (Annexure-I)",
              type: "text",
              value: form.annexureCTCEffectiveDate,
              required: true,
            },
            {
              id: "1774620180785",
              name: "Basic (Monthly CTC)",
              type: "text",
              value: form.basicMonthly,
              required: true,
            },
            {
              id: "1774861862279",
              name: "Basic (Annual CTC)",
              type: "text",
              value: form.basicAnnual,
              required: true,
            },
            {
              id: "1774620180787",
              name: "HRA (Monthly CTC)",
              type: "text",
              value: form.hraMonthly,
              required: true,
            },
            {
              id: "1774861862281",
              name: "HRA (Annual CTC)",
              type: "text",
              value: form.hraAnnual,
              required: true,
            },
            {
              id: "1774620180789",
              name: "Special Allowance (Monthly CTC)",
              type: "text",
              value: form.specialAllowanceMonthly,
              required: true,
            },
            {
              id: "1774861862283",
              name: "Special Allowance (Annual CTC)",
              type: "text",
              value: form.specialAllowanceAnnual,
              required: true,
            },
            {
              id: "1774620180791",
              name: "Medical Expenses (Monthly CTC)",
              type: "text",
              value: form.medicalExpensesMonthly,
              required: true,
            },
            {
              id: "1774861862285",
              name: "Medical Expenses (Annual CTC)",
              type: "text",
              value: form.medicalExpensesAnnual,
              required: true,
            },
            {
              id: "1774620180793",
              name: "Educational Allowance (Monthly CTC)",
              type: "text",
              value: form.educationalAllowanceMonthly,
              required: true,
            },
            {
              id: "1774861862287",
              name: "Educational Allowance (Annual CTC)",
              type: "text",
              value: form.educationalAllowanceAnnual,
              required: true,
            },
            {
              id: "1774620180795",
              name: "Conveyance (Monthly CTC)",
              type: "text",
              value: form.conveyanceMonthly,
              required: true,
            },
            {
              id: "1774861862289",
              name: "Conveyance (Annual CTC)",
              type: "text",
              value: form.conveyanceAnnual,
              required: true,
            },
            {
              id: "1774620180797",
              name: "Performance Link Incentive (Monthly CTC)",
              type: "text",
              value: form.performanceLinkMonthly,
              required: true,
            },
            {
              id: "1774861862291",
              name: "Performance Link Incentive (Annual CTC)",
              type: "text",
              value: form.performanceLinkAnnual,
              required: true,
            },
            {
              id: "1774620180799",
              name: "Provident Fund (Monthly CTC)",
              type: "text",
              value: form.providentFundMonthly,
              required: true,
            },
            {
              id: "1774861862295",
              name: "Provident Fund (Annual CTC)",
              type: "text",
              value: form.providentFundAnnual,
              required: true,
            },
            {
              id: "1774620180801",
              name: "Gratuity (Monthly CTC)",
              type: "text",
              value: form.gratuityMonthly,
              required: true,
            },
            {
              id: "1774861862297",
              name: "Gratuity (Annual CTC)",
              type: "text",
              value: form.gratuityAnnual,
              required: true,
            },
            {
              id: "1774620180803",
              name: "Total (Monthly CTC)",
              type: "text",
              value: form.totalMonthly,
              required: true,
            },
            {
              id: "1774861862299",
              name: "Total (Annual CTC)",
              type: "text",
              value: form.totalAnnual,
              required: true,
            },
            {
              id: "1774620180805",
              name: "Total Fixed CTC (A+B) (Monthly CTC)",
              type: "text",
              value: form.totalFixedCTCMonthly,
              required: true,
            },
            {
              id: "1774861862301",
              name: "Total Fixed CTC (A+B) (Annual CTC)",
              type: "text",
              value: form.totalFixedCTCAnnual,
              required: true,
            },
            {
              id: "1774620180807",
              name: "Monthly in Hand",
              type: "text",
              value: form.monthlyInHand,
              required: true,
            },
            {
              id: "1774614525027",
              name: "Employee Name",
              type: "text",
              value: form.employeeName,
              required: true,
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
        "http://localhost:5000/api/sign/request?type=appointment",
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "X-Company": selectedCompany,
          },
        }
      );

      showToast("Success", "Appointment Letter Created Successfully", "success");

      console.log(response.data);
    } catch (err) {
      console.error(err);

      showToast("Error", err.response?.data?.message, "Failed to create");

    }

    setLoading(false);
  }

  return (
    <>
      <Header
        title="Send Appointment Letter"
        subtitle="Create and send an appointment letter for electronic signing"
        backDisable={false}
      />

      <div className="container-fluid px-3 px-lg-4 py-3">
        <form onSubmit={handleSubmit}>
          <div className="card border-0 shadow-sm">

            {/* PAGE HEADER */}
            <div className="card-header bg-white border-bottom px-4 py-3">
              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <h5 className="mb-1 fw-semibold">
                    Appointment Letter
                  </h5>

                  <small className="text-muted">
                    Enter employee, compensation and signing details
                  </small>
                </div>

                <span className="badge bg-light text-dark border px-3 py-2">
                  {selectedCompany}
                </span>

              </div>
            </div>

            <div className="card-body p-3 p-lg-4">

              <div className="row g-4">

                {/* ================================================= */}
                {/* LEFT COLUMN */}
                {/* ================================================= */}

                <div className="col-xl-5">

                  {/* DOCUMENT */}
                  <div className="mb-4">

                    <SectionTitle
                      number="01"
                      title="Document Details"
                    />

                    <div className="row g-2">

                      <div className="col-md-8">
                        <FormLabel
                          label="Document Name"
                          required
                        />

                        <input
                          className="form-control form-control-sm bg-light"
                          name="documentName"
                          value={form.documentName}
                          placeholder="Auto-generated"
                          readOnly
                          required

                        />
                      </div>

                      <div className="col-md-4">
                        <FormLabel label="IRN" />

                        <input
                          className="form-control form-control-sm"
                          name="irn"
                          value={form.irn}
                          onChange={handleChange}
                          placeholder="Optional"
                        />
                      </div>

                    </div>
                  </div>

                  {/* EMPLOYEE */}
                  <div className="mb-4">

                    <SectionTitle
                      number="02"
                      title="Employee Details"
                    />

                    <div className="row g-2">

                      <div className="col-md-7">
                        <FormLabel
                          label="Full Name"
                          required
                        />

                        <div className="position-relative">

                          <input
                            className="form-control form-control-sm"
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
                            form.employeeName &&
                            (
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

                                          // Document
                                          documentName: member.full_name
                                            ? `APL - ${member.full_name}`
                                            : "",

                                          // Employee
                                          employeeName: member.full_name || "",
                                          address: member.present_address || "",
                                          contactNumber: member.phone_number || "",
                                          emailId: member.email || "",
                                          dateOfBirth: member.date_of_birth
                                            ? member.date_of_birth.split("T")[0]
                                            : "",

                                          // Job
                                          jobTitle: member.designation || "",
                                          joiningDate: member.joining_date
                                            ? member.joining_date.split("T")[0]
                                            : "",

                                          // Annexure
                                          annexureEmployeeName:
                                            member.full_name || "",
                                          annexureDesignation:
                                            member.designation || "",
                                          annexureDOJ: member.joining_date
                                            ? member.joining_date.split("T")[0]
                                            : "",

                                          // Invitee 1
                                          invitee1Name: member.full_name || "",
                                          invitee1Email: member.email || "",
                                          invitee1Phone:
                                            member.phone_number || "",
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
                      </div>

                      <div className="col-md-5">
                        <FormLabel required label="Contact Number" />

                        <input
                          className="form-control form-control-sm"
                          name="contactNumber"
                          value={form.contactNumber}
                          onChange={handleChange}
                          placeholder="Phone number"
                          required
                        />
                      </div>

                      <div className="col-md-7">
                        <FormLabel label="Email ID" required />

                        <input
                          type="email"
                          className="form-control form-control-sm"
                          name="emailId"
                          value={form.emailId}
                          onChange={handleChange}
                          placeholder="Employee email"
                          required
                        />
                      </div>

                      <div className="col-md-5">
                        <FormLabel label="Date of Birth" required />

                        <input
                          type="date"
                          className="form-control form-control-sm"
                          name="dateOfBirth"
                          value={form.dateOfBirth}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <FormLabel label="Residential Address" required />

                        <textarea
                          rows="2"
                          className="form-control form-control-sm"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          placeholder="Employee residential address"
                          required
                        />
                      </div>

                    </div>
                  </div>

                  {/* JOB */}
                  <div className="mb-4">

                    <SectionTitle
                      number="03"
                      title="Job Details"
                    />

                    <div className="row g-2">

                      <div className="col-md-6">
                        <FormLabel label="Job Title / Role" required />

                        <input
                          className="form-control form-control-sm"
                          name="jobTitle"
                          value={form.jobTitle}
                          onChange={handleChange}
                          placeholder="Job title"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <FormLabel label="Joining Date" required />

                        <input
                          type="date"
                          className="form-control form-control-sm"
                          name="joiningDate"
                          value={form.joiningDate}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <FormLabel label="Work Location / Office" required />

                        <input
                          className="form-control form-control-sm"
                          name="workLocation"
                          value={form.workLocation}
                          onChange={handleChange}
                          placeholder="Office / work location"
                          required
                        />
                      </div>

                    </div>
                  </div>

                  {/* SIGNATORY */}
                  <div className="mb-4">

                    <SectionTitle
                      number="04"
                      title="Signatory Details"
                    />

                    <div className="row g-2">

                      <div className="col-md-6">
                        <FormLabel label="Authorized Signatory" required />

                        <input
                          className="form-control form-control-sm"
                          name="authorizadSignatoryName"
                          value={form.authorizadSignatoryName}
                          onChange={handleChange}
                          placeholder="Full name"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <FormLabel label="Designation" required />

                        <input
                          className="form-control form-control-sm"
                          name="authorizadSignatoryDesignation"
                          value={form.authorizadSignatoryDesignation}
                          onChange={handleChange}
                          placeholder="Designation"
                          required
                        />
                      </div>

                    </div>
                  </div>

                </div>

                {/* ================================================= */}
                {/* RIGHT COLUMN */}
                {/* ================================================= */}

                <div className="col-xl-7">

                  {/* COMPENSATION */}
                  <div className="mb-4">

                    <SectionTitle
                      number="05"
                      title="Compensation Details"
                      rightText="Monthly / Annual"
                    />

                    {/* TOTAL FIXED CTC INPUT */}
                    <div className="border rounded-3 bg-light p-3 mb-3">
                      <div className="row align-items-center g-2">

                        <div className="col-md-7">
                          <div className="fw-semibold">
                            Total Fixed CTC
                          </div>

                          <small className="text-muted">
                            Enter the annual fixed CTC. All salary components will be
                            calculated automatically.
                          </small>
                        </div>

                        <div className="col-md-5">
                          <div className="input-group input-group-sm">

                            <span className="input-group-text bg-white">
                              ₹
                            </span>

                            <input
                              type="number"
                              className="form-control text-end fw-semibold"
                              name="totalFixedCTCAnnual"
                              value={form.totalFixedCTCAnnual}
                              onChange={handleTotalFixedCTCChange}
                              placeholder="Enter annual CTC"
                              min="0"
                              required
                            />

                          </div>

                          <div className="text-end mt-1">
                            <small className="text-muted">
                              Annual Fixed CTC
                            </small>
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="border rounded-3 overflow-hidden">

                      {/* TABLE HEADER */}
                      <div className="row g-0 bg-light border-bottom">

                        <div className="col-6 px-3 py-2">
                          <small className="fw-semibold text-muted">
                            COMPONENT
                          </small>
                        </div>

                        <div className="col-3 px-2 py-2 text-end">
                          <small className="fw-semibold text-muted">
                            MONTHLY
                          </small>
                        </div>

                        <div className="col-3 px-2 py-2 text-end">
                          <small className="fw-semibold text-muted">
                            ANNUAL
                          </small>
                        </div>

                      </div>


                      <CompensationRow
                        label="HRA"
                        monthly="hraMonthly"
                        annual="hraAnnual"
                        form={form}
                        handleChange={handleChange}
                        readOnly={true}
                      />

                      <CompensationRow
                        label="Special Allowance"
                        monthly="specialAllowanceMonthly"
                        annual="specialAllowanceAnnual"
                        form={form}
                        handleChange={handleChange}
                        readOnly={true}
                      />

                      <CompensationRow
                        label="Medical Expenses"
                        monthly="medicalExpensesMonthly"
                        annual="medicalExpensesAnnual"
                        form={form}
                        handleChange={handleChange}
                        readOnly={true}
                      />

                      <CompensationRow
                        label="Educational Allowance"
                        monthly="educationalAllowanceMonthly"
                        annual="educationalAllowanceAnnual"
                        form={form}
                        handleChange={handleChange}
                        readOnly={true}
                      />

                      <CompensationRow
                        label="Conveyance"
                        monthly="conveyanceMonthly"
                        annual="conveyanceAnnual"
                        form={form}
                        handleChange={handleChange}
                        readOnly={true}
                      />

                      <CompensationRow
                        label="Performance Link Incentive"
                        monthly="performanceLinkMonthly"
                        annual="performanceLinkAnnual"
                        form={form}
                        handleChange={handlePerformanceLinkChange}
                        readOnly={false}
                      />

                      <CompensationRow
                        label="Provident Fund"
                        monthly="providentFundMonthly"
                        annual="providentFundAnnual"
                        form={form}
                        handleChange={handleChange}
                        readOnly={true}
                      />

                      <CompensationRow
                        label="Gratuity"
                        monthly="gratuityMonthly"
                        annual="gratuityAnnual"
                        form={form}
                        handleChange={handleChange}
                        readOnly={true}
                      />

                      <CompensationRow
                        label="Total Fixed CTC"
                        monthly="totalFixedCTCMonthly"
                        annual="totalFixedCTCAnnual"
                        form={form}
                        handleChange={handleTotalFixedCTCChange}
                        strong
                        singleColumn={true}
                      />

                      <CompensationRow
                        label="Total"
                        monthly="totalMonthly"
                        annual="totalAnnual"
                        form={form}
                        handleChange={handleChange}
                        strong
                        readOnly={true}
                      />

                      <div className="row g-0 border-top bg-light">

                        <div className="col-6 px-3 py-2">
                          <small className="fw-semibold">
                            Monthly In Hand
                          </small>
                        </div>

                        <div className="col-6 px-2 py-1">
                          <input
                            type="number"
                            className="form-control form-control-sm text-end"
                            name="monthlyInHand"
                            value={form.monthlyInHand}
                            onChange={handleChange}
                            placeholder="0"
                            required
                          />
                        </div>

                      </div>

                    </div>
                  </div>

                  {/* ANNEXURE */}
                  <div className="mb-4">

                    <SectionTitle
                      number="06"
                      title="Annexure-I Details"
                    />

                    <div className="row g-2">

                      <div className="col-md-4">
                        <FormLabel label="Employee Name" required />

                        <input
                          className="form-control form-control-sm"
                          name="annexureEmployeeName"
                          value={form.annexureEmployeeName}
                          onChange={handleChange}
                          placeholder="Employee name"
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <FormLabel label="Designation" required />

                        <input
                          className="form-control form-control-sm"
                          name="annexureDesignation"
                          value={form.annexureDesignation}
                          onChange={handleChange}
                          placeholder="Designation"
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <FormLabel label="Date of Joining" required />

                        <input
                          type="date"
                          className="form-control form-control-sm"
                          name="annexureDOJ"
                          value={form.annexureDOJ}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-3">
                        <FormLabel label="CTC Amount (₹)" required />

                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light">₹</span>

                          <input
                            type="number"
                            className="form-control bg-light"
                            name="annexureCTC"
                            value={form.annexureCTC}
                            placeholder="Auto-calculated"
                            readOnly
                            required
                          />
                        </div>

                        <small className="text-muted">
                          Same as Total Annual CTC
                        </small>
                      </div>

                      <div className="col-md-3">
                        <FormLabel label="CTC Effective Date" required />

                        <input
                          type="date"
                          className="form-control form-control-sm"
                          name="annexureCTCEffectiveDate"
                          value={form.annexureCTCEffectiveDate}
                          onChange={handleChange}
                          required
                        />
                      </div>

                    </div>
                  </div>

                  {/* INVITEES */}
                  <div>

                    <SectionTitle
                      number="07"
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
                    onClick={() => window.history.back()}
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
                        <span className="me-2">✓</span>
                        Send Appointment Letter
                      </>
                    )}
                  </button>

                </div>

              </div>

            </div>

          </div>
        </form>

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
      </div>
    </>
  );
}


/* ========================================================= */
/* SECTION TITLE */
/* ========================================================= */

function SectionTitle({
  number,
  title,
  rightText,
}) {
  return (
    <div className="d-flex align-items-center justify-content-between mb-2">

      <div className="d-flex align-items-center">

        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success fw-semibold me-2"
          style={{
            width: "27px",
            height: "27px",
            fontSize: "11px",
            flexShrink: 0,
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
/* FORM LABEL */
/* ========================================================= */

function FormLabel({ label, required }) {
  return (
    <label className="form-label small fw-semibold mb-1">
      {label}

      {required && (
        <span className="text-danger ms-1">
          *
        </span>
      )}
    </label>
  );
}


/* ========================================================= */
/* COMPENSATION ROW */
/* ========================================================= */

function CompensationRow({
  label,
  monthly,
  annual,
  form,
  handleChange,
  strong = false,
  readOnly = false,
  singleColumn = false,
}) {
  return (
    <div
      className={`row g-0 border-bottom ${strong ? "bg-light" : ""}`}
    >

      <div className="col-6 px-3 py-1">
        <div
          className={`small ${strong ? "fw-semibold" : ""}`}
          style={{
            minHeight: "29px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {label}
        </div>
      </div>

      {singleColumn ? (
        // Single column for Total Fixed CTC
        <div className="col-6 px-1 py-1">
          <input
            type="number"
            className={`form-control form-control-sm text-end ${strong ? "fw-semibold" : ""}`}
            name={annual}
            value={form[annual]}
            onChange={handleChange}
            placeholder="0"
            readOnly={readOnly}
          />
        </div>
      ) : (
        // Two columns for other rows
        <>
          <div className="col-3 px-1 py-1">
            <input
              type="number"
              className={`form-control form-control-sm text-end ${strong ? "fw-semibold" : ""}`}
              name={monthly}
              value={form[monthly]}
              onChange={handleChange}
              placeholder="0"
              readOnly={readOnly}
            />
          </div>

          <div className="col-3 px-1 py-1">
            <input
              type="number"
              className={`form-control form-control-sm text-end ${strong ? "fw-semibold" : ""}`}
              name={annual}
              value={form[annual]}
              onChange={handleChange}
              placeholder="0"
              readOnly={readOnly}
            />
          </div>
        </>
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

// add invitee card
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


//// selected invitee card
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