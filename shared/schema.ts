import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  bestWpm: integer("best_wpm").default(0),
  averageWpm: integer("average_wpm").default(0),
  averageAccuracy: real("average_accuracy").default(0),
  gamesPlayed: integer("games_played").default(0),
  gamesWon: integer("games_won").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name").notNull(),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  maxPlayers: integer("max_players").default(6),
  currentPlayers: integer("current_players").default(0),
  status: varchar("status", { enum: ["waiting", "in_progress", "finished"] }).default("waiting"),
  textContent: text("text_content").notNull(),
  difficulty: varchar("difficulty", { enum: ["easy", "medium", "hard", "expert"] }).default("medium"),
  duration: integer("duration").default(180), // 3 minutes in seconds
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameParticipants = pgTable("game_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => rooms.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  currentWpm: integer("current_wpm").default(0),
  currentAccuracy: real("current_accuracy").default(0),
  progress: real("progress").default(0), // percentage completed
  charactersTyped: integer("characters_typed").default(0),
  errors: integer("errors").default(0),
  finished: boolean("finished").default(false),
  finalWpm: integer("final_wpm"),
  finalAccuracy: real("final_accuracy"),
  placement: integer("placement"),
  joinedAt: timestamp("joined_at").defaultNow(),
  finishedAt: timestamp("finished_at"),
});

export const gameResults = pgTable("game_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => rooms.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  wpm: integer("wpm").notNull(),
  accuracy: real("accuracy").notNull(),
  placement: integer("placement").notNull(),
  charactersTyped: integer("characters_typed").notNull(),
  errors: integer("errors").notNull(),
  duration: integer("duration").notNull(), // time taken in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedRooms: many(rooms),
  gameParticipants: many(gameParticipants),
  gameResults: many(gameResults),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  owner: one(users, {
    fields: [rooms.ownerId],
    references: [users.id],
  }),
  participants: many(gameParticipants),
  results: many(gameResults),
}));

export const gameParticipantsRelations = relations(gameParticipants, ({ one }) => ({
  room: one(rooms, {
    fields: [gameParticipants.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [gameParticipants.userId],
    references: [users.id],
  }),
}));

export const gameResultsRelations = relations(gameResults, ({ one }) => ({
  room: one(rooms, {
    fields: [gameResults.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [gameResults.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentPlayers: true,
});

export const insertGameParticipantSchema = createInsertSchema(gameParticipants).omit({
  id: true,
  joinedAt: true,
  finishedAt: true,
});

export const insertGameResultSchema = createInsertSchema(gameResults).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertGameParticipant = z.infer<typeof insertGameParticipantSchema>;
export type GameParticipant = typeof gameParticipants.$inferSelect;
export type InsertGameResult = z.infer<typeof insertGameResultSchema>;
export type GameResult = typeof gameResults.$inferSelect;

// Extended types for API responses
export type RoomWithParticipants = Room & {
  participants: (GameParticipant & { user: User })[];
  owner: User;
};

export type GameParticipantWithUser = GameParticipant & {
  user: User;
};
