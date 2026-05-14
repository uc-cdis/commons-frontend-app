export type SiemWorkspaceViewRecord = {
  id: string;
  name: string;
  description: string | null;
  kind: string;
  scope: string;
  workspace: Record<string, unknown>;
  filters: Record<string, unknown>;
  owner: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SiemWorkspaceViewListResponse = {
  canWrite: boolean;
  currentUser: string | null;
  views: SiemWorkspaceViewRecord[];
};

export type SiemWorkspaceViewInput = {
  name: string;
  description?: string | null;
  kind?: string;
  scope?: string;
  workspace: Record<string, unknown>;
  filters?: Record<string, unknown>;
};