// SPDX-License-Identifier: MPL-2.0

import { connection } from "$lib/../../server_lib/sharedb";
import type { Root } from "$lib/chart.js";
import { db } from "../../../../../../server_lib/user.js";

export async function load({ params, url }) {
  let data: Root | undefined;

  if (params.id) {
    const publication = await db.getPublication(params.id);
    data = await new Promise((resolve, reject) => {
      connection.fetchSnapshot(
        "examples",
        publication.charts.chartRef,
        publication.chartPublication.v,
        (err, snapshot) => {
          if (err != null) {
            reject(404);
          } else {
            resolve(snapshot.data);
          }
        },
      );
    });
  }

  return {
    id: params.id,
    editor: url.searchParams.has("editor"),
    data,
  };
}
