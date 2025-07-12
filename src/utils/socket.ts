import io from "socket.io-client";

// Get the base URL and path from the env variable
const socketUrl = process.env.NEXT_PUBLIC_ORBIT_WEB_SOCKET_URI;

// If your server is at https://orbit-web-socket.onrender.com/api/socketio
// then base URL is https://orbit-web-socket.onrender.com
// and path is /api/socketio

const url = socketUrl?.replace(/\/api\/socketio$/, "") || "";
const path = socketUrl;

const socket = io(url, {
  path,
  transports: ["websocket", "polling"],
  // Add auth or other options if needed
});

export default socket;