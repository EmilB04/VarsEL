import { boot } from 'quasar/wrappers'
import axios, { type AxiosInstance } from 'axios'

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
    $api: AxiosInstance
  }
}

// Use environment variable from Vite
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
