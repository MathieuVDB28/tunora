"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "./nav-icon";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

interface BottomTabBarProps {
  navItems: NavItem[];
}

const primaryTabs = [
  { href: "/dashboard", label: "Accueil", icon: "dashboard" },
  { href: "/library", label: "Biblio", icon: "library" },
  { href: "/practice", label: "Practice", icon: "metronome" },
  { href: "/feed", label: "Feed", icon: "feed" },
];

const moreTabs = [
  { href: "/progress", label: "Progression", icon: "chart" },
  { href: "/covers", label: "Covers", icon: "video" },
  { href: "/albums", label: "Albums", icon: "album" },
  { href: "/setlists", label: "Setlists", icon: "setlist" },
  { href: "/challenges", label: "Defis", icon: "trophy" },
  { href: "/friends", label: "Amis", icon: "users" },
  { href: "/audio", label: "Audio", icon: "audio" },
];

export function BottomTabBar({ navItems }: BottomTabBarProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isMoreActive = moreTabs.some((tab) => pathname === tab.href || pathname.startsWith(tab.href + "/"));

  // Get badge for friends from navItems
  const friendsBadge = navItems.find((item) => item.href === "/friends")?.badge;

  return (
    <>
      {/* Drawer overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* More drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 lg:hidden ${
          isDrawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="rounded-t-2xl border-t border-border bg-card pb-24 pt-4">
          <div className="mb-2 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="grid grid-cols-3 gap-2 px-4">
            {moreTabs.map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
              const badge = tab.href === "/friends" ? friendsBadge : undefined;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setIsDrawerOpen(false)}
                  className={`relative flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <NavIcon icon={tab.icon} className="h-5 w-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                  {badge && badge > 0 && (
                    <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {primaryTabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                  <NavIcon icon={tab.icon} className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors ${
              isMoreActive || isDrawerOpen
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${isMoreActive || isDrawerOpen ? "bg-primary/10" : ""}`}>
              <NavIcon icon="more" className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">Plus</span>
          </button>
        </div>
      </nav>
    </>
  );
}
