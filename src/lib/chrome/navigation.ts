export interface NavigationItem {
  href: string;
  label: string;
}

export const primaryNavigation: NavigationItem[] = [
  { href: "/lessons", label: "Lessons" },
  { href: "/practice", label: "Practice" },
];

export const referenceNavigation: NavigationItem[] = [
  { href: "/dictionary", label: "Dictionary" },
  { href: "/dictionary/common/verb", label: "Most common" },
  { href: "/grammar", label: "Grammar" },
  { href: "/pronunciation", label: "Pronunciation" },
  { href: "/glossary", label: "Glossary" },
  { href: "/resources", label: "Resources" },
  { href: "/references", label: "References" },
  { href: "/downloads", label: "Downloads" },
];

export function isReferenceSection(pathname: string): boolean {
  return (
    pathname === "/dictionary" ||
    pathname.startsWith("/dictionary/") ||
    pathname.startsWith("/grammar") ||
    pathname.startsWith("/pronunciation") ||
    pathname === "/glossary" ||
    pathname.startsWith("/glossary/") ||
    pathname === "/resources" ||
    pathname.startsWith("/resources/") ||
    pathname === "/references" ||
    pathname.startsWith("/references/") ||
    pathname === "/downloads" ||
    pathname.startsWith("/downloads/")
  );
}

export function navigationIsActive(pathname: string, href: string): boolean {
  if (href === "/dictionary/common" || href === "/dictionary/common/verb") {
    return (
      pathname === "/dictionary/common" || pathname.startsWith("/dictionary/common/")
    );
  }

  if (href === "/dictionary") {
    return (
      pathname === "/dictionary" ||
      (pathname.startsWith("/dictionary/") && !pathname.startsWith("/dictionary/common"))
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
