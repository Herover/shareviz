import { and, eq, isNull } from "drizzle-orm";
import { charts, db as drizzledb, organizationInvites, organizations, teams, teamsCharts, userCharts, users, usersOrganizations, usersTeams } from "./drizzle/schema.js";

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
  getUser: async (/** @type {{ username?: string, id?: string }} */{ username, id }) => {
    return drizzledb.select()
      .from(users)
      .where(
        username ? eq(users.email, username) : id ? eq(users.id, id) : undefined,
      );
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
    return drizzledb.select()
      .from(usersTeams)
      .innerJoin(teams, eq(usersTeams.teamId, teams.id))
      .where(eq(usersTeams.userId, userId));
  },
  getUserOrganizations: async (/** @type {string} */ userId) => {
    return drizzledb.select()
      .from(usersOrganizations)
      .innerJoin(organizations, eq(usersOrganizations.organizationId, organizations.id))
      .where(eq(usersOrganizations.userId, userId));
  },

  getUserCharts: async (/** @type {string} */ userId, /** @type {string | undefined} */ chartRef) => {
    return drizzledb.select({
      id: charts.id,
      name: charts.name,
      chartRef: charts.chartRef,
    })
      .from(userCharts)
      .innerJoin(charts, eq(charts.id, userCharts.chartId))
      .where(and(
        eq(userCharts.userId, userId),
        chartRef ? eq(charts.chartRef, chartRef) : undefined,
      ));
    // return new Promise((resolve, reject) => {
    //   const stmt = db.prepare(`
    //     SELECT
    //       charts.id AS id,
    //       charts.name AS name,
    //       teams_users.team_id AS teamId,
    //       charts.chart_ref AS chartRef,
    //       NULL AS relationType
    //     FROM
    //       teams_users
    //       INNER JOIN teams ON teams_users.team_id = teams.id
    //       INNER JOIN teams_charts ON teams_charts.team_id = teams.id
    //       INNER JOIN charts ON charts.id = teams_charts.chart_id
    //     WHERE
    //       teams_users.user_id = ? ${typeof chartRef == "undefined" ? "" : " AND charts.chart_ref = ?"}
    //     UNION
    //     SELECT
    //       charts.id AS id,
    //       charts.name AS name,
    //       NULL AS teamId,
    //       charts.chart_ref AS chartRef,
    //       users_charts.relation_type AS relationType
    //     FROM
    //       users_charts
    //       INNER JOIN charts ON charts.id = users_charts.chart_id
    //     WHERE
    //       users_charts.user_id = ? ${typeof chartRef == "undefined" ? "" : " AND charts.chart_ref = ?"}
    //   `);

    //   stmt.all(typeof chartRef == "undefined" ? [userId, userId] : [userId, chartRef, userId, chartRef], function (err, rows) {
    //     if (err) reject(err);
    //     resolve(rows.map((row) => ({
    //       id: "" + row.id,
    //       name: row.name,
    //       teamId: row.teamId == null ? null : "" + row.teamId,
    //       relationType: row.relationType == null ? null : row.relationType,
    //       chartId: row.chartId,
    //       chartRef: row.chartRef,
    //     })));
    //   }).finalize();
    // });
  },

  /**
   * @returns {Promise<string>} add a new user-chart relation
   */
  addChart: async (
    /** @type {string} */ ref,
    /** @type {string} */ name,
    /** @type {string} */ userId,
    /** @type {string | undefined} */ teamId,
  ) => {
    return drizzledb.transaction(async tx => {
      const chartRef = await tx.insert(charts)
        .values({
          name,
          chartRef: ref,
        })
        .returning({ id: charts.id });
      console.log(chartRef)
      await tx.insert(userCharts)
        .values({
          chartId: chartRef[0].id,
          userId,
        });

      if (typeof teamId != "undefined") {
        await tx.insert(teamsCharts)
          .values({
            chartId: chartRef[0].id,
            teamId
          });
      }

      return chartRef[0].id;
    });
  },

  /**
   * @returns {Promise<boolean>} add a new user-chart relation
   */
  // eslint-disable-next-line no-unused-vars
  addUserChart: async (/** @type {string} */ userId, /** @type {string} */ chartId, /** @type {number} */ typeId) => {
    const res = await drizzledb.insert(userCharts)
      .values({
        userId,
        chartId,
        // typeId,
      })
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
    const res = await drizzledb.delete(userCharts)
      .where(eq(userCharts.chartId, userChartId));
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
  updateChart: async (/** @type {string} */ chartRef, /** @type {string} */ name) => {
    const res = await drizzledb.update(charts)
      .set({ name })
      .where(eq(charts.chartRef, chartRef));
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
    const res = await drizzledb.select()
      .from(charts)
      .where(eq(charts.chartRef, chartRef));
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

  addOrganization: async (/** @type {string} */ name, /** @type {Date|null} */ expires = null) => {
    const expireVal = expires == null ? null : expires.toISOString();
    const resOrg = await drizzledb.insert(organizations)
      .values({
        name,
      })
      .returning({ id: organizations.id });
    const resInvite = await drizzledb.insert(organizationInvites)
      .values({
        expires: expireVal,
        organizationId: resOrg[0].id,
        role: ORGANIZATION_ROLES.ADMIN,
      })
      .returning({ code: organizationInvites.code });
    return { id: resOrg[0].id, code: resInvite[0].code };
  },

  addTeam: async (/** @type {string} */ name, /** @type {string} */ organizationId) => {
    const res = await drizzledb.insert(teams)
      .values({
        name,
        organizationId,
      })
      .returning({ id: organizations.id });
    return res[0].id;
  },

  getTeam: async (/** @type {string} */ teamId) => {
    const res = await drizzledb.select()
      .from(teams)
      .where(eq(teams.id, teamId));
    return res[0];
  },

  getTeamCharts: async(/** @type {string} */ id) => {
    const res = await drizzledb.select({
      id: charts.id,
      name: charts.name,
      chartRef: charts.chartRef,
    })
      .from(usersTeams)
      .innerJoin(teams, eq(usersTeams.teamId, teams.id))
      .innerJoin(teamsCharts, eq(teamsCharts.teamId, teams.id))
      .innerJoin(charts, eq(charts.id, teamsCharts.chartId))
      .where(and(
        eq(usersTeams.teamId, id),
      ));

    return res;
  },

  getTeamMembers: async (/** @type {string} */ id) => {
    return drizzledb.select()
      .from(usersTeams)
      .innerJoin(users, eq(usersTeams.userId, users.id))
      .where(eq(usersTeams.teamId, id));
  },

  addUserTeamsRelation: async (/** @type {string} */ teamId, /** @type {string} */ userId, /** @type {number} */ role) => {
    await drizzledb.insert(usersTeams)
      .values({
        teamId,
        userId,
        role,
      });
  },

  getOrganizationInvite: async (/** @type {string} */ code) => {
    const res = await drizzledb.select()
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
    return await drizzledb.select()
      .from(usersOrganizations)
      .innerJoin(users, eq(usersOrganizations.userId, users.id))
      .where(eq(usersOrganizations.organizationId, id));
  },
  addOrganizationInvite: async (/** @type {string} */ organizationId) => {
    const code = crypto.randomUUID();
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);
    await drizzledb.insert(organizationInvites)
      .values({
        organizationId,
        code,
        role: ORGANIZATION_ROLES.MEMBER,
        expires: expires.toISOString(),
      });
    return code;
  },
  getOrganizationInvites: async (/** @type {string} */ id) => {
    return await drizzledb.select()
      .from(organizationInvites)
      .where(eq(organizationInvites.organizationId, id));
  },
  deleteInvite: async (/** @type {string} */ id, /** @type {string} */ code) => {
    return await drizzledb.delete(organizationInvites)
      .where(and(
        eq(organizationInvites.code, code),
        eq(organizationInvites.organizationId, id),
        isNull(organizationInvites.used),
      ));
  },

  addUserOrganizationRelation: async (/** @type {string} */ code, /** @type {string} */ userId) => {
    return drizzledb.transaction(async (tx) => {
      const invite = await tx.select()
        .from(organizationInvites)
        .where(and(
          eq(organizationInvites.code, code),
          isNull(organizationInvites.used),
        ));
      if (invite.length != 1) {
        tx.rollback();
      }
      if (invite[0].expires != null) {
        const expires = new Date(invite[0].expires)
        if (expires.getTime() < Date.now()) {
          tx.rollback();
        }
      }
      await tx.update(organizationInvites)
        .set({ used: new Date().toISOString() })
        .where(eq(organizationInvites.code, code));
      const res = await tx.insert(usersOrganizations)
        .values({
          organizationId: invite[0].organizationId,
          userId,
          role: invite[0].role,
        });
      return res.changes == 1;
    });
  },
};

const init = async () => {
  // If there's 0 organizations, create a default one with a invite, assume first user is a site
  // administrator.
  const orgs = await drizzledb.$count(organizations);
  if (orgs === 0) {
    const newOrg = await db.addOrganization("New organization");
    console.log("Created initial organization with code http://localhost:5173/invite?code=" + newOrg.code);
  }
};

init();
