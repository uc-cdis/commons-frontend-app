import { KeyboardEvent } from 'react';

const isEnterOrSpace = (event: KeyboardEvent) =>
  event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar';

export default isEnterOrSpace;
