import io from "socket.io-client";
import io from "socket.io-client";

// Get the base URL and path from the env variable
const socketUrl = process.env.NEXT_PUBLIC_ORBIT_WEB_SOCKET_URI;

// If your server is at https://orbit-web-socket.onrender.com/api/socketio
// then base URL is https://orbit-web-socket.onrender.com
// and path is /api/socketio

const url = socketUrl?.replace(/\/api\/socketio$/, "") || "";
const path = "/api/socketio"; // This should just be the path, not the full URL

console.log('Socket connection config:', { url, path, socketUrl });

const socket = io(url, {
  path,
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', (reason: string) => {
  console.log('Socket disconnected:', reason);
});

socket.on('connect_error', (error: Error) => {
  console.error('Socket connection error:', error);
});

export default socket;
