"use client";

import { Box, Burger, Drawer, useMantineTheme } from "@mantine/core";
import { useDisclosure, useLocalStorage, useMediaQuery } from "@mantine/hooks";
import { useCallback, useEffect, type ReactNode } from "react";
import { HeaderStrip } from "./HeaderStrip";

export interface SidebarState {
  collapsed: boolean;
  /** absent in the mobile drawer, which always shows the whole list */
  onToggleCollapsed?: () => void;
}

export interface ChatShellProps {
  sidebar: (state: SidebarState) => ReactNode;
  children: ReactNode;
  headerContent: ReactNode;
}

const SIDEBAR_WIDTH = 340;
const RAIL_WIDTH = 56;

export function ChatShell({ sidebar, children, headerContent }: ChatShellProps) {
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [collapsed, setCollapsed] = useLocalStorage({
    key: "gdc-chat-sidebar-collapsed",
    defaultValue: false,
    // the chat page only renders in the browser, so read it now instead of flashing the full list
    getInitialValueInEffect: false,
  });

  useEffect(() => {
    if (isDesktop && mobileOpened) closeMobile();
  }, [isDesktop, mobileOpened, closeMobile]);

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), [setCollapsed]);

  const sidebarBody = (state: SidebarState) => (
    <Box
      mih={0}
      style={{ flex: 1, display: "flex", flexDirection: "column" }}
      onClick={(event) => {
        if (!mobileOpened) return;
        // The rename input and the row's action menu need the drawer to stay
        // put. Everything else in here is navigation.
        if ((event.target as HTMLElement).closest("[data-keep-open]")) return;
        closeMobile();
      }}
    >
      {sidebar(state)}
    </Box>
  );

  return (
    <Box
      // Marker for the chat's global rules in styles.css and the portal's globals.css.
      data-chat-shell
      pb="sm"
      mih={0}
      miw={0}
      style={{
        flex: 1,
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box mih={0} miw={0} style={{ flex: 1, display: "flex" }}>
        <Box
          component="aside"
          visibleFrom="sm"
          w={collapsed ? RAIL_WIDTH : SIDEBAR_WIDTH}
          mih={0}
          bg="var(--chat-panel)"
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            borderInlineEnd: "1px solid var(--chat-rule)",
          }}
        >
          {sidebarBody({ collapsed, onToggleCollapsed: toggleCollapsed })}
        </Box>

        <Drawer
          opened={mobileOpened}
          onClose={closeMobile}
          size={SIDEBAR_WIDTH}
          padding={0}
          className="chat-drawer"
          withCloseButton={false}
          styles={{
            content: { display: "flex", flexDirection: "column" },
            body: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" },
          }}
        >
          {sidebarBody({ collapsed: false })}
        </Drawer>

        <Box
          component="section"
          mih={0}
          miw={0}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <HeaderStrip>
            <Burger
              hiddenFrom="sm"
              opened={mobileOpened}
              onClick={toggleMobile}
              size="sm"
              aria-label="Toggle conversation list"
            />
            {headerContent}
          </HeaderStrip>
          <Box mih={0} miw={0} style={{ flex: 1, display: "flex" }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
