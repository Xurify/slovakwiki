<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import "../styles.css";

  let { children } = $props();
</script>

<Header />
<div id="main-content" tabindex="-1">
  {@render children()}
</div>
<Footer />
