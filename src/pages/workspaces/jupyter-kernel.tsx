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

// NEXT_PUBLIC_JEG_ENABLED is baked at build time. Set it alongside ENABLE_JEG (server-side)
// in your deployment environment when Jupyter Enterprise Gateway is configured.
const jegEnabled = process.env.NEXT_PUBLIC_JEG_ENABLED === 'true';
const dictionarySchemaUrl =
  process.env.NEXT_PUBLIC_DICTIONARY_SCHEMA_URL ||
  '/api/v0/submission/_dictionary/_all';

const JupyterKernelWorkspacePage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const {
    data: userData,
    isFetching,
    isUninitialized,
    loginStatus,
  } = useUserAuth(false);
  const [workspaceMaximized, setWorkspaceMaximized] = useState(false);
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

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Jupyter Kernel Workspace',
        content: 'Secure notebook workspace (Remote Tier)',
        key: 'gen3-jupyter-kernel-workspace',
      }}
      mainProps={{ fixed: true }}
    >
      {isDevelopment ? (
        <HostedWorkspaceExperience
          initialTier="remote"
          leftPanel={<DataToolsPanel schemaUrl={dictionarySchemaUrl} />}
          authContext={authContext}
          accessPolicy={{
            requireUsername: false,
            requireJwt: false,
            allowLocalDevBypass: true,
          }}
          localDevBypassEnabled={true}
          gatewayBaseUrl="/lw-workspace/proxy"
          workspaceProxyBaseUrl="/api/workspace/kernel"
          hatcheryBaseUrl="/lw-workspace"
          freeAssetBaseUrl="/api/workspace-assets/free"
          remoteAssetBaseUrl="/api/workspace-assets/remote"
          microContainerConfig={{
            identifierTag: process.env.NEXT_PUBLIC_MICRO_CONTAINER_TAG || 'micro-notebook-dev',
          }}
          jegEnabled={jegEnabled}
          jegGatewayBaseUrl="/lw-workspace/proxy/jeg-panel"
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
          initialTier="remote"
          leftPanel={<DataToolsPanel schemaUrl={dictionarySchemaUrl} />}
          authContext={authContext}
          accessPolicy={{ requireUsername: true, requireJwt: false }}
          localDevBypassEnabled={false}
          gatewayBaseUrl="/lw-workspace/proxy"
          workspaceProxyBaseUrl="/api/workspace/kernel"
          hatcheryBaseUrl="/lw-workspace"
          freeAssetBaseUrl="/api/workspace-assets/free"
          remoteAssetBaseUrl="/api/workspace-assets/remote"
          microContainerConfig={{
            identifierTag: process.env.NEXT_PUBLIC_MICRO_CONTAINER_TAG || 'micro-notebook-dev',
          }}
          jegEnabled={jegEnabled}
          jegGatewayBaseUrl="/lw-workspace/proxy/jeg-panel"
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

export default JupyterKernelWorkspacePage;
