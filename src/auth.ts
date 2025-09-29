// SPDX-License-Identifier: MPL-2.0

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/sveltekit/providers/github";
import { accounts } from "../server_lib/drizzle/schema";
import Keycloak from "@auth/sveltekit/providers/keycloak";
import { eq } from "drizzle-orm";
import { decode } from "jsonwebtoken";
import { drizzledb } from "../server_lib/sqlite";

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: DrizzleAdapter(drizzledb),
  providers: [GitHub, Keycloak],
  callbacks: {
    signIn: async () => {
      // See if we have a shareviz user with profile?.email, if not then this person wasn't invited
      // return "/editor/chart?error=No invitation found";
      return true;
    },
    async session({ session, user }) {
      const dbUser = await drizzledb.select().from(accounts).where(eq(accounts.userId, user.id));
      // console.log(session,user,dbUser)
      console.log(decode(dbUser[0].access_token));
      console.log(decode(dbUser[0].id_token));
      // console.log(await db.select().from(sessions).where(eq(sessions.userId, dbUser[0].userId)))
      session.user = user;
      return session;
    },
  },
  trustHost: true,
});
