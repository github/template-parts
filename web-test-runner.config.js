import {esbuildPlugin} from '@web/dev-server-esbuild'
export default {
  files: 'test/',
  nodeResolve: true,
  testFramework: {
    config: {timeout: '100'}
  },
  plugins: [esbuildPlugin({ts: true})]
}
