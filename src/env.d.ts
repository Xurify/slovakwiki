/// <reference types="astro/client" />
/// <reference types="@astrojs/svelte/svelte-shims.d.ts" />

declare module "*.svelte" {
  import type { Component } from "svelte";
  const component: Component;
  export default component;
}

interface ImportMetaEnv {
  readonly PUBLIC_AUDIO_BASE_URL?: string;
  readonly PUBLIC_IMAGE_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
