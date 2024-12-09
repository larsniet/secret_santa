import React, { createContext, useContext, useState, useCallback } from "react";
import { Alert, AlertType } from "../components/common/Alert";

interface AlertContextType {
  showAlert: (type: AlertType, message: string) => void;
}

interface AlertItem {
  id: number;
  type: AlertType;
  message: string;
  isLeaving?: boolean;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  let nextId = 0;

  const removeAlert = useCallback((id: number) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, isLeaving: true } : alert
      )
    );

    // Remove from DOM after animation
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 300);
  }, []);

  const showAlert = useCallback((type: AlertType, message: string) => {
    const id = nextId++;
    setAlerts((prev) => [...prev, { id, type, message }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeAlert(id);
    }, 5000);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed inset-x-0 bottom-4 px-4 sm:right-4 sm:left-auto sm:px-0 space-y-2 z-50">
        {alerts.map(({ id, type, message, isLeaving }) => (
          <Alert
            key={id}
            type={type}
            message={message}
            isLeaving={isLeaving}
            onClose={() => removeAlert(id)}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
