import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { authService } from "../../services/auth.service";

export const VerifyHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setupAuth } = useAuth();
  const { showAlert } = useAlert();
  const hasAttempted = useRef(false);

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");
      if (!token || hasAttempted.current) {
        navigate("/login", { replace: true });
        return;
      }

      hasAttempted.current = true;

      try {
        const response = await authService.verifyEmail(token);
        if (response.access_token && response.user) {
          localStorage.setItem("token", response.access_token);
          localStorage.setItem("user", JSON.stringify(response.user));
          await setupAuth(response.access_token, response.user);
          navigate("/dashboard", { replace: true });
          // Show success message after navigation
          setTimeout(() => {
            showAlert("success", "Email verified successfully!");
          }, 100);
        }
      } catch (error) {
        showAlert("error", "Failed to verify email");
        navigate("/login", { replace: true });
      }
    };

    verify();
  }, [searchParams, navigate, showAlert, setupAuth]);

  return null;
};
