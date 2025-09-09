import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRoomSchema, insertGameParticipantSchema, insertGameResultSchema } from "@shared/schema";
import { z } from "zod";

// Validation schemas
const createRoomInputSchema = insertRoomSchema.extend({
  name: z.string().min(1).max(50),
  maxPlayers: z.number().min(2).max(10),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]),
  duration: z.number().min(60).max(600), // 1-10 minutes
});

const joinRoomInputSchema = z.object({
  code: z.string().length(10),
});

const updateProgressInputSchema = z.object({
  wpm: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  progress: z.number().min(0).max(100),
  charactersTyped: z.number().min(0),
  errors: z.number().min(0),
});

const finishGameInputSchema = z.object({
  participantId: z.string(),
  finalWpm: z.number().min(0),
  finalAccuracy: z.number().min(0).max(100),
});

// Sample text content for different difficulties
const SAMPLE_TEXTS = {
  easy: "The cat sat on the mat. It was a sunny day and the birds were singing in the trees. Children played in the park while their parents watched from nearby benches.",
  medium: "Technology has revolutionized the way we communicate with each other. Social media platforms allow us to connect instantly with people around the world, sharing our thoughts and experiences in real-time.",
  hard: "Quantum mechanics represents one of the most fascinating and counterintuitive branches of physics, challenging our fundamental understanding of reality through phenomena like superposition and entanglement.",
  expert: "The implementation of sophisticated algorithms in machine learning requires careful consideration of computational complexity, optimization techniques, and the mathematical foundations underlying neural network architectures."
};

function generateRoomCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Room management routes
  app.post('/api/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = createRoomInputSchema.parse(req.body);
      
      const roomCode = generateRoomCode();
      const textContent = SAMPLE_TEXTS[input.difficulty];
      
      const room = await storage.createRoom({
        ...input,
        code: roomCode,
        ownerId: userId,
        textContent,
        currentPlayers: 0,
      });

      res.json(room);
    } catch (error) {
      console.error("Error creating room:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create room" });
    }
  });

  app.post('/api/rooms/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = joinRoomInputSchema.parse(req.body);
      
      const room = await storage.getRoomByCode(code);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      if (room.status !== "waiting") {
        return res.status(400).json({ message: "Room is not accepting new players" });
      }

      if (room.currentPlayers >= room.maxPlayers) {
        return res.status(400).json({ message: "Room is full" });
      }

      // Check if user is already in the room
      const existingParticipant = room.participants.find(p => p.user.id === userId);
      if (existingParticipant) {
        return res.status(400).json({ message: "Already joined this room" });
      }

      const participant = await storage.joinRoom({
        roomId: room.id,
        userId,
      });

      await storage.updateRoomPlayerCount(room.id, room.currentPlayers + 1);

      res.json({ room, participant });
    } catch (error) {
      console.error("Error joining room:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to join room" });
    }
  });

  app.get('/api/rooms/:code', isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.params;
      const room = await storage.getRoomByCode(code);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  // Game progress routes
  app.post('/api/game/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { wpm, accuracy, progress, charactersTyped, errors } = updateProgressInputSchema.parse(req.body);
      const { participantId } = req.query;

      if (!participantId) {
        return res.status(400).json({ message: "Participant ID is required" });
      }

      await storage.updateParticipantProgress(
        participantId as string,
        wpm,
        accuracy,
        progress,
        charactersTyped,
        errors
      );

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating progress:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.post('/api/game/finish', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { participantId, finalWpm, finalAccuracy } = finishGameInputSchema.parse(req.body);

      // Get current participants to determine placement
      const participant = await storage.getRoomParticipants(participantId);
      const finishedCount = participant.filter(p => p.finished).length;
      const placement = finishedCount + 1;

      await storage.finishParticipant(participantId, finalWpm, finalAccuracy, placement);

      // Update user stats
      const won = placement === 1;
      await storage.updateUserStats(userId, finalWpm, finalAccuracy, won);

      res.json({ placement });
    } catch (error) {
      console.error("Error finishing game:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to finish game" });
    }
  });

  app.get('/api/rooms/:roomId/participants', isAuthenticated, async (req: any, res) => {
    try {
      const { roomId } = req.params;
      const participants = await storage.getRoomParticipants(roomId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  // Stats and leaderboard routes
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/user/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getUserGameHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching game history:", error);
      res.status(500).json({ message: "Failed to fetch game history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
