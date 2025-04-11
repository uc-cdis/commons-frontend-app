import React from 'react';
import { Card, Text, Grid } from '@mantine/core';
import Link from 'next/link';
import Image from 'next/image';
import AtlasLogo from './Icons/atlasLogo.svg';

const ResourcesData = [
  {
    title: 'OHDSI Atlas',
    link: '/OHDSIAtlas',
    summary:
      'Use this App for cohort creation. These will be automatically populated in the Gen3 GWAS App',
    imageSrc: AtlasLogo,
  },
];
const ResourceBrowser = () => {
  return (
    <div className="p-5">
      <div className="flex justify-between py-4">
        <h1 className="text-3xl pb-5 font-medium">Apps</h1>
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
