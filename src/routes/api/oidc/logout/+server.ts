// SPDX-License-Identifier: MPL-2.0

import { json } from "@sveltejs/kit";
import { decode } from "jsonwebtoken";

import { accounts, sessions } from "$lib/../../server_lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { drizzledb } from "../../../../../server_lib/sqlite";

export async function POST({ request }) {
  console.log(request.headers);
  const data = await request.formData();

  if (!data) {
    console.log("missing form data");
    return json({ message: "something went wrong" }, { status: 400 });
  }

  const logoutToken = data.get("logout_token")?.toString() || "";
  if (!logoutToken) {
    console.log("missing logout_token");
    return json({ message: "something went wrong" }, { status: 400 });
  }

  // try {
  //   const verified = jwt.verify(
  //     logoutToken,
  //     env.AUTH_KEYCLOAK_ID,
  //     {
  //       issuer: env.AUTH_KEYCLOAK_ISSUER,
  //     },
  //   );
  //   console.log(verified)
  // } catch (e) {
  //   console.error(e)
  // }
  const decoded = decode(logoutToken) as any;
  console.log(decoded);
  if (!decoded) {
    console.log("can't decode logout_token");
    return json({ message: "something went wrong" }, { status: 400 });
  }

  const dbAccounts = await drizzledb
    .select()
    .from(accounts)
    .where(eq(accounts.providerAccountId, decoded["sub"]));
  if (dbAccounts.length != 1 || !dbAccounts[0].userId) {
    console.log("can't find related account");
    return json({ message: "something went wrong" }, { status: 400 });
  }

  const result = await drizzledb.delete(sessions).where(eq(sessions.userId, dbAccounts[0].userId));
  if (result.changes == 0) {
    console.log("did not delete any sessions");
    return json({ message: "something went wrong" }, { status: 400 });
  }

  return json({ message: "ok" }, { status: 200 });
}
