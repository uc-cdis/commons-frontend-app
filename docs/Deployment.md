# Deployment types for commons-frontend-app

Therre are two chocies for deployment:

Fork or create from template this repository to deploy commons-frontend-app with your own configuration and repository.

Deploy commons-frontend-app with helm chart. To do this you need create a config repository (or use existing).
The config repository contains the config and public directories used by the gen3-frontend-framework, it needs to have the
 following structure:

directoryName | gen3/config/
directoryName | gen3/public/

To deploy commons-frontend-app with helm chart set up the helm chart values:

```yaml
frontend-framework:
  enabled: true
  customConfig:
    enabled: true
    repo: https://github.com/somerepository/gen3ff-commons-config.git
    branch: main
    dir: directoryName (optional)
  image:
    repository: quay.io/cdis/commons-frontend-app
    tag: main
```
