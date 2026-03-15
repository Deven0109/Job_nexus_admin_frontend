import axiosInstance from './axios';

export const faqAPI = {
    // Get all FAQs (admin/recruiter)
    getAllFAQs: () => axiosInstance.get('/faqs'),

    // Get active FAQs (public)
    getActiveFAQs: () => axiosInstance.get('/faqs/active'),

    // Get single FAQ
    getFAQById: (id) => axiosInstance.get(`/faqs/${id}`),

    // Create FAQ
    createFAQ: (data) => axiosInstance.post('/faqs', data),

    // Update FAQ
    updateFAQ: (id, data) => axiosInstance.put(`/faqs/${id}`, data),

    // Delete FAQ
    deleteFAQ: (id) => axiosInstance.delete(`/faqs/${id}`)
};
