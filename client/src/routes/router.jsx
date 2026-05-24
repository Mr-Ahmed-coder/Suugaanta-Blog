import { createBrowserRouter } from "react-router-dom";
import AppShell from "../app/AppShell";
import HomePage from "../pages/HomePage";
import HeesoPage from "../pages/HeesoPage";
import GabayoPage from "../pages/GabayoPage";
import TaariikhoPage from "../pages/TaariikhoPage";
import AbwaanoPage from "../pages/AbwaanoPage";
import HeesoDetailPage from "../pages/HeesoDetailPage";
import GabayoDetailPage from "../pages/GabayoDetailPage";
import TaariikhoDetailPage from "../pages/TaariikhoDetailPage";
import AuthorProfilePage from "../pages/AuthorProfilePage";
import AboutPage from "../pages/AboutPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import { AuthProvider } from "../context/AuthContext";

// Admin Dashboard Components & Pages
import AdminLayout from "../admin/layouts/AdminLayout";
import DashboardOverview from "../admin/pages/DashboardOverview";
import ManageSongs from "../admin/pages/ManageSongs";
import ManagePoetry from "../admin/pages/ManagePoetry";
import ManageHistory from "../admin/pages/ManageHistory";
import ManageAuthors from "../admin/pages/ManageAuthors";
import SongForm from "../admin/forms/SongForm";
import PoetryForm from "../admin/forms/PoetryForm";
import HistoryForm from "../admin/forms/HistoryForm";
import AuthorForm from "../admin/forms/AuthorForm";
import ManageUsers from "../admin/pages/ManageUsers";
import ProtectedRoute from "../components/common/ProtectedRoute";

// Centralized route configuration keeps future nested layouts and protected sections easy to add.
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "heeso", element: <HeesoPage /> },
      { path: "heeso/:slug", element: <HeesoDetailPage /> },
      { path: "gabayo", element: <GabayoPage /> },
      { path: "gabayo/:slug", element: <GabayoDetailPage /> },
      { path: "taariikho", element: <TaariikhoPage /> },
      { path: "taariikho/:slug", element: <TaariikhoDetailPage /> },
      { path: "abwaano", element: <AbwaanoPage /> },
      { path: "abwaano/:slug", element: <AuthorProfilePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <AuthProvider>
        <AdminLayout />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: "songs", element: <ManageSongs /> },
      { path: "songs/new", element: <SongForm /> },
      { path: "songs/edit/:id", element: <SongForm /> },
      { path: "poetry", element: <ManagePoetry /> },
      { path: "poetry/new", element: <PoetryForm /> },
      { path: "poetry/edit/:id", element: <PoetryForm /> },
      { path: "history", element: <ManageHistory /> },
      { path: "history/new", element: <HistoryForm /> },
      { path: "history/edit/:id", element: <HistoryForm /> },
      { path: "authors", element: <ManageAuthors /> },
      { path: "authors/new", element: <AuthorForm /> },
      { path: "authors/edit/:id", element: <AuthorForm /> },
      { 
        path: "users", 
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageUsers />
          </ProtectedRoute>
        ) 
      },
    ],
  },
]);

export default router;
