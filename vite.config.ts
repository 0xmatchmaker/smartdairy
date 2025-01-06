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
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
      __STORAGE_TYPE__: JSON.stringify(env.VITE_STORAGE_TYPE)
    }
  }
}) 