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
