import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineBriefcase,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineEye,
    HiOutlineMapPin,
    HiOutlineCurrencyRupee,
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
    const [jobRequests, setJobRequests] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        page: 1,
        limit: 5,
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
        navigate(`/jobs/${jobId}?edit=true`);
    };

    const formatSalary = (min, max) => {
        const fmt = (n) => {
            if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
            if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
            return `₹${n}`;
        };
        return `${fmt(min)} – ${fmt(max)}`;
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
                <h2 className="text-2xl font-black text-black/80 tracking-tight flex items-center gap-3">
                    <HiOutlineBriefcase className="w-7 h-7 text-blue-600" />
                    Job Management
                </h2>
                <p className="text-[13px] text-slate-500 mt-1 font-bold">Monitor and manage all job requests and live postings</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5 rounded-3xl border-none ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                            <HiOutlineBriefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-black/80 leading-none">{totalCount}</p>
                            <p className="text-xs text-slate-400 font-bold mt-1">Total Jobs</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 rounded-3xl border-none ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <HiOutlineCheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-black/80 leading-none">{activeCount}</p>
                            <p className="text-xs text-slate-400 font-bold mt-1">Live Active</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 rounded-3xl border-none ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                            <HiOutlineClock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-black/80 leading-none">{pendingCount}</p>
                            <p className="text-xs text-slate-400 font-bold mt-1">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 rounded-3xl border-none ring-1 ring-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                            <HiOutlineXCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-black/80 leading-none">{jobRequests.filter(j => j.status === 'rejected').length}</p>
                            <p className="text-xs text-slate-400 font-bold mt-1">Rejected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-5 rounded-3xl border-none ring-1 ring-slate-100 bg-white">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search jobs..."
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 placeholder-slate-400 focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/5 transition-all outline-none"
                        />
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-600 focus:bg-white focus:border-[#5b4eff] focus:ring-4 focus:ring-[#5b4eff]/5 transition-all outline-none appearance-none cursor-pointer min-w-[150px]"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="active">Active (Public)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <button
                        onClick={() => { setSearchInput(''); setFilters({ search: '', status: '', page: 1, limit: 5 }); }}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                    >
                        <HiOutlineArrowPath className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="card rounded-3xl border-none ring-1 ring-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="text-left px-6 py-4 font-black text-black/80 text-[10px] uppercase tracking-widest">Job Details</th>
                                <th className="text-left px-6 py-4 font-black text-black/80 text-[10px] uppercase tracking-widest">Company</th>
                                <th className="text-left px-6 py-4 font-black text-black/80 text-[10px] uppercase tracking-widest hidden lg:table-cell">Experience</th>
                                <th className="text-left px-6 py-4 font-black text-black/80 text-[10px] uppercase tracking-widest hidden lg:table-cell">Salary</th>
                                <th className="text-left px-6 py-4 font-black text-black/80 text-[10px] uppercase tracking-widest hidden md:table-cell">Recruiter</th>
                                <th className="text-left px-6 py-4 font-black text-black/80 text-[10px] uppercase tracking-widest">Status</th>
                                <th className="text-center px-6 py-4 font-black text-black/80 text-[10px] uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-50">
                            {loading ? (
                                Array(5).fill().map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4"><div className="h-4 w-32 bg-dark-200 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-28 bg-dark-200 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-16 bg-dark-100 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-24 bg-dark-100 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-16 bg-dark-100 rounded"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-20 bg-dark-100 rounded mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : jobRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-5 py-16 text-center">
                                        <HiOutlineBriefcase className="w-12 h-12 mx-auto text-dark-300 mb-3" />
                                        <p className="text-dark-500 font-semibold">No jobs found</p>
                                    </td>
                                </tr>
                            ) : (
                                jobRequests.map((job) => (
                                    <tr key={job._id} className="hover:bg-dark-25 transition-colors">
                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="font-bold text-black/80">{job.jobTitle || job.title || 'Untitled Job'}</p>
                                                <p className="text-[11px] text-dark-400 flex items-center gap-1 mt-0.5 leading-none">
                                                    <HiOutlineMapPin className="w-3 h-3" />
                                                    {[job.city, job.state, job.country].filter(Boolean).join(', ') || job.jobLocation || job.location || 'Location not specified'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {job.companyId?.logo ? (
                                                        <img src={job.companyId.logo} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <HiOutlineBuildingOffice2 className="w-5 h-5 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-black/80 truncate">{job.companyId?.companyName || 'Unknown Company'}</p>
                                                    <p className="text-[11px] text-dark-400 truncate">{job.companyId?.companyEmail || 'No Email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-dark-600">{job.experienceRequired || job.experience || 'Not specified'}</td>
                                        <td className="px-5 py-4 text-dark-600">{formatSalary(job.salaryMin, job.salaryMax)}</td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <p className="text-xs font-bold text-dark-700">{job.approvedByRecruiter ? `${job.approvedByRecruiter.firstName} ${job.approvedByRecruiter.lastName}` : 'N/A'}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            {(job.status === 'active' || job.status === 'inactive') ? (
                                                <button
                                                    onClick={() => handleToggleStatus(job._id, job.status)}
                                                    disabled={actionLoading}
                                                    title={job.status === 'active' ? 'Click to deactivate' : 'Click to activate'}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${STATUS_COLORS[job.status]}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                    {job.status === 'inactive' ? 'rejected' : job.status}
                                                </button>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[job.status]}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'approved' ? 'bg-blue-500' : job.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                    {job.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleView(job)}
                                                    className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="View Full Details"
                                                >
                                                    <HiOutlineEye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(job._id)}
                                                    className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-dark-600 bg-white border border-dark-200 hover:bg-dark-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <HiOutlineChevronLeft className="w-3 h-3" /> Previous
                        </button>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={!pagination.hasNextPage}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-dark-600 bg-white border border-dark-200 hover:bg-dark-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                    <div className="relative bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="relative shrink-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-10 overflow-hidden">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>

                            <button
                                onClick={() => setShowViewModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-md border border-white/10 active:scale-95"
                            >
                                <HiOutlineXMark className="w-5 h-5" />
                            </button>

                            <div className="relative z-10 flex flex-col gap-4">
                                <span className="inline-flex w-fit items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm shadow-xl">
                                    {selectedJob.status === 'active' ? 'Live Active' : selectedJob.status}
                                </span>
                                <div>
                                    <h3 className="text-3xl font-black text-white leading-tight pr-12 tracking-tight uppercase">
                                        {selectedJob.jobTitle || selectedJob.title}
                                    </h3>
                                    <p className="flex items-center gap-2 mt-2 text-white/90 font-bold text-sm">
                                        <HiOutlineBuildingOffice2 className="w-4 h-4" />
                                        {selectedJob.companyId?.companyName || 'Unknown Company'}
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                                        <HiOutlineMapPin className="w-4 h-4" />
                                        {[selectedJob.city, selectedJob.state, selectedJob.country].filter(Boolean).join(', ') || selectedJob.jobLocation || selectedJob.location || 'Remote'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
                            {/* Key Highlights Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Experience', value: selectedJob.experienceRequired || selectedJob.experience || 'Fresher', icon: HiOutlineUserCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { label: 'Salary (P.A)', value: formatSalary(selectedJob.salaryMin, selectedJob.salaryMax), icon: HiOutlineCurrencyRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { label: 'Work Type', value: selectedJob.workType || 'Onsite', icon: HiOutlineBriefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
                                    { label: 'Vacancies', value: selectedJob.numberOfVacancies || '01', icon: HiOutlineBolt, color: 'text-amber-600', bg: 'bg-amber-50' },
                                ].map((item, i) => (
                                    <div key={i} className={`p-4 ${item.bg} rounded-2xl border border-white shadow-sm flex flex-col gap-2`}>
                                        <div className={`w-8 h-8 ${item.color} rounded-lg bg-white shadow-sm flex items-center justify-center`}>
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                                            <p className="text-sm font-black text-slate-900 leading-none">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Skills Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-6 bg-primary-600 rounded-full"></div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Required Expertise</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedJob.requiredSkills?.length > 0 ? (
                                        selectedJob.requiredSkills.map((skill, i) => (
                                            <span key={i} className="px-4 py-2 bg-indigo-50 border border-indigo-100/50 text-indigo-700 text-xs font-black rounded-xl hover:bg-indigo-100 transition-colors uppercase tracking-wider">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No specific skills listed</p>
                                    )}
                                </div>
                            </div>

                            {/* Role Description */}
                            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 ring-4 ring-slate-50/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Job Responsibilities</h4>
                                </div>
                                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                    {selectedJob.jobDescription || selectedJob.description || 'Detailed description not provided.'}
                                </div>
                            </div>

                            {/* Footer Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start gap-4 transition-all hover:border-blue-100 hover:bg-blue-50/10">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                        <HiOutlineUserCircle className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hiring Manager</h4>
                                        <p className="text-sm font-black text-slate-900 truncate">
                                            {selectedJob.createdByEmployer?.firstName ? `${selectedJob.createdByEmployer.firstName} ${selectedJob.createdByEmployer.lastName || ''}` : (selectedJob.companyId?.companyName || 'Not Assigned')}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium truncate">{selectedJob.createdByEmployer?.email || selectedJob.companyId?.companyEmail || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start gap-4 transition-all hover:border-indigo-100 hover:bg-indigo-50/10">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                        <HiOutlineCalendarDays className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Audit Details</h4>
                                        <p className="text-sm font-black text-slate-900">Posted on {formatDate(selectedJob.createdAt)}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-xs text-slate-500 font-medium">Urgency:</span>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${URGENCY_COLORS[selectedJob.urgency] || 'text-slate-500'}`}>{selectedJob.urgency}</span>
                                        </div>
                                        {selectedJob.approvedByRecruiter && (
                                            <p className="text-xs text-slate-500 font-medium mt-1">
                                                Managed by: <span className="text-slate-900 font-black">{selectedJob.approvedByRecruiter.firstName} {selectedJob.approvedByRecruiter.lastName}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="w-full sm:w-auto px-12 py-3.5 rounded-2xl text-sm font-black text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 active:scale-95"
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
