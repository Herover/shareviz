import sqlite from "sqlite3";

/**
 * @typedef Version
 * @prop {number} major
 */

const targetVersion = 1;

const setupDB = async (/** @type {sqlite.Database} */ db) => {
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);
    db.run(`INSERT INTO users (username, password) VALUES ('test', 'test')`);

    db.run(`
      CREATE TABLE version (
        major INTEGER
      )
    `);
    db.run(`INSERT INTO version (major) VALUES (${targetVersion})`);

    db.run("COMMIT TRANSACTION", (err) => {
      if (err != null) throw err;
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
  }
};
