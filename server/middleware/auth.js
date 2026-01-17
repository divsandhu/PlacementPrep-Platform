// JWT Authentication middleware for Socket.io
import { supabase } from '../supabaseClient.js';

/**
 * Verify Supabase JWT token
 * @param {string} token - JWT token from client
 * @returns {Promise<{userId: string, email: string} | null>}
 */
export async function verifyJWT(token) {
  if (!supabase || !token) {
    return null;
  }

  try {
    // Verify the JWT token using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('JWT verification failed:', error?.message);
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return null;
  }
}

/**
 * Socket.io authentication middleware
 * Extracts JWT from handshake auth and verifies it
 */
export async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided for socket connection');
      return next(new Error('Authentication required'));
    }

    const user = await verifyJWT(token);
    
    if (!user) {
      console.log('Invalid token for socket connection');
      return next(new Error('Invalid authentication token'));
    }

    // Attach user info to socket
    socket.userId = user.userId;
    socket.userEmail = user.email;
    
    console.log(`Socket authenticated: ${user.userId}`);
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication failed'));
  }
}
