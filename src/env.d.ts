/// <reference types="astro/client" />
/// <reference types="@astrojs/svelte/svelte-shims.d.ts" />

declare module "*.svelte" {
  import type { Component } from "svelte";
  const component: Component;
  export default component;
}

/** Set by src/integrations/dictionary-index.ts via Vite `define`; absent in tests. */
declare const __DICTIONARY_INDEX_URLS__: readonly string[] | undefined;

interface ImportMetaEnv {
  readonly PUBLIC_AUDIO_BASE_URL?: string;
  readonly PUBLIC_IMAGE_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
