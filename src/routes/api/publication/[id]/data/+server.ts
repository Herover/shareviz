// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { connection } from "$lib/../../server_lib/sharedb";
import { db } from "$lib/../../server_lib/user.js";

export async function GET({ params }) {
  const publication = await db.getPublication(params.id);
  return new Promise((resolve) => {
    connection.fetchSnapshot(
      "examples",
      publication.charts.chartRef,
      publication.chartPublication.v,
      (err, snapshot) => {
        if (err != null) {
          console.error(err);
          resolve(json({ message: "404" }, { status: 404 }));
        }
        else resolve(json({ chart: snapshot.data }));
      },
    );
  });
}
