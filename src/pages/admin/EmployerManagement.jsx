import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';
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
        limit: 10,
    });

    // View Profile Modal state
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [selectedEmployer, setSelectedEmployer] = useState(null);
    const [companyProfile, setCompanyProfile] = useState(null);

    const [fetchError, setFetchError] = useState(false);

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
            const status = data.data.user.isActive ? 'activated' : 'suspended';
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
        setFilters({ search: '', isActive: '', page: 1, limit: 10 });
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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-xl font-bold text-dark-900">Employer Management</h2>
                <p className="text-sm text-dark-500 mt-0.5">
                    Review, approve, and manage employer accounts
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center">
                        <HiOutlineBuildingOffice2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-dark-900">
                            {pagination?.total || 0}
                        </p>
                        <p className="text-xs text-dark-500">Total Employers</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center">
                        <HiOutlineCheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-dark-900">{activeCount}</p>
                        <p className="text-xs text-dark-500">Active</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-danger-500 to-danger-600 flex items-center justify-center">
                        <HiOutlineNoSymbol className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-dark-900">{inactiveCount}</p>
                        <p className="text-xs text-dark-500">Suspended</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <HiOutlineShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-dark-900">{verifiedCount}</p>
                        <p className="text-xs text-dark-500">Verified</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search employers by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-dark-200 text-sm text-dark-800 placeholder-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                        />
                    </div>
                    <select
                        value={filters.isActive}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, isActive: e.target.value, page: 1 }))
                        }
                        className="px-4 py-2.5 rounded-lg border border-dark-200 text-sm text-dark-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 appearance-none bg-white cursor-pointer min-w-[130px]"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Suspended</option>
                    </select>
                    <button
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-dark-200 text-sm font-medium text-dark-600 hover:bg-dark-50 transition-colors"
                    >
                        <HiOutlineArrowPath className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Employers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {fetchError && employers.length === 0 ? (
                    <div className="col-span-full card p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-danger-50 text-danger-500 flex items-center justify-center mb-4">
                            <HiOutlineExclamationTriangle className="w-8 h-8" />
                        </div>
                        <p className="text-dark-900 font-bold text-lg mb-1">Failed to load employers</p>
                        <p className="text-dark-500 text-sm mb-6 max-w-sm">We couldn't connect to the server. Make sure the backend is running.</p>
                        <button
                            onClick={fetchEmployers}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:shadow-lg transition-all"
                        >
                            <HiOutlineArrowPath className="w-4 h-4" />
                            Retry Connection
                        </button>
                    </div>
                ) : loading ? (
                    Array(6)
                        .fill()
                        .map((_, i) => (
                            <div key={i} className="card p-5 animate-pulse">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-11 h-11 rounded-xl bg-dark-200"></div>
                                    <div className="flex-1">
                                        <div className="w-28 h-4 rounded bg-dark-200 mb-2"></div>
                                        <div className="w-36 h-3 rounded bg-dark-100"></div>
                                    </div>
                                </div>
                                <div className="w-full h-8 rounded bg-dark-100"></div>
                            </div>
                        ))
                ) : employers.length === 0 ? (
                    <div className="col-span-full card p-12 text-center">
                        <HiOutlineBuildingOffice2 className="w-10 h-10 mx-auto text-dark-300 mb-3" />
                        <p className="text-dark-500 font-medium">No employers found</p>
                        <p className="text-dark-400 text-xs mt-1">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    employers.map((emp) => (
                        <div
                            key={emp._id}
                            className={`card p-5 hover:shadow-lg transition-all duration-300 border-l-4 ${emp.isActive
                                ? 'border-l-success-500'
                                : 'border-l-danger-400'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden border border-dark-100 ${emp.isActive
                                            ? 'bg-warning-100 text-warning-700'
                                            : 'bg-dark-200 text-dark-500'
                                            }`}
                                    >
                                        {emp.logo ? (
                                            <img src={emp.logo} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <>{emp.firstName?.[0]}{emp.lastName?.[0]}</>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-dark-900 truncate">
                                            {emp.firstName} {emp.lastName}
                                        </p>
                                        <p className="text-[10px] font-bold text-primary-600 truncate uppercase tracking-tight">
                                            {emp.companyName || 'No Company Profile'}
                                        </p>
                                        <p className="text-[11px] text-dark-400 truncate flex items-center gap-1 mt-0.5">
                                            <HiOutlineEnvelope className="w-3 h-3 flex-shrink-0" />
                                            {emp.email}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${emp.isActive
                                        ? 'bg-success-50 text-success-700'
                                        : 'bg-danger-50 text-danger-700'
                                        }`}
                                >
                                    {emp.isActive ? (
                                        <>
                                            <HiOutlineCheckCircle className="w-3 h-3" />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <HiOutlineXCircle className="w-3 h-3" />
                                            Suspended
                                        </>
                                    )}
                                </span>
                                {emp.verifiedByAdmin && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary-50 text-primary-700">
                                        <HiOutlineShieldCheck className="w-3 h-3" />
                                        Verified
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="space-y-1.5 mb-4">
                                {emp.phone && (
                                    <p className="text-xs text-dark-500 flex items-center gap-1.5">
                                        <HiOutlinePhone className="w-3 h-3 text-dark-400" />
                                        {emp.phone}
                                    </p>
                                )}
                                <p className="text-xs text-dark-400">
                                    Joined: {formatDate(emp.createdAt)}
                                </p>
                                <p className="text-xs text-dark-400">
                                    Last Login: {formatDateTime(emp.lastLoginAt)}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t border-dark-100">
                                <button
                                    onClick={() => handleViewProfile(emp)}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                                >
                                    <HiOutlineEye className="w-3.5 h-3.5" />
                                    View
                                </button>
                                <button
                                    onClick={() => handleToggleVerification(emp._id)}
                                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${emp.verifiedByAdmin
                                        ? 'bg-warning-50 text-warning-600 hover:bg-warning-100'
                                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                        }`}
                                >
                                    {emp.verifiedByAdmin ? (
                                        <>
                                            <HiOutlineXCircle className="w-3.5 h-3.5" />
                                            Unverify
                                        </>
                                    ) : (
                                        <>
                                            <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                                            Verify
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(emp._id)}
                                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${emp.isActive
                                        ? 'bg-danger-50 text-danger-600 hover:bg-danger-100'
                                        : 'bg-success-50 text-success-600 hover:bg-success-100'
                                        }`}
                                >
                                    {emp.isActive ? (
                                        <>
                                            <HiOutlineNoSymbol className="w-3.5 h-3.5" />
                                            Suspend
                                        </>
                                    ) : (
                                        <>
                                            <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                                            Activate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                )}
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
                            className="p-2 rounded-lg text-dark-500 hover:bg-dark-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiOutlineChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={!pagination.hasNextPage}
                            className="p-2 rounded-lg text-dark-500 hover:bg-dark-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiOutlineChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== VIEW COMPANY PROFILE MODAL ==================== */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowProfileModal(false); setCompanyProfile(null); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200">

                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6 rounded-t-2xl">
                            <button
                                onClick={() => { setShowProfileModal(false); setCompanyProfile(null); }}
                                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                            >
                                <HiOutlineXMark className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-lg font-bold backdrop-blur-sm overflow-hidden border border-white/30">
                                    {companyProfile?.logo ? (
                                        <img src={companyProfile.logo} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <>{selectedEmployer?.firstName?.[0]}{selectedEmployer?.lastName?.[0]}</>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
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
                                            <div className="h-3 w-24 bg-dark-200 rounded"></div>
                                            <div className="h-10 bg-dark-100 rounded-xl"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : !companyProfile || Object.keys(companyProfile).length === 0 ? (
                                <div className="py-12 text-center">
                                    <HiOutlineBuildingOffice2 className="w-12 h-12 mx-auto text-dark-300 mb-4" />
                                    <p className="text-dark-500 font-semibold">No company profile found</p>
                                    <p className="text-dark-400 text-sm mt-1">This employer has not set up their company profile yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-5">

                                    {/* Company Name */}
                                    <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-xl">
                                        <HiOutlineBuildingOffice2 className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Company Name</p>
                                            <p className="text-sm font-bold text-dark-900">{companyProfile.companyName || '—'}</p>
                                        </div>
                                    </div>

                                    {/* Two Column Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Industry */}
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-xl">
                                            <HiOutlineBriefcase className="w-5 h-5 text-warning-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Industry</p>
                                                <p className="text-sm font-bold text-dark-900">{companyProfile.industry || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-xl">
                                            <HiOutlineMapPin className="w-5 h-5 text-danger-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Location</p>
                                                <p className="text-sm font-bold text-dark-900">{companyProfile.companyLocation || companyProfile.location || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Company Size */}
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-xl">
                                            <HiOutlineUsers className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Company Size</p>
                                                <p className="text-sm font-bold text-dark-900">{COMPANY_SIZE_LABELS[companyProfile.companySize] || companyProfile.companySize || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Website */}
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-xl">
                                            <HiOutlineGlobeAlt className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Website</p>
                                                {companyProfile.companyWebsite || companyProfile.website ? (
                                                    <a href={companyProfile.companyWebsite || companyProfile.website} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary-600 hover:underline">{companyProfile.companyWebsite || companyProfile.website}</a>
                                                ) : (
                                                    <p className="text-sm font-bold text-dark-900">—</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contact Email */}
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-xl">
                                            <HiOutlineEnvelope className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Contact Email</p>
                                                <p className="text-sm font-bold text-dark-900">{companyProfile.companyEmail || companyProfile.contactEmail || '—'}</p>
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-xl">
                                            <HiOutlinePhone className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Phone</p>
                                                <p className="text-sm font-bold text-dark-900">{companyProfile.contactPersonPhone || selectedEmployer?.phone || '—'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {(companyProfile.companyDescription || companyProfile.description) && (
                                        <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-xl">
                                            <HiOutlineDocumentText className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Company Description</p>
                                                <p className="text-sm text-dark-700 leading-relaxed whitespace-pre-wrap">{companyProfile.companyDescription || companyProfile.description}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Verification & Timestamps */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-dark-100">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${companyProfile.verifiedByAdmin ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'}`}>
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
                        <div className="sticky bottom-0 bg-white px-8 py-4 border-t border-dark-100 rounded-b-2xl">
                            <button
                                onClick={() => { setShowProfileModal(false); setCompanyProfile(null); }}
                                className="w-full py-3 rounded-xl border border-dark-200 text-sm font-bold text-dark-600 hover:bg-dark-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployerManagement;
