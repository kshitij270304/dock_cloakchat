# WebSocket Migration Guide

## Overview
The send-message endpoint has been upgraded from REST API to WebSocket for real-time, bidirectional communication.

## Changes Made

### 1. **Server Setup** (`server.ts`)
- Created a custom Next.js server with Socket.IO integration
- Handles real-time WebSocket connections
- Manages message sending and receiving events

### 2. **Socket.IO Client Library** (`src/lib/socketIO.ts`)
- Provides easy-to-use functions for WebSocket communication
- Includes automatic reconnection handling
- Timeout management for robustness

### 3. **Socket Initialization** (`src/lib/socket.ts`)
- Updated to support proper socket management
- Lazy initialization pattern for better performance

### 4. **API Route** (`src/app/api/send-message/route.ts`)
- Kept for backward compatibility (REST fallback)
- Now marked as deprecated
- Recommends using WebSocket instead

## Usage Examples

### Sending a Message

**Before (REST API):**
```typescript
const response = await axios.post('/api/send-message', {
  username: 'targetUser',
  content: 'Hello!',
  sender: 'Anonymous'
});
```

**After (WebSocket):**
```typescript
import { sendMessageViaSocket } from '@/lib/socketIO';

try {
  const response = await sendMessageViaSocket(
    'targetUser',
    'Hello!',
    'Anonymous'
  );
  console.log('Message sent:', response);
} catch (error) {
  console.error('Failed to send:', error);
}
```

### Checking if User Accepts Messages

```typescript
import { checkAcceptingMessagesViaSocket } from '@/lib/socketIO';

try {
  const isAccepting = await checkAcceptingMessagesViaSocket('targetUser');
  console.log('User is accepting messages:', isAccepting);
} catch (error) {
  console.error('Error checking:', error);
}
```

### Listening for New Messages

```typescript
import { onNewMessage, offNewMessage } from '@/lib/socketIO';

// Listen for new messages
onNewMessage('myUsername', (data) => {
  console.log('New message:', data.message);
  console.log('From:', data.from);
});

// Stop listening
offNewMessage('myUsername');
```

### Complete Component Example

```typescript
'use client';

import { useEffect, useState } from 'react';
import { 
  sendMessageViaSocket, 
  onNewMessage,
  offNewMessage 
} from '@/lib/socketIO';

export default function MessageComponent() {
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const targetUsername = 'user123';
  const currentUser = 'Anonymous';

  useEffect(() => {
    // Set up message listener
    const handleNewMessage = (data: any) => {
      setMessages(prev => [...prev, data]);
    };

    onNewMessage(targetUsername, handleNewMessage);

    // Cleanup
    return () => {
      offNewMessage(targetUsername, handleNewMessage);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const response = await sendMessageViaSocket(
        targetUsername,
        content,
        currentUser
      );
      console.log('Message sent:', response);
      setContent('');
    } catch (error) {
      console.error('Failed to send:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <p><strong>{msg.from}:</strong> {msg.message.content}</p>
          </div>
        ))}
      </div>
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type message..."
      />
      <button 
        onClick={handleSendMessage}
        disabled={loading}
      >
        Send
      </button>
    </div>
  );
}
```

## Benefits of WebSocket

✅ **Real-time Communication**: Messages are sent and received instantly  
✅ **Bidirectional**: Two-way communication channel  
✅ **Lower Latency**: No HTTP overhead for each request  
✅ **Persistent Connection**: Single connection for multiple interactions  
✅ **Event-based**: Listen for specific events (new message, user online, etc.)  

## Migration Checklist

- [ ] Update components to use `sendMessageViaSocket` instead of REST calls
- [ ] Replace axios/fetch calls with WebSocket functions from `socketIO.ts`
- [ ] Test message sending and receiving
- [ ] Update error handling logic
- [ ] Test reconnection behavior
- [ ] Remove old REST API calls from components
- [ ] Test in production environment

## Error Handling

```typescript
try {
  const response = await sendMessageViaSocket('user', 'content', 'sender');
  if (!response.success) {
    console.error('Error:', response.message);
  }
} catch (error) {
  if (error.message === 'User not found') {
    // Handle user not found
  } else if (error.message === 'User is not accepting messages') {
    // Handle rejection
  } else {
    // Handle other errors
  }
}
```

## Server Running

```bash
# Development
npm run dev

# Production build (requires build first)
npm run build
npm start
```

## Troubleshooting

**Connection Issues:**
- Ensure server is running on `http://localhost:3000`
- Check browser console for connection errors
- Verify CORS settings in server.ts

**Message Not Sending:**
- Check WebSocket connection status
- Verify username exists in database
- Confirm user is accepting messages

**Performance:**
- Monitor active connections in server logs
- Check database query performance
- Consider implementing message caching
