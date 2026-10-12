import React, { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Integration route B: the framework has no chart slot, and CohortPanel isn't
 * exported, so we portal into each tab's own content column.
 *
 * Depends on three framework internals (check on every @gen3/frontend upgrade):
 *  1. Mantine Tabs.Panel ids end in `-panel-<tabTitle>`;
 *  2. CohortPanel renders `#cohort-builder-content` inside each panel (the id is
 *     duplicated across tabs, so we always scope the lookup to the panel);
 *  3. its first child is the downloads/counts row, after which charts belong.
 * Tabs are keepMounted, so every tab keeps its own portal; no active-tab tracking.
 */
const MOUNT_ATTR = 'data-custom-charts';
const GIVE_UP_WARNING_MS = 15000;

const findMount = (tabTitle: string): HTMLElement | null => {
  const panel = document.querySelector<HTMLElement>(
    `[role="tabpanel"][id$="-panel-${CSS.escape(tabTitle)}"]`,
  );
  const content = panel?.querySelector<HTMLElement>('#cohort-builder-content');
  if (!content) return null;
  const existing = content.querySelector<HTMLElement>(`:scope > [${MOUNT_ATTR}]`);
  if (existing) return existing;
  const mount = document.createElement('div');
  mount.setAttribute(MOUNT_ATTR, tabTitle);
  content.insertBefore(mount, content.children[1] ?? null);
  return mount;
};

export const ExplorerChartsPortal = ({
  tabTitle,
  children,
}: {
  tabTitle: string;
  children: ReactNode;
}) => {
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let current: HTMLElement | null = null;
    let frame = 0;
    const sync = () => {
      frame = 0;
      if (current?.isConnected) return; // cheap path on every table re-render
      current = findMount(tabTitle);
      setMount(current);
    };
    sync();
    // re-attach if the framework rebuilds the panel (e.g. error → recovered)
    const observer = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(sync);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const warn = window.setTimeout(() => {
      if (!current?.isConnected) {
        console.warn(
          `[charts] no mount point for Explorer tab "${tabTitle}". @gen3/frontend's ` +
            'Explorer markup may have changed; see src/lib/charts/ExplorerChartsPortal.tsx.',
        );
      }
    }, GIVE_UP_WARNING_MS);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(warn);
    };
  }, [tabTitle]);

  return mount ? createPortal(children, mount) : null;
};
