"use client";

import { BottomTabBar } from "./bottom-tab-bar";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

interface SidebarWrapperProps {
  navItems: NavItem[];
  userInfo: {
    displayName: string;
    initial: string;
    email: string;
    avatarUrl?: string;
  };
}

export function SidebarWrapper({ navItems }: SidebarWrapperProps) {
  return <BottomTabBar navItems={navItems} />;
}
