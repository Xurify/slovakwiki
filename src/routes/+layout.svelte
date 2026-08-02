<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import "../styles.css";

  let { children } = $props();
</script>

<div class="grid min-h-screen grid-cols-[220px_minmax(0,1fr)] max-[800px]:block">
  <Sidebar />
  <div class="flex min-w-0 min-h-screen flex-col bg-[#fafbf8] bg-[linear-gradient(180deg,rgb(255_255_255_/_60%),transparent_460px)]">
    <Header />
    <div id="main-content" class="min-h-0 flex-1" tabindex="-1">
      {@render children()}
    </div>
    <Footer />
  </div>
</div>
