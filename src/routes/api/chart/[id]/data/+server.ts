// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { connection } from "$lib/../../server_lib/sharedb";

export async function GET({ params }) {
  return new Promise((resolve) => {
    connection.fetchSnapshot("examples", params.id, null, (err, snapshot) => {
      if (err != null) resolve(json({ message: "404" }, { status: 404 }));
      else resolve(json({ chart: snapshot.data }));
    });
  });
}
