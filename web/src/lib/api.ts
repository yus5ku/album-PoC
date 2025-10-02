import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      window.location.href = '/auth/signin'
    }
    return Promise.reject(error)
  }
)

// API functions
export const albumsApi = {
  getAll: () => api.get('/albums'),
  getById: (id: string) => api.get(`/albums/${id}`),
  create: (data: any) => api.post('/albums', data),
  update: (id: string, data: any) => api.patch(`/albums/${id}`, data),
  delete: (id: string) => api.delete(`/albums/${id}`),
}

export const mediaApi = {
  upload: (formData: FormData) => api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getById: (id: string) => api.get(`/media/${id}`),
  delete: (id: string) => api.delete(`/media/${id}`),
}

export const slideshowApi = {
  create: (data: any) => api.post('/slideshow', data),
  getStatus: (jobId: string) => api.get(`/slideshow/${jobId}`),
}
