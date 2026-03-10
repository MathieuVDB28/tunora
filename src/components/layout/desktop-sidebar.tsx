"use client";

import { useState } from "react";
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

interface DesktopSidebarProps {
  navItems: NavItem[];
  userInfo: {
    displayName: string;
    initial: string;
    email: string;
    avatarUrl?: string;
  };
}

export function DesktopSidebar({ navItems, userInfo }: DesktopSidebarProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <NavIcon icon={item.icon} className="h-5 w-5" />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
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
            Deconnexion
          </button>
        </form>
      </div>

      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </aside>
  );
}
