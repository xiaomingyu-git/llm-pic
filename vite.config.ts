import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),
    // Element Plus 自动导入插件
    Components({
      resolvers: [ElementPlusResolver({
        importStyle: false
      })],
      dts: true,
      directoryAsNamespace: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/]
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true,
      vueTemplate: true,
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true
      }
    }),
    // 构建分析插件
    process.env.ANALYZE && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // 生产环境关闭sourcemap减少体积
    minify: 'esbuild', // 使用默认的esbuild压缩器
    rollupOptions: {
      output: {
        // 优化的代码分割策略
        manualChunks: (id) => {
          // Vue生态单独分包
          if (id.includes('vue') && !id.includes('element-plus')) {
            return 'vue-vendor';
          }

          // Element Plus单独分包
          if (id.includes('element-plus')) {
            return 'element-plus';
          }

          // 工具库单独分包
          if (id.includes('axios')) {
            return 'utils';
          }

          // Mermaid及其依赖进一步拆分
          if (id.includes('mermaid')) {
            // 将mermaid核心与其他依赖分离
            if (id.includes('mermaid') && !id.includes('mermaid/dist/')) {
              return 'mermaid-core';
            }
            return 'mermaid';
          }

          // 图表相关库单独分包
          if (id.includes('d3') || id.includes('dagre') || id.includes('cytoscape')) {
            return 'chart-libs';
          }

          // KaTeX数学公式库单独分包
          if (id.includes('katex')) {
            return 'katex';
          }
        },

        // chunk文件名优化
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            const fileName = facadeModuleId.split('/').pop()?.replace(/\.[^.]*$/, '')
            return `js/${fileName}-[hash].js`
          }
          return 'js/[name]-[hash].js'
        },

        // 资源文件名优化
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name || '')) {
            return `media/[name]-[hash][extname]`
          }
          if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name || '')) {
            return `images/[name]-[hash][extname]`
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name || '')) {
            return `fonts/[name]-[hash][extname]`
          }
          return `${ext}/[name]-[hash][extname]`
        }
      },
    },

    // chunk大小警告限制 - 调整为1500KB
    chunkSizeWarningLimit: 1500,
  },

  // 依赖预构建优化 - 修复Mermaid动态导入问题
  optimizeDeps: {
    include: [
      'vue',
      'element-plus',
      'axios',
      'mermaid'
    ],
  },
})
