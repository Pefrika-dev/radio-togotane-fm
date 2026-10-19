import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import HomePage from "./pages/public/HomePage";
import ListenLivePage from "./pages/public/ListenLivePage";
import ProgramsPage from "./pages/public/ProgramsPage";
import PresentersPage from "./pages/public/PresentersPage";
import NewsPage from "./pages/public/NewsPage";
import NewsDetailPage from "./pages/public/NewsDetailPage";
import PodcastsPage from "./pages/public/PodcastsPage";
import PodcastDetailPage from "./pages/public/PodcastDetailPage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import AdvertisePage from "./pages/public/AdvertisePage";
import AdminLoginPage from "./pages/admin/LoginPage";
import AdminDashboardPage from "./pages/admin/DashboardPage";
import AdminProgramsPage from "./pages/admin/ProgramsPage";
import AdminPresentersPage from "./pages/admin/PresentersPage";
import AdminNewsPage from "./pages/admin/NewsPage";
import AdminPodcastsPage from "./pages/admin/PodcastsPage";
import AdminContactsPage from "./pages/admin/ContactsPage";
import AdminInquiriesPage from "./pages/admin/InquiriesPage";
import AdminSettingsPage from "./pages/admin/SettingsPage";
import AdminUsersPage from "./pages/admin/UsersPage";
import AdminAuditPage from "./pages/admin/AuditPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/listen" element={<ListenLivePage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/presenters" element={<PresentersPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:slug" element={<NewsDetailPage />} />
            <Route path="/podcasts" element={<PodcastsPage />} />
            <Route path="/podcasts/:slug" element={<PodcastDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/advertise" element={<AdvertisePage />} />
          </Route>

          {/* Admin login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin dashboard (protected) */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="programs" element={<AdminProgramsPage />} />
            <Route path="presenters" element={<AdminPresentersPage />} />
            <Route path="news" element={<AdminNewsPage />} />
            <Route path="podcasts" element={<AdminPodcastsPage />} />
            <Route path="contacts" element={<AdminContactsPage />} />
            <Route path="inquiries" element={<AdminInquiriesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="audit" element={<AdminAuditPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">404 - Page Not Found</h1></div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
