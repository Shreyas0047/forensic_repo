import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { alertApi } from "../services/alertService";
import { useAuth } from "./AuthContext";

const AlertContext = createContext(null);

function getSocketUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    return window.location.origin;
  }

  if (baseUrl.startsWith("/")) {
    return window.location.origin;
  }

  return baseUrl.replace(/\/api\/?$/, "");
}

export function AlertProvider({ children }) {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!token) {
      setAlerts([]);
      return undefined;
    }

    alertApi.getAlerts().then(setAlerts).catch(() => setAlerts([]));

    const socket = io(getSocketUrl(), {
      transports: ["websocket"],
      withCredentials: true,
    });

    const pushAlert = (payload) => {
      const id = payload.alertId || `${payload.type}-${payload.createdAt}`;
      setAlerts((current) => {
        if (current.some((alert) => (alert.alertId || alert._id) === id)) {
          return current;
        }

        return [{ ...payload, alertId: id }, ...current].slice(0, 20);
      });
      setToasts((current) => {
        if (current.some((toast) => toast.id === id)) {
          return current;
        }

        return [{ ...payload, id }, ...current].slice(0, 4);
      });
    };

    socket.on("NEW_ALERT", pushAlert);
    socket.on("HIGH_RISK_DETECTED", pushAlert);

    return () => {
      socket.off("NEW_ALERT", pushAlert);
      socket.off("HIGH_RISK_DETECTED", pushAlert);
      socket.disconnect();
    };
  }, [token]);

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const value = useMemo(() => ({ alerts, toasts, dismissToast }), [alerts, toasts]);

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export function useAlerts() {
  return useContext(AlertContext);
}
