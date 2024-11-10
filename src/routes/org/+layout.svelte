<script lang="ts">
  import { page } from "$app/stores";
</script>

<header>
  <div class="content">
    <div class="icon">ShareViz</div>
    <nav>
      {#if $page.params.organizationId}
        <div class="nav-item"><a href="/org/{$page.params.organizationId}/team">Overview</a></div>
        <div class="nav-item"><a href="/org/{$page.params.organizationId}">Organization</a></div>
      {/if}
      <div class="nav-item"><a href="/org/user">User</a></div>
    </nav>
  </div>
</header>

<main>
  <slot />
</main>

<footer></footer>

<style>
  header {
    width: 100%;
    border-bottom: solid 1px var(--detail-color);
  }
  header .content {
    box-sizing: border-box;
    width: 100%;
    max-width: var(--width-wide);
    margin: auto;
    padding-left: 1em;
    padding-right: 1em;
    height: 3em;
    display: flex;
    justify-content: start;
    align-items: center;
  }
  .icon {
    font-size: 1.9em;
    margin-right: 1em;
  }
  .nav-item {
    font-size: 1.2em;
    padding-left: 1em;
    padding-right: 1em;
    font-weight: bold;
    color: var(--text-secondary);
  }
  .nav-item > a {
    color: var(--text-secondary);
    text-decoration: none;
  }
  .nav-item:last-child {
    padding-right: 0;
  }
  header nav {
    display: flex;
    justify-content: space-between;
    margin-left: auto;
  }
  main {
    box-sizing: border-box;
    max-width: var(--width-wide);
    margin: auto;
    padding-left: 1em;
    padding-right: 1em;
  }
</style>
