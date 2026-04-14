'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const SidebarContext = createContext({ open: false, toggle: () => {}, close: () => {} });

export const useSidebar = () => useContext(SidebarContext);

export default function SidebarProvider({ children }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <SidebarContext.Provider value={{ open, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}
