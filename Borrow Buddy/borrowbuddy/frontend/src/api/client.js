import axios from 'axios'

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')
const TOKEN_KEY = 'bb_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

const api = axios.create({ baseURL: `${API_URL}/api` })

api.interceptors.request.use((config) => {
  const t = tokenStore.get()
  if (t) config.headers.Authorization = `Bearer ${t}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && tokenStore.get()) {
      // token expired / user suspended -> force logout
      tokenStore.clear()
      window.dispatchEvent(new Event('bb:unauthorized'))
    }
    return Promise.reject(error)
  },
)

/** Turn a backend-relative image path (/seed/x.jpg, /uploads/x.png) into an absolute URL. */
export const assetUrl = (path) => {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${API_URL}${path}`
}

export const errorMessage = (e, fallback = 'Something went wrong. Please try again.') => {
  if (e?.response?.data?.message) return e.response.data.message
  if (e?.code === 'ERR_NETWORK') return 'Cannot reach the BorrowBuddy server. Is the backend running?'
  return fallback
}

export default api
