import type { AstroIntegration } from "astro";

/** Render the given page files on request instead of prerendering them at build. */
export function onDemandRoutes(components: readonly string[]): AstroIntegration {
  return {
    name: "on-demand-routes",
    hooks: {
      "astro:route:setup": ({ route }) => {
        if (components.includes(route.component)) {
          route.prerender = false;
        }
      },
    },
  };
}
