import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/nextjs-vite';
import * as a11yAnnotations from '@storybook/addon-a11y/preview';
import * as previewAnnotations from './preview';

// Registers global decorators, parameters, and the a11y addon's afterEach
// axe-core hook that replaces the test-runner's injectAxe / checkA11y pair.
const annotations = setProjectAnnotations([
  a11yAnnotations,
  previewAnnotations,
]);

beforeAll(annotations.beforeAll);
