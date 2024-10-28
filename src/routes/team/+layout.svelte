<script lang="ts">

</script>

<header>
  <div class="content">
    <div class="icon">ShareViz</div>
    <nav>
      <div class="nav-item">Overview</div>
      <div class="nav-item">Organization</div>
      <div class="nav-item">User</div>
    </nav>
  </div>
</header>

<main>
  <slot />
</main>

<footer>

</footer>

<style>
  :global(body) {
    background-color: var(--main-bg-color);
  }
  header {
    width: 100%;
    border-bottom: solid 1px var(--detail-color);
  }
  header .content {
    width: 100%;
    max-width: var(--width-wide);
    margin: auto;
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
  header nav {
    display: flex;
    justify-content: space-between;
    margin-left: auto;
  }
  main {
    width: var(--width-wide);
    margin: auto;
  }
</style>
