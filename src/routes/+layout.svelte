<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import "../styles.css";

  let { children } = $props();
</script>

<div class="app-frame">
  <Header />
  <div id="main-content" tabindex="-1">
    {@render children()}
  </div>
  <Footer />
</div>
