import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../api/axios';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineBuildingOffice2,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineArrowPath,
    HiOutlineShieldCheck,
    HiOutlineNoSymbol,
    HiOutlineXMark,
    HiOutlineGlobeAlt,
    HiOutlineMapPin,
    HiOutlineUsers,
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineExclamationTriangle,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineLockClosed,
    HiOutlineUser,
} from 'react-icons/hi2';

const EmployerManagement = () => {
    const [employers, setEmployers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        isActive: '',
        page: 1,
        limit: 5,
    });

    const [fetchError, setFetchError] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    // View Profile Modal state
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [selectedEmployer, setSelectedEmployer] = useState(null);
    const [companyProfile, setCompanyProfile] = useState(null);

    // Create/Edit Employer Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        companyName: '',
        industry: '',
        companyLocation: '',
        companyEmail: '',
        companyWebsite: '',
        companySize: '1-10',
        companyDescription: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const fetchEmployers = useCallback(async () => {
        setLoading(true);
        setFetchError(false);
        try {
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.isActive) params.isActive = filters.isActive;
            params.page = filters.page;
            params.limit = filters.limit;

            const response = await adminAPI.listEmployers(params);
            const result = response.data;

            if (result.success && result.data) {
                setEmployers(result.data.employers || []);
                setPagination(result.data.pagination);
            } else {
                throw new Error(result.message || 'Failed to parse employers data');
            }
        } catch (error) {
            console.error('Employers Fetch Error:', error);
            setFetchError(true);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load employers';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchEmployers();
    }, [fetchEmployers]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleToggleStatus = async (id) => {
        try {
            const { data } = await adminAPI.toggleUserStatus(id);
            const status = data.data.user.isActive ? 'activated' : 'inactive';
            toast.success(`Employer ${status}`);
            fetchEmployers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to toggle status');
        }
    };

    const handleToggleVerification = async (userId) => {
        try {
            const { data } = await adminAPI.toggleEmployerVerification(userId);
            const status = data.data.verifiedByAdmin ? 'verified' : 'unverified';
            toast.success(`Employer ${status} successfully`);
            fetchEmployers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update verification');
        }
    };

    const handleViewProfile = async (emp) => {
        setSelectedEmployer(emp);
        setShowProfileModal(true);
        setProfileLoading(true);
        try {
            const response = await adminAPI.getEmployerProfile(emp._id);
            const result = response.data;
            if (result.success && result.data) {
                setCompanyProfile(result.data.companyProfile);
            }
        } catch (error) {
            toast.error('Failed to load company profile');
            console.error(error);
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const resetFilters = () => {
        setSearchInput('');
        setFilters({ search: '', isActive: '', page: 1, limit: 5 });
    };

    const validateForm = (isCreate) => {
        const errors = {};
        const companyWebsite = formData.companyWebsite?.trim();
        const websiteRegex = /^https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:[/?#][^\s]*)?$/;

        if (!formData.firstName?.trim()) errors.firstName = 'Required';
        if (!formData.lastName?.trim()) errors.lastName = 'Required';
        if (!formData.email?.trim()) {
            errors.email = 'Required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email';
        }
        if (isCreate && !formData.password) {
            errors.password = 'Required';
        } else if (isCreate && formData.password.length < 8) {
            errors.password = 'Min 8 characters';
        }
        if (!formData.companyName?.trim()) errors.companyName = 'Required';
        if (!formData.industry?.trim()) errors.industry = 'Required';
        if (!formData.companyLocation?.trim()) errors.companyLocation = 'Required';
        if (!formData.phone?.trim()) {
            errors.phone = 'Required';
        } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) {
            errors.phone = 'Invalid phone (10-15 digits)';
        }
        if (companyWebsite && !websiteRegex.test(companyWebsite)) {
            errors.companyWebsite = 'Use valid URL (http:// or https://)';
        }
        return errors;
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const openCreateModal = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: '',
            role: 'employer',
            companyName: '',
            industry: '',
            companyLocation: '',
            companyEmail: '',
            companyWebsite: '',
            companySize: '1-10',
            companyDescription: '',
        });
        setFormErrors({});
        setShowCreateModal(true);
    };

    const handleCreateEmployer = async (e) => {
        e.preventDefault();
        const errors = validateForm(true);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormLoading(true);
        try {
            await adminAPI.createUser({ ...formData, role: 'employer' });
            toast.success('Employer created successfully');
            setShowCreateModal(false);
            fetchEmployers();
        } catch (error) {
            const errData = error.response?.data;
            if (errData?.errors?.length > 0) {
                toast.error(errData.errors[0].message);
            } else {
                toast.error(errData?.message || 'Failed to create employer');
            }
        } finally {
            setFormLoading(false);
        }
    };

    const openEditModal = (emp) => {
        setSelectedEmployer(emp);
        setFormData({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            phone: emp.phone || '',
            companyName: emp.companyName || '',
            industry: emp.industry || '',
            companyLocation: emp.companyLocation || '',
            companyEmail: emp.companyEmail || '',
            companyWebsite: emp.companyWebsite || '',
            companySize: emp.companySize || '1-10',
            companyDescription: emp.companyDescription || '',
        });
        setFormErrors({});
        setShowEditModal(true);
    };

    const handleUpdateEmployer = async (e) => {
        e.preventDefault();
        const errors = validateForm(false);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormLoading(true);
        try {
            await adminAPI.updateUser(selectedEmployer._id, { ...formData, role: 'employer' });
            toast.success('Employer updated successfully');
            setShowEditModal(false);
            fetchEmployers();
        } catch (error) {
            const errData = error.response?.data;
            if (errData?.errors?.length > 0) {
                toast.error(errData.errors[0].message);
            } else {
                toast.error(errData?.message || 'Failed to update employer');
            }
        } finally {
            setFormLoading(false);
        }
    };

    const openDeleteModal = (emp) => {
        setSelectedEmployer(emp);
        setShowDeleteModal(true);
    };

    const handleDeleteEmployer = async () => {
        setFormLoading(true);
        try {
            await adminAPI.deleteUser(selectedEmployer._id);
            toast.success('Employer deleted successfully');
            setShowDeleteModal(false);
            fetchEmployers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete employer');
        } finally {
            setFormLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const COMPANY_SIZE_LABELS = {
        '1-10': '1–10 employees',
        '11-50': '11–50 employees',
        '51-200': '51–200 employees',
        '201-500': '201–500 employees',
        '501-1000': '501–1000 employees',
        '1000+': '1000+ employees',
    };

    // Stat overview
    const activeCount = employers.filter((e) => e.isActive).length;
    const inactiveCount = employers.filter((e) => !e.isActive).length;
    const verifiedCount = employers.filter((e) => e.verifiedByAdmin).length;

    const inputCls = (field) =>
        `w-full pl-10 pr-4 py-2.5 rounded-md border text-sm text-dark-800 placeholder-dark-400 transition-all focus:ring-2 focus:ring-primary-100 ${formErrors[field]
            ? 'border-danger-400 focus:border-danger-500'
            : 'border-dark-300 focus:border-primary-500'
        }`;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black tracking-tight">Employer Management</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Manage company profiles and platform employers
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-md hover:bg-slate-900 transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                    <HiOutlineBuildingOffice2 className="w-4 h-4" />
                    Add Employer
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-5 rounded-md border-slate-300 ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-amber-50 text-amber-500 flex items-center justify-center">
                            <HiOutlineBuildingOffice2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-black leading-none">
                                {pagination?.total || 0}
                            </p>
                            <p className="text-xs text-slate-700 font-semibold mt-1 uppercase tracking-wider">Total</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 rounded-md border-slate-300 ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <HiOutlineCheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-black leading-none">{activeCount}</p>
                            <p className="text-xs text-slate-700 font-semibold mt-1 uppercase tracking-wider">Active</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 rounded-md border-slate-300 ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-rose-50 text-rose-500 flex items-center justify-center">
                            <HiOutlineNoSymbol className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-black leading-none">{inactiveCount}</p>
                            <p className="text-xs text-slate-700 font-semibold mt-1 uppercase tracking-wider">Inactive</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 rounded-md border-slate-300 ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center">
                            <HiOutlineShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-black leading-none">{verifiedCount}</p>
                            <p className="text-xs text-slate-700 font-semibold mt-1 uppercase tracking-wider">Verified</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-5 rounded-md border-slate-300 ring-1 ring-slate-100 bg-white">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search name or email..."
                            className="w-full pl-11 pr-4 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm text-slate-700 placeholder-slate-400 focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/5 transition-all outline-none"
                        />
                    </div>
                    <select
                        value={filters.isActive}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, isActive: e.target.value, page: 1 }))
                        }
                        className="px-5 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm font-medium text-slate-600 focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/5 transition-all outline-none appearance-none cursor-pointer min-w-[150px]"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Suspended</option>
                    </select>
                    <button
                        onClick={resetFilters}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-slate-50 text-slate-600 text-xs font-medium uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-300"
                    >
                        <HiOutlineArrowPath className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Employers Table */}
            <div className="card rounded-md  border-slate-300 ring-1 ring-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-300">
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest">
                                    Employer
                                </th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest">
                                    Company
                                </th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest hidden md:table-cell">
                                    Status
                                </th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest hidden lg:table-cell">
                                    Join Date
                                </th>
                                <th className="text-center px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {fetchError && employers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        Failed to load employers
                                    </td>
                                </tr>
                            ) : loading ? (
                                Array(5).fill().map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-5"><div className="h-5 w-32 bg-slate-100 rounded-md"></div></td>
                                        <td className="px-6 py-5"><div className="h-5 w-24 bg-slate-100 rounded-md"></div></td>
                                        <td className="px-6 py-5"><div className="h-5 w-20 bg-slate-100 rounded-md"></div></td>
                                        <td className="px-6 py-5"></td>
                                        <td className="px-6 py-5"></td>
                                    </tr>
                                ))
                            ) : employers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No employers found
                                    </td>
                                </tr>
                            ) : (
                                employers.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-md overflow-hidden flex items-center justify-center text-sm font-medium flex-shrink-0 transition-transform group-hover:scale-105 ${emp.isActive ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' : 'bg-rose-50 text-rose-500 shadow-sm shadow-rose-100'} border border-slate-300 relative`}>
                                                    {(emp.logo || emp.avatar) && !imageErrors[emp._id] ? (
                                                        <img
                                                            src={(emp.logo || emp.avatar).startsWith('http') ? (emp.logo || emp.avatar) : `${BASE_URL.replace(/\/$/, '')}/${(emp.logo || emp.avatar).replace(/^\//, '')}`}
                                                            alt="Logo"
                                                            className="w-full h-full object-cover"
                                                            onError={() => setImageErrors(prev => ({ ...prev, [emp._id]: true }))}
                                                        />
                                                    ) : (
                                                        <>{emp.firstName?.[0]}{emp.lastName?.[0]}</>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-black group-hover:text-blue-600 transition-colors leading-none mb-1.5">{emp.firstName} {emp.lastName}</p>
                                                    <p className="text-[12px] font-medium text-black">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-[13px] font-bold text-black uppercase tracking-tight mb-1">{emp.companyName || 'Not Set'}</p>
                                            <p className="text-[11px] font-medium text-black">{emp.industry || 'No Industry'}</p>
                                        </td>
                                        <td className="px-6 py-5 hidden md:table-cell">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest w-fit ${emp.isActive ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-600 border border-rose-300'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-md ${emp.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                    {emp.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                {emp.verifiedByAdmin && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-medium uppercase bg-blue-50 text-blue-600 w-fit">
                                                        <HiOutlineShieldCheck className="w-3 h-3" />
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 hidden lg:table-cell">
                                            <span className="text-[12px] font-bold text-black tracking-tight">{formatDate(emp.createdAt)}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => handleViewProfile(emp)} className="p-2 rounded-md text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-all" title="View Profile"><HiOutlineEye className="w-5 h-5" /></button>
                                                <button onClick={() => openEditModal(emp)} className="p-2 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit"><HiOutlinePencilSquare className="w-5 h-5" /></button>
                                                <button onClick={() => handleToggleVerification(emp._id)} className={`p-2 rounded-md transition-all ${emp.verifiedByAdmin ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`} title={emp.verifiedByAdmin ? 'Unverify' : 'Verify'}>{emp.verifiedByAdmin ? <HiOutlineXMark className="w-5 h-5" /> : <HiOutlineShieldCheck className="w-5 h-5" />}</button>
                                                <button onClick={() => handleToggleStatus(emp._id)} className={`p-2 rounded-md transition-all ${emp.isActive ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`} title={emp.isActive ? 'Suspend' : 'Activate'}>{emp.isActive ? <HiOutlineNoSymbol className="w-5 h-5" /> : <HiOutlineCheckCircle className="w-5 h-5" />}</button>
                                                <button onClick={() => openDeleteModal(emp)} className="p-2 rounded-md text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all" title="Delete"><HiOutlineTrash className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-dark-500">
                        Page <span className="font-semibold text-dark-700">{pagination.page}</span>{' '}
                        of <span className="font-semibold text-dark-700">{pagination.totalPages}</span>
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={!pagination.hasPrevPage}
                            className="p-2 rounded-md text-dark-500 hover:bg-dark-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiOutlineChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={!pagination.hasNextPage}
                            className="p-2 rounded-md text-dark-500 hover:bg-dark-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiOutlineChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== VIEW COMPANY PROFILE MODAL ==================== */}
            {showProfileModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowProfileModal(false); setCompanyProfile(null); }} />
                    <div className="relative bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200">

                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r bg-blue-500 px-8 py-6 rounded-md border-slate-300">
                            <button
                                onClick={() => { setShowProfileModal(false); setCompanyProfile(null); }}
                                className="absolute top-4 right-4 p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
                            >
                                <HiOutlineXMark className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-md bg-white/20 flex items-center justify-center text-white text-lg font-bold backdrop-blur-sm overflow-hidden border border-slate-300">
                                    {companyProfile?.logo ? (
                                        <img
                                            src={companyProfile.logo.startsWith('http') ? companyProfile.logo : `${BASE_URL.replace(/\/$/, '')}/${companyProfile.logo.replace(/^\//, '')}`}
                                            alt="Logo"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <>{selectedEmployer?.firstName?.[0]}{selectedEmployer?.lastName?.[0]}</>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-white">
                                        {selectedEmployer?.firstName} {selectedEmployer?.lastName}
                                    </h3>
                                    <p className="text-blue-100 text-sm font-medium">{selectedEmployer?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="px-8 py-6">
                            {profileLoading ? (
                                <div className="space-y-5 animate-pulse">
                                    {Array(5).fill().map((_, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="h-3 w-24 bg-dark-200 rounded-md"></div>
                                            <div className="h-10 bg-dark-100 rounded-md"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : !companyProfile || Object.keys(companyProfile).length === 0 ? (
                                <div className="py-12 text-center">
                                    <HiOutlineBuildingOffice2 className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                                    <p className="text-slate-500 font-bold">No company profile found</p>
                                    <p className="text-dark-400 text-sm mt-1">This employer has not set up their company profile yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-5">

                                    {/* Company Name */}
                                    <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-md border border-slate-300">
                                        <HiOutlineBuildingOffice2 className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-[11px] font-medium text-dark-400 uppercase tracking-wider mb-1">Company Name</p>
                                            <p className="text-sm font-medium text-black">{companyProfile.companyName || '—'}</p>
                                        </div>
                                    </div>

                                    {/* Two Column Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                        {/* Industry */}
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-md border border-slate-300">
                                            <HiOutlineBriefcase className="w-5 h-5 text-warning-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-medium text-dark-400 uppercase tracking-wider mb-1">Industry</p>
                                                <p className="text-sm font-medium text-black">{companyProfile.industry || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-md border border-slate-300">
                                            <HiOutlineMapPin className="w-5 h-5 text-danger-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-medium text-dark-400 uppercase tracking-wider mb-1">Location</p>
                                                <p className="text-sm font-medium text-black">{companyProfile.companyLocation || companyProfile.location || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Company Size */}
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-md border border-slate-300">
                                            <HiOutlineUsers className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-medium text-dark-400 uppercase tracking-wider mb-1">Company Size</p>
                                                <p className="text-sm font-medium text-black">{COMPANY_SIZE_LABELS[companyProfile.companySize] || companyProfile.companySize || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Website */}
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-md border border-slate-300">
                                            <HiOutlineGlobeAlt className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-medium text-dark-400 uppercase tracking-wider mb-1">Website</p>
                                                {companyProfile.companyWebsite || companyProfile.website ? (
                                                    <a href={companyProfile.companyWebsite || companyProfile.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary-600 hover:underline">{companyProfile.companyWebsite || companyProfile.website}</a>
                                                ) : (
                                                    <p className="text-sm font-medium text-dark-900">—</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contact Email */}
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-md border border-slate-300">
                                            <HiOutlineEnvelope className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-medium text-dark-400 uppercase tracking-wider mb-1">Contact Email</p>
                                                <p className="text-sm font-medium text-black">{companyProfile.companyEmail || companyProfile.contactEmail || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-md border border-slate-300">
                                            <HiOutlinePhone className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-medium text-dark-400 uppercase tracking-wider mb-1">Phone</p>
                                                <p className="text-sm font-medium text-black">{companyProfile.contactPersonPhone || selectedEmployer?.phone || '—'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {(companyProfile.companyDescription || companyProfile.description) && (
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-md border border-slate-300">
                                            <HiOutlineDocumentText className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-medium text-dark-400 uppercase tracking-wider mb-1">Company Description</p>
                                                <p className="text-sm text-dark-700 leading-relaxed whitespace-pre-wrap">{companyProfile.companyDescription || companyProfile.description}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Verification & Timestamps */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-dark-300">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold ${companyProfile.verifiedByAdmin ? 'bg-success-50 text-success-500' : 'bg-warning-200 text-warning-700'}`}>
                                            {companyProfile.verifiedByAdmin ? (
                                                <><HiOutlineCheckCircle className="w-3.5 h-3.5" /> Verified</>
                                            ) : (
                                                <><HiOutlineXCircle className="w-3.5 h-3.5" /> Not Verified</>
                                            )}
                                        </span>
                                        <span className="text-xs text-dark-400">
                                            Joined: {formatDate(selectedEmployer?.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white px-8 py-4 border-t border-dark-100 rounded-b-md">
                            <button
                                onClick={() => { setShowProfileModal(false); setCompanyProfile(null); }}
                                className="w-full py-3 rounded-md border border-dark-300 text-sm font-medium text-dark-600 hover:bg-dark-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative bg-white rounded-md shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-black">Add New Employer</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-md hover:bg-dark-100 transition-colors"><HiOutlineXMark className="w-5 h-5 text-dark-400" /></button>
                        </div>
                        <form onSubmit={handleCreateEmployer} className="space-y-6">
                            {/* Contact Person */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-medium text-dark-400/95 uppercase tracking-widest border-b border-dark-300 pb-2">Contact Person</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">First Name *</label><div className="relative"><HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.firstName} onChange={(e) => handleFormChange('firstName', e.target.value)} placeholder="John" className={inputCls('firstName')} /></div>{formErrors.firstName && <p className="mt-1 text-[11px] text-danger-600">{formErrors.firstName}</p>}</div>
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Last Name *</label><div className="relative"><HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.lastName} onChange={(e) => handleFormChange('lastName', e.target.value)} placeholder="Doe" className={inputCls('lastName')} /></div>{formErrors.lastName && <p className="mt-1 text-[11px] text-danger-600">{formErrors.lastName}</p>}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Email *</label><div className="relative"><HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="email" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} placeholder="employer@example.com" className={inputCls('email')} /></div>{formErrors.email && <p className="mt-1 text-[11px] text-danger-600">{formErrors.email}</p>}</div>
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Phone *</label><div className="relative"><HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="tel" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} placeholder="e.g. 9876543210" className={inputCls('phone')} /></div>{formErrors.phone && <p className="mt-1 text-[11px] text-danger-600">{formErrors.phone}</p>}</div>
                                </div>
                                <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Login Password *</label><div className="relative"><HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleFormChange('password', e.target.value)} className={inputCls('password')} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">{showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}</button></div>{formErrors.password && <p className="mt-1 text-[11px] text-danger-600">{formErrors.password}</p>}</div>
                            </div>

                            {/* Company Info */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-medium text-dark-400/95 uppercase tracking-widest border-b border-dark-200 pb-2">Company Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Company Name *</label><div className="relative"><HiOutlineBuildingOffice2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.companyName} onChange={(e) => handleFormChange('companyName', e.target.value)} placeholder="Acme Inc." className={inputCls('companyName')} /></div>{formErrors.companyName && <p className="mt-1 text-[11px] text-danger-600">{formErrors.companyName}</p>}</div>
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Industry *</label><div className="relative"><HiOutlineBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.industry} onChange={(e) => handleFormChange('industry', e.target.value)} placeholder="Technology" className={inputCls('industry')} /></div>{formErrors.industry && <p className="mt-1 text-[11px] text-danger-600">{formErrors.industry}</p>}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Location *</label><div className="relative"><HiOutlineMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.companyLocation} onChange={(e) => handleFormChange('companyLocation', e.target.value)} placeholder="San Francisco, CA" className={inputCls('companyLocation')} /></div>{formErrors.companyLocation && <p className="mt-1 text-[11px] text-danger-600">{formErrors.companyLocation}</p>}</div>
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Company Size</label><select value={formData.companySize} onChange={(e) => handleFormChange('companySize', e.target.value)} className="w-full px-4 py-2.5 rounded-md border border-dark-200 text-sm appearance-none bg-white"><option value="1-10">1-10 employees</option><option value="11-50">11-50 employees</option><option value="51-200">51-200 employees</option><option value="201-500">201-500 employees</option><option value="501-1000">501-1000 employees</option><option value="1000+">1000+ employees</option></select></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4"><button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-md border border-dark-200 text-sm font-medium text-dark-600">Cancel</button><button type="submit" disabled={formLoading} className="flex-1 py-3 gradient-primary text-white text-sm font-medium rounded-md shadow-lg disabled:opacity-70">{formLoading ? 'Creating...' : 'Create Employer Account'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
                    <div className="relative bg-white rounded-md shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-black">Edit Employer</h3>
                            <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-dark-100 transition-colors"><HiOutlineXMark className="w-5 h-5 text-dark-400" /></button>
                        </div>
                        <form onSubmit={handleUpdateEmployer} className="space-y-6">
                            {/* Contact Person */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-medium text-dark-400/95 uppercase tracking-widest border-b border-dark-200 pb-2">Contact Person</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">First Name *</label><div className="relative"><HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.firstName} onChange={(e) => handleFormChange('firstName', e.target.value)} className={inputCls('firstName')} /></div>{formErrors.firstName && <p className="mt-1 text-[11px] text-danger-600">{formErrors.firstName}</p>}</div>
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Last Name *</label><div className="relative"><HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.lastName} onChange={(e) => handleFormChange('lastName', e.target.value)} className={inputCls('lastName')} /></div>{formErrors.lastName && <p className="mt-1 text-[11px] text-danger-600">{formErrors.lastName}</p>}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Email *</label><div className="relative"><HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="email" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} className={inputCls('email')} /></div>{formErrors.email && <p className="mt-1 text-[11px] text-danger-600">{formErrors.email}</p>}</div>
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Phone</label><div className="relative"><HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="tel" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} className={inputCls('phone')} /></div></div>
                                </div>
                            </div>

                            {/* Company Info */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-medium text-dark-400/95 uppercase tracking-widest border-b border-dark-200 pb-2">Company Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Company Name *</label><div className="relative"><HiOutlineBuildingOffice2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.companyName} onChange={(e) => handleFormChange('companyName', e.target.value)} className={inputCls('companyName')} /></div>{formErrors.companyName && <p className="mt-1 text-[11px] text-danger-600">{formErrors.companyName}</p>}</div>
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Industry *</label><div className="relative"><HiOutlineBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.industry} onChange={(e) => handleFormChange('industry', e.target.value)} className={inputCls('industry')} /></div>{formErrors.industry && <p className="mt-1 text-[11px] text-danger-600">{formErrors.industry}</p>}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Location *</label><div className="relative"><HiOutlineMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.companyLocation} onChange={(e) => handleFormChange('companyLocation', e.target.value)} className={inputCls('companyLocation')} /></div>{formErrors.companyLocation && <p className="mt-1 text-[11px] text-danger-600">{formErrors.companyLocation}</p>}</div>
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Company Size</label><select value={formData.companySize} onChange={(e) => handleFormChange('companySize', e.target.value)} className="w-full px-4 py-2.5 rounded-md border border-dark-200 text-sm appearance-none bg-white"><option value="1-10">1-10 employees</option><option value="11-50">11-50 employees</option><option value="51-200">51-200 employees</option><option value="201-500">201-500 employees</option><option value="501-1000">501-1000 employees</option><option value="1000+">1000+ employees</option></select></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Company Email</label><div className="relative"><HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="email" value={formData.companyEmail} onChange={(e) => handleFormChange('companyEmail', e.target.value)} className={inputCls('companyEmail')} /></div></div>
                                    <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Company Website</label><div className="relative"><HiOutlineGlobeAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="url" value={formData.companyWebsite} onChange={(e) => handleFormChange('companyWebsite', e.target.value)} placeholder="https://example.in" className={inputCls('companyWebsite')} /></div>{formErrors.companyWebsite && <p className="mt-1 text-[11px] text-danger-600">{formErrors.companyWebsite}</p>}</div>
                                </div>
                                <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Description</label><textarea value={formData.companyDescription} onChange={(e) => handleFormChange('companyDescription', e.target.value)} rows="3" className="w-full px-4 py-2.5 rounded-md border border-dark-200 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"></textarea></div>
                            </div>

                            <div className="flex items-center gap-3 pt-4"><button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-md border border-dark-200 text-sm font-medium text-dark-600">Cancel</button><button type="submit" disabled={formLoading} className="flex-1 py-3 gradient-primary text-white text-sm font-medium rounded-md shadow-lg disabled:opacity-70">{formLoading ? 'Saving...' : 'Save Changes'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative bg-white rounded-md shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-md bg-danger-50 flex items-center justify-center mb-4"><HiOutlineExclamationTriangle className="w-6 h-6 text-danger-600" /></div>
                            <h3 className="text-lg font-medium text-black">Delete Employer</h3>
                            <p className="text-sm text-slate-400/95 mt-2">Are you sure you want to delete <b>{selectedEmployer?.companyName || selectedEmployer?.firstName}</b>? This action cannot be undone.</p>
                        </div>
                        <div className="flex items-center gap-3 mt-8">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 rounded-md border border-dark-200 text-sm font-medium text-dark-600 hover:bg-dark-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteEmployer}
                                disabled={formLoading}
                                className="flex-1 py-3 bg-rose-600 text-white text-sm font-medium rounded-md shadow-lg shadow-rose-100 hover:bg-rose-700 transition-colors disabled:opacity-70"
                            >
                                {formLoading ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployerManagement;
