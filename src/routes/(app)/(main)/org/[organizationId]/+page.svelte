<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { PageData } from "./$types";
  import { ORGANIZATION_ROLES } from "$lib/consts";
  import { updateOrganization } from "$lib/api";
  import { notifications } from "$lib/notificationStore";
  import { untrack } from "svelte";
  import { page } from "$app/state";
  import { invalidateAll } from "$app/navigation";
  import SettingsLayout from "$lib/components/settings/SettingsLayout.svelte";
  import SettingsCard from "$lib/components/settings/SettingsCard.svelte";
  import SettingsField from "$lib/components/settings/SettingsField.svelte";
  import MemberRow from "$lib/components/settings/MemberRow.svelte";
  import Icon from "$lib/components/Icon.svelte";

  let { data }: { data: PageData } = $props();

  const orgId = $derived(page.params.organizationId ?? "");
  const orgName = $derived(page.data.organization?.organizations?.name ?? "");
  const isOrgAdmin = $derived(page.data.userIsOrgAdmin === true);
  const currentUserId = $derived(page.data.session?.user?.id);

  // Seeded from the loaded organization and persisted via the org update endpoint.
  let description = $state(untrack(() => page.data.organization?.organizations?.description ?? ""));

  const sections = [
    { id: "organization", label: "Organization", icon: "building" as const },
    { id: "members", label: "Members", icon: "users" as const },
    { id: "invites", label: "Invites", icon: "mail" as const },
  ];

  const update = async (details: { name?: string; description?: string }) => {
    const name = details.name ?? orgName;
    if (!name) return;
    // Nothing changed.
    if (details.name == undefined && details.description == description) return;
    if (details.name != undefined && details.name == orgName) return;
    try {
      await updateOrganization(orgId, { name, description: details.description ?? description });
      if (details.description != undefined) description = details.description;
      invalidateAll();
    } catch (err) {
      notifications.addError((err as Error).message);
    }
  };

  // ──────────── INVITES ────────────
  type Invite = { code: string; expires: Date | null; used: boolean };
  let inviteCode = $state("");

  const invites: Invite[] = $derived(
    (page.data.invites as { code: string; expires: string | null; used: boolean }[])
      .map((invite) => ({
        code: invite.code,
        used: invite.used,
        expires: invite.expires == null ? null : new Date(invite.expires),
      }))
      .sort((a, b) => (b.expires?.getTime() ?? -Infinity) - (a.expires?.getTime() ?? -Infinity)),
  );

  const createInvite = async () => {
    const res = await fetch(`/api/org/${orgId}/invite`, { method: "POST" });
    const resData = await res.json();
    if (res.status != 200) {
      notifications.addError(resData.message);
      return;
    }
    inviteCode = resData.code;
    await invalidateAll();
  };

  const deleteInvite = async (code: string) => {
    const res = await fetch(`/api/org/${orgId}/invite`, {
      method: "DELETE",
      body: JSON.stringify({ code }),
    });
    if (res.status == 200) {
      if (inviteCode == code) inviteCode = "";
      await invalidateAll();
    } else {
      notifications.addError((await res.json()).message);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      notifications.addInfo("Invite code copied to clipboard");
    } catch {
      notifications.addError("Could not copy to clipboard");
    }
  };

  const formatDate = (d: Date | null) =>
    d == null
      ? "Never"
      : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
</script>

<SettingsLayout overline={orgName} title="Organization settings" {sections}>
  <!-- ──────────── ORGANIZATION ──────────── -->
  <SettingsCard
    id="organization"
    overline="Organization"
    title="General"
    description="The organization's display name. Visible to everyone who belongs to it."
  >
    <SettingsField label="Organization name" controlId="org-name">
      <input
        id="org-name"
        type="text"
        value={orgName}
        disabled={!isOrgAdmin}
        onblur={(e) => update({ name: e.currentTarget.value })}
      />
      {#if !isOrgAdmin}
        <p class="field-help">Only organization administrators can rename this organization.</p>
      {/if}
    </SettingsField>
    <SettingsField label="Description" sub="Optional" controlId="org-desc">
      <textarea
        id="org-desc"
        placeholder="What is this organization about?"
        disabled={!isOrgAdmin}
        value={description}
        onblur={(e) => update({ description: e.currentTarget.value })}
      ></textarea>
    </SettingsField>
  </SettingsCard>

  <!-- ──────────── MEMBERS ──────────── -->
  <SettingsCard
    id="members"
    overline="Access"
    title="Members"
    description="Everyone who belongs to this organization. Administrators can manage teams, settings and invites."
    flush
  >
    {#snippet aside()}
      <span class="member-count">
        {data.orgUsers.length}
        {data.orgUsers.length == 1 ? "member" : "members"}
      </span>
    {/snippet}

    {#each data.orgUsers as user (user.id)}
      {@const isAdmin = user.role == ORGANIZATION_ROLES.ADMIN}
      <MemberRow
        id={user.id}
        name={user.name}
        roleLabel={isAdmin ? "Administrator" : "Member"}
        {isAdmin}
        isYou={user.id == currentUserId}
      />
    {/each}
  </SettingsCard>

  <!-- ──────────── INVITES ──────────── -->
  <SettingsCard
    id="invites"
    overline="Access"
    title="Invites"
    description="Share an invite code to let someone join this organization. Codes can be revoked at any time."
    flush
  >
    {#snippet aside()}
      {#if isOrgAdmin}
        <button class="btn-primary action-btn" onclick={createInvite}>
          <Icon name="plus" /> New invite
        </button>
      {/if}
    {/snippet}

    {#if invites.length === 0}
      <div class="empty">
        <Icon name="mail" size={22} stroke={1.5} />
        <p>No active invites{isOrgAdmin ? " — create one to invite a new member." : "."}</p>
      </div>
    {:else}
      <table class="invite-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Expires</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {#each invites as invite (invite.code)}
            <tr class:is-new={invite.code == inviteCode}>
              <td class="code-cell">
                <span class="code">{invite.code}</span>
                {#if invite.used}<span class="used-badge">Used</span>{/if}
              </td>
              <td class="expires-cell">{formatDate(invite.expires)}</td>
              <td class="actions-cell">
                <button
                  class="icon-btn"
                  title="Copy code"
                  aria-label="Copy invite code"
                  onclick={() => copyCode(invite.code)}
                >
                  <Icon name="copy" />
                </button>
                {#if isOrgAdmin}
                  <button
                    class="icon-btn is-danger"
                    title="Delete invite"
                    aria-label="Delete invite"
                    disabled={invite.used}
                    onclick={() => deleteInvite(invite.code)}
                  >
                    <Icon name="trash" />
                  </button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </SettingsCard>
</SettingsLayout>

<style>
  .member-count {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--fg-tertiary);
  }

  .action-btn {
    height: 34px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  /* ════════ INVITE TABLE ════════ */
  .invite-table {
    width: 100%;
    border-collapse: collapse;
  }
  .invite-table thead th {
    text-align: left;
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-tertiary);
    padding: 12px 24px 10px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .invite-table thead th:last-child {
    width: 1%;
  }
  .invite-table tbody td {
    padding: 11px 24px;
    border-bottom: 1px solid var(--border-subtle);
    vertical-align: middle;
  }
  .invite-table tbody tr:last-child td {
    border-bottom: 0;
  }
  .invite-table tbody tr:hover {
    background: var(--color-warm-100);
  }
  .invite-table tbody tr.is-new {
    background: var(--accent-primary-subtle);
  }
  .code-cell {
    align-items: center;
    gap: 10px;
  }
  .code {
    font-family: var(--font-mono);
    font-size: 0.92rem;
    font-weight: 500;
    color: var(--fg-primary);
    letter-spacing: 0.02em;
  }
  .used-badge {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--fg-tertiary);
    background: var(--bg-sunken);
    padding: 1px 6px;
    border-radius: var(--radius-pill);
  }
  .expires-cell {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--fg-secondary);
    white-space: nowrap;
  }
  .actions-cell {
    text-align: right;
    white-space: nowrap;
  }
  .actions-cell .icon-btn + .icon-btn {
    margin-left: 2px;
  }
  .icon-btn {
    width: 30px;
    height: 30px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--fg-tertiary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      background var(--duration-micro),
      color var(--duration-micro);
  }
  .icon-btn:hover {
    background: var(--bg-sunken);
    color: var(--fg-primary);
  }
  .icon-btn.is-danger:hover {
    background: var(--state-error-bg);
    color: var(--state-error);
  }
  .icon-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .icon-btn:disabled:hover {
    background: transparent;
    color: var(--fg-tertiary);
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 40px 24px;
    color: var(--fg-tertiary);
    text-align: center;
  }
  .empty p {
    margin: 0;
    font-size: 0.9rem;
  }
</style>
