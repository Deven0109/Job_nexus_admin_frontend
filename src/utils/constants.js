/**
 * Frontend application constants
 * Mirrors backend constants for consistency
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Job Nexus';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
    CANDIDATE: 'candidate',
    RECRUITER: 'recruiter',
    EMPLOYER: 'employer',
    ADMIN: 'admin',
};

export const JOB_STATUS = {
    DRAFT: 'draft',
    OPEN: 'open',
    PAUSED: 'paused',
    CLOSED: 'closed',
    FILLED: 'filled',
};

export const JOB_TYPES = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' },
];

export const EXPERIENCE_LEVELS = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'lead', label: 'Lead' },
    { value: 'executive', label: 'Executive' },
];

export const APPLICATION_STATUS = {
    APPLIED: 'applied',
    SCREENING: 'screening',
    SHORTLISTED: 'shortlisted',
    SUBMITTED_TO_EMPLOYER: 'submitted_to_employer',
    INTERVIEWING: 'interviewing',
    OFFERED: 'offered',
    HIRED: 'hired',
    REJECTED: 'rejected',
    WITHDRAWN: 'withdrawn',
};

export const APPLICATION_STATUS_LABELS = {
    applied: 'Applied',
    screening: 'Screening',
    shortlisted: 'Shortlisted',
    submitted_to_employer: 'Submitted to Employer',
    interviewing: 'Interviewing',
    offered: 'Offered',
    hired: 'Hired',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
};

export const APPLICATION_STATUS_COLORS = {
    applied: 'badge-neutral',
    screening: 'badge-info',
    shortlisted: 'badge-primary',
    submitted_to_employer: 'badge-warning',
    interviewing: 'badge-info',
    offered: 'badge-success',
    hired: 'badge-success',
    rejected: 'badge-danger',
    withdrawn: 'badge-neutral',
};

export const INTERVIEW_TYPES = [
    { value: 'phone', label: 'Phone' },
    { value: 'video', label: 'Video' },
    { value: 'in-person', label: 'In-Person' },
    { value: 'technical', label: 'Technical' },
    { value: 'panel', label: 'Panel' },
];

export const CURRENCIES = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
    { value: 'INR', label: 'INR (₹)', symbol: '₹' },
    { value: 'AED', label: 'AED (د.إ)', symbol: 'د.إ' },
    { value: 'SGD', label: 'SGD (S$)', symbol: 'S$' },
    { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
    { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
];
