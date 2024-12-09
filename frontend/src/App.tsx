import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AlertProvider } from "./contexts/AlertContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { Dashboard } from "./pages/Dashboard";
import { SessionDetail } from "./pages/SessionDetail";
import { Home } from "./pages/Home";
import { JoinSession } from "./pages/JoinSession";
import { ParticipantPreferences } from "./pages/ParticipantPreferences";
import { UserSettings } from "./pages/UserSettings";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/join/:code" element={<JoinSession />} />
            <Route
              path="/session/:sessionId/participant/:participantId/preferences"
              element={<ParticipantPreferences />}
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions/:id/*"
              element={
                <ProtectedRoute>
                  <SessionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
