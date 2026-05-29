// SPDX-License-Identifier: MPL-2.0

// The `__Host-` prefix is enforced by browsers to require secure=true, path=/, and no Domain attribute
const isSecureOrigin = (process.env.PUBLIC_ORIGIN ?? "").startsWith("https://");
export const SESSION_COOKIE_KEY = isSecureOrigin ? "__Host-dt_session" : "dt_session";
