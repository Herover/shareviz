<!-- SPDX-License-Identifier: MPL-2.0 -->

<script lang="ts">
  import { resolve } from "$app/paths";
  import Brand from "$lib/components/Brand.svelte";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import Icon from "$lib/components/Icon.svelte";

  let email = $state("");
  let password = $state("");
  let password2 = $state("");

  let passwordSame = $derived(password == password2);
  let passwordLong = $derived(password.length >= 10);
  let allOK = $derived(passwordLong && passwordSame);
</script>

<div class="page auth-shell">
  <header class="topbar">
    <Brand href="/" />
    <div class="top-right">
      <ThemeToggle />
    </div>
  </header>

  <main class="auth-wrap">
    <section class="auth">
      <div class="auth-head">
        <h2>Create your account</h2>
        <p>Already have an account? <a href={resolve("/(app)", {})}>Sign in</a></p>
      </div>

      <form class="form" action="/signup" method="post">
        <div class="field-group">
          <label class="field-label" for="email">Email</label>
          <div class="input-wrap">
            <span class="input-ic">
              <Icon name="mail" size={14} />
            </span>
            <input
              class="input"
              id="email"
              name="email"
              type="email"
              placeholder="you@newsroom.org"
              autocomplete="email"
              bind:value={email}
            />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="password">Password</label>
          <div class="input-wrap">
            <span class="input-ic">
              <Icon name="lock" size={14} />
            </span>
            <input
              class="input"
              id="password"
              name="password"
              type="password"
              placeholder="At least 10 characters"
              autocomplete="new-password"
              bind:value={password}
            />
          </div>
          {#if password.length > 0 && !passwordLong}
            <p class="field-error">Password needs to be at least 10 characters.</p>
          {/if}
        </div>

        <div class="field-group">
          <label class="field-label" for="password2">Repeat password</label>
          <div class="input-wrap">
            <span class="input-ic">
              <Icon name="lock" size={14} />
            </span>
            <input
              class="input"
              id="password2"
              type="password"
              placeholder="••••••••••"
              autocomplete="new-password"
              bind:value={password2}
            />
          </div>
          {#if password2.length > 0 && !passwordSame}
            <p class="field-error">Passwords are not the same.</p>
          {/if}
        </div>

        <button class="btn-primary" type="submit" disabled={!allOK}>
          Create account
          <Icon name="arrowRight" size={16} />
        </button>
      </form>

      <p class="legal">
        By signing up, you agree to allow us to store your email, name, IP address, securely hashed
        password, and other details you give us. This information may be shared with other people in
        your organization, or used to contact you regarding your account.
      </p>
    </section>
  </main>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
  }

  .auth-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 24px 64px;
  }

  /* Frosted, centered signup card */
  .auth {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding: 32px;
    background: color-mix(in oklab, var(--bg-surface) 80%, transparent);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-2);
    backdrop-filter: blur(6px);
  }
  /* Longer heading than the login page — size down so it doesn't wrap awkwardly. */
  .auth-head h2 {
    font-size: 30px;
  }

  .field-error {
    font-size: 12px;
    color: var(--state-error);
  }

  .legal {
    font-size: 11.5px;
    line-height: 1.5;
    color: var(--fg-tertiary);
  }

  @media (max-width: 520px) {
    .auth {
      padding: 24px;
    }
  }
</style>
