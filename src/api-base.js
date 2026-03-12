const DEFAULT_API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:10000/v1').trim()

export function getApiBase() {
  const saved = window.localStorage.getItem('admin_api_base')
  if (saved && saved.trim()) {
    return saved.trim()
  }
  return DEFAULT_API_BASE
}
