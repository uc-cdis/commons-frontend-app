import { type RegisteredIcons } from '@gen3/frontend';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const gen3Icons: RegisteredIcons = require(
  `../config/icons/gen3.json`,
);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorIcons: RegisteredIcons = require(
  `../config/icons/color.json`,
);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dictionaryIcons: RegisteredIcons = require(
  `../config/icons/dataDictionary.json`,
);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const workspaceIcons: RegisteredIcons = require(
  `../config/icons/workspace.json`,
);


const icons: RegisteredIcons[] = [
  gen3Icons,
  colorIcons,
  dictionaryIcons,
  workspaceIcons,
];

export default icons;
