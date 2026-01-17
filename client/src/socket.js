// src/socket.js
import { io } from "socket.io-client";
import { supabase } from "./supabaseClient";

// Use VITE_API_URL and remove /api suffix, or fallback to default
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BACKEND_URL = API_URL.replace('/api', '') || "http://localhost:5000";

// Create socket with authentication
export const socket = io(BACKEND_URL, { 
  autoConnect: false,
  auth: async (cb) => {
    // Get current session and send JWT token
    const { data: { session } } = await supabase.auth.getSession();
    cb({
      token: session?.access_token || null
    });
  }
});

// Re-authenticate on token refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    if (socket.connected) {
      socket.auth.token = session?.access_token || null;
      socket.disconnect().connect();
    }
  }
});
