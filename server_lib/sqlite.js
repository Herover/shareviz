import { and, eq, isNull } from "drizzle-orm";
import {
  accounts,
  charts,
  db as drizzledb,
  folders,
  organizationInvites,
  organizations,
  teams,
  userCharts,
  users,
  usersOrganizations,
  usersTeams,
} from "./drizzle/schema.js";

// FIXME: These values must match values in src/lib/consts.ts
export const TEAM_ROLES = {
  MEMBER: 1,
  ADMIN: 2,
};
export const ORGANIZATION_ROLES = {
  MEMBER: 1,
  ADMIN: 2,
};

export const db = {
  getUser: async (/** @type {{ username?: string, id?: string }} */ { username, id }) => {
    return drizzledb
      .select()
      .from(users)
      .where(username ? eq(users.email, username) : id ? eq(users.id, id) : undefined);
  },
  getUserAccounts: async (/** @type {string} */ userId) => {
    return drizzledb
      .select({
        id: accounts.providerAccountId,
        provider: accounts.provider,
        expiresAt: accounts.expires_at,
      })
      .from(accounts)
      .where(eq(accounts.userId, userId));
  },
  getUserTeams: async (/** @type {string} */ userId) => {
    // return new Promise((resolve, reject) => {

    //   const stmt = db.prepare(`
    //     SELECT
    //       teams.id, teams.name
    //     FROM
    //       teams_users
    //       INNER JOIN teams ON teams_users.team_id = teams.id
    //     WHERE
    //       (teams_users.user_id = ?)
    //   `);
    //   stmt.all([userId], function (err, rows) {
    //     if (err) reject(err);
    //     resolve(rows.map(((row) => ({ ...row, id: "" + row.id }))));
    //   }).finalize();
    // });
    return drizzledb
      .select()
      .from(usersTeams)
      .innerJoin(teams, eq(usersTeams.teamId, teams.id))
      .where(eq(usersTeams.userId, userId));
  },
  getUserOrganizations: async (/** @type {string} */ userId) => {
    return drizzledb
      .select()
      .from(usersOrganizations)
      .innerJoin(organizations, eq(usersOrganizations.organizationId, organizations.id))
      .where(eq(usersOrganizations.userId, userId));
  },

  getUserCharts: async (
    /** @type {string} */ userId,
    /** @type {string | undefined} */ chartRef,
  ) => {
    return drizzledb
      .select({
        id: charts.id,
        name: charts.name,
        chartRef: charts.chartRef,
        teamId: charts.teamId,
        created: charts.created,
        updated: charts.updated,
      })
      .from(users)
      .innerJoin(usersTeams, eq(usersTeams.userId, users.id))
      .innerJoin(charts, eq(usersTeams.teamId, charts.teamId))
      .where(and(eq(users.id, userId), chartRef ? eq(charts.chartRef, chartRef) : undefined));
  },

  /**
   * @returns {Promise<string>} add a new user-chart relation
   */
  addChart: async (
    /** @type {string} */ ref,
    /** @type {string} */ name,
    /** @type {string} */ userId,
    /** @type {string | undefined} */ teamId,
    /** @type {string | undefined} */ folderId,
  ) => {
    return drizzledb.transaction(async (tx) => {
      const chartRef = await tx
        .insert(charts)
        .values({
          name,
          chartRef: ref,
          teamId,
          created: Date.now(),
          updated: 0,
          folderId,
        })
        .returning({ id: charts.id });
      await tx.insert(userCharts).values({
        chartId: chartRef[0].id,
        userId,
      });

      return chartRef[0].id;
    });
  },

  /**
   * @returns {Promise<boolean>} add a new user-chart relation
   */
  addUserChart: async (
    /** @type {string} */ userId,
    /** @type {string} */ chartId,
    /** @type {number} */ _typeId,
  ) => {
    const res = await drizzledb.insert(userCharts).values({
      userId,
      chartId,
      // typeId,
    });
    // .returning({ id: userCharts.id });
    return res.changes != 0;
    // return new Promise((resolve, reject) => {
    //   resolve("");
    // const stmt = db.prepare("INSERT INTO users_charts (chart_id, user_id, relation_type) VALUES (?, ?, ?)");
    // stmt.run([chartId, userId, typeId], /** @this sqlite.RunResult */ function (/** @type {Error | null} */ err) {
    //   if (err != null) {
    //     reject(err);
    //   }
    //   resolve("" + this.lastID);
    // }).finalize();
    // });
  },

  /**
   * @returns {Promise<boolean>} delete a user-chart relation
   */
  removeUserChart: async (/** @type {string} */ userChartId) => {
    const res = await drizzledb.delete(userCharts).where(eq(userCharts.chartId, userChartId));
    // .returning({ id: userCharts.id });
    return res.changes != 0;
    // return new Promise((resolve, reject) => {
    //   resolve();
    //   const stmt = db.prepare("DELETE FROM users_charts WHERE id = ?");
    //   stmt.run([userChartId], /** @this sqlite.RunResult */ function (/** @type {Error | null} */ err) {
    //     if (err != null) {
    //       reject(err);
    //     }
    //     resolve();
    //   }).finalize();
    // });
  },

  /**
   * @returns {Promise<boolean>} update a charts info
   */
  updateChart: async (
    /** @type {string} */ chartRef,
    /** @type {{ name?: string, updated?: number, teamId?: string, folderId?: string }} */ fields,
  ) => {
    const res = await drizzledb.update(charts).set(fields).where(eq(charts.chartRef, chartRef));
    return res.changes != 0;
    // return new Promise((resolve, reject) => {
    //   resolve();
    // const stmt = db.prepare(`
    //   UPDATE charts
    //   SET name = ?
    //   WHERE chart_ref = ?
    // `);
    // stmt.run([name, chartRef], /** @this sqlite.RunResult */ function (/** @type {Error | null} */ err) {
    //   if (err != null) {
    //     reject(err);
    //   }
    //   resolve();
    // }).finalize();
    // });
  },

  /**
   * @returns {Promise<{ id: string, name: string, chartRef: string }>} update a charts info
   */
  getChart: async (/** @type {string} */ chartRef) => {
    const res = await drizzledb.select().from(charts).where(eq(charts.chartRef, chartRef));
    return res[0];
    // return new Promise((resolve, reject) => {
    // resolve("");
    // const stmt = db.prepare(`
    //   SELECT
    //     charts.id AS id,
    //     charts.name AS name,
    //     charts.chart_ref AS chartRef
    //   FROM
    //     charts
    //   WHERE
    //     charts.chart_ref = ?
    // `);

    // stmt.get([chartRef], function (err, row) {
    //   if (err != null) {
    //     reject(err);
    //     return;
    //   }

    //   resolve(row);
    // }).finalize();
    // });
  },

  getAllCharts: async () => {
    return drizzledb.select().from(charts);
  },

  addOrganization: async (/** @type {string} */ name, /** @type {Date|null} */ expires = null) => {
    const expireVal = expires == null ? null : expires.toISOString();
    const resOrg = await drizzledb
      .insert(organizations)
      .values({
        name,
      })
      .returning({ id: organizations.id });
    const resInvite = await drizzledb
      .insert(organizationInvites)
      .values({
        expires: expireVal,
        organizationId: resOrg[0].id,
        role: ORGANIZATION_ROLES.ADMIN,
      })
      .returning({ code: organizationInvites.code });
    return { id: resOrg[0].id, code: resInvite[0].code };
  },
  getOrganization: async (/** @type {string} */ id, /** @type {string | undefined} */ userId) => {
    if (typeof userId != "undefined") {
      const orgs = await drizzledb
        .select()
        .from(organizations)
        .innerJoin(usersOrganizations, eq(usersOrganizations.userId, userId))
        .where(eq(organizations.id, id));
      if (orgs.length != 1) {
        throw new Error("Organization not found");
      }

      return orgs[0];
    }
    const orgs = await drizzledb.select().from(organizations).where(eq(organizations.id, id));
    if (orgs.length != 1) {
      throw new Error("Organization not found");
    }

    return { organizations: orgs[0] };
  },

  addTeam: async (/** @type {string} */ name, /** @type {string} */ organizationId) => {
    const res = await drizzledb
      .insert(teams)
      .values({
        name,
        organizationId,
      })
      .returning({ id: organizations.id });
    return res[0].id;
  },

  getTeam: async (/** @type {string} */ teamId) => {
    const res = await drizzledb.select().from(teams).where(eq(teams.id, teamId));
    return res[0];
  },

  updateTeam: async (/** @type {string} */ teamId, /** @type {{ name: string }} */ details) => {
    return drizzledb.update(teams).set(details).where(eq(teams.id, teamId));
  },

  getTeamCharts: async (/** @type {string} */ id) => {
    const res = await drizzledb
      .select({
        id: charts.id,
        name: charts.name,
        chartRef: charts.chartRef,
        created: charts.created,
        updated: charts.updated,
        folderId: charts.folderId,
      })
      .from(charts)
      .where(eq(charts.teamId, id));

    return res;
  },

  getTeamMembers: async (/** @type {string} */ id) => {
    return drizzledb
      .select()
      .from(usersTeams)
      .innerJoin(users, eq(usersTeams.userId, users.id))
      .where(eq(usersTeams.teamId, id));
  },

  addUserTeamsRelation: async (
    /** @type {string} */ teamId,
    /** @type {string} */ userId,
    /** @type {number} */ role,
  ) => {
    await drizzledb.insert(usersTeams).values({
      teamId,
      userId,
      role,
    });
  },

  removeUserTeamsRelation: async (/** @type {string} */ teamId, /** @type {string} */ userId) => {
    const users = await db.getTeamMembers(teamId);
    const adminsAfterDelete = users.filter(
      (u) => u.user.id != userId && u.usersTeams.role == TEAM_ROLES.ADMIN,
    );
    if (adminsAfterDelete.length == 0) {
      throw new Error("There must be at least 1 admin after removal");
    }

    await drizzledb
      .delete(usersTeams)
      .where(and(eq(usersTeams.userId, userId), eq(usersTeams.teamId, teamId)));
  },

  getOrganizationInvite: async (/** @type {string} */ code) => {
    const res = await drizzledb
      .select()
      .from(organizationInvites)
      .innerJoin(organizations, eq(organizationInvites.organizationId, organizations.id))
      .where(eq(organizationInvites.code, code));

    if (res.length != 1) {
      throw new Error("Could not find invite organization");
    } else {
      return res[0];
    }
  },
  getOrganizationUsers: async (/** @type {string} */ id) => {
    return await drizzledb
      .select()
      .from(usersOrganizations)
      .innerJoin(users, eq(usersOrganizations.userId, users.id))
      .where(eq(usersOrganizations.organizationId, id));
  },
  addOrganizationInvite: async (/** @type {string} */ organizationId) => {
    const code = crypto.randomUUID();
    const expires = new Date();
    expires.setDate(expires.getDate() + 28);
    await drizzledb.insert(organizationInvites).values({
      organizationId,
      code,
      role: ORGANIZATION_ROLES.MEMBER,
      expires: expires.toISOString(),
    });
    return { code, expires };
  },
  getOrganizationInvites: async (/** @type {string} */ id) => {
    return await drizzledb
      .select()
      .from(organizationInvites)
      .where(eq(organizationInvites.organizationId, id));
  },
  deleteInvite: async (/** @type {string} */ id, /** @type {string} */ code) => {
    return await drizzledb
      .delete(organizationInvites)
      .where(
        and(
          eq(organizationInvites.code, code),
          eq(organizationInvites.organizationId, id),
          isNull(organizationInvites.used),
        ),
      );
  },

  addUserOrganizationRelation: async (/** @type {string} */ code, /** @type {string} */ userId) => {
    return drizzledb.transaction(async (tx) => {
      const invite = await tx
        .select()
        .from(organizationInvites)
        .where(and(eq(organizationInvites.code, code), isNull(organizationInvites.used)));
      if (invite.length != 1) {
        tx.rollback();
      }
      if (invite[0].expires != null) {
        const expires = new Date(invite[0].expires);
        if (expires.getTime() < Date.now()) {
          tx.rollback();
        }
      }
      await tx
        .update(organizationInvites)
        .set({ used: new Date().toISOString() })
        .where(eq(organizationInvites.code, code));
      const res = await tx.insert(usersOrganizations).values({
        organizationId: invite[0].organizationId,
        userId,
        role: invite[0].role,
      });
      return res.changes == 1;
    });
  },

  addFolder: async (
    /** @type {string} */ name,
    /** @type {string} */ teamId,
    /** @type {string} */ parentId,
  ) => {
    const r = await drizzledb
      .insert(folders)
      .values({
        name,
        teamId,
        parentId,
        created: Date.now(),
      })
      .returning({ id: folders.id });

    return r[0].id;
  },
  editFolder: async (
    /** @type {string} */ id,
    /** @type {{ name?: string, parentId?: string | null }} */ attr,
  ) => {
    await drizzledb
      .update(folders)
      .set({
        name: attr.name,
        parentId: attr.parentId,
      })
      .where(eq(folders.id, id));
  },
  getFolders: async (/** @type {string} */ teamId) => {
    return drizzledb.select().from(folders).where(eq(folders.teamId, teamId));
  },
  getFolder: async (/** @type {string} */ folderId) => {
    const lst = await drizzledb.select().from(folders).where(eq(folders.id, folderId));
    if (lst.length == 0) {
      throw new Error("Folder not found");
    }
    return lst[0];
  },
};

export const init = async () => {
  // If there's 0 organizations, create a default one with a invite, assume first user is a site
  // administrator.
  const orgs = await drizzledb.$count(organizations);
  if (orgs === 0) {
    const newOrg = await db.addOrganization("New organization");
    console.log(
      "Created initial organization with code http://localhost:5173/invite?code=" + newOrg.code,
    );
  }
};
