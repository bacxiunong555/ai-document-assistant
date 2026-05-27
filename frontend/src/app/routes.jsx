import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getUserRole } from "./auth";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../modules/login/LoginPage";
import Dashboard from "../modules/users/dashboard/DashboardPage";
import DraftingPage from "../modules/users/drafting/DraftingPage";
import Documents from "../modules/users/documents/DocumentSearchPage";
import Workflow from "../modules/users/workflow/WorkflowPage";
import Export from "../modules/users/export/ExportPage";
import DocumentDetailPage from "../modules/users/documents/DocumentDetailPage";
import AdminLayout from "../layouts/AdminLayout";
import AdminOverview from "../modules/admin/AdminOverview";
import RAGDocuments from "../modules/admin/RAGDocuments";
import DocumentUpload from "../modules/admin/DocumentUpload";
import UserManagement from "../modules/admin/UserManagement";
import SystemMonitor from "../modules/admin/SystemMonitor";

// Chỉ cho phép user đã đăng nhập
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// Chỉ cho phép role Admin vào /admin
const AdminRoute = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  const role = getUserRole();
  if (role !== "Admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Chỉ cho phép role Chuyên viên vào /
const StaffRoute = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  const role = getUserRole();
  if (role === "Admin") {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

// Chưa login thì vào trang login, đã login thì redirect theo role
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    const role = getUserRole();
    return <Navigate to={role === "Admin" ? "/admin" : "/"} replace />;
  }
  return children;
};

const routes = [
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: (
      <StaffRoute>
        <MainLayout />
      </StaffRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "drafting",
        element: <DraftingPage />,
      },
      {
        path: "documents",
        element: <Documents />,
      },
      {
        path: "documents/:id",
        element: <DocumentDetailPage />,
      },
      {
        path: "workflow",
        element: <Workflow />,
      },
      {
        path: "export",
        element: <Export />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="overview" replace />,
      },
      {
        path: "overview",
        element: <AdminOverview />,
      },
      {
        path: "rag-documents",
        element: <RAGDocuments />,
      },
      {
        path: "upload",
        element: <DocumentUpload />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "system",
        element: <SystemMonitor />,
      },
    ],
  },
];

export default routes;
