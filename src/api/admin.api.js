import api from './axios';

/**
 * Admin API calls — all require admin role
 */
export const adminAPI = {
    // Dashboard
    getStats: (period) => api.get('/admin/dashboard/stats', { params: { period } }),

    // User Management
    listUsers: (params) => api.get('/admin/users/all', { params }),
    getUserById: (id) => api.get(`/admin/users/detail/${id}`),
    createUser: (data) => api.post('/admin/users/create', data),
    updateUser: (id, data) => api.put(`/admin/users/update/${id}`, data),
    toggleUserStatus: (id) => api.patch(`/admin/users/status/${id}`),
    deleteUser: (id) => api.delete(`/admin/users/delete/${id}`),

    // Role-based Management
    listEmployers: (params) => api.get('/admin/roles/employers', { params }),
    listCandidates: (params) => api.get('/admin/roles/candidates', { params }),
    listRecruiters: (params) => api.get('/admin/roles/recruiters', { params }),

    // Employer Company Profile
    getEmployerProfile: (userId) => api.get(`/admin/employers/${userId}/profile`),
    toggleEmployerVerification: (userId) => api.patch(`/admin/employers/${userId}/verify`),

    // Job Management
    listJobRequests: (params) => api.get('/job-requests', { params }),
    getJobRequestById: (id) => api.get(`/job-requests/${id}`),
    updateJobRequest: (id, data) => api.put(`/job-requests/${id}`, data),
    toggleJobStatus: (id) => api.patch(`/job-requests/${id}/toggle-status`),
    deleteJobRequest: (id) => api.delete(`/job-requests/${id}`),
    // Application Management
    listApplications: (params) => api.get('/applications/admin/all', { params }),
    getJobApplications: (jobId) => api.get(`/applications/recruiter/job/${jobId}`),
    getJobPipeline: (jobId) => api.get(`/applications/recruiter/job/${jobId}/pipeline`),
    updateApplicationStatus: (id, action, data = {}) => api.put(`/applications/recruiter/application/${id}/${action}`, data),
};
