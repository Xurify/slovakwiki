export interface NavigationItem {
  href: string;
  label: string;
}

export const primaryNavigation: NavigationItem[] = [
  { href: "/lessons", label: "Lessons" },
  { href: "/practice", label: "Practice" },
  { href: "/wiki", label: "Reference" },
];

export const referenceNavigation: NavigationItem[] = [
  { href: "/wiki", label: "Dictionary" },
  { href: "/grammar", label: "Grammar" },
  { href: "/pronunciation", label: "Pronunciation" },
  { href: "/grammar/terms", label: "Language terms" },
];

export function navigationIsActive(pathname: string, href: string): boolean {
  if (href === "/wiki") {
    return (
      pathname === "/wiki" ||
      pathname.startsWith("/dictionary/") ||
      pathname.startsWith("/grammar/") ||
      pathname.startsWith("/pronunciation/")
    );
  }

  if (href === "/grammar/terms") return pathname === href;

  if (href === "/grammar") {
    return pathname === href || (pathname.startsWith("/grammar/") && !pathname.startsWith("/grammar/terms"));
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Active-state matching for the sidebar's individual reference links.
 * The header's `/wiki` item represents the whole Reference section, while
 * the sidebar's `/wiki` item represents Dictionary only.
 */
export function sidebarNavigationIsActive(pathname: string, href: string): boolean {
  if (href === "/wiki") {
    return pathname === "/wiki" || pathname.startsWith("/dictionary/");
  }

  return navigationIsActive(pathname, href);
}
