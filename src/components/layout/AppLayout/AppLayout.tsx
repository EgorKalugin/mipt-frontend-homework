import type { ReactNode } from 'react';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

export function AppLayout({
  sidebar,
  children,
  isSidebarOpen,
  onCloseSidebar,
}: AppLayoutProps) {
  return (
    <div className={styles.layout}>
      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}
      >
        {sidebar}
      </aside>
      <div
        className={`${styles.overlay} ${!isSidebarOpen ? styles.overlayHidden : ''}`}
        onClick={onCloseSidebar}
      />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
