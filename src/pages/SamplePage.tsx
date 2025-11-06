import React from 'react';
import {
  Center,
  Text,
  Paper,
  BackgroundImage,
  Image,
  Grid,
  SimpleGrid,
  Stack,
} from '@mantine/core';
import { UnstyledButton } from '@mantine/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';
import InfoCard from '@/components/InfoCard';
import ArrowLink from '@/components/ArrowLink';

const SamplePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'M3 AI Commons',
        content: 'Landing page',
        key: 'm3-landing-page',
      }}
    >
      <div className="flex flex-col w-full">
        <div className="w-full h-96 relative">
          <BackgroundImage
            src="/images/frequency-wave-7776034_1920-3.png"
            className="p-20"
          >
            <div className="justify-start text-white text-4xl font-bold font-['Poppins']">
              M3 AI Commons
            </div>
            <div className="justify-start text-white text-2xl font-semibold font-['Poppins'] my-4">
              Powerful AI tools available alongside core data commons
              capabilities.
            </div>
            <div className="w-[1040px] h-20 justify-start">
              <span className="text-white text-sm font-bold font-['Poppins']">
                The M3 AI commons
              </span>
              <span className="text-white text-sm font-normal font-['Poppins']">
                {' '}
                is a cloud-based data platform with a governance structure and
                architecture for managing, analyzing, and sharing data and AI
                resources supporting: multi-modal AI embeddings, AI inferencing,
                building AI models, and natural language interactions. One
                over-arching mission of the M3 AI Commons is to make readily
                accessible small to midscale AI models trained over high-quality
                data leveraging affordable compute resources without sacrificing
                performance comparable to high-cost frontier models.
              </span>
            </div>
            <UnstyledButton
              className={
                'mt-10 px-4 py-3 bg-white/25 rounded outline outline-1 outline-offset-[-1px] outline-white inline-flex justify-start items-center gap-2.5'
              }
            >
              <div className="justify-start text-white text-sm font-semibold font-['Poppins'] leading-4">
                Explore M3 AI Commons
              </div>
            </UnstyledButton>
          </BackgroundImage>
        </div>
        <div className="bg-[#f3f6f9] p-20 flex flex-col">
          <div className="flex flex-col justify-center items-center">
            <div className="w-16 h-16">
              <Image
                src="/icons/M3-Logomark-RGB.svg"
                alt="M3 AI Commons Logo"
                w="auto"
                fit="contain"
                height={64}
              />
            </div>
            <div className="text-center justify-start text-[#111111] text-2xl font-semibold font-['Poppins']">
              AI Commons Core Services
            </div>
            <SimpleGrid
              cols={3}
              spacing="xl"
              verticalSpacing="xl"
              className="mt-10"
            >
              <InfoCard
                title="FAIR Data"
                description="CTDS and Gen3 remain globally recognized leaders in FAIR data sharing platforms ensuring secure AI-ready data."
                imgSrc="/icons/Icon-FD.svg"
              />
              <InfoCard
                title="Embedding Service"
                description="M3 AI Commons embedding-centric approach, including vector store and API, in tandem with Gen3 narrow-middle architecture provides flexible scalability."
                imgSrc="/icons/Icon-ES.svg"
              />
              <InfoCard
                title="Model Inference Services"
                description="Share inferencing workflows with selected models leveraging prompt-based or batch-based inferencing."
                imgSrc="/icons/Icon-MIS.svg"
              />
              <InfoCard
                title="Model Training Services"
                description="Build and train machine learning and small to midscale AI models over data in a federated Commons leveraging Jupyter notebooks in cloud-based workspaces and containerized workflow execution services."
                imgSrc="/icons/Icon-MTS.svg"
              />
              <InfoCard
                title="Model Repository Services"
                description="Store models that can be retrieved by the model inference service, as well as models produced by the model training services."
                imgSrc="/icons/Icon-MRS.svg"
              />
              <InfoCard
                title="Agentic Interfaces"
                description="Query and manage AI-ready data leveraging LLM and AI agentic services interoperating with the commons."
                imgSrc="/icons/Icon-AI.svg"
              />
            </SimpleGrid>
          </div>
        </div>

        <BackgroundImage
          src="/images/mesh-1430107_1920_top.png"
          className="flex justify-between p-20 h-96"
        >
          <div className="w-[32rem] h-32 justify-start">
            <span className="text-[#002a3a] text-4xl font-normal font-['Poppins'] leading-snug">
              Learn More About <br />
              the University of Chicago
            </span>
            <span className="text-[#002a3a] text-4xl font-bold font-['Poppins'] leading-snug">
              {' '}
              <br />
              M3 Meshes of Midscale Models Initiative
            </span>
          </div>
          <Stack align="stretch" justify="center" gap="md">
            <ArrowLink
              href="https://www.m3.chicagolabs.org/m3-midscale-models-initiative"
              text="M3 Initiative"
            />
            <ArrowLink
              href="https://www.m3.chicagolabs.org/m3-midscale-models-initiative"
              text="M3 AI Models"
            />
            <ArrowLink
              href="https://www.m3.chicagolabs.org/m3-midscale-models-initiative"
              text="M3 AI Tools"
            />
          </Stack>
        </BackgroundImage>
      </div>
    </NavPageLayout>
  );
};

// TODO: replace this with a custom getServerSideProps function
export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default SamplePage;
