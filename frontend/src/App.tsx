import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { VerifyHandler } from "./components/auth/VerifyHandler";
import { UserSettings } from "./pages/UserSettings";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import ValidationGuard from "./contexts/ValidationGuard";

function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/verify" element={<VerifyHandler />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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
            <Route
              path="/sessions/:id"
              element={
                <ProtectedRoute>
                  <SessionDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/join/:code" element={<JoinSession />} />

            <Route
              path="/sessions/:sessionId/participants/:participantId"
              element={
                <ValidationGuard>
                  <ParticipantDashboard />
                </ValidationGuard>
              }
            />
            <Route
              path="/sessions/:sessionId/participants/:participantId/preferences"
              element={
                <ValidationGuard>
                  <ParticipantPreferences />
                </ValidationGuard>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AlertProvider>
  );
}

export default App;
