import React from 'react';
import ReturnHomeButton from './ReturnHomeButton/ReturnHomeButton';
import { Title } from '@mantine/core';

const DetailPageHeader = ({ pageTitle }: {pageTitle: string} )=> (
  <div className='details-page-header flex'>
    <ReturnHomeButton />
    <Title order={2}>{pageTitle}</Title>
  </div>
);

export default DetailPageHeader;
