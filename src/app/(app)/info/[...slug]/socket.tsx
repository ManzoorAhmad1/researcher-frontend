import { useEffect, useState, useRef } from "react";
import { RootState } from "@/reducer/store";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { updateUser } from "@/apis/user";

const SocketUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL;
const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes
const UPDATE_INTERVAL = 5 * 60 * 1000; // 15 minutes
const DEBOUNCE_TIME = 1000; // 1 second

if (!SocketUrl) {
  throw new Error("NEXT_PUBLIC_SOCKET_IO_URL is not defined");
}

const useSocket = () => {
  const userId = useSelector((state: RootState) => state.user.user?.user?.id);
  const [socket, setSocket] = useState<Socket | null>(null);
  const lastActivityTime = useRef<number>(Date.now());
  const lastUpdateTime = useRef<number>(Date.now());
  const isUpdating = useRef<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (userId) {
      const newSocket = io(SocketUrl, {
        query: { userId },
        timeout: 15000,
        reconnectionDelay: 15000,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Track user activity with more comprehensive events
      const activityEvents = [
        "mousedown",
        "keydown",
        "scroll",
        "touchstart",
        "mousemove",
        "focus",
        "blur",
        "visibilitychange",
      ];

      const handleUserActivity = () => {
        const now = Date.now();
        // Only update if enough time has passed since last activity
        if (now - lastActivityTime.current >= DEBOUNCE_TIME) {
          lastActivityTime.current = now;
        }
      };

      // Add activity event listeners
      activityEvents.forEach((event) => {
        window.addEventListener(event, handleUserActivity);
      });

      // Handle visibility change
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          handleUserActivity();
        }
      });

      // Handle check_activity event from server
      newSocket.on("check_activity", async () => {
        const now = Date.now();

        const timeSinceLastActivity = now - lastActivityTime.current;
        const timeSinceLastUpdate = now - lastUpdateTime.current;

        // Only update if:
        // 1. User has been active in the last 30 minutes
        // 2. It's been at least 15 minutes since last update
        // 3. No update is currently in progress
        if (
          timeSinceLastActivity <= INACTIVITY_THRESHOLD &&
          timeSinceLastUpdate >= UPDATE_INTERVAL &&
          !isUpdating.current
        ) {
          try {
            isUpdating.current = true;
            const response = await updateUser({
              last_active: new Date().toISOString(),
            });
            lastUpdateTime.current = now;
          } catch (error) {
            console.error("Error updating user activity:", error);
          } finally {
            isUpdating.current = false;
          }
        } else {
          console.log("Skipping update because:", {
            isActive: timeSinceLastActivity <= INACTIVITY_THRESHOLD,
            timeSinceLastActivity:
              Math.round(timeSinceLastActivity / 1000) + " seconds",
            timeSinceLastUpdate:
              Math.round(timeSinceLastUpdate / 1000) + " seconds",
            isUpdating: isUpdating.current,
          });
        }
      });

      // Handle connection events
      newSocket.on("connect", () => {
        lastActivityTime.current = Date.now();
      });

      newSocket.on("disconnect", () => {});

      newSocket.emit("joinRoom", userId);

      return () => {
        console.log("Cleaning up socket connection and event listeners");
        // Clean up event listeners
        activityEvents.forEach((event) => {
          window.removeEventListener(event, handleUserActivity);
        });

        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [userId]);

  return { socket };
};
const socket = io(SocketUrl);
export { socket };

export default useSocket;
