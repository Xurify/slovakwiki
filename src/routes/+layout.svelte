<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import "../styles.css";

  let { children } = $props();
</script>

<div class="app-shell">
  <Sidebar />
  <div class="app-frame">
    <Header />
    <div id="main-content" tabindex="-1">
      {@render children()}
    </div>
    <Footer />
  </div>
</div>
