<script lang="ts">
  import { page } from "$app/state";

  const primary = [
    { href: "/learn", label: "Learn" },
    { href: "/wiki", label: "Wiki" },
    { href: "/quiz", label: "Quiz" },
  ];

  const reference = [
    { href: "/wiki", label: "Dictionary" },
    { href: "/grammar", label: "Grammar" },
    { href: "/pronunciation", label: "Pronunciation" },
  ];

  function isActive(href: string): boolean {
    return href === "/wiki"
      ? page.url.pathname === "/wiki" || page.url.pathname.startsWith("/dictionary/")
      : page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
  }
</script>

<aside class="app-sidebar" aria-label="Site navigation">
  <a class="brand" href="/" aria-label="Slovak Wiki home"><span>Slovak</span><strong>Wiki</strong></a>

  <nav aria-label="Primary navigation">
    {#each primary as item (item.href)}
      <a href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</a>
    {/each}
  </nav>

  <nav class="reference-nav" aria-label="Reference navigation">
    <p>Reference</p>
    {#each reference as item (item.href)}
      <a href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</a>
    {/each}
  </nav>

  <div class="sidebar-footer"><a href="/search">Search</a><a href="/">About</a></div>
</aside>

<style>
  .app-sidebar { position:sticky; top:0; display:flex; height:100vh; flex-direction:column; padding:22px 16px; border-right:1px solid var(--line); background:color-mix(in srgb,var(--paper) 83%,transparent); }
  .brand { display:flex; align-items:baseline; gap:5px; margin:0 8px 36px; font-size:.83rem; } .brand span { color:var(--muted-strong); } .brand strong { color:var(--ink); font-family:var(--font-reading); font-size:1.05rem; }
  nav { display:grid; gap:3px; } nav a { padding:8px 9px; border-left:2px solid transparent; color:var(--ink-soft); font-family:var(--font-reading); font-size:.88rem; } nav a:hover { background:var(--surface-subtle); color:var(--accent-dark); } nav a[aria-current="page"] { border-left-color:var(--accent); background:var(--accent-soft); color:var(--accent-dark); font-weight:700; }
  .reference-nav { margin-top:34px; } .reference-nav p { margin:0 0 7px 9px; color:var(--muted); font-size:.62rem; font-weight:750; letter-spacing:.1em; text-transform:uppercase; }
  .sidebar-footer { display:flex; gap:14px; margin-top:auto; padding:12px 8px 0; border-top:1px solid var(--line); color:var(--muted); font-size:.7rem; } .sidebar-footer a:hover { color:var(--accent-dark); text-decoration:underline; text-underline-offset:3px; }
  @media (max-width:800px) { .app-sidebar { display:none; } }
</style>
