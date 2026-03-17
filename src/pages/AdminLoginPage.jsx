import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    HiOutlineEnvelope,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineExclamationTriangle,
    HiOutlineBriefcase,
} from 'react-icons/hi2';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Redirect if already logged in as admin
    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        if (apiError) setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const userData = await login({
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
            });

            // success toast is handled by AuthContext or here
            toast.success(`Welcome back, ${userData.firstName}!`);
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Login error:', error);
            const errorData = error.response?.data;
            const message = errorData?.message || error.message || 'Login failed. Please try again.';

            // If there are detailed validation errors, show the first one or a combined message
            if (errorData?.errors && errorData.errors.length > 0) {
                const detailedMessage = errorData.errors.map(err => err.message).join(', ');
                setApiError(detailedMessage);
                toast.error(detailedMessage);
            } else {
                setApiError(message);
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="card p-8 shadow-xl">
                    {/* Logo / Brand */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                            <HiOutlineBriefcase className="w-8 h-8 text-white" />
                        </div>
                        <div className="mb-2">
                            <span className="text-xl font-bold text-dark-900">
                                Job<span className="text-primary-600">Nexus</span>
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-dark-900 mb-1">
                            Welcome to Job Nexus Admin Panel
                        </h1>
                        <p className="text-dark-500 text-sm">
                            Securely access your admin dashboard
                        </p>
                    </div>

                    {/* Login Form */}
                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        {/* Email */}
                        <div>
                            <label htmlFor="admin-email" className="block text-sm font-semibold text-dark-700 mb-1.5">
                                Email <span className="text-danger-500">*</span>
                            </label>
                            <div className="relative">
                                <HiOutlineEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-400" />
                                <input
                                    id="admin-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@jobnexus.com"
                                    autoComplete="email"
                                    className={`w-full pl-11 pr-4 py-2.5 rounded-lg border text-sm text-dark-800 placeholder-dark-400 transition-all focus:ring-2 focus:ring-primary-100 ${errors.email
                                        ? 'border-danger-400 focus:border-danger-500'
                                        : 'border-dark-200 focus:border-primary-500'
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-danger-600 font-medium">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="admin-password" className="block text-sm font-semibold text-dark-700 mb-1.5">
                                Password <span className="text-danger-500">*</span>
                            </label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-400" />
                                <input
                                    id="admin-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className={`w-full pl-11 pr-11 py-2.5 rounded-lg border text-sm text-dark-800 placeholder-dark-400 transition-all focus:ring-2 focus:ring-primary-100 ${errors.password
                                        ? 'border-danger-400 focus:border-danger-500'
                                        : 'border-dark-200 focus:border-primary-500'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <HiOutlineEyeSlash className="w-4.5 h-4.5" />
                                    ) : (
                                        <HiOutlineEye className="w-4.5 h-4.5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-danger-600 font-medium">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                id="admin-remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-primary-600 border-dark-300 rounded focus:ring-primary-500 cursor-pointer"
                            />
                            <label htmlFor="admin-remember" className="ml-2 text-sm text-dark-600 cursor-pointer">
                                Remember me
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 gradient-primary text-white font-semibold rounded-lg text-sm shadow-md transition-all ${isLoading
                                ? 'opacity-70 cursor-not-allowed'
                                : 'hover:opacity-90 hover:shadow-lg active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-dark-400 mt-6">
                    © {new Date().getFullYear()} Job Nexus Admin Panel. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default AdminLoginPage;
