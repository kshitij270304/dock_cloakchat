'use client';

import { useEffect, useState } from 'react';
import { 
  sendMessageViaSocket, 
  checkAcceptingMessagesViaSocket,
  onNewMessage,
  offNewMessage,
  getSocket
} from '@/lib/socketIO';
import { toast } from 'sonner';

interface MessageData {
  _id?: string;
  content: string;
  createdAt: Date | string;
  from?: string;
}

interface WebSocketSendMessageProps {
  targetUsername: string;
  currentUser?: string;
  onMessageSent?: (message: MessageData) => void;
  onMessageReceived?: (message: MessageData, from: string) => void;
}

/**
 * Example component showing how to use the new WebSocket implementation
 * for sending and receiving messages in real-time
 */
export default function WebSocketSendMessageExample({
  targetUsername,
  currentUser = 'Anonymous',
  onMessageSent,
  onMessageReceived
}: WebSocketSendMessageProps) {
  const [messageContent, setMessageContent] = useState('');
  const [messages, setMessages] = useState<(MessageData & { from: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Initialize WebSocket connection and listeners
  useEffect(() => {
    const socket = getSocket();

    // Check connection status
    setIsConnected(socket.connected);

    const handleConnect = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      toast.success('Connected to server');
    };

    const handleDisconnect = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      toast.error('Disconnected from server');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  // Set up listener for new messages
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      const newMessage = {
        ...data.message,
        from: data.from,
        createdAt: new Date(data.message.createdAt)
      };
      setMessages(prev => [...prev, newMessage]);
      
      if (onMessageReceived) {
        onMessageReceived(data.message, data.from);
      }
      toast.success(`New message from ${data.from}`);
    };

    onNewMessage(targetUsername, handleNewMessage);

    return () => {
      offNewMessage(targetUsername, handleNewMessage);
    };
  }, [targetUsername, onMessageReceived]);

  // Check if target user is accepting messages
  useEffect(() => {
    const checkAccepting = async () => {
      try {
        const accepting = await checkAcceptingMessagesViaSocket(targetUsername);
        setIsAccepting(accepting);
      } catch (error) {
        console.error('Failed to check if user is accepting messages:', error);
        setIsAccepting(false);
      }
    };

    if (targetUsername && isConnected) {
      checkAccepting();
    }
  }, [targetUsername, isConnected]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    if (!isConnected) {
      toast.error('Not connected to server');
      return;
    }

    if (!isAccepting) {
      toast.error('User is not accepting messages');
      return;
    }

    setLoading(true);
    try {
      const response = await sendMessageViaSocket(
        targetUsername,
        messageContent,
        currentUser
      );

      if (response.success) {
        toast.success('Message sent successfully!');
        setMessageContent('');
        
        if (onMessageSent && response.data) {
          onMessageSent({
            ...response.data,
            createdAt: new Date(response.data.createdAt)
          });
        }
      } else {
        toast.error(response.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error?.message || 'Failed to send message';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Connection Status */}
      <div className="mb-4 p-2 rounded-md">
        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}></span>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      {/* User Status */}
      <div className="mb-4 p-2 rounded-md bg-blue-50">
        <p>Target User: <strong>{targetUsername}</strong></p>
        <p>Accepting Messages: {isAccepting ? '✓ Yes' : '✗ No'}</p>
      </div>

      {/* Messages Display */}
      <div className="mb-4 p-4 border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className="p-3 bg-white rounded border">
                <p className="text-sm font-semibold text-blue-600">{msg.from}</p>
                <p className="text-gray-800">{msg.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Form */}
      <form onSubmit={handleSendMessage} className="space-y-3">
        <textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Type your message here..."
          disabled={!isConnected || !isAccepting || loading}
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          rows={4}
          maxLength={300}
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {messageContent.length}/300
          </span>
          <button
            type="submit"
            disabled={!isConnected || !isAccepting || loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  );
}
