import React, { useState, useEffect } from "react";
import axios from "axios";

interface Participant {
  _id: string;
  name: string;
  email: string;
  assignedTo: string | null;
}

const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "santa2023";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAssigned, setIsAssigned] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const response = await axios.get(`${API_URL}/participants`);
      setParticipants(response.data);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const addParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      try {
        setLoading(true);
        await axios.post(`${API_URL}/participants`, { name, email });
        setName("");
        setEmail("");
        await fetchParticipants();
      } catch (error) {
        console.error("Error adding participant:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const clearParticipants = async () => {
    try {
      await axios.delete(`${API_URL}/participants`);
      setParticipants([]);
    } catch (error) {
      console.error("Error clearing participants:", error);
    }
  };

  const assignAndSendEmails = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/assignments`);

      if (response.data.message) {
        // Clear all participants after successful assignment
        await clearParticipants();
        setIsAssigned(true);
        setSuccess(true);

        // Reset success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
          setIsAssigned(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error assigning Secret Santas:", error);
      setError("Failed to assign Secret Santas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center text-red-600">
            Secret Santa Generator
          </h1>
          {!isAdmin && (
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Admin Login
            </button>
          )}
        </div>

        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
              <form onSubmit={handleAdminLogin}>
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminLogin(false);
                      setError("");
                      setAdminPassword("");
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <form
          onSubmit={addParticipant}
          className="mb-8 bg-white p-6 rounded-lg shadow-md"
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400"
          >
            {loading ? "Adding..." : "Add Participant"}
          </button>
        </form>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Participants</h2>
          {participants.length === 0 ? (
            <p className="text-gray-500">No participants added yet.</p>
          ) : (
            <ul className="mb-6">
              {participants.map((participant) => (
                <li
                  key={participant._id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <span className="font-medium">{participant.name}</span>
                  <span className="text-gray-500">{participant.email}</span>
                </li>
              ))}
            </ul>
          )}

          {participants.length >= 3 && !isAssigned && isAdmin && (
            <button
              onClick={assignAndSendEmails}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              {loading
                ? "Generating & Sending..."
                : "Generate & Send Assignments"}
            </button>
          )}

          {success && (
            <div className="mt-6">
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Success!</strong>
                <p className="block sm:inline">
                  {" "}
                  Assignments have been sent and data has been cleared.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
