import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppThemeProvider } from './context/ThemeModeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Documents from './pages/Documents';
import UploadedFiles from './pages/UploadedFiles';
import GeneratedFiles from './pages/GeneratedFiles';
import Login from './pages/Login';
import Signup from './pages/Signup';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function UserDetailRoute() {
  const { id } = useParams();
  return <UserDetail key={id} />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Analytics />} />
              <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
              <Route path="users/:id" element={<AdminRoute><UserDetailRoute /></AdminRoute>} />
              <Route path="documents" element={<Documents />} />
              <Route path="uploaded-files" element={<AdminRoute><UploadedFiles /></AdminRoute>} />
              <Route path="generated-files" element={<GeneratedFiles />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppThemeProvider>
  );
}

export default App;
