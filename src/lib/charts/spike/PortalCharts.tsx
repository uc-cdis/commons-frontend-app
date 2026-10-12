// SPIKE ONLY — route B: no patch; portal our panel into each tab's content column.
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const MOUNT_ATTR = 'data-custom-charts-mount';

// Mantine Tabs.Panel renders role="tabpanel" with id `${tabsId}-panel-${value}`;
// CohortPanel renders a (non-unique!) #cohort-builder-content inside each panel.
const findMount = (tabTitle: string): HTMLElement | null => {
  const panel = document.querySelector<HTMLElement>(
    `[role="tabpanel"][id$="-panel-${CSS.escape(tabTitle)}"]`,
  );
  const content = panel?.querySelector<HTMLElement>('#cohort-builder-content');
  if (!content) return null;
  let mount = content.querySelector<HTMLElement>(`:scope > [${MOUNT_ATTR}]`);
  if (!mount) {
    mount = document.createElement('div');
    mount.setAttribute(MOUNT_ATTR, tabTitle);
    // after the downloads/counts row, where the built-in charts grid sits
    content.insertBefore(mount, content.children[1] ?? null);
  }
  return mount;
};

export const PortalCharts = ({
  tabTitle,
  children,
}: {
  tabTitle: string;
  children: React.ReactNode;
}) => {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const sync = () => {
      const m = findMount(tabTitle);
      setMount((prev) => (prev === m ? prev : m));
    };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [tabTitle]);
  return mount ? createPortal(children, mount) : null;
};
