import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";
import { token, pusherAppKey, pusherAppCluster } from "./components/providers/appConfig";

// Debug that bootstrap executed
console.log("🚀 Bootstrap: initializing Echo/Pusher...");

// Expose Pusher for Echo
window.Pusher = Pusher;

try {
  window.Echo = new Echo({
    broadcaster: "pusher",
    key: pusherAppKey || import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: pusherAppCluster || import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
    wsPort: 443,
    wssPort: 443,
    enabledTransports: ["ws", "wss"],
    // Use API-prefixed auth endpoint handled by BroadcastServiceProvider
    authEndpoint: "/api/broadcasting/auth",
    auth: {
      headers: {
        Authorization: token(),
        Accept: "application/json",
      },
    },
  });

  const conn = window.Echo?.connector?.pusher?.connection;
  if (conn) {
    conn.bind("connected", () => console.log("🟢 [Echo] connected", conn.socket_id));
    conn.bind("disconnected", () => console.log("🔴 [Echo] disconnected"));
    conn.bind("error", (e) => console.error("❌ [Echo] error", e));
    conn.bind("state_change", (s) => console.log("🔄 [Echo] state", s.previous, "=>", s.current));
  } else {
    console.warn("⚠️ [Echo] connection object not available yet");
  }
} catch (e) {
  console.error("❌ Bootstrap: failed to init Echo:", e);
}

// Ensure axios carries auth header for broadcasting auth
axios.defaults.headers.common["Authorization"] = token();

console.log("✅ Bootstrap: Echo/Pusher init complete");