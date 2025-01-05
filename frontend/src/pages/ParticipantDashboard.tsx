import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [productLoadError, setProductLoadError] = useState(false);
  const initialLoadDone = useRef(false);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        const sessionData = await sessionService.getSession(sessionId);
        setSession(sessionData);
      } catch (error) {
        console.error("Error fetching session data:", error);
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
        // Reset products and pagination when assigned participant changes
        setProducts([]);
        setPage(1);
        setHasMore(true);
      } catch (error) {
        showAlert("error", "Failed to load preferences");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedParticipant();
  }, [participantId, sessionId, showAlert]);

  const fetchProducts = useCallback(
    async (currentPage: number, isLoadingMore: boolean = false) => {
      if (
        !sessionId ||
        !participantId ||
        !assignedParticipant?._id ||
        productLoadError
      )
        return;

      try {
        setIsLoadingMore(isLoadingMore);
        const newProducts = await participantService.getMatchingProducts(
          sessionId,
          assignedParticipant._id,
          currentPage
        );

        if (newProducts.length === 0) {
          setHasMore(false);
          return;
        }

        setProducts((prev) =>
          isLoadingMore ? [...prev, ...newProducts] : newProducts
        );
      } catch (error) {
        if (currentPage === 1) {
          showAlert("error", "Failed to load products");
        }
        setHasMore(false);
        setProductLoadError(true);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [
      sessionId,
      participantId,
      assignedParticipant?._id,
      showAlert,
      productLoadError,
    ]
  );

  useEffect(() => {
    if (assignedParticipant && !initialLoadDone.current) {
      // Only fetch on initial load
      setProducts([]);
      setPage(1);
      setHasMore(true);
      fetchProducts(1, false);
      initialLoadDone.current = true;
    }
  }, [assignedParticipant, fetchProducts]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage, true);
        }
      },
      { threshold: 0.1 } // Start loading when the element is 10% visible
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchProducts, hasMore, isLoadingMore, page]);

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
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Preferences for {assignedParticipant?.name}
          </h2>
          {assignedParticipant?.preferences ? (
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
          ) : (
            <p className="text-sm text-gray-500">No preferences set yet.</p>
          )}
        </div>

        {/* Products Section */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Gift Suggestions
          </h2>
          <p className="text-sm text-gray-500">
            Based on {assignedParticipant?.name}'s preferences.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={`${product.id}-${product.matchScore}`}
                product={product}
              />
            ))}
          </div>
          {/* Loading and error states */}
          {isLoadingMore && !productLoadError && (
            <div className="h-10 flex items-center justify-center">
              <Loading />
            </div>
          )}
          {productLoadError ? (
            <p className="text-center text-gray-500">
              Unable to load product suggestions at this time. Please try again
              later.
            </p>
          ) : (
            products.length === 0 &&
            !isLoadingMore && (
              <p className="text-center text-gray-500">
                No product suggestions available yet. Please check back later or
                update the preferences to get better suggestions.
              </p>
            )
          )}
          <div ref={loadMoreRef} className="h-10" />
        </div>
      </div>
    </Layout>
  );
};

export default ParticipantDashboard;
