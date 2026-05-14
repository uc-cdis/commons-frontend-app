import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';
import {
  Alert,
  Badge,
  Button,
  Divider,
  Modal,
  Group,
  Paper,
  Select,
  Stack,
  TextInput,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import dynamic from 'next/dynamic';

const SiemWorkspace = dynamic(() => import('@/components/siem/SiemWorkspace'), {
  ssr: false,
});

const LOCAL_VIEWS_STORAGE_KEY = 'gen3-vectis-siem-local-views';

type SiemWorkspaceViewRecord = {
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

type SiemWorkspaceViewListResponse = {
  canWrite: boolean;
  currentUser: string | null;
  views: SiemWorkspaceViewRecord[];
};

type UnifiedEvent = {
  timestamp: string;
  eventType: 'WAF' | 'Audit' | 'Threat';
  severity: string;
  source: string;
  target: string;
  account: string;
  action: string;
};

type TimelineProps = NavPageLayoutProps & {
  rows: UnifiedEvent[];
  dataError: string | null;
};

const SecurityTimelinePage = ({ headerProps, footerProps, rows, dataError }: TimelineProps) => {
  const [views, setViews] = useState<SiemWorkspaceViewRecord[]>([]);
  const [canWrite, setCanWrite] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const [viewsError, setViewsError] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saving, setSaving] = useState(false);

  function readLocalViews(): SiemWorkspaceViewRecord[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(LOCAL_VIEWS_STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as SiemWorkspaceViewRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeLocalViews(nextViews: SiemWorkspaceViewRecord[]) {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(LOCAL_VIEWS_STORAGE_KEY, JSON.stringify(nextViews));
  }

  useEffect(() => {
    let mounted = true;

    async function loadViews() {
      try {
        const response = await fetch('/api/siem/views', { method: 'GET' });
        const payload = (await response.json()) as SiemWorkspaceViewListResponse;
        if (!mounted) {
          return;
        }

        if (!response.ok) {
          throw new Error((payload as { error?: string }).error || 'Failed to load SIEM views');
        }

        const localViews = readLocalViews();
        const combinedViews = [...(payload.views || []), ...localViews.filter((view) => !(payload.views || []).some((remoteView) => remoteView.id === view.id))];
        setViews(combinedViews);
        setCanWrite(Boolean(payload.canWrite));
        setCurrentUser(payload.currentUser || null);
        setSelectedViewId((current) => current || combinedViews[0]?.id || null);
        setViewsError(null);
      } catch (error: unknown) {
        if (!mounted) {
          return;
        }

        setViewsError(error instanceof Error ? error.message : 'Failed to load SIEM views');
      }
    }

    loadViews();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedView = useMemo(
    () => views.find((view) => view.id === selectedViewId) ?? views[0] ?? null,
    [selectedViewId, views],
  );

  useEffect(() => {
    if (selectedView) {
      setSaveName(selectedView.name);
      setSaveDescription(selectedView.description || '');
    }
  }, [selectedView]);

  async function handleSaveView() {
    if (!selectedView) {
      return;
    }

    setSaving(true);
    try {
      if (!canWrite) {
        const localView: SiemWorkspaceViewRecord = {
          ...selectedView,
          id: `local-${Date.now()}`,
          name: saveName.trim(),
          description: saveDescription.trim() || null,
          scope: 'local',
          owner: currentUser,
          isDefault: false,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        const nextLocalViews = [...readLocalViews(), localView];
        writeLocalViews(nextLocalViews);
        setViews((current) => [...current, localView]);
        setSelectedViewId(localView.id);
        setSaveModalOpen(false);
        return;
      }

      const response = await fetch('/api/siem/views', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: saveName.trim(),
          description: saveDescription.trim() || null,
          kind: selectedView.kind,
          scope: selectedView.scope,
          workspace: selectedView.workspace,
          filters: selectedView.filters,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || payload?.detail || 'Failed to save SIEM view');
      }

      setViews((current) => [...current, payload as SiemWorkspaceViewRecord]);
      setSelectedViewId((payload as SiemWorkspaceViewRecord).id);
      setSaveModalOpen(false);
      setViewsError(null);
    } catch (error: unknown) {
      setViewsError(error instanceof Error ? error.message : 'Failed to save SIEM view');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteView() {
    if (!selectedView || selectedView.isDefault) {
      return;
    }

    try {
      if (!canWrite || selectedView.scope === 'local') {
        const nextLocalViews = readLocalViews().filter((view) => view.id !== selectedView.id);
        writeLocalViews(nextLocalViews);
        setViews((current) => current.filter((view) => view.id !== selectedView.id));
        setSelectedViewId((current) => (current === selectedView.id ? views.find((view) => view.id !== selectedView.id)?.id || null : current));
        return;
      }

      const response = await fetch(`/api/siem/views?view_id=${encodeURIComponent(selectedView.id)}`, {
        method: 'DELETE',
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || payload?.detail || 'Failed to delete SIEM view');
      }

      setViews((current) => current.filter((view) => view.id !== selectedView.id));
      setSelectedViewId((current) => (current === selectedView.id ? views.find((view) => view.id !== selectedView.id)?.id || null : current));
      setViewsError(null);
    } catch (error: unknown) {
      setViewsError(error instanceof Error ? error.message : 'Failed to delete SIEM view');
    }
  }

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'SIEM Timeline',
        content: 'Cross-Pivot Events',
        key: 'vectis-siem-timeline',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
        <div style={{ flexShrink: 0, padding: '12px 24px 8px' }}>
          <Paper withBorder radius="md" px="md" py="sm">
            <Stack gap="xs">
              <Group justify="space-between" align="center" wrap="wrap">
                <div>
                  <Title order={4} fw={600} style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.01em' }}>
                    Unified Security Timeline
                  </Title>
                  <Text c="dimmed" size="xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Cross-pivot across WAF, Audit, and Threat events.
                  </Text>
                </div>
                <Group gap="xs">
                  <Badge variant="light" color={canWrite ? 'green' : 'gray'}>
                    {canWrite ? 'Writer' : 'Read only'}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    {rows.length.toLocaleString()} events
                  </Text>
                  <Link href="/SecurityDashboard">
                    <Button variant="default" size="xs" leftSection={<IconArrowLeft size={14} />}>
                      Dashboard
                    </Button>
                  </Link>
                </Group>
              </Group>

              <Divider />

              <Group align="end" justify="space-between" wrap="wrap">
                <Group grow align="end" style={{ flex: 1, minWidth: 320 }}>
                  <Select
                    label="Saved view"
                    value={selectedViewId}
                    onChange={setSelectedViewId}
                    data={views.map((view) => ({
                      value: view.id,
                      label: view.name,
                      description: view.description || undefined,
                    }))}
                    searchable
                    nothingFoundMessage="No saved views"
                    style={{ minWidth: 320 }}
                  />
                </Group>
                <Group gap="xs">
                  <Button variant="default" onClick={() => setSaveModalOpen(true)} disabled={!selectedView}>
                    Save as
                  </Button>
                  <Button variant="default" onClick={() => setSelectedViewId(views[0]?.id || null)} disabled={!views.length}>
                    Reset
                  </Button>
                  <Button variant="outline" color="red" onClick={() => void handleDeleteView()} disabled={!selectedView || selectedView.isDefault}>
                    Delete
                  </Button>
                </Group>
              </Group>

              {selectedView ? (
                <Text size="xs" c="dimmed">
                  {selectedView.description || 'Saved SIEM view'}
                  {currentUser && selectedView.owner === currentUser ? ' • owned by you' : ''}
                  {selectedView.isDefault ? ' • default preset' : ''}
                  {selectedView.scope === 'local' ? ' • local draft' : ''}
                </Text>
              ) : null}

              {viewsError ? (
                <Alert color="yellow" title="Saved views failed to load">
                  {viewsError}
                </Alert>
              ) : null}
            </Stack>
          </Paper>
          {dataError ? (
            <Alert color="red" title="Timeline data load failed" mt="xs">
              {dataError}
            </Alert>
          ) : null}
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <SiemWorkspace rows={rows} workspaceConfig={selectedView?.workspace} />
        </div>
      </div>

      <Modal opened={saveModalOpen} onClose={() => setSaveModalOpen(false)} title="Save SIEM view" centered>
        <Stack>
          <Text size="sm" c="dimmed">
            Save a copy of the currently selected view. Writers persist to the backend; everyone else keeps a local draft in the browser.
          </Text>
          <TextInput label="Name" value={saveName} onChange={(event) => setSaveName(event.currentTarget.value)} required />
          <Textarea label="Description" value={saveDescription} onChange={(event) => setSaveDescription(event.currentTarget.value)} minRows={3} />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSaveView()} loading={saving} disabled={!saveName.trim()}>
              Save view
            </Button>
          </Group>
        </Stack>
      </Modal>
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<TimelineProps> = async (context) => {
  const baseProps = await getNavPageLayoutPropsFromConfig();

  const siemBaseUrl = process.env.SIEM_SERVICE_URL
    ? process.env.SIEM_SERVICE_URL
    : process.env.SIEM_SERVICE_DNS
      ? `http://${process.env.SIEM_SERVICE_DNS}:8000`
      : 'http://siem-service.gen3.svc.cluster.local:8000';

  try {
    const cookieHeader = context.req.headers.cookie;
    const authHeader = context.req.headers.authorization;
    const response = await fetch(`${siemBaseUrl}/siem/timeline`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(typeof cookieHeader === 'string' ? { cookie: cookieHeader } : {}),
        ...(typeof authHeader === 'string' ? { authorization: authHeader } : {}),
      },
      body: JSON.stringify({ page: { limit: 1000, offset: 0 }, filters: {} }),
    });

    if (!response.ok) {
      throw new Error(`SIEM request failed: ${response.status}`);
    }

    const payload = await response.json();

    return {
      props: {
        ...baseProps,
        rows: payload?.rows || [],
        dataError: null,
      },
    };
  } catch (error: any) {
    return {
      props: {
        ...baseProps,
        rows: [],
        dataError: error?.message || 'Failed to load timeline data',
      },
    };
  }
};

export default SecurityTimelinePage;
