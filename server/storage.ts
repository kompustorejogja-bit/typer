import {
  users,
  rooms,
  gameParticipants,
  gameResults,
  type User,
  type UpsertUser,
  type Room,
  type InsertRoom,
  type GameParticipant,
  type InsertGameParticipant,
  type GameResult,
  type InsertGameResult,
  type RoomWithParticipants,
  type GameParticipantWithUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStats(userId: string, wpm: number, accuracy: number, won: boolean): Promise<void>;
  
  // Room operations
  createRoom(room: InsertRoom): Promise<Room>;
  getRoomByCode(code: string): Promise<RoomWithParticipants | undefined>;
  getRoomById(id: string): Promise<RoomWithParticipants | undefined>;
  updateRoomStatus(roomId: string, status: "waiting" | "in_progress" | "finished"): Promise<void>;
  updateRoomPlayerCount(roomId: string, count: number): Promise<void>;
  
  // Game participant operations
  joinRoom(participant: InsertGameParticipant): Promise<GameParticipant>;
  updateParticipantProgress(participantId: string, wpm: number, accuracy: number, progress: number, charactersTyped: number, errors: number): Promise<void>;
  finishParticipant(participantId: string, finalWpm: number, finalAccuracy: number, placement: number): Promise<void>;
  getRoomParticipants(roomId: string): Promise<GameParticipantWithUser[]>;
  
  // Game result operations
  saveGameResult(result: InsertGameResult): Promise<GameResult>;
  getUserGameHistory(userId: string, limit?: number): Promise<GameResult[]>;
  getLeaderboard(limit?: number): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStats(userId: string, wpm: number, accuracy: number, won: boolean): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const newGamesPlayed = user.gamesPlayed + 1;
    const newGamesWon = won ? user.gamesWon + 1 : user.gamesWon;
    const newAverageWpm = Math.round((user.averageWpm * user.gamesPlayed + wpm) / newGamesPlayed);
    const newAverageAccuracy = (user.averageAccuracy * user.gamesPlayed + accuracy) / newGamesPlayed;
    const newBestWpm = Math.max(user.bestWpm, wpm);

    await db
      .update(users)
      .set({
        gamesPlayed: newGamesPlayed,
        gamesWon: newGamesWon,
        averageWpm: newAverageWpm,
        averageAccuracy: newAverageAccuracy,
        bestWpm: newBestWpm,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Room operations
  async createRoom(roomData: InsertRoom): Promise<Room> {
    const [room] = await db.insert(rooms).values(roomData).returning();
    return room;
  }

  async getRoomByCode(code: string): Promise<RoomWithParticipants | undefined> {
    const [room] = await db
      .select()
      .from(rooms)
      .leftJoin(users, eq(rooms.ownerId, users.id))
      .where(eq(rooms.code, code));

    if (!room) return undefined;

    const participants = await db
      .select()
      .from(gameParticipants)
      .leftJoin(users, eq(gameParticipants.userId, users.id))
      .where(eq(gameParticipants.roomId, room.rooms.id));

    return {
      ...room.rooms,
      owner: room.users!,
      participants: participants.map(p => ({
        ...p.game_participants,
        user: p.users!,
      })),
    };
  }

  async getRoomById(id: string): Promise<RoomWithParticipants | undefined> {
    const [room] = await db
      .select()
      .from(rooms)
      .leftJoin(users, eq(rooms.ownerId, users.id))
      .where(eq(rooms.id, id));

    if (!room) return undefined;

    const participants = await db
      .select()
      .from(gameParticipants)
      .leftJoin(users, eq(gameParticipants.userId, users.id))
      .where(eq(gameParticipants.roomId, room.rooms.id));

    return {
      ...room.rooms,
      owner: room.users!,
      participants: participants.map(p => ({
        ...p.game_participants,
        user: p.users!,
      })),
    };
  }

  async updateRoomStatus(roomId: string, status: "waiting" | "in_progress" | "finished"): Promise<void> {
    await db
      .update(rooms)
      .set({ status, updatedAt: new Date() })
      .where(eq(rooms.id, roomId));
  }

  async updateRoomPlayerCount(roomId: string, count: number): Promise<void> {
    await db
      .update(rooms)
      .set({ currentPlayers: count, updatedAt: new Date() })
      .where(eq(rooms.id, roomId));
  }

  // Game participant operations
  async joinRoom(participantData: InsertGameParticipant): Promise<GameParticipant> {
    const [participant] = await db
      .insert(gameParticipants)
      .values(participantData)
      .returning();
    return participant;
  }

  async updateParticipantProgress(
    participantId: string,
    wpm: number,
    accuracy: number,
    progress: number,
    charactersTyped: number,
    errors: number
  ): Promise<void> {
    await db
      .update(gameParticipants)
      .set({
        currentWpm: wpm,
        currentAccuracy: accuracy,
        progress,
        charactersTyped,
        errors,
      })
      .where(eq(gameParticipants.id, participantId));
  }

  async finishParticipant(
    participantId: string,
    finalWpm: number,
    finalAccuracy: number,
    placement: number
  ): Promise<void> {
    await db
      .update(gameParticipants)
      .set({
        finished: true,
        finalWpm,
        finalAccuracy,
        placement,
        finishedAt: new Date(),
      })
      .where(eq(gameParticipants.id, participantId));
  }

  async getRoomParticipants(roomId: string): Promise<GameParticipantWithUser[]> {
    const participants = await db
      .select()
      .from(gameParticipants)
      .leftJoin(users, eq(gameParticipants.userId, users.id))
      .where(eq(gameParticipants.roomId, roomId))
      .orderBy(desc(gameParticipants.progress));

    return participants.map(p => ({
      ...p.game_participants,
      user: p.users!,
    }));
  }

  // Game result operations
  async saveGameResult(resultData: InsertGameResult): Promise<GameResult> {
    const [result] = await db.insert(gameResults).values(resultData).returning();
    return result;
  }

  async getUserGameHistory(userId: string, limit = 10): Promise<GameResult[]> {
    const results = await db
      .select()
      .from(gameResults)
      .where(eq(gameResults.userId, userId))
      .orderBy(desc(gameResults.createdAt))
      .limit(limit);

    return results;
  }

  async getLeaderboard(limit = 10): Promise<User[]> {
    const leaderboard = await db
      .select()
      .from(users)
      .where(sql`${users.gamesPlayed} > 0`)
      .orderBy(desc(users.bestWpm))
      .limit(limit);

    return leaderboard;
  }
}

export const storage = new DatabaseStorage();
