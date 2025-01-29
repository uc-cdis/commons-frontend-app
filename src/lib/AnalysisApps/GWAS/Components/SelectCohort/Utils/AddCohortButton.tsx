import React from 'react';
import { Button } from '@mantine/core';
import { useRouter } from 'next/router';

const AddCohortButton = () => {
  const router = useRouter();
  const atlasLink = '/OHDSIAtlas';

  const handleOpenLink = () => {
    window.open(router.basePath + atlasLink, '_blank', 'noopener,noreferrer');
  };
  return (
    <Button data-tour="cohort-add" onClick={handleOpenLink}>
      Add New Cohort
    </Button>
  );
};

export default AddCohortButton;
