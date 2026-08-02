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
  { href: "/grammar/terms", label: "Language terms" },
  { href: "/references", label: "References" },
];

export function isReferenceSection(pathname: string): boolean {
  return (
    pathname === "/dictionary" ||
    pathname.startsWith("/dictionary/") ||
    pathname.startsWith("/grammar") ||
    pathname.startsWith("/pronunciation") ||
    pathname === "/references" ||
    pathname.startsWith("/references/")
  );
}

export function navigationIsActive(pathname: string, href: string): boolean {
  if (href === "/grammar/terms") return pathname === href;

  if (href === "/dictionary/common" || href === "/dictionary/common/verb") {
    return (
      pathname === "/dictionary/common" || pathname.startsWith("/dictionary/common/")
    );
  }

  if (href === "/grammar") {
    return (
      pathname === href ||
      (pathname.startsWith("/grammar/") && !pathname.startsWith("/grammar/terms"))
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
