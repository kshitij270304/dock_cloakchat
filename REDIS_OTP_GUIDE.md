# Redis OTP Caching Implementation Guide

## Overview
This implementation adds Redis caching for OTP (One-Time Password) verification in the login flow. OTPs are now cached in Redis with automatic expiry, providing faster verification while maintaining database as a fallback.

## What Was Added

### 1. New Files
- **[src/lib/redis.ts](src/lib/redis.ts)** - Redis client utility with OTP caching functions

### 2. Updated Files
- **[package.json](package.json)** - Added `redis` package v4.7.0
- **[src/app/api/send-otp/route.ts](src/app/api/send-otp/route.ts)** - Caches OTP in Redis after generation
- **[src/app/api/verify-otp/route.ts](src/app/api/verify-otp/route.ts)** - Checks Redis first, then database

## Implementation Details

### Redis Key Format
```
otp:{userId}
```
Example: `otp:507f1f77bcf86cd799439011`

### OTP Lifecycle

#### 1. OTP Generation (send-otp)
```
1. Generate 6-digit OTP
2. Save to MongoDB (backward compatibility)
3. Cache in Redis with 600s (10 min) expiry
4. Send via email
```

#### 2. OTP Verification (verify-otp)
```
1. Check if OTP exists in Redis
2. If not found in Redis, check MongoDB
3. Compare received OTP with stored value
4. Delete from both Redis and MongoDB
5. Return success/failure
```

### Functions Available

**`getRedisClient()`**
- Initializes and returns Redis client
- Handles reconnection automatically
- Throws error if unable to connect

**`setOTPInRedis(userId: string, otp: string, expiryInSeconds?: number)`**
- Stores OTP in Redis with expiry
- Default expiry: 600 seconds (10 minutes)
- Throws error if Redis is unavailable

**`getOTPFromRedis(userId: string)`**
- Retrieves OTP from Redis
- Returns null if not found or expired
- Throws error if Redis is unavailable

**`deleteOTPFromRedis(userId: string)`**
- Removes OTP from Redis
- Safe to call even if key doesn't exist

**`closeRedisConnection()`**
- Gracefully closes Redis connection
- Optional for cleanup

## Environment Configuration

### Required Environment Variable
```env
REDIS_URL=redis://your-redis-host:6379
```

### Redis Dashboard Connection
Use your Redis dashboard credentials (from screenshot):
- **Host:** day-compelling-altruistic-79627db.redis.io
- **Port:** 6379
- **Database:** 0
- **Auth:** Check your Redis dashboard credentials

### Example .env Setup
```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Resend Email
RESEND_API_KEY=your_resend_api_key

# Redis
REDIS_URL=redis://day-compelling-altruistic-79627db.redis.io:6379
# If password protected:
REDIS_URL=redis://:password@day-compelling-altruistic-79627db.redis.io:6379
```

## API Endpoints

### POST /api/send-otp
**Request:**
```json
{
  "identifier": "user@example.com",
  "password": "userPassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "email": "user@example.com",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Flow:**
1. Validates credentials
2. Generates OTP
3. Caches in Redis (10 min expiry)
4. Saves to MongoDB (fallback)
5. Sends email

### POST /api/verify-otp
**Request:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now log in.",
  "userId": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "user@example.com"
}
```

**Flow:**
1. Check Redis for OTP (fast, in-memory)
2. If not found, check MongoDB (fallback)
3. Verify OTP matches
4. Delete from both Redis and MongoDB
5. Return success

## Performance Benefits

| Aspect | Without Redis | With Redis |
|--------|---------------|-----------|
| OTP Lookup | Database query | In-memory lookup |
| Average Latency | 10-50ms | <1ms |
| Automatic Expiry | Manual cleanup | Automatic after 10min |
| Scalability | Database depends | Redis handles |
| Failure Mode | Complete failure | Falls back to DB |

## Error Handling

### Non-Blocking Fallback
If Redis is unavailable:
- OTP sending still works (saves to DB, logs Redis error)
- OTP verification falls back to database
- No service interruption

### Logged Errors
- Redis connection errors
- Cache read/write failures
- Fallback operations

## Testing

### Step 1: Verify Redis Connection
```bash
# Check if REDIS_URL is set correctly
echo $REDIS_URL

# Test connectivity using Redis CLI
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

### Step 2: Test OTP Flow
1. Go to `/sign-in`
2. Enter verified user credentials
3. Click "Continue"
4. Check Redis dashboard:
   - Go to Keys section
   - Look for keys matching `otp:*`
   - Verify OTP value is stored
5. Enter OTP from email
6. Verify OTP is deleted from Redis after verification

### Step 3: Monitor Redis
```bash
# Real-time monitor Redis commands
redis-cli -u $REDIS_URL MONITOR

# Check OTP keys in Redis
redis-cli -u $REDIS_URL KEYS "otp:*"

# Get specific OTP
redis-cli -u $REDIS_URL GET "otp:507f1f77bcf86cd799439011"

# Check TTL (time to live)
redis-cli -u $REDIS_URL TTL "otp:507f1f77bcf86cd799439011"
```

## Troubleshooting

### Issue: "Redis connection failed"
**Solution:**
- Verify REDIS_URL in .env
- Check Redis server is running
- Test connectivity: `redis-cli -u $REDIS_URL ping`

### Issue: OTP not cached in Redis
**Solution:**
- Check logs for "[Redis]" messages
- Verify Redis URL is accessible
- Check Redis dashboard for key: `otp:{userId}`

### Issue: OTP verification fails
**Solution:**
- If Redis down, should fallback to database
- Check MongoDB for twoFactorCode
- Verify OTP expiry time (10 minutes)

### Issue: Redis keys not expiring
**Solution:**
- Check Redis configuration allows key expiry
- Monitor TTL: `redis-cli -u $REDIS_URL TTL otp:{userId}`
- Verify setEx command is working

## Package Installation

The `redis` package is already added to dependencies. To install:

```bash
npm install
# or
yarn install
# or
pnpm install
```

This installs:
- **redis@4.7.0** - Node.js Redis client

## Logs to Monitor

Look for these log patterns in your console:

```
[Redis] Connected successfully
[Redis] OTP cached for user {userId}, expires in 600s
[Redis] Retrieved OTP for user {userId}: Found
[send-otp] OTP cached in Redis for user: {userId}
[verify-otp] OTP retrieved from Redis cache
[verify-otp] OTP deleted from Redis
```

## Security Considerations

✅ **OTP expiry:** Automatic after 10 minutes (Redis) + database backup
✅ **Secure storage:** In Redis, removed after verification
✅ **Fallback security:** Database maintains backup copy
✅ **No sensitive data:** Only OTP stored, no passwords
✅ **Audit logs:** All operations logged with timestamps

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set REDIS_URL in .env
3. ✅ Restart development server
4. ✅ Test OTP flow (see Testing section)
5. ✅ Monitor Redis dashboard for keys
6. ✅ Check logs for Redis operations

## Architecture Diagram

```
User Login
    ↓
[send-otp] Endpoint
    ├→ Validate Credentials
    ├→ Generate OTP
    ├→ Save to MongoDB (backup)
    ├→ Cache in Redis (primary)
    └→ Send Email
    ↓
User Enters OTP
    ↓
[verify-otp] Endpoint
    ├→ Check Redis (fast)
    │   ├→ Found: Verify & Delete
    │   └→ Not Found: Check MongoDB (fallback)
    ├→ Compare OTP
    ├→ Delete from Redis
    ├→ Delete from MongoDB
    └→ Login Success
```

## Database Schema

### MongoDB (User Model)
```javascript
{
  twoFactorCode: String,           // Backup copy
  twoFactorCodeExpiry: Date,       // Backup copy
}
```

### Redis (Key-Value)
```
Key:   otp:{userId}
Value: "123456"
TTL:   600 seconds (auto-managed)
```

## Support

For issues or questions:
1. Check logs for "[Redis]" or "[send-otp]" or "[verify-otp]" messages
2. Verify Redis URL and connectivity
3. Check Redis dashboard for cached keys
4. Monitor both Redis and MongoDB for consistency
