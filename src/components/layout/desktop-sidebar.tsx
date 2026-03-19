"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { UserProfileModal } from "@/components/profile/user-profile-modal";
import { NavIcon } from "./nav-icon";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  id: string;
  label: string;
  icon: string;
  items: { href: string; label: string; icon: string }[];
}

const standaloneTop: { href: string; label: string; icon: string } = {
  href: "/dashboard",
  label: "Dashboard",
  icon: "dashboard",
};

const sections: NavSection[] = [
  {
    id: "music",
    label: "Ma Musique",
    icon: "music_collection",
    items: [
      { href: "/library", label: "Bibliothèque", icon: "library" },
      { href: "/albums", label: "Albums", icon: "album" },
      { href: "/covers", label: "Covers", icon: "video" },
      { href: "/setlists", label: "Setlists", icon: "setlist" },
    ],
  },
  {
    id: "training",
    label: "Entraînement",
    icon: "training",
    items: [
      { href: "/practice", label: "Practice", icon: "metronome" },
      { href: "/progress", label: "Progression", icon: "chart" },
      { href: "/challenges", label: "Défis", icon: "trophy" },
    ],
  },
  {
    id: "social",
    label: "Social",
    icon: "social",
    items: [
      { href: "/feed", label: "Feed", icon: "feed" },
      { href: "/friends", label: "Amis", icon: "users" },
    ],
  },
];

const standaloneBottom: { href: string; label: string; icon: string } = {
  href: "/audio",
  label: "Outils Audio",
  icon: "audio",
};

interface DesktopSidebarProps {
  navItems: NavItem[];
  userInfo: {
    displayName: string;
    initial: string;
    email: string;
    avatarUrl?: string;
  };
}

function SectionGroup({
  section,
  pathname,
  badges,
  isOpen,
  onToggle,
}: {
  section: NavSection;
  pathname: string;
  badges: Map<string, number>;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hasActive = section.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <div>
      {/* Section header */}
      <button
        onClick={onToggle}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
          hasActive
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        <NavIcon icon={section.icon} className="h-5 w-5" />
        <span className="flex-1 text-left">{section.label}</span>
        <svg
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Section items */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="ml-2 space-y-0.5 border-l border-border/50 pl-2 pt-0.5">
          {section.items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const badge = badges.get(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <NavIcon icon={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
                {badge && badge > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DesktopSidebar({ navItems, userInfo }: DesktopSidebarProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Build badge map from flat navItems
  const badges = new Map<string, number>();
  navItems.forEach((item) => {
    if (item.badge) badges.set(item.href, item.badge);
  });

  // Determine which sections should be open (auto-open active section)
  const getInitialOpenSections = (): Set<string> => {
    const open = new Set<string>();
    for (const section of sections) {
      const hasActive = section.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      );
      if (hasActive) open.add(section.id);
    }
    // If no section is active, open all by default
    if (open.size === 0) {
      sections.forEach((s) => open.add(s.id));
    }
    return open;
  };

  const [openSections, setOpenSections] = useState<Set<string>>(getInitialOpenSections);

  // Auto-open section when navigating
  useEffect(() => {
    for (const section of sections) {
      const hasActive = section.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      );
      if (hasActive && !openSections.has(section.id)) {
        setOpenSections((prev) => new Set(prev).add(section.id));
      }
    }
  }, [pathname]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const dashboardActive =
    pathname === standaloneTop.href ||
    pathname.startsWith(standaloneTop.href + "/");
  const audioActive =
    pathname === standaloneBottom.href ||
    pathname.startsWith(standaloneBottom.href + "/");

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-border bg-card lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center">
          <Image
            src="/logo.png"
            alt="Ostinara"
            width={36}
            height={36}
            className="rounded-lg"
          />
        </div>
        <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-xl font-extrabold text-transparent">
          Ostinara
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Dashboard - standalone */}
        <Link
          href={standaloneTop.href}
          className={`mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
            dashboardActive
              ? "bg-primary/10 font-medium text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <NavIcon icon={standaloneTop.icon} className="h-5 w-5" />
          <span>{standaloneTop.label}</span>
        </Link>

        {/* Separator */}
        <div className="mb-3 border-t border-border/50" />

        {/* Grouped sections */}
        <div className="space-y-1.5">
          {sections.map((section) => (
            <SectionGroup
              key={section.id}
              section={section}
              pathname={pathname}
              badges={badges}
              isOpen={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </div>

        {/* Separator */}
        <div className="my-3 border-t border-border/50" />

        {/* Audio - standalone */}
        <Link
          href={standaloneBottom.href}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
            audioActive
              ? "bg-primary/10 font-medium text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <NavIcon icon={standaloneBottom.icon} className="h-5 w-5" />
          <span>{standaloneBottom.label}</span>
        </Link>
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-accent"
          >
            {userInfo.avatarUrl ? (
              <img
                src={userInfo.avatarUrl}
                alt={userInfo.displayName}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {userInfo.initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {userInfo.displayName}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {userInfo.email}
              </div>
            </div>
          </button>
          <ThemeToggle />
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Déconnexion
          </button>
        </form>
      </div>

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </aside>
  );
}
