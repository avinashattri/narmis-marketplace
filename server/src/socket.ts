import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyAuthToken } from './middleware/auth';
import { Conversation } from './models/Conversation';

let ioInstance: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer, allowedOrigins: string[]): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization?.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.slice(7)
        : undefined);

    if (!token) {
      return next(new Error('Authentication required for real-time messaging'));
    }

    try {
      const decoded = verifyAuthToken(token);
      socket.data.userId = decoded.sub;
      next();
    } catch {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('join_conversation', async (conversationId: string) => {
      if (!conversationId || !userId) return;
      try {
        const conv = await Conversation.findById(conversationId).lean();
        if (
          conv &&
          (String(conv.participant1_id) === userId || String(conv.participant2_id) === userId)
        ) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch {
        // ignore invalid conversation ID
      }
    });

    socket.on('leave_conversation', (conversationId: string) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = (): SocketIOServer | null => ioInstance;

export const emitToUsers = (userIds: string[], event: string, payload: unknown): void => {
  if (!ioInstance) return;
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  for (const uid of uniqueIds) {
    ioInstance.to(`user:${uid}`).emit(event, payload);
  }
};
