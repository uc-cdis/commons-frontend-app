import React, { useContext } from 'react';
import { ActionIcon } from '@mantine/core';
import { IconCircleArrowLeftFilled } from '@tabler/icons-react';
import SharedContext from '../../../Utils/SharedContext';
import VIEWS from '../../../Utils/ViewsEnumeration';

const ReturnHomeButton = () => {
  const { setCurrentView } = useContext(SharedContext);
  if (!setCurrentView) {
    throw new Error('setCurrentView is not defined in SharedContext');
  }
  return (
    <ActionIcon
      variant="transparent"
      classNames={{
        root: 'return-home-button',
        icon: 'text-gray-600 hover:text-gray-800',
      }}
      size="xl"
      aria-label="Back to home"
      onClick={() => setCurrentView(VIEWS.home)}
    >
      <IconCircleArrowLeftFilled className='w-full h-full' />
    </ActionIcon>
  );
};
export default ReturnHomeButton;
