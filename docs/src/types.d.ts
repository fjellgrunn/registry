declare module '@fjell/docs-template' {
  export * from '../../../fjell-docs-template/src/types'
  export { DocsApp } from '../../../fjell-docs-template/src/components/DocsApp'
}

declare module '../docs.config.js' {
  import type { DocsConfig } from '@fjell/docs-template'
  const config: DocsConfig
  export default config
}
