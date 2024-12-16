import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { participantService } from "../services/participant.service";
import { sessionService } from "../services/session.service";
import { Loading } from "../components/common/Loading";

interface ValidationGuardProps {
  children: React.ReactNode;
}

const ValidationGuard: React.FC<ValidationGuardProps> = ({ children }) => {
  const { sessionId, participantId } = useParams<{
    sessionId: string;
    participantId: string;
  }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateSessionAndParticipant = async () => {
      if (!sessionId || !participantId) {
        navigate("/");
        return;
      }

      try {
        const session = await sessionService.getSession(sessionId);
        const participant = await participantService.getParticipant(
          sessionId,
          participantId
        );

        // Check if participant belongs to the session
        if (session && participant && participant.session === sessionId) {
          setIsValid(true);
        } else {
          navigate("/");
        }
      } catch (error) {
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    validateSessionAndParticipant();
  }, [sessionId, participantId, navigate]);

  if (isLoading) {
    return <Loading />;
  }

  return isValid ? <>{children}</> : null; // Render children if valid
};

export default ValidationGuard;
