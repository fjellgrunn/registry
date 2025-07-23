interface DocsConfig {
  projectName: string;
  basePath: string;
  port: number;
  branding: {
    theme: string;
    tagline: string;
    logo?: string;
    backgroundImage?: string;
    primaryColor?: string;
    accentColor?: string;
    github?: string;
    npm?: string;
  };
  sections: Array<{
    id: string;
    title: string;
    subtitle: string;
    file: string;
  }>;
  filesToCopy: Array<{
    source: string;
    destination: string;
  }>;
  plugins?: any[];
  version: {
    source: string;
  };
  customContent?: {
    [key: string]: (content: string) => string;
  };
}

const config: DocsConfig = {
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

export default config
