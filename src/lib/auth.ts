// SPDX-License-Identifier: MPL-2.0

import dayjs from "dayjs";
import { db } from "../../server_lib/user";
import type { Cookies } from "@sveltejs/kit";
import { SESSION_COOKIE_KEY } from "../../server_lib/auth";
import { env } from "$env/dynamic/public";

// Creates and sets cookies for a user who has authenticated
export const setSessionCookie = async (
  userId: string,
  request: Request,
  cookies: Cookies,
  ipAddress: string,
  identifier: string | null,
) => {
  const d = dayjs().add(7, "day").toDate();
  const token = await db.addUserSession(
    userId,
    d,
    request.headers.get("User-Agent") || "",
    ipAddress,
    identifier,
  );

  cookies.set(SESSION_COOKIE_KEY, token, {
    httpOnly: true,
    path: "/",
    secure: env.PUBLIC_ORIGIN.startsWith("https://"),
    sameSite: "lax",
    expires: d,
  });
};
