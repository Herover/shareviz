export { handle } from "./auth";
import type { ServerInit } from "@sveltejs/kit";
import { db } from "../server_lib/user";
import { init as initDB } from "../server_lib/sqlite";
import { connection } from "$lib/../../server_lib/sharedb";
import { migrate } from "$lib/chartMigrate";
import { formatVersion } from "$lib/initialDoc";

export const init: ServerInit = async () => {
  console.log("init db...");
  await initDB();
  console.log("migrate...");
  const charts = await db.getAllCharts();
  console.log("checking", charts.length, "charts for migrations");
  for (let i = 0; i < charts.length; i++) {
    await new Promise<void>((resolve, reject) => {
      const doc = connection.get("examples", charts[i].chartRef);
      const onLoad = () => {
        migrate(doc);

        if (doc.data?.m?.v != formatVersion) {
          console.error("Failed migration for", doc.id);
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

  console.log("done migrating");
};
