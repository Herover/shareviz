import { signIn } from "../../auth.server";
import type { Actions } from "./$types";
export const actions: Actions = { default: signIn };
