// SPDX-License-Identifier: MPL-2.0

import type { TeamResponse } from "$lib/../routes/api/team/[id]/+server";

export async function getTeam(teamId: string): Promise<TeamResponse> {
  const resp = await fetch(`/api/team/${teamId}`, {
    method: "GET",
  });

  const data = await resp.json();

  if (resp.status != 200) {
    throw new Error(data.message);
  }

  return data;
}

/**
 * Creates a new team
 * @param name name of new team
 * @param organizationId organization id team belongs to
 * @returns new team id
 */
export async function addTeam(name: string, organizationId: string): Promise<string> {
  const res = await fetch("/api/team", {
    method: "POST",
    body: JSON.stringify({
      name,
      organizationId,
    }),
  });
  const data = await res.json();
  if (res.status != 200) {
    const data = await res.json();
    throw new Error(data.message);
  }
  return data.teamId;
}

export async function addTeamMember(userId: string, teamId: string): Promise<void> {
  const res = await fetch(`/api/team/${teamId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
  if (res.status != 200) {
    const data = await res.json();
    throw new Error(data.message);
  }
}

export async function removeTeamMember(userId: string, teamId: string): Promise<void> {
  const res = await fetch(`/api/team/${teamId}/members`, {
    method: "DELETE",
    body: JSON.stringify({ userId }),
  });
  if (res.status != 200) {
    const data = await res.json();
    throw new Error(data.message);
  }
}

export async function updateTeam(teamId: string, details: { name: string }): Promise<void> {
  const res = await fetch(`/api/team/${teamId}`, {
    method: "PUT",
    body: JSON.stringify({ name: details.name }),
  });
  if (res.status != 200) {
    const data = await res.json();
    throw new Error(data.message);
  }
}

export async function addFolder(name: string, teamId: string, parentId?: string): Promise<string> {
  const res = await fetch(`/api/folder`, {
    method: "POST",
    body: JSON.stringify({
      name,
      teamId,
      parentId,
    }),
  });
  const data = await res.json();
  if (res.status != 200) {
    throw new Error(data.message);
  }
  return data.id;
}

export async function editFolder(
  folderId: string,
  attributes: { parentId?: string | null; name?: string },
): Promise<void> {
  const res = await fetch(`/api/folder/${folderId}`, {
    method: "PUT",
    body: JSON.stringify(attributes),
  });
  if (res.status != 200) {
    const data = await res.json();
    throw new Error(data.message);
  }
}

export async function editChartInfo(
  id: string,
  attributes: { name?: string; folderId?: string | null },
): Promise<void> {
  const res = await fetch("/api/chart/" + id, {
    method: "PUT",
    body: JSON.stringify(attributes),
  });

  if (res.status != 200) {
    const data = await res.json();
    throw new Error(data.message);
  }
}

export async function getChartPublications(id: string): Promise<{
  publications: {
    charts: {
      id: string;
      name: string;
      chartRef: string;
      teamId: string | null;
      created: number;
      updated: number;
      archived: number | null;
      folderId: string | null;
    };
    chartPublication: {
      id: string;
      chartId: string;
      v: number;
      created: number;
    };
  }[];
}> {
  const res = await fetch("/api/chart/" + id + "/publication", {
    method: "GET",
  });

  if (res.status != 200) {
    const data = await res.json();
    throw new Error(data.message);
  }

  return await res.json();
}

export async function addPublication(chartId: string, version: number): Promise<string> {
  const res = await fetch(`/api/chart/${chartId}/publication`, {
    method: "POST",
    body: JSON.stringify({
      version,
    }),
  });
  const data = await res.json();
  if (res.status != 200) {
    throw new Error(data.message);
  }
  return data.id;
}
