import { integer, sqliteTable, text, primaryKey, unique } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqlite = new Database("auth.sqlite");
export const db = drizzle({ client: sqlite, logger: true });

// Auth.js types

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const authenticators = sqliteTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: integer("credentialBackedUp", {
      mode: "boolean",
    }).notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);

// Shareviz types

export const organizations = sqliteTable("organizations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
});

export const teams = sqliteTable("teams", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
});

export const usersTeams = sqliteTable(
  "usersTeams",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamId: text("teamId")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    role: integer("role").notNull(),
  },
  (t) => ({
    unq: unique("userTeamsUnique").on(t.userId, t.teamId),
  }),
);

export const usersOrganizations = sqliteTable(
  "usersOrganizations",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organizationId")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: integer("role").notNull(),
  },
  (t) => ({
    unq: unique("usersOrganizationsUnique").on(t.userId, t.organizationId),
  }),
);

export const userCharts = sqliteTable(
  "usersCharts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    chartId: text("chartId")
      .notNull()
      .references(() => charts.id, { onDelete: "cascade" }),
  },
  (t) => ({
    unq: unique("userChartsUnique").on(t.userId, t.chartId),
  }),
);

export const charts = sqliteTable("charts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  chartRef: text("chartRef").notNull().unique(),
  teamId: text("teamId").references(() => teams.id, { onDelete: "set null" }),
  created: integer("created").notNull(),
  updated: integer("updated").notNull().default(0),
  archived: integer("archived"),
  folderId: text("folderId").references(() => folders.id, { onDelete: "cascade" }),
});

export const folders = sqliteTable("folder", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  parentId: text("folderId").references(
    /** @type () => import("drizzle-orm/sqlite-core").AnySQLiteColumn */ () => folders.id,
    { onDelete: "cascade" },
  ),
  name: text("name").notNull(),
  teamId: text("teamId").references(() => teams.id, { onDelete: "set null" }),
  created: integer("created").notNull(),
  archived: integer("archived"),
});

export const organizationInvites = sqliteTable("organizationInvites", {
  code: text("code")
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text("organizationId").notNull(),
  // Date this invite code was used
  used: text("used"),
  expires: text("expires"),
  role: integer("role").notNull(),
});
