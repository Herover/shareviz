<script lang="ts">
  import { page } from "$app/stores";
  import { ORGANIZATION_ROLES } from "$lib/consts";

  let invites: { code: string; expires: Date | null; used: boolean }[] = $state(
    [],
  );
  let newInvites: typeof invites = $state([]);
  let inviteCode = $state("");
  let newInviteCodeEl: HTMLInputElement | undefined = $state(undefined);

  let selectInviteCodeInput = () => {
    if (typeof newInviteCodeEl != "undefined") newInviteCodeEl.select();
  };

  let createInvite = $derived(async () => {
    const res = await fetch(`/api/org/${$page.params.organizationId}/invite`, {
      method: "POST",
    });
    const data = await res.json();
    inviteCode = data.code;
    invites = [
      { code: data.code, expires: new Date(data.expires), used: false },
      ...invites,
    ];
  });
  $effect(() => {
    invites = [
      ...($page.data.invites as {
        code: string;
        expires: string | null;
        used: boolean;
      }[]),
      ...newInvites,
    ]
      .map((invite) => ({
        code: invite.code,
        used: invite.used,
        expires: invite.expires == null ? null : new Date(invite.expires),
      }))
      .sort(
        (a, b) =>
          (b.expires?.getTime() ?? -Infinity) -
          (a.expires?.getTime() ?? -Infinity),
      );
  });
  let deleteInvite = $derived(async (code: string) => {
    const res = await fetch(`/api/org/${$page.params.organizationId}/invite`, {
      method: "DELETE",
      body: JSON.stringify({ code }),
    });
    if (res.status == 200) {
      invites = invites.filter((e) => e.code != code);
      if (inviteCode == code) {
        inviteCode = "";
      }
    }
  });
</script>

<h1>Organization Settings</h1>

<p>
  <button onclick={() => createInvite()}>New invite</button>
  {#if inviteCode != ""}
    <input
      value={inviteCode}
      onfocus={() => selectInviteCodeInput()}
      onmouseup={() => selectInviteCodeInput()}
      bind:this={newInviteCodeEl}
    />
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
        <td
          >{user.role == ORGANIZATION_ROLES.ADMIN
            ? "Administrator"
            : "user"}</td
        >
        <td>{user.name}</td>
      </tr>
    {/each}
  </tbody>
</table>
