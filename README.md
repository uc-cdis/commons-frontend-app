

This is the base REPOSITORY or TEMPLATE for
Gen3.2 data commons.


## Getting Started

## Installation

The minimum node version is set to v20.11.0 only from an LTS perspective.
Node can be downloaded from the official Node.js site. You may also consider using a [Node version manager](https://docs.npmjs.com/cli/v7/configuring-npm/install#using-a-node-version-manager-to-install-nodejs-and-npm).
Your version of Node may not ship with npm v10. To install it, run:

```bash
npm install npm@10.2.4 -g
```

Note: if you see this error:
```
npm ERR! code ENOWORKSPACES
npm ERR! This command does not support workspaces.
```
you can run ```npx next telemetry disable```

Alterntively, you can use `nvm` to install the correct version of npm:
```bash
nvm install 20.11.0
```

### Install Dependencies

From the root of the project, install dependencies by running:

```bash
npm install
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
