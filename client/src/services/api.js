import api from './axios';

// Doctor API
export const doctorAPI = {
  getAll: (params) => api.get('/api/doctors', { params }),
  getById: (id) => api.get(`/api/doctors/${id}`),
  getSlots: (id, date) => api.get(`/api/doctors/${id}/slots`, { params: { date } }),
  updateProfile: (data) => api.put('/api/doctors/profile', data),
  updateAvailability: (data) => api.put('/api/doctors/availability', data)
};

// Appointment API
export const appointmentAPI = {
  create: (data) => api.post('/api/appointments', data),
  getAll: (params) => api.get('/api/appointments', { params }),
  getById: (id) => api.get(`/api/appointments/${id}`),
  update: (id, data) => api.put(`/api/appointments/${id}`, data),
  cancel: (id, reason) => api.delete(`/api/appointments/${id}`, { data: { reason } })
};

// User API
export const userAPI = {
  updateProfile: (data) => api.put('/api/users/profile', data),
  updatePassword: (data) => api.put('/api/users/password', data)
};

export default api;