import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../api/axios';
import { Skeleton, Box, Stack, Paper, Button, IconButton, Typography, Avatar, TextField, Pagination, Link } from '@mui/material';
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
    HiOutlineChevronDoubleRight,
    HiOutlineUserGroup,
    HiOutlineArrowsUpDown
} from 'react-icons/hi2';

const COLUMN_CONFIG = [
    { key: 'Applied', title: 'Applied', color: 'bg-blue-600 shadow-blue-100', text: 'text-blue-700', bg: 'bg-blue-50', action: 'review' },
    {
        key: 'Under Review',
        title: 'Review',
        color: 'bg-amber-500 shadow-amber-100',
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        action: 'shortlist',
        include: ['Under Review', 'Recruiter Shortlisted']
    },
    { key: 'Employer Shortlisted', title: 'Shortlisted', color: 'bg-indigo-500 shadow-indigo-100', text: 'text-indigo-700', bg: 'bg-indigo-50', action: 'interview' },
    {
        key: 'Interview Scheduled',
        title: 'Interview',
        color: 'bg-purple-500 shadow-purple-100',
        text: 'text-purple-700',
        bg: 'bg-purple-50',
        action: 'next-round',
        include: ['Interview Scheduled', 'Selected Next Round']
    },
    { key: 'Final Selected', title: 'Hired', color: 'bg-emerald-500 shadow-emerald-100', text: 'text-emerald-700', bg: 'bg-emerald-50', action: 'hire' },
    {
        key: 'Final Rejected',
        title: 'Rejected',
        color: 'bg-red-500 shadow-red-100',
        text: 'text-red-700',
        bg: 'bg-red-50',
        action: 'reject',
        include: ['Final Rejected', 'Recruiter Rejected', 'Employer Rejected']
    }
];

const STATUS_THEMES = {
    'Applied': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', label: 'New Applied' },
    'Under Review': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', label: 'Reviewing' },
    'Recruiter Shortlisted': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', label: 'Recruiter SL' },
    'Employer Shortlisted': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', label: 'Employer Approved' },
    'Interview Scheduled': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', label: 'Interviewing' },
    'Selected Next Round': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100', label: 'Next Round' },
    'Final Selected': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', label: 'Hired' },
    'Final Rejected': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', label: 'Rejected' },
    'Recruiter Rejected': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', label: 'Rejected' },
    'Employer Rejected': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', label: 'Rejected' }
};

const STEPS = [
    { label: 'APPLIED', icon: HiOutlineClipboardDocumentList, statuses: ['Applied', 'Recruiter Rejected'] },
    { label: 'REVIEW', icon: HiOutlineMagnifyingGlass, statuses: ['Under Review'] },
    { label: 'SHORTLIST', icon: HiOutlineUsers, statuses: ['Recruiter Shortlisted', 'Employer Shortlisted', 'Employer Rejected'] },
    { label: 'INTERVIEW', icon: HiOutlineVideoCamera, statuses: ['Interview Scheduled', 'Interview Completed', 'Selected Next Round'] },
    { label: 'SELECTED', icon: HiOutlineCheckBadge, statuses: ['Final Selected', 'Final Rejected'] }
];

const WorkflowStepper = ({ currentStatus }) => {
    const statusLevels = {
        'Applied': 0, 'Recruiter Rejected': 0,
        'Under Review': 1,
        'Recruiter Shortlisted': 2, 'Employer Shortlisted': 2, 'Employer Rejected': 2,
        'Interview Scheduled': 3, 'Interview Completed': 3, 'Selected Next Round': 3,
        'Final Selected': 4, 'Final Rejected': 4
    };
    const currentLevel = statusLevels[currentStatus] ?? 0;
    const isCurrentlyRejected = currentStatus.includes('Rejected');

    return (
        <div className="flex items-center justify-between w-full max-w-[320px] px-2 py-2">
            {STEPS.map((step, index) => {
                const isPassed = index < currentLevel;
                const isCurrent = index === currentLevel;
                const isNodeRejected = isCurrent && isCurrentlyRejected;
                const state = (isPassed || (index === 4 && currentStatus === 'Final Selected')) ? 'completed' : isNodeRejected ? 'rejected' : isCurrent ? 'active' : 'pending';

                return (
                    <div key={index} className="flex flex-col items-center relative flex-1">
                        {index !== 0 && (
                            <div
                                style={{ width: '100%', left: '-50%', top: '12px' }}
                                className={`absolute h-[3px] -translate-y-1/2 z-0 transition-all duration-500 ${index <= currentLevel ? (isCurrentlyRejected && index === currentLevel ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-300'}`}
                            />
                        )}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 ${state === 'completed' ? 'bg-emerald-600 border-emerald-600' : state === 'rejected' ? 'bg-red-600 border-red-600' : state === 'active' ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-50' : 'bg-white border-slate-200'}`}>
                            {state === 'completed' ? <HiOutlineCheckCircle className="w-4 h-4 text-white" /> : state === 'rejected' ? <HiOutlineXMark className="w-4 h-4 text-white" /> : <span className={`text-[10px] font-bold leading-none ${state === 'active' ? 'text-white' : 'text-slate-300'}`}>{index + 1}</span>}
                        </div>
                        <span className={`mt-1 text-[7px] font-bold uppercase text-center transition-colors px-0.5 ${state === 'active' ? 'text-blue-600' : state === 'completed' ? 'text-slate-900' : state === 'rejected' ? 'text-red-500' : 'text-slate-300'}`}>
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
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [view, setView] = useState('jobs'); // 'jobs' | 'applicants' | 'pipeline'
    const [prevViewState, setPrevViewState] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);

    const [pipeline, setPipeline] = useState({});
    const [viewingProfile, setViewingProfile] = useState(null);
    const [pipelineLoading, setPipelineLoading] = useState(false);

    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [jobsTotal, setJobsTotal] = useState(0);
    const [jobsPage, setJobsPage] = useState(1);
    const [jobsSearch, setJobsSearch] = useState('');
    const [jobsStatusFilter, setJobsStatusFilter] = useState('active');
    const [globalStats, setGlobalStats] = useState({ totalActive: 0, totalOverall: 0 });

    const [applicants, setApplicants] = useState([]);
    const [applicantsLoading, setApplicantsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isScheduling, setIsScheduling] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    const [interviewData, setInterviewData] = useState({ roundNumber: 1, meetLink: '', meetCode: '', scheduledAt: '' });
    const limit = 10;

    const fetchJobs = useCallback(async () => {
        setJobsLoading(true);
        try {
            const params = { page: jobsPage, limit, search: jobsSearch, status: jobsStatusFilter };
            const res = await adminAPI.listJobRequests(params);
            if (res.data?.success) {
                setJobs(res.data.data.jobRequests);
                setJobsTotal(res.data.data.pagination.total);
                if (res.data.data.stats) setGlobalStats(res.data.data.stats);
            }
        } catch (error) { toast.error('Failed to load jobs'); }
        finally { setJobsLoading(false); }
    }, [jobsPage, jobsSearch, jobsStatusFilter]);

    useEffect(() => {
        if (view === 'jobs') {
            const timer = setTimeout(() => { fetchJobs(); }, jobsSearch ? 400 : 0);
            return () => clearTimeout(timer);
        }
    }, [fetchJobs, view]);

    const fetchApplicants = async (jobId) => {
        setApplicantsLoading(true);
        try {
            const res = await adminAPI.getJobApplications(jobId);
            if (res.data?.success) setApplicants(res.data.data);
        } catch (error) { toast.error('Failed to load applicants'); }
        finally { setApplicantsLoading(false); }
    };

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
                } catch (error) { console.error('Failed to load job from URL param', error); }
            };
            loadJobFromUrl();
        }
    }, [searchParams]);

    const handleViewApplicants = (job) => {
        setPrevViewState('jobs');
        setSelectedJob(job);
        setView('applicants');
        fetchApplicants(job.jobId || job._id);
    };

    const handleAllApplicationsClick = () => {
        if (selectedJob) fetchApplicants(selectedJob.jobId || selectedJob._id);
        setView('applicants');
    };

    const handleBackToJobs = () => {
        if (view === 'pipeline' && prevViewState === 'applicants') {
            setView('applicants');
            setPrevViewState('jobs');
            return;
        }
        setView('jobs');
        setPrevViewState(null);
        setSelectedJob(null);
        setApplicants([]);
    };

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
        } finally { setIsUpdating(false); }
    };

    const handleOpenSchedule = (app) => {
        setIsScheduling(app._id);
        if (app.status === 'Interview Scheduled' && app.interviewRounds?.length > 0) {
            const lastRound = app.interviewRounds[app.interviewRounds.length - 1];
            setInterviewData({
                roundNumber: lastRound.roundNumber,
                meetLink: lastRound.meetLink,
                meetCode: lastRound.meetCode,
                scheduledAt: lastRound.scheduledAt ? new Date(lastRound.scheduledAt).toISOString().slice(0, 16) : ''
            });
        } else {
            setInterviewData({ roundNumber: (app.interviewRounds?.length || 0) + 1, meetLink: '', meetCode: '', scheduledAt: '' });
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
            fetchJobs(); // Update counts in the main list
        } catch (error) { toast.error(error.response?.data?.message || 'Scheduling failed'); }
        finally { setIsSubmitting(false); }
    };

    const handleEditJob = (job) => navigate(`/jobs/${job._id}`, { state: { from: location.pathname } });

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job posting?')) return;
        try {
            await adminAPI.deleteJobRequest(jobId);
            toast.success('Job posting deleted successfully');
            fetchJobs();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to delete job'); }
    };

    const fetchPipeline = async (jobId) => {
        setPipelineLoading(true);
        try {
            const res = await adminAPI.getJobPipeline(jobId);
            if (res.data?.success) setPipeline(res.data.data);
        } catch (error) { toast.error('Failed to load hiring pipeline'); }
        finally { setPipelineLoading(false); }
    };

    const handleAction = async (id, action) => {
        try {
            const loadToast = toast.loading('Moving candidate...');
            await adminAPI.updateApplicationStatus(id, action);
            toast.dismiss(loadToast);
            toast.success('Candidate moved forward');
            fetchPipeline(selectedJob.jobId || selectedJob._id);
        } catch (error) { toast.error('Failed to move candidate'); }
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const findCandidate = (id) => {
            for (const key in pipeline) {
                const list = pipeline[key];
                if (Array.isArray(list)) {
                    const found = list.find(c => c._id === id);
                    if (found) return found;
                }
            }
            return null;
        };

        if (destination.droppableId === 'Interview Scheduled') {
            const candidate = findCandidate(draggableId);
            if (candidate) {
                handleOpenSchedule(candidate);
                return;
            }
        }

        const actionMap = {
            'Under Review': 'review',
            'Employer Shortlisted': 'shortlist',
            'Final Selected': 'final-select'
        };

        const action = actionMap[destination.droppableId];
        if (action) {
            await handleAction(draggableId, action);
        }
    };

    const handlePipeline = (jobId) => {
        const job = jobs.find(j => j._id === jobId) || selectedJob;
        setPrevViewState(view);
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

    const totalPipelineCandidates = COLUMN_CONFIG.reduce((sum, col) => sum + getCandidatesForColumn(col).length, 0);

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
            <div>
                <h2 className="text-2xl font-bold text-black tracking-tight">Manage Job Postings</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Track and manage all your active and closed job listings</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-5 rounded-md shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0"><HiOutlineBriefcase className="w-6 h-6 text-indigo-600" /></div>
                    <div><p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Total Postings</p><p className="text-2xl font-bold text-black leading-none">{globalStats.totalOverall}</p></div>
                </div>
                <div className="bg-white p-5 rounded-md shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0"><HiOutlineBolt className="w-6 h-6 text-emerald-600" /></div>
                    <div><p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Active Jobs</p><p className="text-2xl font-bold text-black leading-none">{globalStats.totalActive}</p></div>
                </div>
            </div>
            <div className="bg-white p-4 rounded-md shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400/95" />
                    <input type="text" value={jobsSearch} onChange={(e) => { setJobsSearch(e.target.value); setJobsPage(1); }} placeholder="Search by title, city or location..." className="w-full pl-11 pr-4 py-3 rounded-md border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-slate-50 focus:bg-white transition-all outline-none" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/95" />
                        <select value={jobsStatusFilter} onChange={(e) => { setJobsStatusFilter(e.target.value); setJobsPage(1); }} className="pl-9 pr-8 py-3 rounded-md border border-slate-200 text-sm font-medium text-slate-700 bg-white hover:border-slate-900 transition-all outline-none appearance-none min-w-[140px]">
                            <option value="active">Active Only</option>
                            <option value="closed">Closed Only</option>
                            <option value="all">All Jobs</option>
                        </select>
                        <HiOutlineArrowsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400/95 pointer-events-none" />
                    </div>
                </div>
            </div>
            <Stack spacing={2}>
                {jobsLoading ? Array(limit).fill(0).map((_, i) => (
                    <Paper key={i} elevation={0} sx={{ p: 4, borderRadius: 1.5, border: '1px solid #f1f5f9', bgcolor: 'white' }}>
                        <div className="flex gap-6 animate-pulse"><Skeleton variant="circular" width={48} height={48} /><div className="flex-1"><Skeleton variant="text" width="40%" height={28} /><Skeleton variant="text" width="20%" height={16} sx={{ mt: 1 }} /></div></div>
                    </Paper>
                )) : jobs.map((job) => (
                    <Paper key={job._id} elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 1.5, border: '1px solid', borderColor: '#f1f5f9', bgcolor: 'white', transition: 'all 0.3s' }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0"><HiOutlineBuildingOffice2 className="w-7 h-7 text-slate-400/95" /></div>
                            <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
                                <div className="flex items-center gap-2 mb-1"><Typography variant="h6" fontWeight={800} sx={{ color: 'black' }}>{job.jobTitle || job.title}</Typography><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${job.jobType?.toLowerCase() === 'full-time' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{job.jobType}</span></div>
                                <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', flexWrap: 'wrap' }}>
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.6, fontWeight: 700 }}><HiOutlineMapPin className="w-3.5 h-3.5" /> {job.city || job.location}</Typography>
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.6, fontWeight: 700 }}><HiOutlineCurrencyRupee className="w-3.5 h-3.5" /> {formatSalary(job.salaryRange?.min, job.salaryRange?.max)}</Typography>
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.6, fontWeight: 700 }}><HiOutlineCalendarDays className="w-3.5 h-3.5" /> {new Date(job.createdAt).toLocaleDateString()}</Typography>
                                </Stack>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 4, px: 3 }}>
                                <Box sx={{ textAlign: 'center', minWidth: 60 }}><Typography variant="h6" fontWeight={800} color="primary">{job.applicantCount || 0}</Typography><Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ fontSize: '10px' }}>Applicants</Typography></Box>
                                <Box sx={{ textAlign: 'center', minWidth: 60 }}><Typography variant="h6" fontWeight={800} color="black">{job.vacancies || 0}</Typography><Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ fontSize: '10px' }}>Positions</Typography></Box>
                            </Box>
                            <Stack direction="row" spacing={1.5} sx={{ ml: 'auto' }}>
                                <Button onClick={() => handlePipeline(job._id)} size="small" variant="contained" startIcon={<HiOutlineBolt />} sx={{ borderRadius: '14px', bgcolor: '#22c55e', color: '#000', '&:hover': { bgcolor: '#16a34a' } }}>Pipeline</Button>
                                <Button onClick={() => handleViewApplicants(job)} size="small" variant="contained" startIcon={<HiOutlineUsers />} sx={{ borderRadius: '14px', bgcolor: '#5b4eff', color: '#fff' }}>Applicants</Button>
                                <IconButton size="small" onClick={() => handleEditJob(job)} sx={{ color: '#d97706', bgcolor: '#fffbeb' }}><HiOutlinePencilSquare /></IconButton>
                                <IconButton size="small" onClick={() => handleDeleteJob(job._id)} sx={{ color: '#dc2626', bgcolor: '#fef2f2' }}><HiOutlineTrash /></IconButton>
                            </Stack>
                        </Box>
                    </Paper>
                ))}
            </Stack>
            {!jobsLoading && jobsTotal > limit && (
                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                    <Pagination 
                        count={Math.ceil(jobsTotal / limit)} 
                        page={jobsPage} 
                        onChange={(e, p) => setJobsPage(p)} 
                        color="primary" 
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': { fontWeight: 700 },
                            '& .Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }
                        }}
                    />
                </Box>
            )}
        </div>
    );

    const renderApplicantsList = () => (
        <div className="space-y-3 pt-6">
            <Paper elevation={0} sx={{ p: 1, px: 2, borderRadius: 1.25, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 3 }}>
                <IconButton onClick={handleBackToJobs} sx={{ bgcolor: '#f8fafc' }}><HiOutlineArrowLeft /></IconButton>
                <Box sx={{ flex: 1 }}><Typography variant="h6" fontWeight={500}>Candidates & Applications</Typography><Typography variant="caption" color="primary.main">{selectedJob?.jobTitle || selectedJob?.title}</Typography></Box>
                <Button onClick={() => handlePipeline(selectedJob?._id)} size="small" variant="contained" color="success" startIcon={<HiOutlineBolt />}>Pipeline</Button>
            </Paper>
            <Stack spacing={1}>
                {applicantsLoading ? Array(3).fill(0).map((_, i) => (
                    <Paper key={i} sx={{ p: 3, animate: 'pulse' }}><Skeleton width="40%" /><Skeleton width="20%" /></Paper>
                )) : applicants.length === 0 ? (
                    <Paper sx={{ py: 12, textAlign: 'center', bgcolor: '#f8fafc' }}><HiOutlineUser className="w-12 h-12 mx-auto" /><Typography>No candidates found</Typography></Paper>
                ) : applicants.map((app) => (
                    <Paper key={app._id} elevation={0} sx={{ p: 1, px: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={app.candidate?.avatar && !imageErrors[app._id] ? (app.candidate.avatar.startsWith('http') ? app.candidate.avatar : `${BASE_URL}/${app.candidate.avatar}`) : null} imgProps={{ onError: () => setImageErrors(prev => ({ ...prev, [app._id]: true })) }}>{app.candidate?.firstName?.[0]}</Avatar>
                        <Box sx={{ minWidth: 160 }}>
                            <Typography variant="subtitle2">{app.candidate?.firstName} {app.candidate?.lastName}</Typography>
                            <div className={`inline-flex px-2 py-0.5 rounded text-[8px] border ${STATUS_THEMES[app.status]?.bg || 'bg-slate-50'} ${STATUS_THEMES[app.status]?.text || 'text-slate-600'}`}>
                                {STATUS_THEMES[app.status]?.label || app.status}
                            </div>
                        </Box>
                        <Box sx={{ flex: 1 }}><WorkflowStepper currentStatus={app.status} /></Box>
                        {app.status === 'Interview Scheduled' && app.interviewRounds?.length > 0 && (
                            <Box sx={{ 
                                minWidth: 200, 
                                bgcolor: '#FAF5FF', 
                                border: '1px solid #E9D5FF', 
                                borderRadius: '12px', 
                                p: '6px 10px',
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                            }}>
                                <Box sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    bgcolor: '#9333EA', 
                                    borderRadius: '10px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'white',
                                    shrink: 0
                                }}>
                                    <HiOutlineVideoCamera className="w-4 h-4" />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    {app.interviewRounds.slice(-1).map((round, idx) => {
                                        const d = new Date(round.scheduledAt);
                                        const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase() + ' ' + d.getFullYear().toString().slice(-2);
                                        return (
                                            <div key={idx}>
                                                <Typography sx={{ 
                                                    color: '#A855F7', 
                                                    fontWeight: 800, 
                                                    fontSize: '8px', 
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    lineHeight: 1.1
                                                }}>
                                                    INTERVIEW
                                                </Typography>
                                                <Typography sx={{ 
                                                    color: '#0F172A', 
                                                    fontWeight: 800, 
                                                    fontSize: '10px',
                                                    lineHeight: 1.1
                                                }}>
                                                    {dateStr}, {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            </div>
                                        );
                                    })}
                                </Box>
                                <Button 
                                    href={app.interviewRounds[app.interviewRounds.length - 1].meetLink} 
                                    target="_blank"
                                    variant="contained" 
                                    sx={{ 
                                        bgcolor: '#9333EA', 
                                        color: 'white', 
                                        borderRadius: '8px', 
                                        fontWeight: 900, 
                                        fontSize: '9px',
                                        px: 1,
                                        height: 28,
                                        minWidth: 'auto',
                                        '&:hover': { bgcolor: '#7E22CE' }
                                    }}
                                >
                                    JOIN
                                </Button>
                            </Box>
                        )}
                        <Button href={`${BASE_URL}${app.resumeUrl}`} target="_blank" size="small" variant="outlined" sx={{ height: 28, fontSize: '10px' }}>Resume</Button>
                        <Stack direction="row" spacing={1}>
                            {app.status === 'Applied' && <Button onClick={() => handleStatusUpdate(app._id, 'review', 'Review')} variant="contained" color="warning" size="small">Review</Button>}
                            {app.status === 'Under Review' && <Button onClick={() => handleStatusUpdate(app._id, 'shortlist', 'Shortlist')} variant="contained" color="primary" size="small">Shortlist</Button>}
                            {app.status === 'Interview Scheduled' && (
                                <>
                                    <Button onClick={() => handleStatusUpdate(app._id, 'next-round', 'Next Round')} variant="contained" color="primary" size="small">Next</Button>
                                    <Button onClick={() => handleStatusUpdate(app._id, 'final-select', 'Hire')} variant="contained" color="success" size="small">Hire</Button>
                                    <IconButton onClick={() => handleOpenSchedule(app)} size="small"><HiOutlineCalendarDays /></IconButton>
                                </>
                            )}
                            {app.status !== 'Final Selected' && app.status !== 'Final Rejected' && <Button onClick={() => handleStatusUpdate(app._id, 'reject', 'Reject')} variant="contained" size="small" sx={{ bgcolor: '#be123c', color: 'white' }}>Reject</Button>}
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </div>
    );

    const renderPipelineView = () => (
        <div className="h-[calc(100vh-64px)] flex flex-col pt-6 bg-slate-50 overflow-hidden -mx-4 -mb-6">
            <div className="shrink-0 px-3 sm:px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={handleBackToJobs} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"><HiOutlineArrowLeft className="w-5 h-5" /></button>
                    <div><h1 className="text-xl font-bold text-slate-900">Hiring Pipeline</h1><p className="text-[12px] font-medium text-primary-800 uppercase tracking-widest">{selectedJob?.jobTitle || selectedJob?.title}</p></div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => fetchPipeline(selectedJob?._id)} className="p-2 text-slate-500 hover:text-slate-900"><HiOutlineArrowPath className={pipelineLoading ? 'animate-spin' : ''} /></button>
                    <button onClick={handleAllApplicationsClick} className="px-5 py-2.5 bg-[#0f172a] text-white text-[12px] font-medium uppercase rounded-xl">All Applications</button>
                </div>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 flex gap-4 p-6 overflow-x-auto overflow-y-hidden select-none scrollbar-hide pb-8">
                    {COLUMN_CONFIG.map((col) => (
                        <Droppable key={col.key} droppableId={col.key}>
                            {(provided) => (
                                <div className="w-[320px] min-w-[320px] flex flex-col bg-slate-100/30 rounded-[32px] border border-slate-200/50 p-3">
                                    <div className="flex items-center justify-between px-3 py-3 mb-3 shrink-0">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-2 h-2 rounded-full ${col.color} shadow-sm ring-4 ring-white`} />
                                            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em]">{col.title}</h3>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black tracking-tighter ${col.bg} ${col.text} border border-current/10 shadow-sm`}>{getCandidatesForColumn(col).length}</span>
                                    </div>
                                    <div 
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-[150px]"
                                    >
                                        {getCandidatesForColumn(col).map((app, index) => (
                                            <Draggable key={app._id} draggableId={app._id} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgb(0,0,0,0.02)] transition-all hover:shadow-xl hover:border-slate-300">
                                                        <div className="flex items-center gap-3 mb-2.5">
                                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                                                {app.candidate?.avatar && !imageErrors[app._id] ? <img src={app.candidate.avatar.startsWith('http') ? app.candidate.avatar : `${BASE_URL}/${app.candidate.avatar}`} alt="Avatar" className="w-full h-full object-cover" onError={() => setImageErrors(prev => ({ ...prev, [app._id]: true }))} /> : <span className={`text-[12px] font-medium uppercase ${col.text}`}>{app.candidate?.firstName?.[0]}{app.candidate?.lastName?.[0]}</span>}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="text-sm font-medium text-black truncate capitalize">{app.candidate?.firstName} {app.candidate?.lastName}</h4>
                                                                <p className="text-[9px] font-medium text-black truncate">{app.candidate?.email}</p>
                                                                {app.status === 'Interview Scheduled' && app.interviewRounds?.length > 0 && (
                                                                    <div className="mt-2.5 p-2 bg-[#FAF5FF] border border-[#E9D5FF] rounded-xl flex items-center gap-2">
                                                                        <div className="w-8 h-8 bg-[#9333EA] rounded-lg flex items-center justify-center text-white shrink-0">
                                                                            <HiOutlineVideoCamera className="w-4 h-4" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            {app.interviewRounds.slice(-1).map((round, idx) => (
                                                                                <div key={idx}>
                                                                                    <p className="text-[8px] font-black text-[#A855F7] uppercase tracking-tighter leading-none">R-{round.roundNumber} INTERVIEW</p>
                                                                                    <p className="text-[9px] font-bold text-[#0F172A] leading-tight truncate">
                                                                                        {new Date(round.scheduledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()} • {new Date(round.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                    </p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <a href={app.interviewRounds[app.interviewRounds.length - 1].meetLink} target="_blank" rel="noreferrer" className="px-2 py-1 bg-[#9333EA] text-white text-[8px] font-black uppercase rounded-lg hover:bg-[#7E22CE] transition-colors shrink-0">JOIN</a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => setViewingProfile(app)} className={`flex-1 text-center py-2 ${col.bg} text-[10px] font-medium ${col.text} uppercase rounded-lg hover:brightness-95`}>View Details</button>
                                                            {col.action && <button onClick={() => handleAction(app._id, col.action)} className={`p-2 rounded-lg ${col.bg} ${col.text} hover:scale-110`} title="Move Forward"><HiOutlineChevronDoubleRight className="w-3.5 h-3.5" /></button>}
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );

    return (
        <div className="w-full h-full overflow-hidden">
            {view === 'jobs' ? renderJobCards() : view === 'applicants' ? renderApplicantsList() : renderPipelineView()}
            {viewingProfile && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <Avatar src={viewingProfile.candidate?.avatar && !imageErrors[viewingProfile._id] ? (viewingProfile.candidate.avatar.startsWith('http') ? viewingProfile.candidate.avatar : `${BASE_URL}/${viewingProfile.candidate.avatar}`) : null} sx={{ width: 64, height: 64, border: '2px solid white' }}>{viewingProfile.candidate?.firstName?.[0]}</Avatar>
                                <div><h3 className="text-2xl font-medium leading-none mb-1">{viewingProfile.candidate?.firstName} {viewingProfile.candidate?.lastName}</h3><p className="text-xs text-slate-400">{viewingProfile.candidate?.email}</p></div>
                            </div>
                            <button onClick={() => setViewingProfile(null)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20"><HiOutlineXMark className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h4 className="text-[11px] font-medium text-slate-400/95 uppercase mb-4">Professional Skills</h4><div className="flex flex-wrap gap-2">{(viewingProfile.candidateProfile?.skills || []).map((skill, idx) => <span key={idx} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] uppercase rounded-lg">{skill}</span>)}</div></div>
                                </div>
                                <div className="md:col-span-2 space-y-8">
                                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"><h4 className="text-[11px] font-medium text-primary-600 uppercase mb-4">Professional Summary</h4><p className="text-sm text-slate-600 leading-relaxed font-medium">{viewingProfile.candidateProfile?.summary || "No summary provided."}</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-end gap-3"><button onClick={() => setViewingProfile(null)} className="px-8 py-3 bg-slate-50 text-slate-600 text-[11px] font-medium uppercase rounded-xl">Close</button><a href={`${BASE_URL}${viewingProfile.resumeUrl}`} target="_blank" className="px-8 py-3 bg-primary-600 text-white text-[11px] font-medium uppercase rounded-xl">Download Resume</a></div>
                    </div>
                </div>
            )}
            {isScheduling && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <Paper elevation={24} sx={{ width: '100%', maxWidth: 500, borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6">Schedule Interview</Typography>
                            <IconButton onClick={() => setIsScheduling(null)}><HiOutlineXMark /></IconButton>
                        </Box>
                        <Box component="form" onSubmit={handleScheduleSubmit} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField fullWidth label="Round Number" type="number" required value={interviewData.roundNumber} onChange={(e) => setInterviewData({ ...interviewData, roundNumber: e.target.value })} />
                            <TextField fullWidth label="Meeting Code" required placeholder="abc-def" value={interviewData.meetCode} onChange={(e) => setInterviewData({ ...interviewData, meetCode: e.target.value })} />
                            <TextField fullWidth label="Meeting Link" type="url" required placeholder="https://meet.google.com/..." value={interviewData.meetLink} onChange={(e) => setInterviewData({ ...interviewData, meetLink: e.target.value })} />
                            <TextField fullWidth label="Date & Time" type="datetime-local" required InputLabelProps={{ shrink: true }} value={interviewData.scheduledAt} onChange={(e) => setInterviewData({ ...interviewData, scheduledAt: e.target.value })} />
                            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                                <Button fullWidth onClick={() => setIsScheduling(null)}>Cancel</Button>
                                <Button fullWidth type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Scheduling...' : 'Confirm'}</Button>
                            </Stack>
                        </Box>
                    </Paper>
                </div>
            )}
        </div>
    );
};

export default AdminApplicationManagement;
