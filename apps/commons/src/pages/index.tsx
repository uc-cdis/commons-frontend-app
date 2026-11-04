import React from "react";
import { Image, SimpleGrid, Group, Button } from "@mantine/core";
import type { NavPageLayoutProps } from "@gen3/frontend";
import { getNavPageLayoutPropsFromConfig, NavPageLayout } from "@gen3/frontend";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import InfoCard from "@/components/InfoCard";

interface LandingPageButtonProps {
  children: React.ReactNode;
  href: string;
}

/**
 * Button with the standard styling for the call to action buttons on the landing page.
 */
const LandingPageButton = ({ children, href }: LandingPageButtonProps) => (
  <Button component={Link} href={href} className="bg-secondary-lightest text-secondary border border-secondary">
    {children}
  </Button>
);

const SamplePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: "Genomic Intelligence Commons",
        content: "Landing page",
        key: "gac-landing-page",
      }}
    >
      <div className="flex flex-col w-full center">
        <div className="w-full h-[400px] relative center bg-[#F4F3F9]">
          <div
            className="h-[400px] flex items-center max-w-screen-lg m-auto"
            style={{
              backgroundImage: "url(/images/BackgroundNodes.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="basis-3/5">
              <h1 className="justify-start text-secondary text-3xl font-bold">
                Genomic Intelligence Commons
              </h1>
              <div className="justify-start text-primary font-semibold mt-3 mb-8">
                High-quality data. Right-sized deep learning models. <br/> Real discovery.
              </div>
              <div className="justify-start text-primary text-sm max-w-lg mb-8">
                The Genomic Intelligence Commons makes readily accessible small to midscale SI models trained over high-quality data leveraging affordable compute resources without sacrificing performance comparable to high-cost frontier models.
              </div>
              <Group>
                <LandingPageButton href="/Chat">Query Genomics Explorer</LandingPageButton>
                <LandingPageButton href="/Analysis">Run Analyses</LandingPageButton>
                <LandingPageButton href="/Models">Browse Models</LandingPageButton>
              </Group>
            </div>
            <div className="h-[400px] basis-2/5">
              <Image
                src="/images/BodyImages.png"
                alt="Stylized Human Body Images Male Female"
                className="object-scale-down h-[370px] my-[15px]"
              />
            </div>
          </div>
        </div>
        <div className="flex max-w-screen-lg m-auto py-12">
          <h2 className="basis-1/2 text-secondary text-4xl font-bold">
            A Cloud Platform for Genomic Data and SI
          </h2>
          <div className="basis-1/2">
            <div className="pb-6">
              Powerful SI tools available alongside core data commons capabilities.
            </div>
            <div className="text-sm">
              The Genomic Intelligence Commons is a cloud-based data platform with a governance structure and architecture for managing, analyzing, and sharing data and SI resources supporting: multi-modal SI embeddings, SI inferencing, building SI models, and natural language interactions.
            </div>
          </div>
        </div>

        <SimpleGrid cols={3} spacing="xl" verticalSpacing="xl" className="mb-8 max-w-screen-lg m-auto">
          <InfoCard
            title="FAIR Data"
            description="CTDS and Gen3 remain globally recognized leaders in FAIR data sharing platforms ensuring secure SI-ready data."
            imgSrc="/icons/Icon-FD.svg"
          />
          <InfoCard
            title="Embedding Service"
            description="Genomic Intelligence Commons embedding-centric approach, including vector store and API, in tandem with Gen3 narrow-middle architecture provides flexible scalability."
            imgSrc="/icons/Icon-ES.svg"
          />
          <InfoCard
            title="Model Inference Services"
            description="Share inferencing workflows with selected models leveraging prompt-based or batch-based inferencing."
            imgSrc="/icons/Icon-MIS.svg"
          />
          <InfoCard
            title="Model Training Services"
            description="Build and train machine learning and small to midscale SI models over data in a federated Commons leveraging Jupyter notebooks in cloud-based workspaces and containerized workflow execution services."
            imgSrc="/icons/Icon-MTS.svg"
          />
          <InfoCard
            title="Model Repository Services"
            description="Store models that can be retrieved by the model inference service, as well as models produced by the model training services."
            imgSrc="/icons/Icon-MRS.svg"
          />
          <InfoCard
            title="Agentic Interfaces"
            description="Query and manage SI-ready data leveraging LLM and SI agentic services interoperating with the commons."
            imgSrc="/icons/Icon-AI.svg"
          />
        </SimpleGrid>
        <div className="w-full h-[360px] relative bg-gradient-to-r from-[#1673A3] to-[#833689]">
          <div
            className="relative h-[360px] flex items-center"
            style={{
              backgroundImage: "url(/images/frequency-wave-7776034_1920-gdc.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex max-w-screen-lg m-auto text-3xl font-bold text-white text-center [text-shadow:_0_4px_4px_rgba(0,0,0,0.25)]">
              Our vision is to create an open, SI-enabled ecosystem that transforms genomic data into accessible knowledge and models, accelerating discovery, and advancing precision medicine.
            </div>
          </div>
        </div>
      </div>
    </NavPageLayout>
  );
};

// TODO: replace this with a custom getServerSideProps function
export const getServerSideProps: GetServerSideProps<NavPageLayoutProps> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default SamplePage;
