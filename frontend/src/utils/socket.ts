import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket connection
const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // Don't connect automatically
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

export default socket;
