import { Config } from '@stencil/core';
import { sass } from '@stencil/sass'


export const config: Config = {
  namespace: 'sten-components',
  globalStyle: './node_modules/@learnD3/theme/lib/index.css',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  testing: {
    browserHeadless: "shell",
  },
  plugins: [
    sass({
      // injectGlobalPaths 数组 全局通用的sass变量
    })
  ]
};
