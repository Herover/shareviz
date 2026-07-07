<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { page } from "$app/stores";
  import OrganizationList from "$lib/components/OrganizationList.svelte";
</script>

<h1>Select organization</h1>

<OrganizationList organizations={$page.data.organizations} />
