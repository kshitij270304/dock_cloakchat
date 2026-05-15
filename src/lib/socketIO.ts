import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Connected to server via WebSocket');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendMessageViaSocket = (
  username: string,
  content: string,
  sender?: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  return new Promise((resolve, reject) => {
    const socket = getSocket();

    socket.emit('send-message', { username, content, sender }, (response: any) => {
      if (response?.success) {
        resolve(response);
      } else {
        reject(response);
      }
    });

    // Listen for success response
    socket.once('send-message-success', (response) => {
      resolve(response);
    });

    // Listen for error response
    socket.once('send-message-error', (response) => {
      reject(response);
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      reject({ success: false, message: 'Request timeout' });
    }, 5000);
  });
};

export const checkAcceptingMessagesViaSocket = (username: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const socket = getSocket();

    socket.emit('check-accepting-messages', { username });

    socket.once('check-accepting-messages-response', (response) => {
      if (response?.success) {
        resolve(response.isAccepting);
      } else {
        reject(response);
      }
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      reject({ success: false, message: 'Request timeout' });
    }, 5000);
  });
};

export const onNewMessage = (username: string, callback: (data: any) => void) => {
  const socket = getSocket();
  socket.on(`new-message-${username}`, callback);
};

export const offNewMessage = (username: string, callback?: (data: any) => void) => {
  const socket = getSocket();
  if (callback) {
    socket.off(`new-message-${username}`, callback);
  } else {
    socket.off(`new-message-${username}`);
  }
};
