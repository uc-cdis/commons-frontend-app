import React, { useEffect, useMemo, useState } from 'react';
import type { GetServerSideProps } from 'next';
import {
  NavPageLayout,
  type NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';
import { useUserAuth } from '@gen3/core';
import {
  HostedWorkspaceExperience,
  DataToolsPanel,
  type WorkspaceAuthContext,
} from '@gen3/jupyter-workspaces';

const dictionarySchemaUrl =
  process.env.NEXT_PUBLIC_DICTIONARY_SCHEMA_URL ||
  '/api/v0/submission/_dictionary/_all';

const JupyterLiteWorkspacePage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isRemoteTierPage = false;
  const {
    data: userData,
    isFetching,
    isUninitialized,
    loginStatus,
  } = useUserAuth(false);
  const [workspaceMaximized, setWorkspaceMaximized] = useState(false);
  const [gatewayUnavailable, setGatewayUnavailable] = useState(false);
  const username =
    userData?.username ||
    userData?.preferred_username ||
    userData?.email ||
    undefined;
  const isAuthLoading = isUninitialized || isFetching;

  const authContext = useMemo<WorkspaceAuthContext>(
    () => {
      if (isDevelopment) {
        return {
          username: username || 'dev-local-user',
          jwt: 'dev-local-token',
          rbac: userData?.authz ? Object.keys(userData.authz) : [],
          abac: { devBypass: true },
        };
      }

      return {
        username,
        rbac: userData?.authz ? Object.keys(userData.authz) : [],
        abac: {},
      };
    },
    [isDevelopment, userData, username],
  );

  useEffect(() => {
    const root = document.documentElement;
    if (workspaceMaximized) {
      root.classList.add('gen3-workspace-maximized');
    } else {
      root.classList.remove('gen3-workspace-maximized');
    }
    return () => {
      root.classList.remove('gen3-workspace-maximized');
    };
  }, [workspaceMaximized]);

  useEffect(() => {
    if (!isRemoteTierPage) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    fetch('/api/workspace/kernel/api/status', {
      method: 'GET',
      signal: controller.signal,
    })
      .then((response) => {
        setGatewayUnavailable(!response.ok);
      })
      .catch(() => {
        setGatewayUnavailable(true);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isRemoteTierPage]);

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Jupyter Lite Workspace',
        content: 'Secure notebook workspace (Free Tier)',
        key: 'gen3-jupyter-lite-workspace',
      }}
      mainProps={{ fixed: true }}
    >
      {isRemoteTierPage && gatewayUnavailable ? (
        <div className="flex h-full min-h-[40vh] w-full items-center justify-center px-6 py-10">
          <div className="max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Remote kernel gateway is temporarily unavailable. Please retry in a moment or use
            the Jupyter Lite workspace while the backend is starting.
          </div>
        </div>
      ) : isDevelopment ? (
        <HostedWorkspaceExperience
          initialTier="free"
          leftPanel={<DataToolsPanel schemaUrl={dictionarySchemaUrl} />}
          authContext={authContext}
          accessPolicy={{
            requireUsername: false,
            requireJwt: false,
            allowLocalDevBypass: true,
          }}
          localDevBypassEnabled={true}
          gatewayBaseUrl="/api/workspace/kernel"
          hatcheryBaseUrl="/api/workspace/hatchery"
          freeAssetBaseUrl="/api/workspace-assets/free"
          remoteAssetBaseUrl="/api/workspace-assets/remote"
          onToggleHostChrome={setWorkspaceMaximized}
        />
      ) : isAuthLoading ? (
        <div className="flex h-full min-h-[40vh] w-full items-center justify-center px-6 py-10">
          <p className="text-sm font-medium text-slate-600">Loading workspace session...</p>
        </div>
      ) : !authContext.username && loginStatus !== 'authenticated' ? (
        <div className="flex h-full min-h-[40vh] w-full items-center justify-center px-6 py-10">
          <div className="max-w-lg rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Please sign in to launch Jupyter Workspace.
          </div>
        </div>
      ) : (
        <HostedWorkspaceExperience
          initialTier="free"
          leftPanel={<DataToolsPanel schemaUrl={dictionarySchemaUrl} />}
          authContext={authContext}
          accessPolicy={{ requireUsername: true, requireJwt: false }}
          localDevBypassEnabled={false}
          gatewayBaseUrl="/api/workspace/kernel"
          hatcheryBaseUrl="/api/workspace/hatchery"
          freeAssetBaseUrl="/api/workspace-assets/free"
          remoteAssetBaseUrl="/api/workspace-assets/remote"
          onToggleHostChrome={setWorkspaceMaximized}
        />
      )}
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default JupyterLiteWorkspacePage;
