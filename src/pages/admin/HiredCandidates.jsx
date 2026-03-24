import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api/admin.api';
import { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineCheckBadge,
    HiOutlineUsers,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineBriefcase,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineEye,
    HiOutlineTrash,
    HiOutlineXMark,
} from 'react-icons/hi2';

const HiredCandidates = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: 'Final Selected',
        page: 1,
        limit: 5,
    });
    const [pagination, setPagination] = useState(null);
    const [imageErrors, setImageErrors] = useState({});

    const [viewingApp, setViewingApp] = useState(null);
    const [deletingApp, setDeletingApp] = useState(null);

    const fetchApplications = useCallback(async () => {
        // Avoid full-page skeleton flash on every fetch to keep sidebar/layout stable
        if (!applications.length) {
            setLoading(true);
        }
        setError(false);
        try {
            const params = {
                page: filters.page,
                limit: filters.limit,
                status: filters.status,
            };
            if (filters.search) params.search = filters.search;

            const res = await adminAPI.listApplications(params);
            const result = res.data;

            if (result.success && result.data) {
                setApplications(result.data.applications || result.data.items || []);
                
                // Extract global total to synchronize with dashboard
                const total = result.data.pagination?.total ?? result.data.total ?? 0;
                const pageNum = result.data.pagination?.page ?? result.data.page ?? filters.page;
                const limitNum = result.data.pagination?.limit ?? result.data.limit ?? filters.limit;

                setPagination({
                    total: total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: result.data.pagination?.totalPages ?? result.data.totalPages ?? Math.ceil(total / limitNum),
                    hasNextPage: (pageNum * limitNum) < total,
                    hasPrevPage: pageNum > 1
                });
            } else {
                throw new Error(result.message || 'Failed to load hired candidates');
            }
        } catch (err) {
            setError(true);
            toast.error(err.response?.data?.message || err.message || 'Failed to load hired candidates');
        } finally {
            setLoading(false);
        }
    }, [filters, applications.length]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const totalHired = pagination?.total ?? applications.length;

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black tracking-tight flex items-center gap-2">
                        <HiOutlineCheckBadge className="w-7 h-7 text-emerald-600" />
                        Hire Candidate
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        View all candidates who are hired (Final Selected) across all jobs
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-widest">
                    <HiOutlineUsers className="w-4 h-4" />
                    <span>Total Hired: {totalHired}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-5 rounded-md border-slate-300 ring-1 ring-slate-100 bg-white">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                    <div className="flex-1 relative">
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by candidate name, email or job title..."
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card rounded-md border-slate-300 ring-1 ring-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/60 border-b border-slate-300">
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest">
                                    Candidate
                                </th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest">
                                    Contact
                                </th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest">
                                    Hired For
                                </th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[10px] uppercase tracking-widest hidden md:table-cell">
                                    Employer
                                </th>
                                <th className="text-left px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest">
                                    Hired On
                                </th>
                                <th className="text-center px-6 py-4 font-bold text-black text-[12px] uppercase tracking-widest">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {error && !loading && applications.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        Failed to load hired candidates. Please try again.
                                    </td>
                                </tr>
                            )}

                            {loading ? (
                                Array(5)
                                    .fill(0)
                                    .map((_, idx) => (
                                        <tr key={idx} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100" />
                                                    <div className="h-3 w-24 bg-slate-100 rounded" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-3 w-32 bg-slate-100 rounded" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-3 w-40 bg-slate-100 rounded" />
                                            </td>

                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <div className="h-3 w-32 bg-slate-100 rounded" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-3 w-20 bg-slate-100 rounded" />
                                            </td>
                                        </tr>
                                    ))
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <HiOutlineCheckBadge className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                        <p className="text-slate-500 font-medium">
                                            No hired candidates found yet.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => {
                                    const candidate = app.candidate || app.candidateId || {};
                                    const job = app.job || app.jobId || {};

                                    const jobCategory =
                                        job.category ||
                                        job.jobCategory ||
                                        job.category?.name ||
                                        job.category?.categoryName ||
                                        job.categoryName ||
                                        '';

                                    const candidateCategory =
                                        app.candidateProfile?.jobCategory ||
                                        app.candidateProfile?.category ||
                                        (Array.isArray(app.candidateProfile?.categories) ? app.candidateProfile.categories[0] : '') ||
                                        candidate.jobCategory ||
                                        candidate.category ||
                                        (Array.isArray(candidate.categories) ? candidate.categories[0] : '');
                                    const employerName =
                                        job.companyId?.companyName ||
                                        job.employer?.companyName ||
                                        job.employerName ||
                                        '—';

                                    return (
                                        <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-medium border border-emerald-100 overflow-hidden relative">
                                                        {candidate.avatar && !imageErrors[app._id] ? (
                                                            <img
                                                                src={
                                                                    candidate.avatar.startsWith('http') ||
                                                                        candidate.avatar.startsWith('data:')
                                                                        ? candidate.avatar
                                                                        : `${BASE_URL.replace(/\/$/, '')}/${candidate.avatar.replace(/^\//, '')}`
                                                                }
                                                                alt="Avatar"
                                                                className="w-full h-full object-cover"
                                                                onError={() => setImageErrors(prev => ({ ...prev, [app._id]: true }))}
                                                            />
                                                        ) : (
                                                            <span>
                                                                {candidate.firstName?.[0]}
                                                                {candidate.lastName?.[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-black leading-tight">
                                                            {candidate.firstName} {candidate.lastName}
                                                        </p>
                                                        <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-md uppercase tracking-widest">
                                                            HIRED
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1 text-[12px] font-bold text-black">
                                                    <p className="flex items-center gap-2 transition-colors">
                                                        <HiOutlineEnvelope className="w-3.5 h-3.5 text-slate-400/95" />
                                                        {candidate.email}
                                                    </p>
                                                    <p className="flex items-center gap-2 transition-colors">
                                                        <HiOutlinePhone className="w-3.5 h-3.5 text-slate-400/95" />
                                                        {candidate.phone || '—'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-black truncate mb-1">
                                                        {job.jobTitle || job.title || 'Untitled Job'}
                                                    </p>
                                                    {jobCategory && (
                                                        <span className="inline-flex px-2 py-0.5 rounded-md bg-blue-100 text-[9px] font-bold text-blue-500 uppercase">
                                                            {jobCategory}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-black truncate mb-0.5">
                                                        {employerName}
                                                    </p>
                                                    <p className="text-[11px] font-medium text-black truncate">
                                                        {job.companyId?.companyEmail || '—'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-widest border border-emerald-100">
                                                    {formatDate(app.updatedAt || app.hiredAt || app.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        onClick={() => setDeletingApp(app)}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-400 transition-all"
                                                        title="Delete hired record"
                                                    >
                                                        <HiOutlineTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
                        <p className="text-xs text-slate-500">
                            Showing{' '}
                            <span className="font-semibold text-slate-700">
                                {(pagination.page - 1) * pagination.limit + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-semibold text-slate-700">
                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </span>{' '}
                            of{' '}
                            <span className="font-semibold text-slate-700">{pagination.total}</span> candidates
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={!pagination.hasPrevPage}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <HiOutlineChevronLeft className="w-3 h-3" />
                                Previous
                            </button>
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={!pagination.hasNextPage}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                                <HiOutlineChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Candidate Modal */}
            {viewingApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setViewingApp(null)}
                    />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-lg font-medium text-slate-900">Candidate Details</h3>
                                <p className="text-xs font-medium text-slate-400/95 uppercase tracking-widest mt-0.5">
                                    Hire Candidate
                                </p>
                            </div>
                            <button
                                onClick={() => setViewingApp(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
                            >
                                <HiOutlineXMark className="w-4 h-4" />
                            </button>
                        </div>

                        {(() => {
                            const candidate = viewingApp.candidate || viewingApp.candidateId || {};
                            const job = viewingApp.job || viewingApp.jobId || {};
                            const employerName =
                                job.companyId?.companyName ||
                                job.employer?.companyName ||
                                job.employerName ||
                                '—';

                            return (
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold border border-emerald-100 overflow-hidden relative">
                                            {candidate.avatar && !imageErrors[`modal-${viewingApp._id}`] ? (
                                                <img
                                                    src={
                                                        candidate.avatar.startsWith('http') ||
                                                            candidate.avatar.startsWith('data:')
                                                            ? candidate.avatar
                                                            : `${BASE_URL.replace(/\/$/, '')}/${candidate.avatar.replace(/^\//, '')}`
                                                    }
                                                    alt="Avatar"
                                                    onError={() => setImageErrors(prev => ({ ...prev, [`modal-${viewingApp._id}`]: true }))}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>
                                                    {candidate.firstName?.[0]}
                                                    {candidate.lastName?.[0]}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-medium text-slate-900">
                                                {candidate.firstName} {candidate.lastName}
                                            </p>
                                            <p className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium uppercase tracking-widest border border-emerald-100">
                                                Hired for {job.jobTitle || job.title || '—'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                                            <p className="text-[11px] font-bold text-slate-400/95 uppercase tracking-widest mb-2">
                                                Contact
                                            </p>
                                            <div className="space-y-1 text-sm text-slate-700 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <HiOutlineEnvelope className="w-4 h-4 text-slate-400/95" />
                                                    <span>{candidate.email || '—'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <HiOutlinePhone className="w-4 h-4 text-slate-400/95" />
                                                    <span>
                                                        {candidate.phone ||
                                                            candidate.mobileNumber ||
                                                            viewingApp.candidateProfile?.mobileNumber ||
                                                            viewingApp.candidateProfile?.phone ||
                                                            viewingApp.phone ||
                                                            viewingApp.mobileNumber ||
                                                            '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                                            <p className="text-[11px] font-bold text-slate-400/95 uppercase tracking-widest mb-2">
                                                Job & Employer
                                            </p>
                                            <div className="space-y-1 text-sm text-slate-700 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <HiOutlineBriefcase className="w-4 h-4 text-slate-400/95" />
                                                    <span>{job.jobTitle || job.title || '—'}</span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Employer: <span className="font-medium">{employerName}</span>
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Hired on:{' '}
                                                    <span className="font-medium">
                                                        {formatDate(viewingApp.updatedAt || viewingApp.hiredAt || viewingApp.createdAt)}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end">
                            <button
                                onClick={() => setViewingApp(null)}
                                className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setDeletingApp(null)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Delete Hired Candidate</h3>
                            <button
                                onClick={() => setDeletingApp(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
                            >
                                <HiOutlineXMark className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-800">
                            Are you sure you want to delete this hired candidate entry? This will remove them from the
                            <span className="font-bold"> Hire Candidate </span>
                            list (status will be updated from hired).
                        </p>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setDeletingApp(null)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await adminAPI.updateApplicationStatus(deletingApp._id, 'reject-after-interview');
                                        toast.success('Hired candidate removed');
                                        setDeletingApp(null);
                                        fetchApplications();
                                    } catch (err) {
                                        toast.error(err.response?.data?.message || 'Failed to delete hired candidate');
                                    }
                                }}
                                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-rose-700 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HiredCandidates;

