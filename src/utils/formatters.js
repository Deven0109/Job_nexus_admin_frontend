import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format date to readable string
 * @param {string|Date} date
 * @param {string} formatStr
 * @returns {string}
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
    if (!date) return '—';
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return format(parsed, formatStr);
};

/**
 * Format date to relative time (e.g. "2 days ago")
 * @param {string|Date} date
 * @returns {string}
 */
export const timeAgo = (date) => {
    if (!date) return '—';
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsed, { addSuffix: true });
};

/**
 * Format salary range
 * @param {Object} salary - { min, max, currency, period }
 * @returns {string}
 */
export const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Not specified';

    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', AED: 'د.إ' };
    const symbol = symbols[salary.currency] || salary.currency || '$';

    const formatNum = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
        return num.toLocaleString();
    };

    if (salary.min && salary.max) {
        return `${symbol}${formatNum(salary.min)} - ${symbol}${formatNum(salary.max)} / ${salary.period || 'year'}`;
    }

    if (salary.min) return `From ${symbol}${formatNum(salary.min)} / ${salary.period || 'year'}`;
    return `Up to ${symbol}${formatNum(salary.max)} / ${salary.period || 'year'}`;
};

/**
 * Format location
 * @param {Object} location - { city, state, country, remote }
 * @returns {string}
 */
export const formatLocation = (location) => {
    if (!location) return 'Not specified';
    if (location.remote) return 'Remote';

    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ') || 'Not specified';
};

/**
 * Get initials from name
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
export const getInitials = (firstName = '', lastName = '') => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
};

/**
 * Truncate text
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};
