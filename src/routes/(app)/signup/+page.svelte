<script lang="ts">
  let email = $state("");
  let password = $state("");
  let password2 = $state("");

  let passwordSame = $derived(password == password2);
  let passwordLong = $derived(password.length >= 10);
  let allOK = $derived(passwordLong && passwordSame);
</script>

<form action="/signup" method="post">
  <p><label>E-mail <input name="email" bind:value={email} /></label></p>
  <p><label>Password <input name="password" type="password" bind:value={password} /></label></p>
  <p><label>Repeat password <input type="password" bind:value={password2} /></label></p>
  {#if !passwordSame}<p>Passwords are not the same.</p>{/if}
  {#if !passwordLong}<p>Password need to be 10 characters.</p>{/if}
  <p>
    By signing up, you agree to allow us to store your email, name, IP address, securely hashed
    password, and other details you give us. This information may be shared with other people in
    your organization, or used to contact you regarding your account.
  </p>
  <button type="submit" disabled={!allOK}>Create user</button>
</form>

<style>
  .error {
    color: var(--text-error);
  }
</style>
