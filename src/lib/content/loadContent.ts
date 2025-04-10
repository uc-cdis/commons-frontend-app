import {
  ContentSource,
  Fonts,
  RegisteredIcons,
  TenStringArray,
} from '@gen3/frontend';
import { GEN3_COMMONS_NAME } from '@gen3/core';

export const loadContent = async () => {
  const modals = await ContentSource.getContentDatabase().get(
    `${GEN3_COMMONS_NAME}/modals.json`,
  );
  const session = await ContentSource.getContentDatabase().get(
    `${GEN3_COMMONS_NAME}/session.json`,
  );

  const fonts = await ContentSource.getContentDatabase().get(
    `${GEN3_COMMONS_NAME}/themeFonts.json`,
  );

  const themeColors = await ContentSource.getContentDatabase().get(
    `${GEN3_COMMONS_NAME}/themeColors.json`,
  );

  const colors = Object.fromEntries(
    Object.entries(themeColors).map(([key, values]) => [
      key,
      Object.values(values) as TenStringArray,
    ]),
  );

  const icons = await ContentSource.getContentDatabase().getAll(
    `icons/`,
    '\\.json',
  );
  return {
    modalsConfig: modals,
    sessionConfig: 'sessionConfig' in session ? session.sessionConfig : session,
    themeFonts: fonts as Fonts,
    colors: colors,
    icons: icons as RegisteredIcons[],
  };
};
