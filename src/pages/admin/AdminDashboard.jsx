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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header */}
            {/* Top Row: Premium Stats Grid (Horizontal Focus) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 border-b border-slate-100 pb-6 mb-2">
                <Link to="/candidates" className="bg-white p-6 rounded-md border border-slate-300 flex justify-between items-center transition-all duration-300 hover:shadow-md hover:border-slate-400 hover:-translate-y-1">
                    <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">{overview?.candidates || 0}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Total Candidates</p>
                    </div>
                    <div className="w-10 h-10 rounded-md text-blue-600 bg-blue-50 flex items-center justify-center transition-all duration-300 group-hover:bg-blue-100">
                        <HiOutlineUserGroup className="w-5 h-5" />
                    </div>
                </Link>

                <Link to="/recruiters" className="bg-white p-6 rounded-md border border-slate-300 flex justify-between items-center transition-all duration-300 hover:shadow-md hover:border-slate-400 hover:-translate-y-1">
                    <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">{overview?.recruiters || 0}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Total Recruiters</p>
                    </div>
                    <div className="w-10 h-10 rounded-md text-purple-600 bg-purple-50 flex items-center justify-center transition-all duration-300">
                        <HiOutlineUsers className="w-5 h-5" />
                    </div>
                </Link>

                <Link to="/employers" className="bg-white p-6 rounded-md border border-slate-300 flex justify-between items-center transition-all duration-300 hover:shadow-md hover:border-slate-400 hover:-translate-y-1">
                    <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">{overview?.employers || 0}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Total Employers</p>
                    </div>
                    <div className="w-10 h-10 rounded-md text-emerald-600 bg-emerald-50 flex items-center justify-center transition-all duration-300">
                        <HiOutlineBuildingOffice2 className="w-5 h-5" />
                    </div>
                </Link>

                <Link to="/jobs" className="bg-white p-6 rounded-md border border-slate-300 flex justify-between items-center transition-all duration-300 hover:shadow-md hover:border-slate-400 hover:-translate-y-1">
                    <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">{overview?.jobs || 0}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Active Jobs</p>
                    </div>
                    <div className="w-10 h-10 rounded-md text-amber-600 bg-amber-50 flex items-center justify-center transition-all duration-300">
                        <HiOutlineBriefcase className="w-5 h-5" />
                    </div>
                </Link>

                <Link to="/applications" className="bg-white p-6 rounded-md border border-slate-300 flex justify-between items-center transition-all duration-300 hover:shadow-md hover:border-slate-400 hover:-translate-y-1">
                    <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">{overview?.applications || 0}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Applications</p>
                    </div>
                    <div className="w-10 h-10 rounded-md text-indigo-600 bg-indigo-50 flex items-center justify-center transition-all duration-300">
                        <HiOutlineDocumentText className="w-5 h-5" />
                    </div>
                </Link>

                <Link to="/shortlisted-candidates" className="bg-white p-6 rounded-md border border-slate-300 flex justify-between items-center transition-all duration-300 hover:shadow-md hover:border-slate-400 hover:-translate-y-1">
                    <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">{overview?.shortlisted || 0}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Hired Candidates</p>
                    </div>
                    <div className="w-10 h-10 rounded-md text-rose-600 bg-rose-50 flex items-center justify-center transition-all duration-300">
                        <HiOutlineCheckBadge className="w-5 h-5" />
                    </div>
                </Link>
            </div>

            {/* Middle Row: Chart (Left) & Quick Actions (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Overview (Chart) */}
                <div className="lg:col-span-2 bg-white rounded-md border border-slate-300 p-6 shadow-sm flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-black">Activity Overview</h3>
                            <p className="text-sm text-slate-500 mt-1">Real-time statistics for platform ecosystem</p>
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

                    <div className="flex flex-wrap items-center justify-end gap-5 text-[11px] font-medium mb-4">
                        <button onClick={() => toggleSeries('employers')} className={`flex items-center gap-2 transition-all ${visibleSeries.employers ? 'opacity-100' : 'opacity-20'}`}>
                            <div className="w-3 h-3 rounded bg-blue-500"></div>
                            <span className="text-slate-700 uppercase tracking-widest">Companies</span>
                        </button>
                        <button onClick={() => toggleSeries('candidates')} className={`flex items-center gap-2 transition-all ${visibleSeries.candidates ? 'opacity-100' : 'opacity-20'}`}>
                            <div className="w-3 h-3 rounded bg-emerald-500"></div>
                            <span className="text-slate-700 uppercase tracking-widest">Candidates</span>
                        </button>
                        <button onClick={() => toggleSeries('jobs')} className={`flex items-center gap-2 transition-all ${visibleSeries.jobs ? 'opacity-100' : 'opacity-20'}`}>
                            <div className="w-3 h-3 rounded bg-amber-500"></div>
                            <span className="text-slate-700 uppercase tracking-widest">Jobs</span>
                        </button>
                        <button onClick={() => toggleSeries('applications')} className={`flex items-center gap-2 transition-all ${visibleSeries.applications ? 'opacity-100' : 'opacity-20'}`}>
                            <div className="w-3 h-3 rounded bg-purple-500"></div>
                            <span className="text-slate-700 uppercase tracking-widest">Apps</span>
                        </button>
                    </div>

                    <div className="relative h-[250px] mt-2 flex items-end justify-between gap-4 px-2 md:px-6 overflow-visible flex-1">
                        {/* Y-Axis Grid Lines */}
                        <div className="absolute inset-x-0 inset-y-0 -top-4 bottom-8 flex flex-col justify-between pointer-events-none text-[10px] font-medium text-slate-400">
                            {[2, 1.5, 1, 0.5, 0].map(val => (
                                <div key={val} className="flex items-center gap-3 w-full">
                                    <span className="w-4 text-right">{val}</span>
                                    <div className="flex-1 h-px bg-slate-100"></div>
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
                                    {hoveredIdx === idx && (
                                        <div className="absolute inset-x-0 -inset-y-4 bg-slate-50 rounded-md -z-10 animate-in fade-in duration-200"></div>
                                    )}

                                    <div className="w-full flex items-end justify-center gap-[2px] h-[160px] relative">
                                        {visibleSeries.employers && (
                                            <div className="w-[8px] md:w-[12px] bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600"
                                                style={{ height: `${Math.min((item.employers / maxVal) * 100, 100)}%` }}></div>
                                        )}
                                        {visibleSeries.candidates && (
                                            <div className="w-[8px] md:w-[12px] bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-600"
                                                style={{ height: `${Math.min((item.candidates / maxVal) * 100, 100)}%` }}></div>
                                        )}
                                        {visibleSeries.jobs && (
                                            <div className="w-[8px] md:w-[12px] bg-amber-500 rounded-t-sm transition-all hover:bg-amber-600"
                                                style={{ height: `${Math.min((item.jobs / maxVal) * 100, 100)}%` }}></div>
                                        )}
                                        {visibleSeries.applications && (
                                            <div className="w-[8px] md:w-[12px] bg-purple-500 rounded-t-sm transition-all hover:bg-purple-600"
                                                style={{ height: `${Math.min((item.applications / maxVal) * 100, 100)}%` }}></div>
                                        )}

                                        {hoveredIdx === idx && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-[100] w-40 bg-white shadow-xl rounded-xl border border-slate-200 p-4 animate-in zoom-in-95 fade-in duration-200">
                                                <p className="text-[10px] font-bold text-slate-500 mb-3 border-b border-slate-100 pb-2 uppercase tracking-widest">{item.label}</p>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-medium text-slate-500">Companies</span>
                                                        <span className="text-[11px] font-bold text-black">{item.employers}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-medium text-slate-500">Candidates</span>
                                                        <span className="text-[11px] font-bold text-black">{item.candidates}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-medium text-slate-500">Jobs</span>
                                                        <span className="text-[11px] font-bold text-black">{item.jobs}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-medium text-slate-500">Apps</span>
                                                        <span className="text-[11px] font-bold text-black">{item.applications}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className={`mt-3 text-[10px] font-bold transition-colors uppercase tracking-widest ${hoveredIdx === idx ? 'text-blue-600' : 'text-slate-400'}`}>{item.label}</p>
                                </div>
                            );
                        })}
                        {!stats?.activityTrend?.length && (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                                No activity data recorded
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions (Right) */}
                <div className="bg-white rounded-md border border-slate-300 p-6 shadow-sm flex flex-col h-full">
                    <h3 className="text-xl font-bold text-black mb-6">Quick Actions</h3>
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                        <Link to="/jobs" className="flex items-center justify-center w-full py-3.5 bg-blue-600 text-white rounded-md font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm">
                            Manage Jobs
                        </Link>
                        <Link to="/applications" className="flex items-center justify-center w-full py-3.5 bg-slate-50 border border-slate-300 text-slate-700 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                            Review Apps
                        </Link>
                        <Link to="/recruiters" className="flex items-center justify-center w-full py-3.5 bg-slate-50 border border-slate-300 text-slate-700 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                            Manage Staff
                        </Link>
                        <Link to="/employers" className="flex items-center justify-center w-full py-3.5 bg-slate-50 border border-slate-300 text-slate-700 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                            Employers
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Activity (Full Width) */}
            <div className="bg-white rounded-md border border-slate-300 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-black">Recent Activity</h3>
                    <Link to="/applications" className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-md transition-colors uppercase tracking-widest border border-blue-100">View All</Link>
                </div>
                <div className="divide-y divide-slate-100">
                    {stats?.recentApplications?.length > 0 ? (
                        stats.recentApplications.map((app) => (
                            <div key={app._id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded border border-slate-300 bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden flex-shrink-0 relative">
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
                                            <span className="text-xs">
                                                {(app.candidate?.firstName?.[0] || 'U') + (app.candidate?.lastName?.[0] || '')}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-black text-[14px]">{app.candidate?.firstName} {app.candidate?.lastName}</p>
                                        <p className="text-[12px] font-medium text-slate-600 mt-0.5">{app.job?.title || 'Unknown Position'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[12px] font-bold text-slate-500 mb-1.5">{formatDate(app.createdAt)}</p>
                                    <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${app.status?.toLowerCase() === 'applied' ? 'bg-amber-50 text-amber-600 border border-amber-200' : app.status?.toLowerCase() === 'shortlisted' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-300'}`}>
                                        {app.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-16 text-center">
                            <HiOutlineDocumentText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No recent applications found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
