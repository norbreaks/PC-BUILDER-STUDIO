import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
// Import your future page components here
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogPage from './pages/CatalogPage';
import BuildDetailPage from './pages/BuildDetailPage';
import HomePage from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage';
import BuildsListPage from './pages/BuildsListPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import LoadingSpinner from './components/LoadingSpinner';
import RAGChat from './components/RAGChat';
import Header from './components/Header';
import Footer from './components/Footer';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { useChat } from './context/ChatContext';

// Component to protect routes
const ProtectedRoute = ({ element }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />; // Show a loading indicator while checking token
    }

    // If not authenticated, redirect to the login page
    return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  const { isChatOpen, openChat, closeChat } = useChat();

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route path="/catalog" element={<ProtectedRoute element={<CatalogPage />} />} />
            <Route path="/build/:buildId" element={<ProtectedRoute element={<BuildDetailPage />} />} />
            <Route path="/profile" element={<ProtectedRoute element={<UserProfilePage />} />} />
            <Route path="/builds" element={<ProtectedRoute element={<BuildsListPage />} />} />
            <Route path="/payment-success" element={<ProtectedRoute element={<PaymentSuccessPage />} />} />

            {/* Redirect any unmatched path to the home page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />

        {/* Global RAG Chat */}
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-40 group"
          title="Ask the AI Builder"
        >
          <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-glow ring-1 ring-white/10 hover:from-indigo-400 hover:to-purple-400 transition-all">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
          </span>
        </button>
        <RAGChat isOpen={isChatOpen} onClose={closeChat} />
      </div>
    </Router>
  );
}

export default App;
