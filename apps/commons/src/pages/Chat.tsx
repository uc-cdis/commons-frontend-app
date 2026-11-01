import type { NavPageLayoutProps } from "@gen3/frontend";
import { getNavPageLayoutPropsFromConfig, NavPageLayout } from "@gen3/frontend";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { ChatRuntimeProvider } from "@/chat/ChatRuntimeProvider";

const ChatLoading = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-base-darkest" />
  </div>
);

// Chat reaches @copilotkit/react-core through useChat. Keep it out of the module
// graph this page is evaluated with on the server: _app never renders on the server,
// but the page module is still required there because getServerSideProps lives in it.
const Chat = dynamic(() => import("@gen3/chat/ui").then((m) => m.Chat), {
  ssr: false,
  loading: () => <ChatLoading />,
});

const ChatPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      mainProps={{ fixed: true }}
      headerMetadata={{
        title: "Genomics Explorer",
        content: "Ask questions about GDC data",
        key: "gac-chat-page",
      }}
    >
      <ChatRuntimeProvider>
        <Chat agentId="default" />
      </ChatRuntimeProvider>
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<NavPageLayoutProps> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default ChatPage;
