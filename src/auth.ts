import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/sveltekit/providers/github";
import { db } from "../server_lib/drizzle/schema";

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: DrizzleAdapter(db),
  providers: [GitHub],
  callbacks: {
    signIn: async ({ profile }) => {
      // See if we have a shareviz user with profile?.email, if not then this person wasn't invited
      // return "/editor/chart?error=No invitation found";
      return true;
    },
  },
});
