// server/plugins.js

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

if (!fs.existsSync(path.join(process.cwd(), 'config', 'plugins.json'))) {
  console.log('No plugins to generate.');
  return;
}

console.log('Generating plugins...');

const plugins = JSON.parse(
  fs
    .readFileSync(path.join(process.cwd(), 'config', 'plugins.json'))
    .toString('utf-8'),
);
const imports = plugins
  .map(
    (plugin) =>
      `import { registerApp as registerApp${plugin.name} } from "${plugin.module}";`,
  )
  .join('\n');
const register = plugins
  .map((plugin) => `registerApp${plugin.name}();`)
  .join('\n');
fs.writeFileSync(
  path.join(process.cwd(), 'config', 'registerSitePlugins.js'),
  `${imports}
  export const registerSitePlugins = () => {
    ${register}
  };
  `,
);
