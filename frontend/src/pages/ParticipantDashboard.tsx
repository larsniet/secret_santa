import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Participant,
  participantService,
} from "../services/participant.service";
import { Layout } from "../components/layout/Layout";
import { useAlert } from "../contexts/AlertContext";
import { Button } from "../components/common/Button";
import { ProductCard } from "../components/common/ProductCard";
import { Loading } from "../components/common/Loading";
import { sessionService, Session } from "../services/session.service";

const ParticipantDashboard: React.FC = () => {
  const { participantId, sessionId } = useParams<{
    participantId: string;
    sessionId: string;
  }>();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [session, setSession] = useState<Session | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [assignedParticipant, setAssignedParticipant] =
    useState<Participant | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        const sessionData = await sessionService.getSession(sessionId);
        setSession(sessionData);
      } catch (error) {
        showAlert("error", "Failed to load session data");
      }
    };

    fetchSession();
  }, [sessionId, showAlert]);

  useEffect(() => {
    const fetchAssignedParticipant = async () => {
      if (!sessionId || !participantId) return;

      try {
        const participant = await participantService.getParticipant(
          sessionId,
          participantId
        );
        setParticipant(participant);
        if (!participant.assignedTo) {
          showAlert("error", "No participant assigned to you");
          return;
        }
        setAssignedParticipant(participant.assignedTo);
      } catch (error) {
        showAlert("error", "Failed to load preferences");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedParticipant();
  }, [participantId, sessionId, showAlert]);

  const fetchProducts = useCallback(
    async (page: number) => {
      if (!sessionId || !participantId) return;

      try {
        setIsLoadingMore(true);
        const newProducts = await participantService.getMatchingProducts(
          sessionId,
          assignedParticipant?._id,
          page
        );
        setProducts((prev) => [...prev, ...newProducts]);
        if (newProducts.length === 0) setHasMore(false);
      } catch (error) {
        showAlert("error", "Failed to load products");
      } finally {
        setIsLoadingMore(false);
      }
    },
    [sessionId, participantId, assignedParticipant?._id, showAlert]
  );

  useEffect(() => {
    if (assignedParticipant) {
      fetchProducts(1);
    }
  }, [assignedParticipant, fetchProducts]);

  const loadMoreProducts = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h1 className="text-3xl font-bold text-gray-900">
            {session?.name || "Participant Dashboard"}
          </h1>
          <Button
            onClick={() =>
              navigate(
                `/sessions/${sessionId}/participants/${participantId}/preferences`
              )
            }
          >
            Update My Preferences
          </Button>
        </div>

        {/* Preferences Section */}
        {assignedParticipant?.preferences ? (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Preferences for {assignedParticipant?.name}
            </h2>
            <ul className="space-y-2">
              {Object.entries(assignedParticipant.preferences).map(
                ([key, value]) => {
                  if (typeof value === "object" && value !== null) {
                    const nestedValues = Object.entries(value)
                      .map(
                        ([nestedKey, nestedValue]) =>
                          nestedValue && `${nestedKey}: ${nestedValue}`
                      )
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <li key={key} className="text-sm text-gray-600">
                        <strong className="capitalize">
                          {key.replace(/([A-Z])/g, " $1")}:
                        </strong>{" "}
                        {nestedValues || "Not set"}
                      </li>
                    );
                  }
                  return (
                    <li key={key} className="text-sm text-gray-600">
                      <strong className="capitalize">
                        {key.replace(/([A-Z])/g, " $1")}:
                      </strong>{" "}
                      {value || "Not set"}
                    </li>
                  );
                }
              )}
            </ul>
          </div>
        ) : null}

        {/* Products Section */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Gift Suggestions
          </h2>
          <p className="text-sm text-gray-500">
            Based on the preferences of your assigned participant.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button onClick={loadMoreProducts} isLoading={isLoadingMore}>
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ParticipantDashboard;
