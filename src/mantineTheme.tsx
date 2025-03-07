import { createTheme, mergeThemeOverrides } from '@mantine/core';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { TenStringArray, createMantineTheme } from '@gen3/frontend';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const themeColors: Record<string, TenStringArray> = require(`../config/${GEN3_COMMONS_NAME}/themeColors.json`);

const gen3Theme = createMantineTheme(
    {
      heading: ['Poppins', 'sans-serif'],
      content: ['Poppins', 'sans-serif'],
      fontFamily: 'Poppins',
    },
    themeColors
  );
const localTheme = createTheme({
  components: {/*Add components overrides here},*/}
});

export default mergeThemeOverrides(gen3Theme, localTheme);
