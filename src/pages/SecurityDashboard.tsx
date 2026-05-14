import React, { useCallback, useMemo, useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconBolt,
  IconRefresh,
  IconShield,
  IconTimeline,
} from '@tabler/icons-react';

type Bucket = {
  key: string;
  count: number;
};

type UnifiedEvent = {
  timestamp: string;
  eventType: string;
  severity: string;
  source: string;
  target: string;
  account: string;
  action: string;
  sourceIndex?: string;
  src_ip?: string;
  event_source?: string;
  rule_id?: string;
  pattern_type?: string;
  drsUri?: string;
  [key: string]: string | number | boolean | null | undefined;
};

type DashboardData = {
  securityCount: number;
  auditCount: number;
  threatCount: number;
  events: UnifiedEvent[];
  topSourceIps: Bucket[];
  topRules: Bucket[];
  topCountries: Bucket[];
  topEventSources: Bucket[];
};

const TopListCard = ({
  title,
  rows,
  color,
}: {
  title: string;
  rows: Bucket[];
  color: string;
}) => {
  const maxCount = rows.reduce((max, row) => Math.max(max, row.count), 0);

  return (
    <Paper withBorder radius="lg" p="md" style={{ minHeight: 220 }}>
      <Text fw={700} mb="sm">{title}</Text>
      {rows.length === 0 ? (
        <Text c="dimmed" size="sm">No data available.</Text>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.slice(0, 8).map((row) => {
            const width = maxCount > 0 ? `${Math.max(8, Math.round((row.count / maxCount) * 100))}%` : '8%';
            return (
              <div key={row.key}>
                <Group justify="space-between" gap="xs">
                  <Text size="xs" truncate>{row.key || '-'}</Text>
                  <Text size="xs" fw={700}>{row.count.toLocaleString()}</Text>
                </Group>
                <div style={{ height: 6, borderRadius: 999, background: '#edf2f7', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width,
                      background: color,
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Paper>
  );
};

const KpiCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Paper withBorder radius="lg" p="md" style={{ minHeight: 110 }}>
    <Group justify="space-between" align="center">
      <Text size="sm" c="dimmed" fw={600}>
        {title}
      </Text>
      <ThemeIcon size="lg" radius="md" variant="light" color={color}>
        {icon}
      </ThemeIcon>
    </Group>
    <Text size="2rem" fw={800} mt={8}>
      {value.toLocaleString()}
    </Text>
  </Paper>
);

type DashboardProps = NavPageLayoutProps & {
  dashboardData: DashboardData;
  dataError: string | null;
};

const SecurityDashboardPage = ({
  headerProps,
  footerProps,
  dashboardData,
  dataError,
}: DashboardProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const data = dashboardData;

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    try {
      await router.replace(router.asPath);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const totalSignals = useMemo(
    () => data.securityCount + data.auditCount + data.threatCount,
    [data.auditCount, data.securityCount, data.threatCount]
  );

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'SIEM Dashboard',
        content: 'Unified SOC View',
        key: 'vectis-siem-dashboard',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)',
          overflowY: 'auto',
          paddingBottom: 96,
          boxSizing: 'border-box',
        }}
      >
        {/* Header bar */}
        <div style={{ flexShrink: 0, padding: '12px 24px 0' }}>
          <Paper
            withBorder
            radius="xl"
            p="md"
            mb="sm"
            style={{
              background:
                'linear-gradient(120deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.1) 60%, rgba(14,116,144,0.08) 100%)',
            }}
          >
            <Group justify="space-between" align="center">
              <div>
                <Group gap="xs" mb={4}>
                  <Badge color="teal" variant="light">
                    Security Operations
                  </Badge>
                  <Badge color={dataError ? 'red' : 'green'} variant="dot">
                    {dataError ? 'Data degraded' : 'Data live'}
                  </Badge>
                </Group>
                <Title order={4} fw={600} style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.01em' }}>SIEM Command Center</Title>
                <Text c="dimmed" size="xs" style={{ fontFamily: 'Poppins, sans-serif' }}>Unified SOC view across WAF, Audit, and Threat Intelligence.</Text>
              </div>
              <Group>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={isLoading ? <Loader size={12} /> : <IconRefresh size={13} />}
                  onClick={loadOverview}
                  disabled={isLoading}
                >
                  Refresh
                </Button>
                <Link href="/SecurityTimeline">
                  <Button size="xs" leftSection={<IconTimeline size={14} />} color="blue">
                    Timeline
                  </Button>
                </Link>
              </Group>
            </Group>
          </Paper>

          {dataError ? (
            <Alert color="red" icon={<IconAlertCircle size={16} />} title="Data load failed" mb="xs">
              {dataError}. Refresh when backend services recover.
            </Alert>
          ) : null}

          <SimpleGrid cols={{ base: 2, sm: 4 }} mb="sm">
            <KpiCard title="WAF Events" value={data.securityCount} icon={<IconShield size={18} />} color="blue" />
            <KpiCard title="Audit Events" value={data.auditCount} icon={<IconBolt size={18} />} color="violet" />
            <KpiCard title="Threat Indicators" value={data.threatCount} icon={<IconAlertCircle size={18} />} color="red" />
            <KpiCard title="Total Signals" value={totalSignals} icon={<IconTimeline size={18} />} color="orange" />
          </SimpleGrid>

          <Divider mb="xs" />
        </div>

        {/* Cross-source Perspective table — fills remaining viewport */}
        <div style={{ padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
            <TopListCard title="Top Source IPs" rows={data.topSourceIps} color="#2f9e44" />
            <TopListCard title="Top WAF Rules" rows={data.topRules} color="#1c7ed6" />
            <TopListCard title="Top Countries" rows={data.topCountries} color="#ae3ec9" />
            <TopListCard title="Audit Event Sources" rows={data.topEventSources} color="#e8590c" />
          </SimpleGrid>

        </div>
      </div>
    </NavPageLayout>
  );
};

const emptyDashboardData: DashboardData = {
  securityCount: 0,
  auditCount: 0,
  threatCount: 0,
  events: [],
  topSourceIps: [],
  topRules: [],
  topCountries: [],
  topEventSources: [],
};

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (context) => {
  const baseProps = await getNavPageLayoutPropsFromConfig();

  const siemBaseUrl = process.env.SIEM_SERVICE_URL
    ? process.env.SIEM_SERVICE_URL
    : process.env.SIEM_SERVICE_DNS
      ? `http://${process.env.SIEM_SERVICE_DNS}:8000`
      : 'http://siem-service.gen3.svc.cluster.local:8000';

  try {
    const cookieHeader = context.req.headers.cookie;
    const authHeader = context.req.headers.authorization;
    const response = await fetch(`${siemBaseUrl}/siem/overview`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(typeof cookieHeader === 'string' ? { cookie: cookieHeader } : {}),
        ...(typeof authHeader === 'string' ? { authorization: authHeader } : {}),
      },
      body: JSON.stringify({ page: { limit: 500, offset: 0 }, filters: {} }),
    });

    if (!response.ok) {
      throw new Error(`SIEM request failed: ${response.status}`);
    }

    const payload = await response.json();

    return {
      props: {
        ...baseProps,
        dashboardData: {
          securityCount: Number(payload?.totals?.waf || 0),
          auditCount: Number(payload?.totals?.audit || 0),
          threatCount: Number(payload?.totals?.threat || 0),
          events: payload?.events || [],
          topSourceIps: payload?.topSourceIps || [],
          topRules: payload?.topRules || [],
          topCountries: payload?.topCountries || [],
          topEventSources: payload?.topEventSources || [],
        },
        dataError: null,
      },
    };
  } catch (error: any) {
    return {
      props: {
        ...baseProps,
        dashboardData: emptyDashboardData,
        dataError: error?.message || 'Failed to load SIEM dashboard data',
      },
    };
  }
};

export default SecurityDashboardPage;
