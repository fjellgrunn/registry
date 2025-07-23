interface DocsConfig {
  projectName: string;
  basePath: string;
  port: number;
  branding: {
    theme: string;
    backgroundImage?: string;
  };
  sections: Array<{
    id: string;
    title: string;
    subtitle: string;
    file: string;
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
  projectName: 'fjell-http-api',
  basePath: '/http-api/',
  port: 3002,
  branding: {
    theme: 'http-api',
    backgroundImage: '/pano.png'
  },
  sections: [
    {
      id: 'overview',
      title: 'Foundation',
      subtitle: 'Core concepts & philosophy',
      file: ''
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      subtitle: 'Your first HTTP API calls',
      file: ''
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      subtitle: 'Complete method documentation',
      file: ''
    },
    {
      id: 'examples',
      title: 'Examples',
      subtitle: 'Code examples & usage patterns',
      file: '/http-api/examples/README.md'
    }
  ],
  plugins: [],
  version: {
    source: 'package.json'
  },
  customContent: {
    'overview': () => {
      return `# Foundation

Core concepts and philosophy behind Fjell HTTP API.

This library provides a simple and powerful HTTP client for making API requests with comprehensive error handling and response parsing.`;
    },
    'getting-started': () => {
      return `# Getting Started

Your first HTTP API calls with Fjell.

## Installation

\`\`\`bash
npm install @fjell/http-api
\`\`\`

## Basic Usage

\`\`\`typescript
import { HttpClient } from '@fjell/http-api'

const client = new HttpClient({
  baseURL: 'https://api.example.com'
})

const response = await client.get('/users')
\`\`\``;
    },
    'api-reference': () => {
      return `# API Reference

Complete method documentation for Fjell HTTP API.

## Methods

### GET Requests
### POST Requests
### PUT Requests
### DELETE Requests

Complete documentation coming soon...`;
    }
  }
}

export default config
