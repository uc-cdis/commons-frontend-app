import type { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig, ContentSource } from '@gen3/frontend';
import type { NavPageLayoutProps } from '@gen3/frontend';

export const ModelsCatalogPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        headerProps: {
          topBar: {
            items: [],
          },
          navigation: {},
        },
        footerProps: {},
        headerMetadata: {
          title: 'Gen3 Model Catalog',
          content: 'Model Catalog',
          key: 'gen3-model-catalog-page',
        },
      },
    };
  }
};
