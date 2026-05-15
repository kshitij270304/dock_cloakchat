import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import dbConnect from './src/lib/dbConnect';
import UserModel from './src/model/User.model';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket.IO connection and event handlers
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle sending messages via WebSocket
    socket.on('send-message', async (data: { username: string; content: string; sender?: string }) => {
      try {
        await dbConnect();
        const { username, content, sender } = data;

        // Validate input
        if (!username || !content) {
          socket.emit('send-message-error', {
            message: 'Username and content are required',
            success: false,
          });
          return;
        }

        // Find the user
        const user = await UserModel.findOne({ username }).exec();

        if (!user) {
          socket.emit('send-message-error', {
            message: 'User not found',
            success: false,
          });
          return;
        }

        if (!user.isAcceptingMessages) {
          socket.emit('send-message-error', {
            message: 'User is not accepting messages',
            success: false,
          });
          return;
        }

        // Create new message
        const newMessage = {
          content,
          createdAt: new Date(),
        } as any; // MongoDB will auto-generate _id field

        user.messages.push(newMessage);
        await user.save({ validateBeforeSave: false });

        // Emit success response to the sender
        socket.emit('send-message-success', {
          message: 'Message sent successfully',
          success: true,
          data: newMessage,
        });

        // Emit message-received event to the recipient (if online)
        io.emit(`new-message-${username}`, {
          message: newMessage,
          from: sender || 'Anonymous',
        });

        console.log(`Message sent to ${username}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('send-message-error', {
          message: 'Internal server error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Handle checking if user is accepting messages
    socket.on('check-accepting-messages', async (data: { username: string }) => {
      try {
        await dbConnect();
        const { username } = data;

        const user = await UserModel.findOne({ username }).exec();

        if (!user) {
          socket.emit('check-accepting-messages-response', {
            isAccepting: false,
            success: false,
            message: 'User not found',
          });
          return;
        }

        socket.emit('check-accepting-messages-response', {
          isAccepting: user.isAcceptingMessages,
          success: true,
        });
      } catch (error) {
        console.error('Error checking accepting messages:', error);
        socket.emit('check-accepting-messages-response', {
          isAccepting: false,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
