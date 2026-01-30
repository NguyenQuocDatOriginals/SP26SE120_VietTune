import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import RecordingDetailPage from "./pages/RecordingDetailPage";
import UploadPage from "./pages/UploadPage";
import SearchPage from "./pages/SearchPage";
import SemanticSearchPage from "./pages/SemanticSearchPage";
import KnowledgeGraphPage from "./pages/KnowledgeGraphPage";
import ChatbotPage from "./pages/ChatbotPage";
import InstrumentsPage from "./pages/InstrumentsPage";
import EthnicitiesPage from "./pages/EthnicitiesPage";
import MastersPage from "./pages/MastersPage";
import AboutPage from "./pages/AboutPage";
import TermsPage from "./pages/TermsPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ContributionsPage from "./pages/ContributionsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateExpertPage from "./pages/admin/CreateExpertPage";
import AdminGuard from "./components/admin/AdminGuard";
import ModerationPage from "./pages/ModerationPage";
import ApprovedRecordingsPage from "./pages/ApprovedRecordingsPage";
import NotificationPage from "./pages/NotificationPage";
import NotFoundPage from "./pages/NotFoundPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import ScrollToTop from "./components/common/ScrollToTop";
import NotificationProvider from "./components/common/NotificationProvider";

function App() {
  useEffect(() => {
    // Prevent text copying and related keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputElement = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.hasAttribute('contenteditable')
      );

      // Allow copy/paste/cut/select all in input/textarea elements
      if (isInputElement) {
        return;
      }

      // Prevent Ctrl+C, Ctrl+A, Ctrl+V, Ctrl+X, Ctrl+S outside input/textarea
      if ((e.ctrlKey || e.metaKey) && ['c', 'a', 'v', 'x', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Prevent F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (DevTools shortcuts)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Prevent context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      // Allow context menu on input and textarea elements
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevent copy, cut, paste, select all events
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      // Allow copy in input and textarea elements
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      // Allow cut in input and textarea elements
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      // Allow paste in input and textarea elements
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow selection in input and textarea elements
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('selectstart', handleSelectStart, true);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('cut', handleCut, true);
      document.removeEventListener('paste', handlePaste, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
    };
  }, []);

  return (
    <NotificationProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="recordings/:id" element={<RecordingDetailPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="semantic-search" element={<SemanticSearchPage />} />
          <Route path="knowledge-graph" element={<KnowledgeGraphPage />} />
          <Route path="chatbot" element={<ChatbotPage />} />
          <Route path="instruments" element={<InstrumentsPage />} />
          <Route path="ethnicities" element={<EthnicitiesPage />} />
          <Route path="masters" element={<MastersPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="contributions" element={<ContributionsPage />} />
          <Route path="moderation" element={<ModerationPage />} />
          <Route path="approved-recordings" element={<ApprovedRecordingsPage />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="admin" element={<AdminGuard />}>
            <Route index element={<AdminDashboard />} />
            <Route path="create-expert" element={<CreateExpertPage />} />
          </Route>
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </NotificationProvider>
  );
}

export default App;