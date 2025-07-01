import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Conversation from '../pages/Conversation';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';

// Composant pour protéger les routes privées
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PrivateRoutes = (
  <>
    <Route path="/" element={<ProtectedRoute><Navigate to="/conversation" replace /></ProtectedRoute>} />
    <Route path="/conversation" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
    <Route path="/conversation/:chatId" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
  </>
);

export default PrivateRoutes;