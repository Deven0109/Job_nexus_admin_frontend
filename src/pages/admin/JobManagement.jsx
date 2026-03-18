import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineBriefcase,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineEye,
    HiOutlineMapPin,
    HiOutlineClock,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineArrowPath,
    HiOutlineBolt,
    HiOutlineXMark,
    HiOutlineBuildingOffice2,
    HiOutlineUserCircle,
    HiOutlineCalendarDays,
    HiOutlinePencilSquare,
} from 'react-icons/hi2';

const STATUS_COLORS = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-100',
    approved: 'bg-blue-50 text-blue-700 border border-blue-100',
    rejected: 'bg-rose-50 text-rose-600 border border-rose-100',
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    inactive: 'bg-rose-50 text-rose-600 border border-rose-100',
};

const URGENCY_COLORS = {
    Low: 'bg-slate-100 text-slate-600',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-red-100 text-red-700',
};

const JobManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [jobRequests, setJobRequests] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        page: 1,
        limit: 10,
    });

    // View Modal
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchJobRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: filters.page,
                limit: filters.limit
            };
            if (filters.search) params.search = filters.search;
            if (filters.status) params.status = filters.status;

            const response = await adminAPI.listJobRequests(params);
            const result = response.data;

            if (result.success && result.data) {
                setJobRequests(result.data.jobRequests || []);
                setPagination(result.data.pagination);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchJobRequests();
    }, [fetchJobRequests]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleToggleStatus = async (id, currentStatus) => {
        setActionLoading(true);
        try {
            await adminAPI.toggleJobStatus(id);
            toast.success(`Job ${currentStatus === 'active' ? 'rejected' : 'activated'} successfully!`);
            fetchJobRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to toggle status`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleView = (job) => {
        setSelectedJob(job);
        setShowViewModal(true);
    };

    const handleEdit = (jobId) => {
        navigate(`/jobs/${jobId}?edit=true`, { state: { from: location.pathname } });
    };

    const CURRENCY_SYMBOLS = {
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£',
        AED: 'AED ',
        CAD: 'C$',
        AUD: 'A$',
        SGD: 'S$',
        SAR: 'SR ',
        QAR: 'QR ',
    };

    const formatSalarySnippet = (min, max, currency = 'INR') => {
        const symbol = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.INR;
        const fmt = (n) => {
            if (!n && n !== 0) return '0';
            if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
            if (n >= 100000) return `${(n / 100000).toFixed(2)} L`;
            return n.toLocaleString('en-IN');
        };
        if (!min && !max && min !== 0 && max !== 0) return 'Not Specified';
        return `${symbol}${fmt(min)} – ${symbol}${fmt(max)}`;
    };

    const formatSalary = (min, max, currency = 'INR') => {
        const symbol = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.INR;
        const formatNumber = (n) => {
            if (!n && n !== 0) return '0';
            if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
            if (n >= 100000) return `${(n / 100000).toFixed(2)} L`;
            return n.toLocaleString('en-IN');
        };

        if (!min && !max && min !== 0 && max !== 0) {
            return <span className="text-xs font-bold text-slate-400">Not Specified</span>;
        }

        return (
            <div className="flex flex-col">
                <span className="font-bold text-emerald-600">
                    {symbol}{formatNumber(min)} – {symbol}{formatNumber(max)}
                </span>
            </div>
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    // Overall Stats
    const totalCount = pagination?.total || 0;
    const activeCount = jobRequests.filter(j => j.status === 'active').length;
    const pendingCount = jobRequests.filter(j => j.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-black tracking-tight flex items-center gap-3">
                    <HiOutlineBriefcase className="w-7 h-7 text-blue-600" />
                    Job Management
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Monitor and manage all job requests and live postings</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5 rounded-md border-slate-300 ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-indigo-50 text-indigo-500 flex items-center justify-center">
                            <HiOutlineBriefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-black leading-none">{totalCount}</p>
                            <p className="text-xs text-slate-700 font-bold mt-1">Total Jobs</p>
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
                            <p className="text-xs text-slate-700 font-bold mt-1">Live Active</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 rounded-md border-slate-300 ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-amber-50 text-amber-500 flex items-center justify-center">
                            <HiOutlineClock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-black leading-none">{pendingCount}</p>
                            <p className="text-xs text-slate-700 font-bold mt-1">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 rounded-md border-slate-300 ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-rose-50 text-rose-500 flex items-center justify-center">
                            <HiOutlineXCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-black leading-none">{jobRequests.filter(j => j.status === 'rejected').length}</p>
                            <p className="text-xs text-slate-700 font-bold mt-1">Rejected</p>
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
                            placeholder="Search jobs..."
                            className="w-full pl-11 pr-4 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm text-slate-700 placeholder-slate-400 focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/5 transition-all outline-none"
                        />
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        className="px-5 py-3 rounded-md bg-slate-50 border border-slate-300 text-sm font-medium text-slate-600 focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/5 transition-all outline-none appearance-none cursor-pointer min-w-[150px]"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="active">Active (Public)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <button
                        onClick={() => { setSearchInput(''); setFilters({ search: '', status: '', page: 1, limit: 10 }); }}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-slate-50 text-slate-600 text-xs font-medium uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-300"
                    >
                        <HiOutlineArrowPath className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="card rounded-md border-slate-300 ring-1 ring-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] table-auto text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider">Job Details</th>
                                <th className="text-left px-6 py-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider">Company</th>
                                <th className="text-left px-6 py-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider">Experience</th>
                                <th className="text-left px-6 py-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider">Salary</th>
                                <th className="text-center px-6 py-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider">Openings</th>
                                <th className="text-left px-6 py-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider">Status</th>
                                <th className="text-center px-6 py-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider">Applicants</th>
                                <th className="text-center px-6 py-4 font-bold text-slate-800 text-[11px] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                Array(5).fill().map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-200 rounded-md"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded-md"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded-md"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-200 rounded-md"></div></td>
                                        <td className="px-6 py-4 text-center"><div className="h-4 w-12 bg-slate-200 rounded-md mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded-md"></div></td>
                                        <td className="px-6 py-4 text-center"><div className="h-4 w-12 bg-slate-200 rounded-md mx-auto"></div></td>
                                        <td className="px-6 py-4 text-center"><div className="h-4 w-16 bg-slate-200 rounded-md mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : jobRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-5 py-16 text-center">
                                        <HiOutlineBriefcase className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                        <p className="text-black/80 font-bold">No jobs found</p>
                                    </td>
                                </tr>
                            ) : (
                                jobRequests.map((job) => (
                                    <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="min-w-0 max-w-[260px]">
                                                <p className="font-semibold text-slate-900 truncate">{job.jobTitle || job.title || 'Untitled Job'}</p>
                                                <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                                                    <HiOutlineMapPin className="w-3 h-3" />
                                                    {[job.city, job.state, job.country].filter(Boolean).join(', ') || job.jobLocation || job.location || 'Location not specified'}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-1">Posted: {formatDate(job.createdAt)}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 min-w-0 max-w-[250px]">
                                                <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                                                    {job.companyId?.logo ? (
                                                        <img src={job.companyId.logo} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <HiOutlineBuildingOffice2 className="w-5 h-5 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">{job.companyId?.companyName || 'Unknown Company'}</p>
                                                    <p className="text-[11px] text-slate-500 truncate">{job.companyId?.companyEmail || 'No Email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-slate-700">{job.experienceRequired || job.experience || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold text-emerald-700">{formatSalarySnippet(job.salaryMin, job.salaryMax, job.currency)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                                                {job.numberOfVacancies || job.vacancies || 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(job.status === 'active' || job.status === 'inactive') ? (
                                                <button
                                                    onClick={() => handleToggleStatus(job._id, job.status)}
                                                    disabled={actionLoading}
                                                    title={job.status === 'active' ? 'Click to deactivate' : 'Click to activate'}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${STATUS_COLORS[job.status]}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-md ${job.status === 'active' ? 'bg-emerald-900 animate-pulse' : 'bg-rose-900'}`}></span>
                                                    {job.status === 'inactive' ? 'rejected' : job.status}
                                                </button>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[job.status]}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-md ${job.status === 'approved' ? 'bg-blue-700' : job.status === 'pending' ? 'bg-amber-700 animate-pulse' : 'bg-rose-700'}`}></span>
                                                    {job.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-md">
                                                {job.applicantCount || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleView(job)}
                                                    className="p-2 rounded-md text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="View Full Details"
                                                >
                                                    <HiOutlineEye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(job._id)}
                                                    className="p-2 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="Edit Job Details"
                                                >
                                                    <HiOutlinePencilSquare className="w-5 h-5" />
                                                </button>
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
                    <p className="text-xs text-dark-500 font-medium">
                        Showing page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={!pagination.hasPrevPage}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold text-dark-600 bg-white border border-dark-200 hover:bg-dark-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <HiOutlineChevronLeft className="w-3 h-3" /> Previous
                        </button>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={!pagination.hasNextPage}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold text-dark-600 bg-white border border-dark-200 hover:bg-dark-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next <HiOutlineChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== VIEW MODAL ==================== */}
            {showViewModal && selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setShowViewModal(false)} />
                    <div className="relative bg-white rounded-md shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-300 animate-in fade-in zoom-in duration-300">
                        {/* Modal Header - Clean & Simple */}
                        <div className="relative shrink-0 bg-blue-500 px-8 py-6 border-b border-slate-300">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-md hover:bg-slate-200 text-black-900 transition-all active:scale-95"
                            >
                                <HiOutlineXMark className="w-5 h-5" />
                            </button>

                            <div className="relative z-10 flex flex-col gap-3">
                                <span className={`inline-flex w-fit items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                                    selectedJob.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                    selectedJob.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                                    'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                    {selectedJob.status === 'active' ? 'Live Active' : selectedJob.status}
                                </span>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight pr-12">
                                        {selectedJob.jobTitle || selectedJob.title}
                                    </h3>
                                    <p className="flex items-center flex-wrap gap-3 mt-2 text-slate-500 font-medium text-xs">
                                        <span className="flex items-center gap-1.5">
                                            <HiOutlineBuildingOffice2 className="w-4 h-4" />
                                            {selectedJob.companyId?.companyName || 'Unknown Company'}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="flex items-center gap-1.5">
                                            <HiOutlineMapPin className="w-4 h-4" />
                                            {[selectedJob.city, selectedJob.state, selectedJob.country].filter(Boolean).join(', ') || selectedJob.jobLocation || selectedJob.location || 'Remote'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
                            {/* Key Highlights Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Experience', value: selectedJob.experienceRequired || selectedJob.experience || 'Fresher', icon: HiOutlineUserCircle, color: 'text-slate-600', bg: 'bg-white' },
                                    { label: 'Salary (P.A)', value: formatSalarySnippet(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.currency), icon: null, color: 'text-slate-600', bg: 'bg-white' },
                                    { label: 'Work Type', value: selectedJob.workType || 'Onsite', icon: HiOutlineBriefcase, color: 'text-slate-600', bg: 'bg-white' },
                                    { label: 'Vacancies', value: selectedJob.numberOfVacancies || '01', icon: HiOutlineBolt, color: 'text-slate-600', bg: 'bg-white' },
                                ].map((item, i) => (
                                    <div key={i} className={`p-4 ${item.bg} rounded-md border border-slate-300 flex flex-col gap-2 transition-all`}>
                                        {item.icon && (
                                            <div className={`w-8 h-8 ${item.color} rounded-md bg-white border border-slate-300 flex items-center justify-center`}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                                            <p className="text-sm font-bold text-slate-900 leading-tight">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Skills Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    {/* <div className="w-1 h-5 bg-slate-400 rounded-full"></div>    */}
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Required Skills</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedJob.requiredSkills?.length > 0 ? (
                                        selectedJob.requiredSkills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-300 text-slate-700 text-[11px] font-bold rounded-md uppercase tracking-wider">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No specific skills listed</p>
                                    )}
                                </div>
                            </div>

                             {/* Role Description */}
                            <div className="bg-slate-50 rounded-md p-6 border border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    {/* <div className="w-1 h-5 bg-slate-400 rounded-md"></div> */}
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Job Description</h4>
                                </div>
                                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                    {selectedJob.jobDescription || selectedJob.description || 'Detailed description not provided.'}
                                </div>
                            </div>

                            {/* Footer Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 rounded-md bg-white border border-slate-300 shadow-sm flex items-start gap-4 transition-all hover:bg-slate-50 group">
                                    <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center shrink-0 border border-slate-300 text-slate-500 transition-all">
                                        <HiOutlineUserCircle className="w-5 h-5 " />
                                    </div>
                                     <div className="min-w-0">
                                        <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Employer Info</h4>
                                        <p className="font-bold text-slate-900 text-sm tracking-tight truncate uppercase">{selectedJob.companyId?.companyName || 'No Company'}</p>
                                        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{selectedJob.createdByEmployer?.email || selectedJob.companyId?.companyEmail || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="p-5 rounded-md bg-white border border-slate-300 shadow-sm flex items-start gap-4 transition-all hover:bg-slate-50 group">
                                    <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center shrink-0 border border-slate-300 text-slate-500 transition-all">
                                        <HiOutlineCalendarDays className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Audit Details</h4>
                                        <p className="text-sm font-bold text-slate-900">Posted on {formatDate(selectedJob.createdAt)}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase">Urgency:</span>
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${URGENCY_COLORS[selectedJob.urgency] || 'text-slate-400'}`}>{selectedJob.urgency}</span>
                                            </div>
                                            {selectedJob.approvedByRecruiter && (
                                                <div className="h-3 w-[1px] bg-slate-200"></div>
                                            )}
                                            {selectedJob.approvedByRecruiter && (
                                                <p className="text-[10px] text-slate-500 font-bold truncate">
                                                    By: <span className="text-slate-700 uppercase">{selectedJob.approvedByRecruiter.firstName} {selectedJob.approvedByRecruiter.lastName}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="w-full sm:w-auto px-10 py-2.5 rounded-md text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobManagement;
