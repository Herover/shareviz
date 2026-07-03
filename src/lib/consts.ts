// SPDX-License-Identifier: MPL-2.0

// FIXME: These values must match values in server_liv/sqlite.js
export const TEAM_ROLES = {
  MEMBER: 1,
  ADMIN: 2,
};
export const ORGANIZATION_ROLES = {
  MEMBER: 1,
  ADMIN: 2,
};

// Maximum number of teams a single organization may contain.
export const MAX_TEAMS_PER_ORGANIZATION = 10;

// Maximum number of charts a single team may contain.
export const MAX_CHARTS_PER_TEAM = 100;

// Maximum number of personal (non-team) charts a single user may have.
export const MAX_CHARTS_PER_USER = 100;

// Maximum number of folders a single team may contain.
export const MAX_FOLDERS_PER_TEAM = 50;
