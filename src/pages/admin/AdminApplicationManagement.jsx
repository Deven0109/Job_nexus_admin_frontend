import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../api/axios';
import { Skeleton, Box, Stack, Paper, Button, IconButton, Typography, Divider, Avatar } from '@mui/material';
import {
    HiOutlineClipboardDocumentList,
    HiOutlineMagnifyingGlass,
    HiOutlineArrowPath,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineEye,
    HiOutlineUser,
    HiOutlineBriefcase,
    HiOutlineBuildingOffice2,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineMapPin,
    HiOutlineCalendarDays,
    HiOutlineArrowLeft,
    HiOutlineBolt,
    HiOutlineUsers,
    HiOutlineCurrencyRupee,
    HiOutlineCheckCircle,
    HiOutlineXMark,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineVideoCamera,
    HiOutlineClock,
    HiOutlineAcademicCap,
    HiOutlineCheckBadge,
    HiOutlineAdjustmentsVertical,
    HiOutlineArrowsUpDown,
    HiOutlineChevronDoubleRight,
    HiOutlineUserGroup
} from 'react-icons/hi2';

const COLUMN_CONFIG = [
    { key: 'Applied', title: 'Applied', color: 'bg-blue-500 shadow-blue-100', text: 'text-blue-600', bg: 'bg-blue-50', action: 'review' },
    {
        key: 'Under Review',
        title: 'Review',
        color: 'bg-amber-500 shadow-amber-100',
        text: 'text-amber-600',
        bg: 'bg-amber-50',
        action: 'shortlist',
        include: ['Under Review', 'Recruiter Shortlisted']
    },
    { key: 'Employer Shortlisted', title: 'Shortlisted', color: 'bg-indigo-500 shadow-indigo-100', text: 'text-indigo-600', bg: 'bg-indigo-50', action: 'interview' },
    {
        key: 'Interview Scheduled',
        title: 'Interview',
        color: 'bg-purple-500 shadow-purple-100',
        text: 'text-purple-600',
        bg: 'bg-purple-50',
        action: 'next-round',
        include: ['Interview Scheduled', 'Selected Next Round']
    },
    { key: 'Final Selected', title: 'Hired', color: 'bg-emerald-500 shadow-emerald-100', text: 'text-emerald-600', bg: 'bg-emerald-50', action: 'hire' },
    {
        key: 'Final Rejected',
        title: 'Rejected',
        color: 'bg-red-500 shadow-red-100',
        text: 'text-red-600',
        bg: 'bg-red-50',
        action: null,
        include: ['Final Rejected', 'Recruiter Rejected', 'Employer Rejected']
    }
];
const STATUS_THEMES = {
    'Applied': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', label: 'New Applied' },
    'Under Review': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'Reviewing' },
    'Recruiter Shortlisted': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', label: 'Recruiter SL' },
    'Employer Shortlisted': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Employer Approved' },
    'Interview Scheduled': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', label: 'Interviewing' },
    'Selected Next Round': { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100', label: 'Next Round' },
    'Final Selected': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', label: 'Hired' },
    'Final Rejected': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', label: 'Rejected' },
    'Recruiter Rejected': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', label: 'Rejected' },
    'Employer Rejected': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', label: 'Rejected' }
};

const STEPS = [
    { label: 'APPLIED', icon: HiOutlineClipboardDocumentList, statuses: ['Applied', 'Recruiter Rejected'] },
    { label: 'REVIEW', icon: HiOutlineMagnifyingGlass, statuses: ['Under Review'] },
    { label: 'SHORTLIST', icon: HiOutlineUsers, statuses: ['Recruiter Shortlisted', 'Employer Shortlisted', 'Employer Rejected'] },
    { label: 'INTERVIEW', icon: HiOutlineVideoCamera, statuses: ['Interview Scheduled', 'Interview Completed', 'Selected Next Round'] },
    { label: 'SELECTED', icon: HiOutlineCheckBadge, statuses: ['Final Selected', 'Final Rejected'] }
];

const WorkflowStepper = ({ currentStatus }) => {
    // Determine progress depth based on current status
    const statusLevels = {
        'Applied': 0,
        'Recruiter Rejected': 0,
        'Under Review': 1,
        'Recruiter Shortlisted': 2,
        'Employer Shortlisted': 2,
        'Employer Rejected': 2,
        'Interview Scheduled': 3,
        'Interview Completed': 3,
        'Selected Next Round': 3,
        'Final Selected': 4,
        'Final Rejected': 4
    };

    const currentLevel = statusLevels[currentStatus] ?? 0;
    const isCurrentlyRejected = currentStatus.includes('Rejected');

    return (
        <div className="flex items-center justify-between w-full max-w-[320px] px-2 py-2">
            {STEPS.map((step, index) => {
                const isPassed = index < currentLevel;
                const isCurrent = index === currentLevel;
                const isNodeRejected = isCurrent && isCurrentlyRejected;

                // State for node visual
                const state = (isPassed || (index === 4 && currentStatus === 'Final Selected'))
                    ? 'completed'
                    : isNodeRejected ? 'rejected' : isCurrent ? 'active' : 'pending';

                return (
                    <div key={index} className="flex flex-col items-center relative flex-1">
                        {/* Connecting Line (from previous to current) */}
                        {index !== 0 && (
                            <div
                                style={{ width: '100%', left: '-50%', top: '12px' }}
                                className={`absolute h-[3px] -translate-y-1/2 z-0 transition-all duration-500
                                ${index <= currentLevel
                                        ? (isCurrentlyRejected && index === currentLevel ? 'bg-red-500' : 'bg-emerald-500')
                                        : 'bg-slate-300'}`}
                            />
                        )}

                        {/* Status Node */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10
                            ${state === 'completed' ? 'bg-emerald-600 border-emerald-600' :
                                state === 'rejected' ? 'bg-red-600 border-red-600' :
                                    state === 'active' ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-50' :
                                        'bg-white border-slate-200'}`}
                        >
                            {state === 'completed' ? (
                                <HiOutlineCheckCircle className="w-4 h-4 text-white" />
                            ) : state === 'rejected' ? (
                                <HiOutlineXMark className="w-4 h-4 text-white" />
                            ) : (
                                <span className={`text-[10px] font-black leading-none ${state === 'active' ? 'text-white' : 'text-slate-300'}`}>
                                    {index + 1}
                                </span>
                            )}
                        </div>

                        {/* Step Label */}
                        <span className={`mt-1 text-[7px] font-black uppercase text-center transition-colors px-0.5
                            ${state === 'active' ? 'text-blue-600' :
                                state === 'completed' ? 'text-slate-900' :
                                    state === 'rejected' ? 'text-red-500' :
                                        'text-slate-300'}`}
                        >
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const AdminApplicationManagement = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [view, setView] = useState('jobs'); // 'jobs' | 'applicants' | 'pipeline'
    const [selectedJob, setSelectedJob] = useState(null);

    // Pipeline States
    const [pipeline, setPipeline] = useState({});
    const [viewingProfile, setViewingProfile] = useState(null);
    const [pipelineLoading, setPipelineLoading] = useState(false);

    // Jobs View States
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [jobsTotal, setJobsTotal] = useState(0);
    const [jobsPage, setJobsPage] = useState(1);
    const [jobsSearch, setJobsSearch] = useState('');
    const [jobsStatusFilter, setJobsStatusFilter] = useState('active');
    const [globalStats, setGlobalStats] = useState({ totalActive: 0, totalOverall: 0 });

    // Applicants View States
    const [applicants, setApplicants] = useState([]);
    const [applicantsLoading, setApplicantsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isScheduling, setIsScheduling] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    // View/Edit Modal States
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedJobDetail, setSelectedJobDetail] = useState(null);

    const [interviewData, setInterviewData] = useState({
        roundNumber: 1,
        meetLink: '',
        meetCode: '',
        scheduledAt: ''
    });

    const limit = 5;

    // --- FETCH JOBS ---
    const fetchJobs = useCallback(async () => {
        setJobsLoading(true);
        try {
            const params = {
                page: jobsPage,
                limit,
                search: jobsSearch,
                status: jobsStatusFilter
            };
            const res = await adminAPI.listJobRequests(params);
            if (res.data?.success) {
                setJobs(res.data.data.jobRequests);
                setJobsTotal(res.data.data.pagination.total);
                if (res.data.data.stats) {
                    setGlobalStats(res.data.data.stats);
                }
            }
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setJobsLoading(false);
        }
    }, [jobsPage, jobsSearch, jobsStatusFilter]);

    useEffect(() => {
        if (view === 'jobs') {
            const timer = setTimeout(() => {
                fetchJobs();
            }, jobsSearch ? 400 : 0);
            return () => clearTimeout(timer);
        }
    }, [fetchJobs, view]);

    // --- FETCH APPLICANTS ---
    const fetchApplicants = async (jobId) => {
        setApplicantsLoading(true);
        try {
            const res = await adminAPI.getJobApplications(jobId);
            if (res.data?.success) {
                setApplicants(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load applicants');
        } finally {
            setApplicantsLoading(false);
        }
    };

    // Filter by jobId from URL (Notification redirection)
    useEffect(() => {
        const jobIdParam = searchParams.get('jobId');
        if (jobIdParam) {
            const loadJobFromUrl = async () => {
                try {
                    const res = await adminAPI.getJobRequestById(jobIdParam);
                    if (res.data?.success) {
                        const job = res.data.data;
                        setSelectedJob(job);
                        setView('applicants');
                        fetchApplicants(jobIdParam);
                    }
                } catch (error) {
                    console.error('Failed to load job from URL param', error);
                }
            };
            loadJobFromUrl();
        }
    }, [searchParams]);

    const handleViewApplicants = (job) => {
        setSelectedJob(job);
        setView('applicants');
        // We need the actual Job ID (from the Job model) to fetch applications
        const actualJobId = job.jobId || job._id;
        fetchApplicants(actualJobId);
    };

    const handleAllApplicationsClick = () => {
        if (selectedJob) {
            const actualJobId = selectedJob.jobId || selectedJob._id;
            fetchApplicants(actualJobId);
        }
        setView('applicants');
    };

    const handleBackToJobs = () => {
        setView('jobs');
        setSelectedJob(null);
        setApplicants([]);
    };

    // --- HIRE WORKFLOW ACTIONS ---
    const handleStatusUpdate = async (id, action, successMsg) => {
        const loadingToast = toast.loading('Updating status...');
        setIsUpdating(true);
        try {
            await adminAPI.updateApplicationStatus(id, action);
            toast.dismiss(loadingToast);
            toast.success(successMsg);
            if (view === 'applicants') fetchApplicants(selectedJob.jobId || selectedJob._id);
            if (view === 'pipeline') fetchPipeline(selectedJob.jobId || selectedJob._id);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await adminAPI.updateApplicationStatus(isScheduling, 'schedule-interview', interviewData);
            toast.success('Interview Scheduled');
            setIsScheduling(null);
            if (view === 'applicants') fetchApplicants(selectedJob.jobId || selectedJob._id);
            if (view === 'pipeline') fetchPipeline(selectedJob.jobId || selectedJob._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Scheduling failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditJob = (job) => {
        navigate(`/jobs/${job._id}`);
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) return;

        setActionLoading(true);
        try {
            await adminAPI.deleteJobRequest(jobId);
            toast.success('Job posting deleted successfully');
            fetchJobs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete job');
        } finally {
            setActionLoading(false);
        }
    };

    // --- PIPELINE ACTIONS ---
    const fetchPipeline = async (jobId) => {
        setPipelineLoading(true);
        try {
            const res = await adminAPI.getJobPipeline(jobId);
            if (res.data?.success) {
                setPipeline(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load hiring pipeline');
        } finally {
            setPipelineLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            const loadToast = toast.loading('Moving candidate...');
            await adminAPI.updateApplicationStatus(id, action);
            toast.dismiss(loadToast);
            toast.success('Candidate moved forward');
            fetchPipeline(selectedJob.jobId || selectedJob._id);
        } catch (error) {
            toast.error('Failed to move candidate');
        }
    };

    const handlePipeline = (jobId) => {
        const job = jobs.find(j => j._id === jobId) || selectedJob;
        setSelectedJob(job);
        setView('pipeline');
        fetchPipeline(jobId);
    };

    const getCandidatesForColumn = (col) => {
        if (col.include) {
            return col.include.reduce((acc, status) => {
                const list = pipeline?.[status] || [];
                return [...acc, ...(Array.isArray(list) ? list : [])];
            }, []);
        }
        const list = pipeline?.[col.key] || [];
        return Array.isArray(list) ? list : [];
    };

    const totalPipelineCandidates = COLUMN_CONFIG.reduce((sum, col) => {
        return sum + getCandidatesForColumn(col).length;
    }, 0);

    const formatSalary = (min, max) => {
        const fmt = (n) => {
            if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
            if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
            return `₹${n}`;
        };
        return `${fmt(min)} – ${fmt(max)}`;
    };

    const renderJobCards = () => (
        <div className="space-y-6 pt-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-black/80 tracking-tight">
                    Manage Job Postings
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    Track and manage all your active and closed job listings
                </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-5 rounded-md shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <HiOutlineBriefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Postings</p>
                        <p className="text-2xl font-black text-slate-900 leading-none">{globalStats.totalOverall}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-md shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <HiOutlineBolt className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Jobs</p>
                        <p className="text-2xl font-black text-slate-900 leading-none">
                            {globalStats.totalActive}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-md shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={jobsSearch}
                        onChange={(e) => { setJobsSearch(e.target.value); setJobsPage(1); }}
                        placeholder="Search by title, city or location..."
                        className="w-full pl-11 pr-4 py-3 rounded-md border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-slate-50 focus:bg-white transition-all outline-none"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <HiOutlineAdjustmentsVertical className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={jobsStatusFilter}
                            onChange={(e) => { setJobsStatusFilter(e.target.value); setJobsPage(1); }}
                            className="pl-9 pr-8 py-3 rounded-md border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none appearance-none cursor-pointer min-w-[140px] transition-all"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div className="relative">
                        <HiOutlineArrowsUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            className="pl-9 pr-8 py-3 rounded-md border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none appearance-none cursor-pointer min-w-[140px] transition-all"
                        >
                            <option value="">Latest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Job List Area */}
            <Stack spacing={1.5}>
                {jobsLoading ? (
                    Array(limit).fill(0).map((_, i) => (
                        <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="30%" height={24} />
                                <Skeleton variant="text" width="20%" height={16} sx={{ mt: 0.5 }} />
                            </Box>
                        </Paper>
                    ))
                ) : jobs.length === 0 ? (
                    <Paper sx={{ py: 12, textAlign: 'center', borderRadius: 1, border: '1px dashed', borderColor: 'divider', bgcolor: 'slate.50/50' }}>
                        <HiOutlineBriefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <Typography variant="body1" fontWeight={800} color="text.secondary">No jobs found</Typography>
                    </Paper>
                ) : (
                    jobs.map((job) => (
                        <Paper
                            key={job._id}
                            elevation={0}
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: { xs: 2, sm: 4 },
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: '#f8fafc',
                                    borderColor: 'primary.200',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                }
                            }}
                        >
                            {/* Job Info */}
                            <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 240 } }}>
                                <Typography
                                    onClick={() => handleEditJob(job)}
                                    variant="h6"
                                    fontWeight={900}
                                    sx={{
                                        color: 'text.primary',
                                        mb: 0.5,
                                        tracking: '-0.02em',
                                        fontSize: '18px',
                                        cursor: 'pointer',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    {job.jobTitle || job.title}
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 800, color: 'text.secondary' }}>
                                        <HiOutlineMapPin className="w-3.5 h-3.5" />
                                        {[job.city, job.state].filter(Boolean).join(', ') || job.location || 'Remote'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 800, color: 'primary.main', bgcolor: 'primary.50', px: 1, py: 0.2, borderRadius: 0.5, whiteSpace: 'nowrap' }}>
                                        <HiOutlineCurrencyRupee className="w-3.5 h-3.5" />
                                        {formatSalary(job.salaryMin, job.salaryMax)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>•</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        Posted {new Date(job.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Stack>
                            </Box>

                            {/* Stats */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, px: { sm: 3 }, borderLeft: { sm: '1px solid' }, borderRight: { sm: '1px solid' }, borderColor: 'divider' }}>
                                <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                                    <Typography variant="h6" fontWeight={900} color="primary.main" sx={{ fontSize: '16px' }}>{job.numberOfVacancies || 0}</Typography>
                                    <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ textTransform: 'uppercase', tracking: '0.05em', fontSize: '10px' }}>Positions</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                                    <Box
                                        sx={{
                                            px: 1,
                                            py: 0.2,
                                            borderRadius: 0.5,
                                            fontSize: '9px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            mb: 0.4,
                                            display: 'inline-block',
                                            bgcolor: (job.urgency?.toUpperCase() === 'HIGH') ? '#FEF2F2' : (job.urgency?.toUpperCase() === 'MEDIUM') ? '#FFFBEB' : '#F3F4F6',
                                            color: (job.urgency?.toUpperCase() === 'HIGH') ? '#DC2626' : (job.urgency?.toUpperCase() === 'MEDIUM') ? '#D97706' : '#4B5563',
                                            border: '1px solid',
                                            borderColor: (job.urgency?.toUpperCase() === 'HIGH') ? '#FEE2E2' : (job.urgency?.toUpperCase() === 'MEDIUM') ? '#FEF3C7' : '#E5E7EB'
                                        }}
                                    >
                                        {job.urgency || 'Normal'}
                                    </Box>
                                    <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ textTransform: 'uppercase', tracking: '0.05em', fontSize: '10px', display: 'block' }}>Priority</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', minWidth: 70 }}>
                                    <Box
                                        sx={{
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 0.5,
                                            fontSize: '10px',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            bgcolor: job.status === 'active' ? '#ECFDF5' : '#F1F5F9',
                                            color: job.status === 'active' ? '#059669' : '#475569',
                                            border: '1px solid',
                                            borderColor: job.status === 'active' ? '#D1FAE5' : '#E2E8F0'
                                        }}
                                    >
                                        {job.status}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Actions */}
                            <Stack direction="row" spacing={1.5} sx={{ ml: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
                                <Button
                                    onClick={() => handlePipeline(job._id)}
                                    size="small"
                                    variant="contained"
                                    startIcon={<HiOutlineBolt />}
                                    sx={{ 
                                        borderRadius: '14px', 
                                        fontWeight: 900, 
                                        textTransform: 'none', 
                                        px: 3, 
                                        height: 38,
                                        bgcolor: '#22c55e', 
                                        color: '#000',
                                        '&:hover': { bgcolor: '#16a34a' }, 
                                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
                                        '& .MuiButton-startIcon': { color: '#000' }
                                    }}
                                >
                                    Pipeline
                                </Button>
                                <Button
                                    onClick={() => handleViewApplicants(job)}
                                    size="small"
                                    variant="contained"
                                    startIcon={<HiOutlineUsers />}
                                    sx={{ 
                                        borderRadius: '14px', 
                                        fontWeight: 900, 
                                        textTransform: 'none', 
                                        px: 2.5, 
                                        height: 38,
                                        bgcolor: '#5b4eff', 
                                        color: '#fff',
                                        '&:hover': { bgcolor: '#4a3fed' }, 
                                        boxShadow: '0 4px 12px rgba(91, 78, 255, 0.25)',
                                        minWidth: 'unset',
                                        '& .MuiButton-startIcon': { color: '#fff' }
                                    }}
                                >
                                    Applicants
                                </Button>
                                <Stack direction="row" spacing={0.5}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEditJob(job)}
                                        sx={{ color: '#d97706', bgcolor: '#fffbeb', border: '1px solid', borderColor: '#fef3c7', '&:hover': { bgcolor: '#fef3c7' } }}
                                    >
                                        <HiOutlinePencilSquare className="w-4 h-4" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDeleteJob(job._id)}
                                        sx={{ color: '#dc2626', bgcolor: '#fef2f2', border: '1px solid', borderColor: '#fee2e2', '&:hover': { bgcolor: '#fee2e2' } }}
                                    >
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </Paper>
                    ))
                )}
            </Stack>

            {/* Pagination */}
            {!jobsLoading && Math.ceil(jobsTotal / limit) > 1 && (
                <div className="flex items-center justify-between mt-6 px-2">
                    <button
                        onClick={() => setJobsPage(prev => Math.max(1, prev - 1))}
                        disabled={jobsPage === 1}
                        className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm active:scale-95"
                    >
                        <HiOutlineChevronLeft className="w-4 h-4" />
                        Previous
                    </button>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg">
                        Page {jobsPage} / {Math.ceil(jobsTotal / limit)}
                    </span>
                    <button
                        onClick={() => setJobsPage(prev => Math.min(Math.ceil(jobsTotal / limit), prev + 1))}
                        disabled={jobsPage === Math.ceil(jobsTotal / limit)}
                        className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm active:scale-95"
                    >
                        Next
                        <HiOutlineChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );

    const renderApplicantsList = () => (
        <div className="space-y-3 pt-6">
            {/* Header */}
            <Paper elevation={0} sx={{ p: 1, px: 2, borderRadius: 1.25, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 3 }}>
                <IconButton
                    onClick={handleBackToJobs}
                    sx={{ bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: '#f1f5f9' } }}
                >
                    <HiOutlineArrowLeft className="w-5 h-5 text-slate-600" />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={900} color="text.primary">Candidates & Applications</Typography>
                    <Typography variant="caption" fontWeight={800} color="primary.main" sx={{ textTransform: 'uppercase', tracking: '0.1em' }}>
                        {selectedJob?.jobTitle || selectedJob?.title}
                    </Typography>
                </Box>
                <Button
                    onClick={() => handlePipeline(selectedJob?._id)}
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<HiOutlineBolt />}
                    sx={{ borderRadius: 1.5, fontWeight: 900, textTransform: 'none', px: 2, bgcolor: '#22c55e', '&:hover': { bgcolor: '#1eb054' }, boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)' }}
                >
                    Pipeline
                </Button>
            </Paper>

            {/* Application List */}
            <Stack spacing={1}>
                {applicantsLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: 1, border: '1px solid', borderColor: 'divider', animate: 'pulse' }}>
                            <Skeleton variant="text" width="40%" height={24} />
                            <Skeleton variant="text" width="20%" height={16} sx={{ mt: 1 }} />
                        </Paper>
                    ))
                ) : applicants.length === 0 ? (
                    <Paper sx={{ py: 12, textAlign: 'center', borderRadius: 1, border: '1px dashed', borderColor: 'divider', bgcolor: '#f8fafc' }}>
                        <HiOutlineUser className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <Typography variant="body1" fontWeight={800} color="text.secondary">No candidates found for this job</Typography>
                    </Paper>
                ) : (
                    (applicants || []).map((app) => (
                        <Paper
                            key={app._id}
                            elevation={0}
                            sx={{
                                p: 0.75, // Reduced padding
                                px: 2,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                flexWrap: 'nowrap',
                                alignItems: 'center',
                                gap: 1.5, // Reduced gap
                                transition: 'all 0.2s',
                                overflow: 'hidden', // Prevent internal overflow
                                '&:hover': {
                                    bgcolor: '#f8fafc',
                                    borderColor: 'primary.100',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                }
                            }}
                        >
                            {/* Profile Info */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 160, flexShrink: 0 }}>
                                <Avatar
                                    src={app.candidate?.avatar && !imageErrors[app._id]
                                        ? (app.candidate.avatar.startsWith('http') || app.candidate.avatar.startsWith('data:')
                                            ? app.candidate.avatar
                                            : `${BASE_URL}${app.candidate.avatar.startsWith('/') ? '' : '/'}${app.candidate.avatar.replace(/^\//, '')}`)
                                        : null}
                                    imgProps={{
                                        onError: () => setImageErrors(prev => ({ ...prev, [app._id]: true }))
                                    }}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor: '#f1f5f9',
                                        fontSize: '12px',
                                        fontWeight: 900,
                                        color: 'primary.main',
                                        border: '2px solid white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                    }}
                                >
                                    {app.candidate?.firstName?.[0]}
                                    {app.candidate?.lastName?.[0]}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="subtitle2" fontWeight={900} sx={{ color: 'text.primary', lineHeight: 1.2, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {app.candidate?.firstName} {app.candidate?.lastName}
                                    </Typography>
                                    <div
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase border mt-1 tracking-wider ${STATUS_THEMES[app.status]?.bg || 'bg-slate-50'} ${STATUS_THEMES[app.status]?.text || 'text-slate-600'} ${STATUS_THEMES[app.status]?.border || 'border-slate-200'}`}
                                    >
                                        {STATUS_THEMES[app.status]?.label || app.status}
                                    </div>
                                </Box>
                            </Box>

                            {/* Contact Box */}
                            <Box sx={{ minWidth: 120, borderLeft: '1px solid', borderColor: 'divider', pl: 1.5, flexShrink: 0 }}>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontWeight: 800 }}>
                                    <HiOutlineEnvelope className="w-3 h-3" /> {app.candidate?.email || 'N/A'}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontWeight: 800, mt: 0.5 }}>
                                    <HiOutlinePhone className="w-3 h-3" /> {app.candidate?.phone || 'N/A'}
                                </Typography>
                            </Box>

                            {/* Pipeline Step */}
                            <Box sx={{ flex: 1, minWidth: 200, borderLeft: '1px solid', borderColor: 'divider', px: 1, flexShrink: 1 }}>
                                <WorkflowStepper currentStatus={app.status} />
                            </Box>

                            {/* Actions & Interview Info Row */}
                            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5, borderLeft: '1px solid', borderColor: 'divider', pl: 1.5, flexShrink: 0 }}>
                                {/* Join / Meeting Info */}
                                {app.status === 'Interview Scheduled' && app.interviewRounds?.length > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.50', p: 0.5, px: 1, borderRadius: 1, border: '1px solid', borderColor: 'primary.100' }}>
                                        <div className="flex flex-col text-left mr-0.5">
                                            <span className="text-[7px] font-black text-primary-main uppercase leading-none">RD {app.interviewRounds[app.interviewRounds.length - 1].roundNumber}</span>
                                            <span className="text-[9px] font-bold text-slate-700 leading-tight">
                                                {new Date(app.interviewRounds[app.interviewRounds.length - 1].scheduledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                        <Button
                                            href={app.interviewRounds[app.interviewRounds.length - 1].meetLink}
                                            target="_blank"
                                            size="small"
                                            variant="contained"
                                            sx={{ height: 24, fontSize: '9px', fontWeight: 900, px: 1, borderRadius: 0.75, minWidth: 'unset', textTransform: 'none' }}
                                        >
                                            Join
                                        </Button>
                                    </Box>
                                )}

                                <Button
                                    href={app.resumeUrl?.startsWith('http') ? app.resumeUrl : `${BASE_URL}${app.resumeUrl}`}
                                    target="_blank"
                                    size="small"
                                    variant="outlined"
                                    startIcon={<HiOutlineClipboardDocumentList className="w-3.5 h-3.5" />}
                                    sx={{ borderRadius: 1, fontWeight: 900, textTransform: 'none', height: 28, borderColor: '#e2e8f0', color: '#64748b', fontSize: '10px' }}
                                >
                                    Resume
                                </Button>

                                {app.status === 'Applied' && (
                                    <Button onClick={() => handleStatusUpdate(app._id, 'review', 'Review')} variant="contained" color="warning" size="small" sx={{ borderRadius: 1, fontWeight: 900, height: 28, fontSize: '10px', textTransform: 'none' }}>Review</Button>
                                )}
                                {app.status === 'Under Review' && (
                                    <Button onClick={() => handleStatusUpdate(app._id, 'shortlist', 'Shortlist')} variant="contained" color="primary" size="small" sx={{ borderRadius: 1, fontWeight: 900, height: 28, fontSize: '10px', textTransform: 'none' }}>Shortlist</Button>
                                )}

                                {app.status === 'Interview Scheduled' ? (
                                    <>
                                        <Button onClick={() => handleStatusUpdate(app._id, 'final-select', 'Hire')} variant="contained" color="success" size="small" sx={{ borderRadius: 1, fontWeight: 900, height: 28, fontSize: '10px', textTransform: 'none' }}>Hire</Button>
                                        <IconButton onClick={() => setIsScheduling(app._id)} size="small" sx={{ bgcolor: '#f1f5f9', border: '1px solid', borderColor: '#e2e8f0', height: 28, width: 28, borderRadius: 1 }}>
                                            <HiOutlineCalendarDays className="w-3.5 h-3.5" />
                                        </IconButton>
                                    </>
                                ) : (['Employer Shortlisted', 'Selected Next Round'].includes(app.status)) && (
                                    <Button onClick={() => setIsScheduling(app._id)} variant="contained" color="success" size="small" sx={{ borderRadius: 1, fontWeight: 900, height: 28, fontSize: '10px', textTransform: 'none' }}>Schedule</Button>
                                )}

                                {app.status !== 'Final Selected' && app.status !== 'Final Rejected' && (
                                    <Button
                                        onClick={() => handleStatusUpdate(app._id, 'reject', 'Reject')}
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            borderRadius: 1,
                                            fontWeight: 900,
                                            height: 28,
                                            fontSize: '10px',
                                            textTransform: 'none',
                                            bgcolor: '#be123c', // Distinct red
                                            '&:hover': { bgcolor: '#9f1239' }
                                        }}
                                    >
                                        Reject
                                    </Button>
                                )}
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={(e) => { 
                                        e.stopPropagation();
                                        const resumeUrl = (app.resumeUrl || app.candidateProfile?.resumeUrl)?.startsWith('http') 
                                            ? (app.resumeUrl || app.candidateProfile?.resumeUrl) 
                                            : `${BASE_URL}/${(app.resumeUrl || app.candidateProfile?.resumeUrl || '').replace(/^\//, '')}`;
                                        window.open(resumeUrl, '_blank');
                                    }}
                                    sx={{ 
                                        borderRadius: 1, 
                                        fontWeight: 900, 
                                        textTransform: 'none', 
                                        height: 28, 
                                        fontSize: '10px',
                                        // Blue theme for Resume button
                                        bgcolor: '#eff6ff',
                                        color: '#2563eb',
                                        borderColor: 'transparent',
                                        '&:hover': { 
                                            bgcolor: '#2563eb',
                                            color: '#fff',
                                            borderColor: 'transparent'
                                        }
                                    }}
                                >
                                    Resume
                                </Button>
                            </Box>
                        </Paper>
                    ))
                )}
            </Stack>

            {/* Schedule Modal */}
            {isScheduling && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <Paper elevation={24} sx={{ width: '100%', maxWidth: 500, borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justify: 'space-between' }}>
                            <Typography variant="h6" fontWeight={900}>Schedule Interview</Typography>
                            <IconButton onClick={() => setIsScheduling(null)}><HiOutlineXMark /></IconButton>
                        </Box>
                        <Box component="form" onSubmit={handleScheduleSubmit} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Stack direction="row" spacing={2}>
                                <div className="flex-1 space-y-1">
                                    <Typography variant="caption" fontWeight={900} color="text.disabled" sx={{ textTransform: 'uppercase', ml: 0.5 }}>Round No.</Typography>
                                    <input type="number" required value={interviewData.roundNumber} onChange={(e) => setInterviewData({ ...interviewData, roundNumber: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:bg-white focus:border-primary-500 outline-none transition-all" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Typography variant="caption" fontWeight={900} color="text.disabled" sx={{ textTransform: 'uppercase', ml: 0.5 }}>Room Code</Typography>
                                    <input type="text" required placeholder="abc-def" value={interviewData.meetCode} onChange={(e) => setInterviewData({ ...interviewData, meetCode: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:bg-white focus:border-primary-500 outline-none transition-all" />
                                </div>
                            </Stack>
                            <div className="space-y-1">
                                <Typography variant="caption" fontWeight={900} color="text.disabled" sx={{ textTransform: 'uppercase', ml: 0.5 }}>Meeting Link</Typography>
                                <input type="url" required placeholder="https://meet.google.com/..." value={interviewData.meetLink} onChange={(e) => setInterviewData({ ...interviewData, meetLink: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:bg-white focus:border-primary-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1">
                                <Typography variant="caption" fontWeight={900} color="text.disabled" sx={{ textTransform: 'uppercase', ml: 0.5 }}>Date & Time</Typography>
                                <input type="datetime-local" required value={interviewData.scheduledAt} onChange={(e) => setInterviewData({ ...interviewData, scheduledAt: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:bg-white focus:border-primary-500 outline-none transition-all" />
                            </div>
                            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                                <Button fullWidth onClick={() => setIsScheduling(null)} sx={{ height: 48, borderRadius: 1.5, fontWeight: 900, color: 'text.secondary' }}>Cancel</Button>
                                <Button fullWidth type="submit" variant="contained" disabled={isSubmitting} sx={{ height: 48, borderRadius: 1.5, fontWeight: 900 }}>
                                    {isSubmitting ? 'Scheduling...' : 'Confirm'}
                                </Button>
                            </Stack>
                        </Box>
                    </Paper>
                </div>
            )}
        </div>
    );

    const renderPipelineView = () => (
        <div className="h-[calc(100vh-64px)] flex flex-col pt-6 bg-slate-50 overflow-hidden -mx-6 -mb-6">
            {/* Header */}
            <div className="shrink-0 px-4 sm:px-6 py-3 bg-white border-b border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBackToJobs}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all active:scale-90"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                                Hiring Pipeline
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">
                                    {selectedJob?.jobTitle || selectedJob?.title} 
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {selectedJob?.jobCategory || selectedJob?.category}
                                </span>
                                <span className="text-slate-300">•</span>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <span className="text-primary-600">{totalPipelineCandidates}</span> Active Candidates
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchPipeline(selectedJob?._id)}
                        className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                        title="Refresh Board"
                    >
                        <HiOutlineArrowPath className={`w-5 h-5 ${pipelineLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleAllApplicationsClick}
                        className="px-5 py-2.5 bg-[#0f172a] text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                    >
                        All Applications
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 flex gap-4 p-6 overflow-x-auto overflow-y-hidden select-none scrollbar-hide pb-8">
                {COLUMN_CONFIG.map((col) => {
                    const candidates = getCandidatesForColumn(col);
                    return (
                        <div
                            key={col.key}
                            className="w-[320px] min-w-[320px] max-w-[320px] flex flex-col bg-slate-100/30 rounded-[32px] border border-slate-200/50 p-3"
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between px-3 py-3 mb-3 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-2.5 h-2.5 rounded-full ${col.color} shadow-sm`} />
                                    <h3 className="text-xs font-black text-black/80 uppercase tracking-widest">
                                        {col.title}
                                    </h3>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tight ${col.bg} ${col.text}`}>
                                    {candidates.length}
                                </span>
                            </div>

                            {/* Cards List */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200 custom-scrollbar">
                                {candidates.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 opacity-20 grayscale scale-90">
                                        <HiOutlineUserGroup className="w-12 h-12 mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-tighter">Empty</p>
                                    </div>
                                ) : (
                                    candidates.map((app) => (
                                        <div
                                            key={app._id}
                                            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgb(0,0,0,0.02)] transition-all hover:shadow-xl hover:border-slate-300 group"
                                        >
                                            <div className="flex items-center gap-3 mb-2.5">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 relative">
                                                    {app.candidate?.avatar && !imageErrors[app._id] ? (
                                                        <img
                                                            onClick={(e) => { e.stopPropagation(); handleAllApplicationsClick(); }}
                                                            src={
                                                                app.candidate.avatar.startsWith('http') || app.candidate.avatar.startsWith('data:')
                                                                    ? app.candidate.avatar
                                                                    : `${BASE_URL}/${app.candidate.avatar.replace(/^\//, '')}`
                                                            }
                                                            alt="Avatar"
                                                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                                            onError={() => {
                                                                setImageErrors(prev => ({ ...prev, [app._id]: true }));
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className={`text-[12px] font-black uppercase ${col.text}`}>
                                                            {app.candidate?.firstName?.[0]}
                                                            {app.candidate?.lastName?.[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 
                                                        onClick={(e) => { e.stopPropagation(); handleAllApplicationsClick(); }}
                                                        className="text-sm font-black text-slate-900 truncate capitalize cursor-pointer hover:text-primary-600"
                                                    >
                                                        {app.candidate?.firstName} {app.candidate?.lastName}
                                                    </h4>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        <p className="text-[9px] font-bold text-slate-400 truncate flex items-center gap-1">
                                                            <HiOutlineEnvelope className="w-3 h-3" />
                                                            {app.candidate?.email}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-slate-400 truncate flex items-center gap-1">
                                                            <HiOutlinePhone className="w-3 h-3" />
                                                            {app.candidate?.phone || app.candidateProfile?.phone || 'No Number'}
                                                        </p>
                                                        {app.candidate?.phone && app.candidateProfile?.phone && app.candidate.phone !== app.candidateProfile.phone && (
                                                            <p className="text-[9px] font-bold text-slate-400 truncate flex items-center gap-1">
                                                                <HiOutlinePhone className="w-3 h-3" />
                                                                {app.candidateProfile.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info Pills */}
                                            {app.candidateProfile && (
                                                <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-[9px] font-bold text-slate-500 rounded-md border border-slate-100">
                                                        <HiOutlineBriefcase className="w-3 h-3 text-slate-400" />
                                                        {app.candidateProfile.experience?.[0]?.companyName ? "Experienced" : "Fresher"}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleAllApplicationsClick(); }}
                                                    className={`flex-1 text-center py-2 ${col.bg} text-[10px] font-black ${col.text} uppercase tracking-wider rounded-lg hover:brightness-95 transition-all border border-transparent shadow-sm`}
                                                >
                                                    View Details
                                                </button>
                                                {col.action && (
                                                    <button
                                                        onClick={() => handleAction(app._id, col.action)}
                                                        className={`p-2 rounded-lg ${col.bg} ${col.text} hover:scale-110 active:scale-90 transition-all shadow-sm flex items-center justify-center`}
                                                        title="Move to Next Stage"
                                                    >
                                                        <HiOutlineChevronDoubleRight className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                {col.key !== 'Final Rejected' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(app._id, 'reject', 'Candidate Rejected')}
                                                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 active:scale-90 transition-all shadow-sm flex items-center justify-center"
                                                        title="Reject Candidate"
                                                    >
                                                        <HiOutlineXMark className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );



    return (
        <div className="w-full h-full overflow-hidden">
            {view === 'jobs' ? renderJobCards() : view === 'applicants' ? renderApplicantsList() : renderPipelineView()}

            {/* Global Candidate Profile Modal */}
            {viewingProfile && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 select-text">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                                    {viewingProfile.candidate?.avatar ? (
                                        <img
                                            src={viewingProfile.candidate.avatar.startsWith('http') ? viewingProfile.candidate.avatar : `${BASE_URL}/${viewingProfile.candidate.avatar.replace(/^\//, '')}`}
                                            className="w-full h-full object-cover"
                                            alt="Candidate"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    ) : (
                                        <span className="text-2xl font-black text-white/40">
                                            {(viewingProfile.candidate?.firstName?.[0] || '') + (viewingProfile.candidate?.lastName?.[0] || '')}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight leading-none mb-1">
                                        {viewingProfile.candidate?.firstName} {viewingProfile.candidate?.lastName}
                                    </h3>
                                    <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><HiOutlineEnvelope className="w-3.5 h-3.5" />{viewingProfile.candidate?.email}</span>
                                        <span className="flex items-center gap-1.5"><HiOutlinePhone className="w-3.5 h-3.5" />{viewingProfile.candidate?.phone || viewingProfile.candidateProfile?.mobileNumber || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setViewingProfile(null)} 
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
                            >
                                <HiOutlineXMark className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Left Column: Basic Info & Skills */}
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Professional Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(viewingProfile.candidateProfile?.skills || viewingProfile.candidate?.skills || []).length > 0 ? (
                                                (viewingProfile.candidateProfile?.skills || viewingProfile.candidate?.skills).map((skill, idx) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-lg shadow-sm border border-indigo-100">
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : <p className="text-xs font-bold text-slate-300">No skills listed</p>}
                                        </div>
                                    </div>

                                    {(viewingProfile.candidateProfile?.city || viewingProfile.candidate?.city) && (
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</h4>
                                            <p className="text-sm font-bold text-slate-700">
                                                {[
                                                    viewingProfile.candidateProfile?.city || viewingProfile.candidate?.city, 
                                                    viewingProfile.candidateProfile?.state || viewingProfile.candidate?.state, 
                                                    viewingProfile.candidateProfile?.country || viewingProfile.candidate?.country
                                                ].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Main Column: Summary, Experience, Education */}
                                <div className="md:col-span-2 space-y-8">
                                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                                        <h4 className="text-[11px] font-black text-primary-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <HiOutlineUser className="w-4 h-4" /> Professional Summary
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            {viewingProfile.candidateProfile?.summary || viewingProfile.candidate?.summary || "No professional summary provided."}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                            <HiOutlineBriefcase className="w-4 h-4 text-slate-400" /> Work Experience
                                        </h4>
                                        {(viewingProfile.candidateProfile?.experience || []).length > 0 ? (
                                            <div className="space-y-4">
                                                {viewingProfile.candidateProfile.experience.map((exp, idx) => (
                                                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-primary-500 transition-all" />
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className="font-black text-slate-900">{exp.jobTitle || exp.role || 'Role'}</h5>
                                                            <span className="text-[10px] font-black bg-slate-50 px-2.5 py-1 rounded-lg text-slate-500 border border-slate-100">{exp.startDate} - {exp.endDate || 'Present'}</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-primary-600 mb-2">{exp.company || exp.companyName}</p>
                                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{exp.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <div className="bg-white/40 p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs font-bold text-slate-400">Not provided</div>}
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                                            <HiOutlineAcademicCap className="w-4 h-4 text-slate-400" /> Education Background
                                        </h4>
                                        {(viewingProfile.candidateProfile?.education || []).length > 0 ? (
                                            <div className="space-y-4">
                                                {viewingProfile.candidateProfile.education.map((edu, idx) => (
                                                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h5 className="font-black text-slate-900">{edu.degree || 'Degree'}</h5>
                                                            <span className="text-[10px] font-black text-slate-400">{edu.year || edu.passOutYear}</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-600">{edu.school || edu.college || edu.university}</p>
                                                        {edu.fieldOfStudy && <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{edu.fieldOfStudy}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <div className="bg-white/40 p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs font-bold text-slate-400">Not provided</div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                            <button 
                                onClick={() => setViewingProfile(null)} 
                                className="px-8 py-3 bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all active:scale-95"
                            >
                                Close
                            </button>
                            <a
                                href={(viewingProfile.resumeUrl || viewingProfile.candidateProfile?.resumeUrl)?.startsWith('http') ? (viewingProfile.resumeUrl || viewingProfile.candidateProfile?.resumeUrl) : `${BASE_URL}/${(viewingProfile.resumeUrl || viewingProfile.candidateProfile?.resumeUrl || '').replace(/^\//, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-3 bg-primary-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-95"
                            >
                                Download Resume
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApplicationManagement;
