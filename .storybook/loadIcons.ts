import { type RegisteredIcons } from '@gen3/frontend';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import gen3Icons from '../config/icons/gen3.json';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import colorIcons from '../config/icons/color.json'

// eslint-disable-next-line @typescript-eslint/no-var-requires
import dictionaryIcons from
  '../config/icons/dataDictionary.json'

// eslint-disable-next-line @typescript-eslint/no-var-requires
import workspaceIcons from
  '../config/icons/workspace.json';

const icons: RegisteredIcons[] = [
  gen3Icons,
  colorIcons,
  dictionaryIcons,
  workspaceIcons,
];

export default icons;
