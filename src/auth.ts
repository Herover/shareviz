import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/sveltekit/providers/github";
import { db } from "../server_lib/drizzle/schema";

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: DrizzleAdapter(db),
  providers: [GitHub],
  callbacks: {
    signIn: async () => {
      // See if we have a shareviz user with profile?.email, if not then this person wasn't invited
      // return "/editor/chart?error=No invitation found";
      return true;
    },
    session({ session, user }) {
      session.user = user;
      return session;
    },
  },
  trustHost: typeof process.env.AUTH_TRUST_HOST == "string",
});
