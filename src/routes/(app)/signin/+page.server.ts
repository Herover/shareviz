// SPDX-License-Identifier: MPL-2.0

import { signIn } from "$lib/../auth";
import type { Actions } from "./$types";
export const actions: Actions = { default: signIn };
