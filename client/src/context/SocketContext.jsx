import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Join pincode room so citizen gets alerts for their area
      if (user.pincode) socket.emit('join:pincode', user.pincode);
      // Operator/admin also joins ops room
      if (['operator', 'admin'].includes(user.role)) socket.emit('join:ops');
    });

    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]);

  const on  = (event, cb) => socketRef.current?.on(event, cb);
  const off = (event, cb) => socketRef.current?.off(event, cb);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, on, off }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);