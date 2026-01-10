import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import RecordingDetailPage from "./pages/RecordingDetailPage";
import UploadPage from "./pages/UploadPage";
import SearchPage from "./pages/SearchPage";
import InstrumentsPage from "./pages/InstrumentsPage";
import EthnicitiesPage from "./pages/EthnicitiesPage";
import MastersPage from "./pages/MastersPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="recordings/:id" element={<RecordingDetailPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="instruments" element={<InstrumentsPage />} />
          <Route path="ethnicities" element={<EthnicitiesPage />} />
          <Route path="masters" element={<MastersPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="admin/*" element={<AdminDashboard />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
