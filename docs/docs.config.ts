import { DocsConfig } from '@fjell/docs-template';

const config = {
  projectName: 'Fjell Registry',
  basePath: '/registry/',
  port: 3001,
  branding: {
    theme: 'registry',
    tagline: 'Common Registry for Fjell',
    backgroundImage: '/pano.png',
    github: 'https://github.com/getfjell/registry',
    npm: 'https://www.npmjs.com/package/@fjell/registry'
  },
  sections: [
    {
      id: 'overview',
      title: 'Foundation',
      subtitle: 'Core concepts & philosophy',
      file: '/registry/README.md'
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      subtitle: 'Your first registry operations',
      file: '/registry/GETTING_STARTED.md'
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      subtitle: 'Complete method documentation',
      file: '/registry/API.md'
    },
    {
      id: 'client-api',
      title: 'Client API',
      subtitle: 'Comprehensive API operations & error handling',
      file: '/registry/client-api-overview.md',
      subsections: [
        {
          id: 'operations-overview',
          title: 'Operations Overview',
          subtitle: 'Complete guide to all API operations',
          file: '/registry/operations/README.md'
        },
        {
          id: 'all-operation',
          title: 'All Operation',
          subtitle: 'Retrieve multiple items with queries',
          file: '/registry/operations/all.md'
        },
        {
          id: 'create-operation',
          title: 'Create Operation',
          subtitle: 'Create new items with validation',
          file: '/registry/operations/create.md'
        },
        {
          id: 'get-operation',
          title: 'Get Operation',
          subtitle: 'Retrieve single items by key',
          file: '/registry/operations/get.md'
        },
        {
          id: 'error-handling',
          title: 'Error Handling',
          subtitle: 'Comprehensive error handling & resilience',
          file: '/registry/error-handling/README.md'
        },
        {
          id: 'network-errors',
          title: 'Network Errors',
          subtitle: 'Handle connection failures & timeouts',
          file: '/registry/error-handling/network-errors.md'
        },
        {
          id: 'configuration',
          title: 'Configuration',
          subtitle: 'API setup & configuration options',
          file: '/registry/configuration.md'
        }
      ]
    },
    {
      id: 'examples',
      title: 'Examples',
      subtitle: 'Code examples & usage patterns',
      file: '/registry/examples-README.md'
    }
  ],
  filesToCopy: [
    {
      source: '../README.md',
      destination: 'public/README.md'
    },
    {
      source: '../examples/README.md',
      destination: 'public/examples-README.md'
    },
    {
      source: '../GETTING_STARTED.md',
      destination: 'public/GETTING_STARTED.md'
    },
    {
      source: '../API.md',
      destination: 'public/API.md'
    }
  ],
  plugins: [],
  version: {
    source: 'package.json'
  }
}

export default config as DocsConfig
