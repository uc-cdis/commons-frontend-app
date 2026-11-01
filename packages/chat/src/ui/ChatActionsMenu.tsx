"use client";

import { Menu } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import type { ReactElement } from "react";

export interface ChatActionsMenuProps {
  children: ReactElement;
  deleteDisabled?: boolean;
  onRename: () => void;
  onDelete?: () => void;
}

export function ChatActionsMenu({
  children,
  deleteDisabled,
  onRename,
  onDelete,
}: ChatActionsMenuProps) {
  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>{children}</Menu.Target>
      {/* it renders outside the mobile drawer, but React still passes its clicks to the drawer's
          close-on-click, which would close it before Rename can open the title box */}
      <Menu.Dropdown data-keep-open>
        <Menu.Item leftSection={<IconPencil size={14} />} onClick={onRename}>
          Rename
        </Menu.Item>
        <Menu.Item
          color="var(--chat-error)"
          leftSection={<IconTrash size={14} />}
          disabled={deleteDisabled}
          onClick={onDelete}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
