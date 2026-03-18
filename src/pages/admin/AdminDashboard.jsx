import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';
import { BASE_URL } from '../../api/axios';
import {
    HiOutlineUsers,
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineBuildingOffice2,
    HiOutlineUserGroup,
    HiOutlineCheckBadge,
    HiOutlineChartBar,
    HiOutlineArrowTrendingUp
} from 'react-icons/hi2';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [period, setPeriod] = useState('Month');
    const [visibleSeries, setVisibleSeries] = useState({
        employers: true,
        candidates: true,
        jobs: true,
        applications: true
    });
    const [imageErrors, setImageErrors] = useState({});

    const toggleSeries = (key) => {
        setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }));
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminAPI.getStats(period);
                if (res.data?.success) {
                    setStats(res.data.data);
                }
            } catch (error) {
                toast.error('Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [period]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    if (loading) return <div className="p-8">Loading dashboard...</div>;
    if (!stats) return <div className="p-8 text-danger-500">Error loading dashboard</div>;

    const { overview } = stats;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-4 border-b border-slate-100">
                <div>
                    <h2 className="text-[28px] font-bold text-black tracking-tight">Dashboard Management</h2>
                    <p className="text-sm text-slate-600 mt-1 font-medium">Platform performance and ecosystem oversight</p>
                </div>
            </div>
            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Total Candidates */}
                <Link to="/candidates" className="group p-5 rounded-md border border-slate-300 hover:border-blue-200 transition-all duration-300 relative overflow-hidden block bg-white shadow-sm hover:shadow-xl hover:shadow-blue-50/50">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <HiOutlineUserGroup className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-black leading-none mb-1.5">{overview?.candidates || 0}</p>
                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">Total Candidates</p>
                        </div>
                    </div>
                </Link>

                {/* Total Recruiters */}
                <Link to="/recruiters" className="group p-5 rounded-md border border-slate-300 hover:border-purple-200 transition-all duration-300 relative overflow-hidden block bg-white shadow-sm hover:shadow-xl hover:shadow-purple-50/50">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                            <HiOutlineUsers className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-black leading-none mb-1.5">{overview?.recruiters || 0}</p>
                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">Total Recruiters</p>
                        </div>
                    </div>
                </Link>

                {/* Total Employers */}
                <Link to="/employers" className="group p-5 rounded-md border border-slate-300 hover:border-emerald-200 transition-all duration-300 relative overflow-hidden block bg-white shadow-sm hover:shadow-xl hover:shadow-emerald-50/50">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                            <HiOutlineBuildingOffice2 className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-black leading-none mb-1.5">{overview?.employers || 0}</p>
                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">Total Employers</p>
                        </div>
                    </div>
                </Link>

                {/* Total Jobs */}
                <Link to="/jobs" className="group p-5 rounded-md border border-slate-300 hover:border-amber-200 transition-all duration-300 relative overflow-hidden block bg-white shadow-sm hover:shadow-xl hover:shadow-amber-50/50">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                            <HiOutlineBriefcase className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-black leading-none mb-1.5">{overview?.jobs || 0}</p>
                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">Total Active Jobs</p>
                        </div>
                    </div>
                </Link>

                {/* Total Applications */}
                <Link to="/applications" className="group p-5 rounded-md border border-slate-300 hover:border-blue-200 transition-all duration-300 relative overflow-hidden block bg-white shadow-sm hover:shadow-xl hover:shadow-blue-50/50">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <HiOutlineDocumentText className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-black leading-none mb-1.5">{overview?.applications || 0}</p>
                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">Total Applications</p>
                        </div>
                    </div>
                </Link>

                {/* Hire Candidate */}
                <Link to="/shortlisted-candidates" className="group p-5 rounded-md border border-slate-300 hover:border-rose-200 transition-all duration-300 relative overflow-hidden block bg-white shadow-sm hover:shadow-xl hover:shadow-rose-50/50">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                            <HiOutlineCheckBadge className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-black leading-none mb-1.5">{overview?.shortlisted || 0}</p>
                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">Hire Candidate</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Activity Overview */}
            <div className="card p-8 border-1px solid black  ring-1 ring-slate-200/80 bg-white relative z-20 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
                    <div>
                        <h3 className="text-2xl font-bold text-black">Activity Overview</h3>
                        <p className="text-sm text-slate-700 mt-1 font-medium">Real-time statistics for platform ecosystem</p>
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md self-end md:self-auto shadow-inner">
                        {['Week', 'Month', 'Year'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-5 py-1.5 text-[11px] font-medium rounded-md transition-all ${period === p ? 'bg-[#1E293B] text-white shadow-sm' : 'text-slate-700 hover:text-slate-800'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-5 text-[11px] font-medium mb-6">
                    <button onClick={() => toggleSeries('employers')} className={`flex items-center gap-2 transition-all ${visibleSeries.employers ? 'opacity-100' : 'opacity-20'}`}>
                        <div className="w-3.5 h-3.5 rounded-md bg-blue-500"></div>
                        <span className="text-slate-700 uppercase tracking-widest">Companies</span>
                    </button>
                    <button onClick={() => toggleSeries('candidates')} className={`flex items-center gap-2 transition-all ${visibleSeries.candidates ? 'opacity-100' : 'opacity-20'}`}>
                        <div className="w-3.5 h-3.5 rounded-md bg-emerald-500"></div>
                        <span className="text-slate-700 uppercase tracking-widest">Candidates</span>
                    </button>
                    <button onClick={() => toggleSeries('jobs')} className={`flex items-center gap-2 transition-all ${visibleSeries.jobs ? 'opacity-100' : 'opacity-20'}`}>
                        <div className="w-3.5 h-3.5 rounded-md bg-amber-500"></div>
                        <span className="text-slate-700 uppercase tracking-widest">Jobs</span>
                    </button>
                    <button onClick={() => toggleSeries('applications')} className={`flex items-center gap-2 transition-all ${visibleSeries.applications ? 'opacity-100' : 'opacity-20'}`}>
                        <div className="w-3.5 h-3.5 rounded-md bg-purple-500"></div>
                        <span className="text-slate-700 uppercase tracking-widest">Applications</span>
                    </button>
                </div>

                <div className="relative h-[320px] mt-4 flex items-end justify-between gap-4 px-6 md:px-10 overflow-visible">
                    {/* Y-Axis Grid Lines matching reference */}
                    <div className="absolute inset-x-0 inset-y-0 -top-4 bottom-8 flex flex-col justify-between pointer-events-none text-[11px] font-medium text-slate-500">
                        {[2, 1.5, 1, 0.5, 0].map(val => (
                            <div key={val} className="flex items-center gap-4 w-full">
                                <span className="w-6 text-right">{val}</span>
                                <div className="flex-1 h-px bg-slate-50"></div>
                            </div>
                        ))}
                    </div>

                    {stats?.activityTrend?.map((item, idx) => {
                        const maxVal = Math.max(...(stats?.activityTrend?.map(i => Math.max(i.employers, i.candidates, i.jobs, i.applications)) || [1]), 2);
                        return (
                            <div
                                key={idx}
                                className="flex-1 flex flex-col items-center group/column relative z-10 pb-2 transition-all duration-300 h-full justify-end"
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            >
                                {/* Column Backdrop Highlight */}
                                {hoveredIdx === idx && (
                                    <div className="absolute inset-x-1 -inset-y-4 bg-slate-50/80 rounded-md -z-10 animate-in fade-in duration-200 ring-1 ring-slate-100"></div>
                                )}

                                <div className="w-full flex items-end justify-center gap[4px] h-[200px] relative">
                                    {visibleSeries.employers && (
                                        <div className="w-[14px] md:w-[20px] bg-blue-500/80 rounded-t-sm transition-all hover:bg-blue-600 shadow-sm"
                                            style={{ height: `${Math.min((item.employers / maxVal) * 100, 100)}%` }}></div>
                                    )}
                                    {visibleSeries.candidates && (
                                        <div className="w-[14px] md:w-[20px] bg-emerald-500/80 rounded-t-sm transition-all hover:bg-emerald-600 shadow-sm"
                                            style={{ height: `${Math.min((item.candidates / maxVal) * 100, 100)}%` }}></div>
                                    )}
                                    {visibleSeries.jobs && (
                                        <div className="w-[14px] md:w-[20px] bg-amber-500/80 rounded-t-sm transition-all hover:bg-amber-600 shadow-sm"
                                            style={{ height: `${Math.min((item.jobs / maxVal) * 100, 100)}%` }}></div>
                                    )}
                                    {visibleSeries.applications && (
                                        <div className="w-[14px] md:w-[20px] bg-purple-500/80 rounded-t-sm transition-all hover:bg-purple-600 shadow-sm"
                                            style={{ height: `${Math.min((item.applications / maxVal) * 100, 100)}%` }}></div>
                                    )}

                                    {/* Tooltip Overlay */}
                                    {hoveredIdx === idx && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-[100] w-48 bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 p-5 animate-in zoom-in-95 fade-in duration-300">
                                             <p className="text-[10px] font-semibold text-slate-500 mb-4 border-b border-slate-50 pb-2 uppercase tracking-widest">{item.label}</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#5b4eff]"></div>
                                                        <span className="text-[11px] font-medium text-slate-400">Companies</span>
                                                    </div>
                                                    <span className="text-[12px] font-medium text-black">{item.employers}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#36f0b4]"></div>
                                                        <span className="text-[11px] font-medium text-slate-400">Candidates</span>
                                                    </div>
                                                    <span className="text-[12px] font-medium text-black">{item.candidates}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#f9a825]"></div>
                                                        <span className="text-[11px] font-medium text-slate-500">Jobs</span>
                                                    </div>
                                                    <span className="text-[12px] font-medium text-black">{item.jobs}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#a855f7]"></div>
                                                        <span className="text-[11px] font-medium text-slate-400">Applications</span>
                                                    </div>
                                                    <span className="text-[12px] font-medium text-black">{item.applications}</span>
                                                </div>
                                            </div>
                                            {/* Tooltip Arrow */}
                                            <div className="absolute top-[99%] left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 border-r border-b border-white rotate-45 shadow-sm"></div>
                                        </div>
                                    )}
                                </div>
                                 <p className={`mt-5 text-[11px] font-medium transition-colors uppercase tracking-widest ${hoveredIdx === idx ? 'text-blue-600' : 'text-slate-300'}`}>{item.label}</p>
                            </div>
                        );
                    })}
                    {!stats?.activityTrend?.length && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 italic text-sm">
                            No activity data recorded
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 card border-none ring-1 ring-slate-200/80 bg-white overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-black">Recent Activity</h3>
                        <Link to="/applications" className="text-[11px] font-medium text-blue-600 hover:text-blue-900 bg-blue-50 px-4 py-2 rounded-lg transition-colors uppercase tracking-widest">View All</Link>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {stats?.recentApplications?.length > 0 ? (
                            stats.recentApplications.map((app) => (
                                <div key={app._id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                         <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 font-medium border-2 border-slate-300 shadow-sm overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform relative">
                                            {app.candidate?.avatar && !imageErrors[app._id] ? (
                                                <img 
                                                    src={app.candidate.avatar.startsWith('http') || app.candidate.avatar.startsWith('data:') 
                                                        ? app.candidate.avatar 
                                                        : `${BASE_URL.replace(/\/$/, '')}/${app.candidate.avatar.replace(/^\//, '')}`}
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover"
                                                    onError={() => setImageErrors(prev => ({ ...prev, [app._id]: true }))}
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-black">
                                                    {(app.candidate?.firstName?.[0] || 'U') + (app.candidate?.lastName?.[0] || '')}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-black text-sm truncate max-w-[150px]">{app.candidate?.firstName} {app.candidate?.lastName}</p>
                                            <p className="text-[11px] font-medium text-black truncate max-w-[150px]">{app.job?.title || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-bold text-black mb-1">{formatDate(app.createdAt)}</p>
                                        <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${app.status?.toLowerCase() === 'applied' ? 'bg-amber-50 text-amber-600 border border-amber-100' : app.status?.toLowerCase() === 'shortlisted' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-black-700 border border-slate-100'}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center">
                                <HiOutlineDocumentText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">No recent applications found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-6">
                    <div className="card p-8 border-1px solid to-black ring-1 ring-slate-200/80 bg-white shadow-sm">
                        <h3 className="text-xl font-bold text-black mb-6">Quick Actions</h3>
                        <div className="space-y-4">
                            <Link to="/jobs" className="flex items-center justify-center w-full py-4 bg-blue-600 text-white rounded-md font-bold text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 hover:-translate-y-1 active:scale-95">
                                Manage Jobs
                            </Link>
                            <Link to="/applications" className="flex items-center justify-center w-full py-4 bg-white border-2 border-slate-300 text-slate-800 rounded-md font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all hover:border-slate-200">
                                Review Applications
                            </Link>
                            <Link to="/recruiters" className="flex items-center justify-center w-full py-4 bg-white border-2 border-slate-300 text-slate-800 rounded-md font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all hover:border-slate-200">
                                Manage Recruiters
                            </Link>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
