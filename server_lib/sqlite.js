import sqlite from "sqlite3";

/**
 * @typedef Version
 * @prop {number} major
 */

const targetVersion = 1;

const setupDB = async (/** @type {sqlite.Database} */ db) => {
  db.serialize(() => {
    console.log("Creating db...");
    db.run("BEGIN TRANSACTION");
    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);
    db.run(`INSERT INTO users (username, password) VALUES ('test', 'test')`);
    db.run(`INSERT INTO users (username, password) VALUES ('SHOULD NOT BE VISIBLE user', 'test')`);

    db.run(`
      CREATE TABLE teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        organization_id INTEGER
      )
    `);
    db.run(`INSERT INTO teams (id, name, organization_id) VALUES (1, 'Test team', 1)`);
    db.run(`INSERT INTO teams (id, name, organization_id) VALUES (2, 'SHOULD NOT BE VISIBLE team', 1)`);

    db.run(`
      CREATE TABLE teams_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        team_id INTEGER
      )
    `);
    db.run(`INSERT INTO teams_users (user_id, team_id) VALUES (1, 1)`);

    db.run(`
      CREATE TABLE charts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        chart_ref TEXT
      )
    `);
    db.run(`INSERT INTO charts (name, chart_ref) VALUES ("Demo chart", "1")`);

    db.run(`
      CREATE TABLE users_charts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        relation_type INTEGER,
        chart_id INTEGER
      )
    `);
    db.run(`INSERT INTO users_charts (chart_id, user_id, relation_type) VALUES (1, 1, 1)`);

    db.run(`
      CREATE TABLE teams_charts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER,
        chart_id INTEGER
      )
    `);
    db.run(`INSERT INTO teams_charts (chart_id, team_id) VALUES (1, 1)`);

    db.run(`
      CREATE TABLE organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
      )
    `);
    db.run(`INSERT INTO organizations (name) VALUES ("Test organization")`);
    db.run(`INSERT INTO organizations (name) VALUES ("SHOULD NOT BE VISIBLE organization")`);

    db.run(`
      CREATE TABLE version (
        major INTEGER
      )
    `);
    db.run(`INSERT INTO version (major) VALUES (${targetVersion})`);

    db.run("COMMIT TRANSACTION", (err) => {
      if (err != null) throw err;
      console.log("Done creating db...");
    });
  });
};

export const init = () => {
  const db = new (sqlite.verbose()).Database("./db.sqlite", (err) => {
    if (err) {
      throw err;
    }

    const state_upgrade = 1;
    const state_create = 2;
    let state = 0;

    db.all("SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%';", async (err, rows) => {
      if (err) throw err;
      if (typeof rows == "undefined" || rows.length == 0) {
        await setupDB(db);
      } else {
        db.all("SELECT * FROM version", async function (err, /** @type {Version[] | undefined} */ rows) {
          if (err) {
            throw err;
          }

          if (typeof rows == "undefined" || rows.length == 0) {
            state = state_create;
          } else if (rows[0]["major"] != targetVersion) {
            state = state_upgrade;
          }


          if (state == state_create) {
            return await setupDB(db);
          }
        });
      }
    });
  });

  return cmds(db);
};

const cmds = (/** @type {sqlite.Database} */ db) => {
  return {
    /**
     * @returns {Promise<string>} user with username or id
     */
    newUser: async (/** @type {{ username: string, password: string }} */{ username, password }) => {
      return new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        stmt.run([username, password], /** @this sqlite.RunResult */ function (/** @type {Error | null} */ err) {
          if (err != null) {
            reject(err);
          }
          resolve("" + this.lastID);
        }).finalize();
      });
    },

    /**
     * @returns {Promise<import('./user.js').User>} user with username or id
     */
    getUser: async (/** @type {{ username?: string, id?: string }} */{ username, id }) => {
      return new Promise((resolve, reject) => {
        /** @this sqlite.RunResult */
        const cb = function (/** @type {Error | null} */ err, /** @type {any} */ row) {
          if (err != null) {
            reject(err);
            return;
          }

          resolve(row);
        };

        if (typeof username == "string") {
          const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
          stmt.get([username], function (err, row) {
            cb.call(this, err, row);
          }).finalize();
          return;
        }

        if (typeof id == "string") {
          const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
          stmt.get([id], function (err, row) {
            cb.call(this, err, row);
          }).finalize();
          return;
        }

        reject("no user identifier")
      });
    },

    /**
     * @returns {Promise<import('./user.js').Team[]>} teams by userId connected to them
     */
    getUserTeams: async (/** @type {string} */ userId) => {
      return new Promise((resolve, reject) => {

        const stmt = db.prepare(`
          SELECT
            teams.id, teams.name
          FROM
            teams_users
            INNER JOIN teams ON teams_users.team_id = teams.id
          WHERE
            (teams_users.user_id = ?)
        `);
        stmt.all([userId], function (err, rows) {
          if (err) reject(err);
          resolve(rows.map(((row) => ({ ...row, id: "" + row.id }))));
        }).finalize();
      });
    },

    /**
     * @returns {Promise<import('./user.js').ChartInfo[]>} charts a user can see
     */
    getUserCharts: async (/** @type {string} */ userId) => {
      return new Promise((resolve, reject) => {

        const stmt = db.prepare(`
          SELECT
            teams_charts.chart_id AS chartId,
            teams_users.team_id AS teamId,
            charts.chart_ref AS chartRef,
            NULL AS relationType
          FROM
            teams_users
            INNER JOIN teams ON teams_users.team_id = teams.id
            INNER JOIN teams_charts ON teams_charts.team_id = teams.id
            INNER JOIN charts ON charts.id = teams_charts.chart_id
          WHERE
            (teams_users.user_id = ?)
          UNION
          SELECT
            users_charts.chart_id AS chartId,
            NULL AS teamId,
            charts.chart_ref AS chartRef,
            users_charts.relation_type AS relationType
          FROM
            users_charts
            INNER JOIN charts ON charts.id = users_charts.chart_id
          WHERE
            users_charts.user_id = ?
        `);
        
        stmt.all([userId, userId], function (err, rows) {
          if (err) reject(err);
          resolve(rows.map((row) => ({
            id: "" + row.id,
            name: row.name,
            teamId: row.teamId == null ? null : "" + row.teamId,
            relationType: row.relationType == null ? null : row.relationType,
            chartId: row.chartId,
          })));
        }).finalize();
      });
    },
  }
};
