<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  let oldPassword = $state("");
  let password1 = $state("");
  let password2 = $state("");

  let samePassword = $derived(password1 == password2);
  let okLength = $derived(password1.length >= 10);

  let ok = $derived(samePassword && okLength);
</script>

<form action={ok ? "/signin?/setPassword" : null} method="post">
  {#if data.hasPassword}
    <label
      >Old password<br /><input
        type="password"
        bind:value={oldPassword}
        name="old_password"
      /></label
    >
    <br />
  {/if}
  <label
    >New password<br /><input type="password" bind:value={password1} name="new_password" /></label
  >
  <br />
  <label>Repeat password<br /><input type="password" bind:value={password2} /></label>
  {#if !samePassword}
    <p>Passwords don't match.</p>
  {/if}
  {#if !okLength}
    <p>Password too short.</p>
  {/if}
  {#if ok}
    <br />
    <button type="submit">Set password</button>
  {/if}
</form>
