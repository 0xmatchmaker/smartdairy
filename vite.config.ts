import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  
  return {
    base: '/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      },
      extensions: ['.js', '.ts', '.vue']
    },
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
      __STORAGE_TYPE__: JSON.stringify(env.VITE_STORAGE_TYPE)
    },
    build: {
      rollupOptions: {
        // 确保 Vant 组件被正确打包
        external: [],
        output: {
          manualChunks: {
            'vant': ['vant']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['vant']
    }
  }
}) 