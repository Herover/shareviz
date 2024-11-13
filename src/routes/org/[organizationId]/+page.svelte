<script lang="ts">
  import { run } from 'svelte/legacy';

  import { page } from "$app/stores";
  import { ORGANIZATION_ROLES } from "$lib/consts";

  let inviteCode = $state("");
  let createInvite = $derived(async () => {
    const res = await fetch(`/api/org/${$page.params.organizationId}/invite`, {
      method: "POST",
    });
    const data = await res.json();
    inviteCode = data.code;
  });

  let invites: { code: string; expires: Date | null; used: boolean }[] = $state([]);
  run(() => {
    invites = (
      $page.data.invites as {
        code: string;
        expires: Date | null;
        used: boolean;
      }[]
    )
      .map((invite: any) => ({
        code: invite.code,
        used: invite.used,
        expires: invite.expires == null ? null : new Date(invite.expires),
      }))
      .sort(
        (a, b) =>
          (a.expires?.getTime() ?? Infinity) -
          (b.expires?.getTime() ?? Infinity),
      );
  });
  let deleteInvite = $derived(async (code: string) => {
    const res = await fetch(`/api/org/${$page.params.organizationId}/invite`, {
      method: "DELETE",
      body: JSON.stringify({ code }),
    });
    if (res.status == 200) {
      invites = invites.filter((e) => e.code != code);
    }
  });
</script>

<h1>Organization Settings</h1>

<p>
  <button onclick={() => createInvite()}>New invite</button>
  {#if inviteCode != ""}
    <input value={inviteCode} />
  {/if}
</p>

<table>
  <thead>
    <tr>
      <th>Code</th>
      <th>Expires</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    {#each invites as invite}
      <tr>
        <td>{invite.code}</td>
        <td>
          {#if invite.expires}
            {(invite.expires.getDay() + "").padStart(2, "0")}
            -
            {(invite.expires.getMonth() + 1 + "").padStart(2, "0")}
            -
            {invite.expires.getFullYear()}
          {:else}
            never
          {/if}
        </td>
        <td
          ><button
            disabled={invite.used}
            onclick={() => deleteInvite(invite.code)}>Delete</button
          ></td
        >
      </tr>
    {/each}
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th>Role</th>
      <th>Name</th>
    </tr>
  </thead>
  <tbody>
    {#each $page.data.orgUsers as user}
      <tr>
        <td>{user.role == ORGANIZATION_ROLES.ADMIN ? "Administrator" : "user"}</td
        >
        <td>{user.name}</td>
      </tr>
    {/each}
  </tbody>
</table>
