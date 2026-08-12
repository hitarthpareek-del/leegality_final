import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdmin from "./pages/SuperAdmin";
import SuperAdminRoute from "./components/SuperAdminRoute";
import "./App.css"
import NDAPage from "./pages/NDAPage";
import AppointmentLetterPage from "./pages/AppointmentLetterPage";
import DocumentDetailsPage from "./pages/DocumentDetailsPage";
import UserDetailsFormPage from "./pages/UserDetailsFormPage"
import ReportsPage from "./pages/ReportsPage";
import MembersPage from "./pages/MembersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/nda"
          element={
            <ProtectedRoute>
              <NDAPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointmentletter"
          element={
            <ProtectedRoute>
              <AppointmentLetterPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin"
          element={
            <SuperAdminRoute>
              <SuperAdmin />
            </SuperAdminRoute>
          }
        />

        <Route
          path="/documents/:documentId"
          element={
            <ProtectedRoute>
              <DocumentDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-form"
          element={

            <UserDetailsFormPage />

          }
        />

        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <MembersPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}