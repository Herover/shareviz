import sqlite from "sqlite3";
import type { GetUserArguments, NewUserArguments, User } from "./user";

interface Version {
  major: number,
}

const targetVersion = 1;

const setupDB = async (db: sqlite.Database) => {
  console.log("setup")
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
      if (err) throw err;
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
        db.all("SELECT * FROM version", async function (err, rows) {
          if (err) {
            throw err;
          }

          if (typeof rows == "undefined" || rows.length == 0) {
            state = state_create;
          } else if ((rows as Version[])[0]["major"] != targetVersion) {
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

const cmds = (db: sqlite.Database) => {
  return {
    newUser: async ({ username, password }: NewUserArguments) => {
      return new Promise<string>((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        stmt.run([username, password], function (err) {
          if (err) {
            reject(err);
          }
          resolve("" + this.lastID);
        }).finalize();
      });
    },
    getUser: async ({ username, id }: GetUserArguments) => {
      return new Promise<User>((resolve, reject) => {
        const cb = function (this: sqlite.RunResult, err: Error | null, row: any) {
          if (err) {
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
