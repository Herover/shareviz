<script lang="ts">
  import { page } from "$app/stores";
  import { ORGANIZATION_ROLES } from "$lib/consts";

  $: console.log($page.data.orgUsers)
</script>

<h1>Organization Settings</h1>

<table>
  <tr>
    <th>Role</th>
    <th>Name</th>
  </tr>
  {#each $page.data.orgUsers as user}
    <tr>
      <td>{user.usersOrganizations.role == ORGANIZATION_ROLES.ADMIN ? "Administrator" : "user"}</td>
      <td>{user.user.name}</td>
    </tr>
  {/each}
</table>
