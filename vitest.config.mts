import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [
    storybookTest({ configDir: '.storybook' }),
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    // setupFiles not needed: since Storybook 10.3, addon-vitest auto-provisions
    // preview annotations (decorators, a11y afterEach, etc.)
  },
});
