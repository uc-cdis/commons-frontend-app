import React from 'react';
import { Card, Text, Grid } from '@mantine/core';
import Link from 'next/link';
import Image from 'next/image';
import GWASUIApp from './Icons/GWASUIApp.svg';
import GWASResults from './Icons/GWASResults.svg';
import AtlasLogo from './Icons/atlasLogo.svg';
import DataDictionary from './Icons/dataDictionary.svg';
import TeamProjectHeader from '../SharedUtils/TeamProject/TeamProjectHeader/TeamProjectHeader';

const ResourcesData = [
  {
    title: 'OHDSI Atlas',
    link: '/OHDSIAtlas',
    summary:
      'Use this App for cohort creation. These will be automatically populated in the Gen3 GWAS App',
    imageSrc: AtlasLogo,
  },
  {
    title: 'Gen3 GWAS',
    link: '/GWASUIApp',
    summary:
      'Use this App to perform high throughput GWAS on Million Veteran Program (MVP) data, using the University of Washington Genesis pipeline',
    imageSrc: GWASUIApp,
  },
  {
    title: 'GWAS Results',
    link: '/GWASResults',
    summary: 'Use this App to view status & results of submitted workflows',
    imageSrc: GWASResults,
  },
  {
    title: 'MVP Data Dictionary',
    link: '/AtlasDataDictionary',
    summary:
      'Use this App to view a tabluar representation of the MVP data dictionary',
    imageSrc: DataDictionary,
  },
];
const ResourceBrowser = () => {
  return (
    <div className="p-5">
      <div className="flex justify-between py-4">
        <h1 className="text-3xl pb-5 font-medium">Apps</h1>
        <TeamProjectHeader isEditable />
      </div>

      <Grid gutter="lg">
        {ResourcesData.map((resource) => (
          <Grid.Col key={resource.title} span={{ base: 12, md: 6, lg: 4 }}>
            <Link href={resource.link} passHref>
              <Card
                className="w-full h-full flex flex-col"
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
              >
                <Text
                  className="text-center pb-2 text-2xl font-bold"
                  size="lg"
                  mt="md"
                >
                  {resource.title}
                </Text>
                <Text className="text-center flex-grow pb-4" size="sm">
                  {resource.summary}
                </Text>
                <Card.Section className="flex justify-center items-center h-[200px]">
                  <Image
                    src={resource.imageSrc}
                    className="max-h-full max-w-full object-contain"
                    alt=""
                  />
                </Card.Section>
              </Card>
            </Link>
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );
};

export default ResourceBrowser;
