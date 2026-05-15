# WebSocket Testing Guide

## Quick Start

### 1. Start the Server
```bash
npm run dev
```

Expected output:
```
> Ready on http://localhost:3000
```

### 2. Verify WebSocket is Running
Open browser DevTools (F12) and check:
1. Go to Application → Cookies → Look for any WebSocket connections
2. Check Console for: `"Connected to WebSocket server"` messages
3. Network tab should show WebSocket connections (look for green `101 Switching Protocols`)

---

## Testing Scenarios

### Test 1: Connection Status
**What it tests:** WebSocket connection establishment

```bash
# In browser console:
const socket = getSocket();
console.log('Connected:', socket.connected);
```

**Expected:** `Connected: true`

---

### Test 2: Send Message
**What it tests:** Real-time message sending

**Using the UI:**
1. Go to `http://localhost:3000/u/testuser` (or any valid username)
2. You should see green "Connected via WebSocket" indicator
3. Type a message (min 10 chars, max 300 chars)
4. Click "Send It"
5. Should see success toast notification

**Using code in browser console:**
```typescript
import { sendMessageViaSocket } from '@/lib/socketIO';

await sendMessageViaSocket('testuser', 'This is a test message', 'TestUser');
```

**Expected:**
- Success message toast
- No errors in console
- Message saved in database

---

### Test 3: Check User Accepting Messages
**What it tests:** User status checking

```typescript
import { checkAcceptingMessagesViaSocket } from '@/lib/socketIO';

const isAccepting = await checkAcceptingMessagesViaSocket('testuser');
console.log('Accepting messages:', isAccepting);
```

**Expected:** `Accepting messages: true` (if user accepts messages)

---

### Test 4: Connection Reconnection
**What it tests:** Automatic reconnection after disconnect

1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for WebSocket connection (should be green)
4. Right-click on it → "Close connection"
5. Watch the Connection Status indicator
6. It should automatically reconnect within 5 seconds

**Expected:** 
- Connection status changes to red briefly
- Then back to green
- Console shows "Disconnected..." then "Connected..." messages

---

### Test 5: Real-time Message Notification
**What it tests:** Receiving new message events

1. Have two browser windows/tabs open
2. In Tab 1: Go to `http://localhost:3000/u/user1`
3. In Tab 2: Go to `http://localhost:3000/u/user2`
4. From Tab 1, send a message to user2
5. The message should appear in Tab 2 in real-time

**Expected:** Immediate message appearance without page refresh

---

## Error Testing

### Test 6: Send to Non-existent User
```typescript
await sendMessageViaSocket('nonexistentuser123', 'Hello', 'Sender');
```

**Expected:** Error toast: "User not found"

---

### Test 7: Send to User Not Accepting Messages
1. Create/find a user with `isAcceptingMessages = false`
2. Try sending a message

**Expected:** Error toast: "User is not accepting messages"

---

### Test 8: Connection Timeout
```typescript
// Disconnect network and try to send
await sendMessageViaSocket('user', 'message', 'sender');
```

**Expected:** Error after 5 seconds: "Request timeout"

---

### Test 9: Empty Message
```typescript
await sendMessageViaSocket('user', '', 'sender');
```

**Expected:** Error: "Username and content are required"

---

### Test 10: Message Length Validation
```typescript
// Message too short (< 10 chars)
await sendMessageViaSocket('user', 'hello', 'sender');

// Message too long (> 300 chars)
const longMsg = 'a'.repeat(301);
await sendMessageViaSocket('user', longMsg, 'sender');
```

**Expected:** Validation errors from client-side form validation

---

## Browser Console Commands

### Get Socket Instance
```typescript
const socket = getSocket();
console.log(socket);
```

### Check Connection Status
```typescript
const socket = getSocket();
console.log('Connected:', socket.connected);
```

### Listen for All Events
```typescript
const socket = getSocket();
socket.onAny((eventName, ...args) => {
  console.log('Event:', eventName, 'Data:', args);
});
```

### Send Test Message
```typescript
const socket = getSocket();
socket.emit('send-message', {
  username: 'testuser',
  content: 'Test message',
  sender: 'TestSender'
});

socket.on('send-message-success', (response) => {
  console.log('Success:', response);
});

socket.on('send-message-error', (response) => {
  console.error('Error:', response);
});
```

---

## Debugging Tips

### Check Server Logs
```bash
# Watch server output for connection logs
npm run dev
```

Look for:
- `User connected: [socket-id]`
- `Message sent to [username]`
- `User disconnected: [socket-id]`
- Error messages

### Monitor Network
1. DevTools → Network tab
2. Filter by "WS" to see WebSocket connections
3. Click on WebSocket connection to see messages

### Check Database
```typescript
// In MongoDB
db.users.findOne({ username: 'testuser' });
```

Look for `messages` array to verify message was stored

---

## Performance Testing

### Load Testing
```typescript
// Send multiple messages rapidly
for (let i = 0; i < 10; i++) {
  await sendMessageViaSocket('user', `Message ${i}`, 'Sender');
}
```

**Monitor:**
- Server CPU usage
- Memory consumption
- Connection stability

### Latency Testing
```typescript
const start = performance.now();
await sendMessageViaSocket('user', 'message', 'sender');
const latency = performance.now() - start;
console.log('Latency:', latency, 'ms');
```

**Expected:** < 100ms for local testing

---

## Checklist for Deployment

- [ ] Test on development server locally
- [ ] Test with multiple concurrent connections
- [ ] Test reconnection scenarios
- [ ] Test error handling
- [ ] Test message persistence in database
- [ ] Monitor server memory and CPU
- [ ] Test with different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile browsers
- [ ] Set up monitoring/logging for production
- [ ] Configure CORS for production domain
- [ ] Update `socket.io` URL for production

---

## Common Issues & Solutions

### "WebSocket is closed before the connection is established"
- **Cause:** Server not running or port mismatch
- **Fix:** Ensure `npm run dev` is running on port 3000

### "Cannot read properties of undefined (reading 'emit')"
- **Cause:** Socket not properly initialized
- **Fix:** Use `getSocket()` to ensure socket is initialized

### "Message sent but not appearing in database"
- **Cause:** Database connection issue
- **Fix:** Check MongoDB connection string, verify `npm run dev` logs

### "Connection keeps dropping"
- **Cause:** Network issue or server overload
- **Fix:** Check network, restart server, monitor memory usage

---

## Next Steps

After successful testing:
1. ✅ Verify all test scenarios pass
2. ✅ Update remaining components to use WebSocket
3. ✅ Deploy to staging environment
4. ✅ Perform user acceptance testing
5. ✅ Deploy to production with monitoring
