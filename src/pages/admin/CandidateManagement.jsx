import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../api/axios';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineUserPlus,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineXMark,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineArrowPath,
    HiOutlineExclamationTriangle,
    HiOutlineLockClosed,
    HiOutlineEnvelope,
    HiOutlineUser,
    HiOutlinePhone,
    HiOutlineShieldCheck,
    HiOutlineUsers,
} from 'react-icons/hi2';

const CandidateManagement = () => {
    // List state
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        role: 'candidate',
        isActive: '',
        page: 1,
        limit: 5,
        sort: '-createdAt',
    });

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'candidate',
        phone: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [formLoading, setFormLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Debounced search
    const [searchInput, setSearchInput] = useState('');
    const [imageErrors, setImageErrors] = useState({});

    // Fetch users
    const [fetchError, setFetchError] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setFetchError(false);
        try {
            const params = { role: 'candidate' };
            if (filters.search) params.search = filters.search;
            if (filters.isActive) params.isActive = filters.isActive;
            params.page = filters.page;
            params.limit = filters.limit;
            params.sort = filters.sort;

            const response = await adminAPI.listCandidates(params);
            const result = response.data;

            if (result.success && result.data) {
                setUsers(result.data.candidates || []);
                setPagination(result.data.pagination);
            } else {
                throw new Error(result.message || 'Failed to parse candidates data');
            }
        } catch (error) {
            console.error('Candidates Fetch Error:', error);
            setFetchError(true);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load candidates';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Handlers
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const resetFilters = () => {
        setSearchInput('');
        setFilters({
            search: '',
            role: 'candidate',
            isActive: '',
            page: 1,
            limit: 5,
            sort: '-createdAt',
        });
    };

    // Create user
    const openCreateModal = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'candidate',
            phone: '',
        });
        setFormErrors({});
        setShowPassword(false);
        setShowCreateModal(true);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const errors = validateForm(true);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormLoading(true);
        try {
            await adminAPI.createUser(formData);
            toast.success('Candidate created successfully');
            setShowCreateModal(false);
            fetchUsers();
        } catch (error) {
            const errData = error.response?.data;
            if (errData?.errors?.length > 0) {
                toast.error(errData.errors[0].message);
            } else {
                toast.error(errData?.message || 'Failed to create candidate');
            }
        } finally {
            setFormLoading(false);
        }
    };

    // Edit user
    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
        });
        setFormErrors({});
        setShowEditModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        const errors = validateForm(false);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormLoading(true);
        try {
            await adminAPI.updateUser(selectedUser._id, formData);
            toast.success('Candidate updated successfully');
            setShowEditModal(false);
            fetchUsers();
        } catch (error) {
            const errData = error.response?.data;
            if (errData?.errors?.length > 0) {
                toast.error(errData.errors[0].message);
            } else {
                toast.error(errData?.message || 'Failed to update candidate');
            }
        } finally {
            setFormLoading(false);
        }
    };

    // Toggle status
    const handleToggleStatus = async (userId) => {
        try {
            const { data } = await adminAPI.toggleUserStatus(userId);
            const status = data.data.user.isActive ? 'activated' : 'deactivated';
            toast.success(`Candidate ${status}`);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to toggle status');
        }
    };

    // Delete user
    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleDeleteUser = async () => {
        setFormLoading(true);
        try {
            await adminAPI.deleteUser(selectedUser._id);
            toast.success('Candidate deleted');
            setShowDeleteModal(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete candidate');
        } finally {
            setFormLoading(false);
        }
    };

    // Form validation
    const validateForm = (isCreate) => {
        const errors = {};
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
        if (!formData.phone?.trim()) {
            errors.phone = 'Required';
        } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) {
            errors.phone = 'Invalid phone (10-15 digits)';
        }
        return errors;
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: '' }));
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

    const activeCount = users.filter((u) => u.isActive).length;
    const inactiveCount = users.filter((u) => !u.isActive).length;

    const inputCls = (field) =>
        `w-full pl-10 pr-4 py-2.5 rounded-md border text-sm text-dark-800 placeholder-dark-400 transition-all focus:ring-2 focus:ring-primary-100 ${formErrors[field]
            ? 'border-danger-400 focus:border-danger-500'
            : 'border-dark-300 focus:border-primary-500'
        }`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black tracking-tight">Candidate Management</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Browse and manage platform candidates
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#5b4eff] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-slate-900 transition-all shadow-lg shadow-[#5b4eff]/20 active:scale-95"
                >
                    <HiOutlineUserPlus className="w-4 h-4" />
                    Add Candidate
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="card p-5 rounded-md border-slate-300 ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-amber-50 text-amber-500 flex items-center justify-center">
                            <HiOutlineUsers className="w-6 h-6" />
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
                            <HiOutlineXMark className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-black leading-none">{inactiveCount}</p>
                            <p className="text-xs text-slate-700 font-semibold mt-1 uppercase tracking-wider">Inactive</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-5 rounded-md border-slate-300 ring-1 ring-slate-100 bg-white">
                <div className="flex flex-col md:flex-row gap-4">
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
                        onChange={(e) => handleFilterChange('isActive', e.target.value)}
                        className="px-5 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm font-medium text-slate-600 focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/5 transition-all outline-none appearance-none cursor-pointer min-w-[150px]"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
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

            <div className="card rounded-md border-slate-300 ring-1 ring-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-300">
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest">
                                    Candidate
                                </th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest hidden md:table-cell">
                                    Status
                                </th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest hidden lg:table-cell">
                                    Last Login
                                </th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest hidden lg:table-cell">
                                    Joined
                                </th>
                                <th className="text-center px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-100">
                            {fetchError && users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-12 text-center">
                                        <div className="w-12 h-12 rounded-md bg-danger-50 text-danger-500 flex items-center justify-center mx-auto mb-3">
                                            <HiOutlineExclamationTriangle className="w-6 h-6" />
                                        </div>
                                        <p className="text-black font-medium mb-1">Failed to load candidates</p>
                                        <p className="text-dark-500 text-sm mb-4">We couldn't connect to the server. Please ensure the backend is running.</p>
                                        <button
                                            onClick={fetchUsers}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary-50 text-primary-700 font-semibold text-sm hover:bg-primary-100 transition-colors"
                                        >
                                            <HiOutlineArrowPath className="w-4 h-4" />
                                            Retry
                                        </button>
                                    </td>
                                </tr>
                            ) : loading ? (
                                Array(5).fill().map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-md bg-dark-200"></div>
                                                <div className="w-28 h-4 rounded-md bg-dark-200"></div>
                                            </div>
                                        </td>
                                        <td colSpan="4"></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-12 text-center">
                                        <HiOutlineUsers className="w-10 h-10 mx-auto text-dark-300 mb-3" />
                                        <p className="text-dark-500 font-medium">No candidates found</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-md overflow-hidden flex items-center justify-center text-sm font-medium flex-shrink-0 transition-transform group-hover:scale-105 ${u.isActive ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' : 'bg-rose-50 text-rose-500 shadow-sm shadow-rose-100'} border border-slate-300 relative`}>
                                                    {u.avatar && !imageErrors[u._id] ? (
                                                        <img
                                                            src={u.avatar.startsWith('http') ? u.avatar : `${BASE_URL.replace(/\/$/, '')}/${u.avatar.replace(/^\//, '')}`}
                                                            alt="Avatar"
                                                            className="w-full h-full object-cover"
                                                            onError={() => setImageErrors(prev => ({ ...prev, [u._id]: true }))}
                                                        />
                                                    ) : (
                                                        <>{u.firstName?.[0]}{u.lastName?.[0]}</>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-black group-hover:text-blue-600 transition-colors leading-none mb-1.5">{u.firstName} {u.lastName}</p>
                                                    <p className="text-[12px] font-medium text-black">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 hidden md:table-cell">
                                            <button
                                                onClick={() => handleToggleStatus(u._id)}
                                                title={u.isActive ? 'Click to deactivate' : 'Click to activate'}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${u.isActive ? 'bg-emerald-50 text-emerald-900 border border-emerald-100 shadow-sm shadow-emerald-50' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-md ${u.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 hidden lg:table-cell">
                                            <span className="text-[12px] font-bold text-black tracking-tight">{formatDateTime(u.lastLoginAt)}</span>
                                        </td>
                                        <td className="px-6 py-5 hidden lg:table-cell">
                                            <span className="text-[12px] font-bold text-black tracking-tight">{formatDate(u.createdAt)}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => openEditModal(u)} className="p-2 rounded-md text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit"><HiOutlinePencilSquare className="w-5 h-5" /></button>
                                                <button onClick={() => handleToggleStatus(u._id)} className={`p-2 rounded-md transition-all ${u.isActive ? 'text-slate-600 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`} title={u.isActive ? "Deactivate" : "Activate"}>{u.isActive ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}</button>
                                                <button onClick={() => openDeleteModal(u)} className="p-2 rounded-md text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all" title="Delete"><HiOutlineTrash className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-dark-100 bg-dark-50/50">
                        <p className="text-xs text-dark-500">Showing <span className="font-semibold text-dark-700">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-dark-700">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-dark-700">{pagination.total}</span> candidates</p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => handlePageChange(pagination.page - 1)} disabled={!pagination.hasPrevPage} className="p-1.5 rounded-md text-dark-500 hover:bg-dark-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><HiOutlineChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => handlePageChange(pagination.page + 1)} disabled={!pagination.hasNextPage} className="p-1.5 rounded-md text-dark-500 hover:bg-dark-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><HiOutlineChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative bg-white rounded-md shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-black">Add Candidate</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-md hover:bg-dark-100 transition-colors"><HiOutlineXMark className="w-5 h-5 text-dark-400" /></button>
                        </div>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-medium text-dark-700 mb-1.5">First Name *</label><div className="relative"><HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.firstName} onChange={(e) => handleFormChange('firstName', e.target.value)} placeholder="John" className={inputCls('firstName')} /></div>{formErrors.firstName && <p className="mt-1 text-[11px] text-danger-600">{formErrors.firstName}</p>}</div>
                                <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Last Name *</label><div className="relative"><HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.lastName} onChange={(e) => handleFormChange('lastName', e.target.value)} placeholder="Doe" className={inputCls('lastName')} /></div>{formErrors.lastName && <p className="mt-1 text-[11px] text-danger-600">{formErrors.lastName}</p>}</div>
                            </div>
                            <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Email *</label><div className="relative"><HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="email" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} placeholder="candidate@example.com" className={inputCls('email')} /></div>{formErrors.email && <p className="mt-1 text-[11px] text-danger-600">{formErrors.email}</p>}</div>
                            <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Password *</label><div className="relative"><HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleFormChange('password', e.target.value)} className={inputCls('password')} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">{showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}</button></div>{formErrors.password && <p className="mt-1 text-[11px] text-danger-600">{formErrors.password}</p>}</div>
                            <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Phone *</label><div className="relative"><HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="tel" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} placeholder="e.g. 9876543210" className={inputCls('phone')} /></div>{formErrors.phone && <p className="mt-1 text-[11px] text-danger-600">{formErrors.phone}</p>}</div>
                            <div className="flex items-center gap-3 pt-3"><button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 rounded-md border border-dark-200 text-sm font-medium text-dark-600">Cancel</button><button type="submit" disabled={formLoading} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md shadow-md disabled:opacity-70">{formLoading ? 'Creating...' : 'Create Candidate'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
                    <div className="relative bg-white rounded-md shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-black">Edit Candidate</h3>
                            <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-md hover:bg-dark-100 transition-colors"><HiOutlineXMark className="w-5 h-5 text-dark-400" /></button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-medium text-dark-700 mb-1.5">First Name *</label><div className="relative"><HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.firstName} onChange={(e) => handleFormChange('firstName', e.target.value)} className={inputCls('firstName')} /></div>{formErrors.firstName && <p className="mt-1 text-[11px] text-danger-600">{formErrors.firstName}</p>}</div>
                                <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Last Name *</label><div className="relative"><HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="text" value={formData.lastName} onChange={(e) => handleFormChange('lastName', e.target.value)} className={inputCls('lastName')} /></div>{formErrors.lastName && <p className="mt-1 text-[11px] text-danger-600">{formErrors.lastName}</p>}</div>
                            </div>
                            <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Email *</label><div className="relative"><HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="email" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} className={inputCls('email')} /></div>{formErrors.email && <p className="mt-1 text-[11px] text-danger-600">{formErrors.email}</p>}</div>
                            <div><label className="block text-xs font-medium text-dark-700 mb-1.5">Phone</label><div className="relative"><HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" /><input type="tel" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} className={inputCls('phone')} /></div></div>
                            <div className="flex items-center gap-3 pt-3"><button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 rounded-md border border-dark-200 text-sm font-medium text-dark-600">Cancel</button><button type="submit" disabled={formLoading} className="flex-1 py-2.5 gradient-primary text-white text-sm font-medium rounded-md shadow-md disabled:opacity-70">{formLoading ? 'Saving...' : 'Save Changes'}</button></div>
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
                            <h3 className="text-lg font-bold text-black">Delete Candidate</h3>
                            <p className="text-sm text-slate-500 mt-2">Are you sure you want to delete <b>{selectedUser?.firstName} {selectedUser?.lastName}</b>? This action cannot be undone.</p>
                        </div>
                        <div className="flex items-center gap-3 mt-8"><button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 rounded-md border border-dark-200 text-sm font-medium text-dark-600">Cancel</button><button type="button" onClick={handleDeleteUser} disabled={formLoading} className="flex-1 py-2.5 bg-danger-600 text-white text-sm font-medium rounded-md hover:bg-danger-700 shadow-md disabled:opacity-70">{formLoading ? 'Deleting...' : 'Yes, Delete'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateManagement;
