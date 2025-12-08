// SPDX-License-Identifier: MPL-2.0

import type { Handle, ServerInit } from "@sveltejs/kit";
import { db } from "../server_lib/user";
import { init as initDB } from "../server_lib/sqlite";
import { connection } from "$lib/../../server_lib/sharedb";
import { SESSION_COOKIE_KEY } from "$lib/../../server_lib/auth";
import { migrate } from "$lib/chartMigrate";
import { formatVersion } from "$lib/initialDoc";
import { getLogger } from "$lib/log.js";

const logger = getLogger();

export const init: ServerInit = async () => {
  logger.log("init db...");
  await initDB();
  logger.log("migrate...");
  const charts = await db.getAllCharts();
  logger.log("checking charts for migrations", { n: charts.length });
  for (let i = 0; i < charts.length; i++) {
    await new Promise<void>((resolve, reject) => {
      const doc = connection.get("examples", charts[i].chartRef);
      const onLoad = () => {
        migrate(doc);

        if (doc.data?.m?.v != formatVersion) {
          logger.error("Failed migration", { id: doc.id });
        }

        doc.unsubscribe();
        doc.off("load", onLoad);
        doc.off("error", reject);
        // Disconnect doc from connection
        doc.destroy();

        resolve();
      };
      doc.on("load", onLoad);
      doc.on("error", reject);
      doc.subscribe((err) => {
        if (err) {
          reject(err);
        }
      });
    });
  }

  logger.log("done migrating");
};

const newAuthHandle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get(SESSION_COOKIE_KEY);
  if (typeof sessionCookie == "string") {
    const userSession = await db.getUserBySession(sessionCookie);
    if (userSession && Date.now() < userSession.user_session.expires.getTime()) {
      event.locals.session = userSession;
    } else {
      // Expired session
      event.cookies.delete(SESSION_COOKIE_KEY, { path: "/" });
    }
  } else {
    event.locals.session = null;
  }

  const response = await resolve(event);

  return response;
};

export const handle = newAuthHandle;
