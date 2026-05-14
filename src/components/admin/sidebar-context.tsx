import { createContext, useContext, useState, type ReactNode } from "react";

type Ctx = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
};

const SidebarCtx = createContext<Ctx | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <SidebarCtx.Provider
      value={{
        collapsed,
        setCollapsed,
        toggle: () => setCollapsed(!collapsed),
        mobileOpen,
        setMobileOpen,
      }}
    >
      {children}
    </SidebarCtx.Provider>
  );
}

export function useSidebarState() {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebarState must be used inside SidebarProvider");
  return ctx;
}
