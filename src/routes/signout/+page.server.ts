import { signOut } from "../../auth.server";
import type { Actions } from "./$types";
export const actions: Actions = { default: signOut };
