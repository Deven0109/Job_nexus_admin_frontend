import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-black tracking-tight">Dashboard Management</h2>
                    <p className="text-slate-500 text-sm mt-1 font-bold">Platform performance and ecosystem oversight</p>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Candidates */}
                <Link to="/candidates" className="group card p-7 border-none ring-1 ring-slate-200/80 hover:ring-[#5b4eff]/50 transition-all duration-300 relative overflow-hidden block bg-white shadow-sm hover:shadow-xl hover:shadow-[#5b4eff]/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5b4eff]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#5b4eff] text-white flex items-center justify-center shadow-lg shadow-[#5b4eff]/20 group-hover:rotate-6 transition-transform">
                            <HiOutlineUserGroup className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 leading-none mb-1">{overview?.candidates || 0}</p>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Candidates</p>
                        </div>
                    </div>
                </Link>

                {/* Total Recruiters */}
                <Link to="/recruiters" className="group card p-7 border-none ring-1 ring-slate-200/80 hover:ring-[#5b4eff]/50 transition-all duration-300 relative overflow-hidden block bg-white shadow-sm hover:shadow-xl hover:shadow-[#5b4eff]/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5b4eff]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#5b4eff] text-white flex items-center justify-center shadow-lg shadow-[#5b4eff]/20 group-hover:rotate-6 transition-transform">
                            <HiOutlineUsers className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 leading-none mb-1">{overview?.recruiters || 0}</p>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Recruiters</p>
                        </div>
                    </div>
                </Link>

                {/* Total Employers */}
                <Link to="/employers" className="group card p-7 border-none ring-1 ring-slate-200/80 hover:ring-[#5b4eff]/50 transition-all duration-300 relative overflow-hidden block bg-white shadow-sm hover:shadow-xl hover:shadow-[#5b4eff]/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5b4eff]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#5b4eff] text-white flex items-center justify-center shadow-lg shadow-[#5b4eff]/20 group-hover:rotate-6 transition-transform">
                            <HiOutlineBuildingOffice2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 leading-none mb-1">{overview?.employers || 0}</p>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Employers</p>
                        </div>
                    </div>
                </Link>

                {/* Total Jobs */}
                <Link to="/jobs" className="group card p-7 border-none ring-1 ring-slate-200/80 hover:ring-[#5b4eff]/50 transition-all duration-300 relative overflow-hidden block bg-white shadow-sm hover:shadow-xl hover:shadow-[#5b4eff]/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5b4eff]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#5b4eff] text-white flex items-center justify-center shadow-lg shadow-[#5b4eff]/20 group-hover:rotate-6 transition-transform">
                            <HiOutlineBriefcase className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 leading-none mb-1">{overview?.jobs || 0}</p>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Active Jobs</p>
                        </div>
                    </div>
                </Link>

                {/* Total Applications */}
                <Link to="/applications" className="group card p-7 border-none ring-1 ring-slate-200/80 hover:ring-[#5b4eff]/50 transition-all duration-300 relative overflow-hidden block bg-white shadow-sm hover:shadow-xl hover:shadow-[#5b4eff]/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5b4eff]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#5b4eff] text-white flex items-center justify-center shadow-lg shadow-[#5b4eff]/20 group-hover:rotate-6 transition-transform">
                            <HiOutlineDocumentText className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 leading-none mb-1">{overview?.applications || 0}</p>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Applications</p>
                        </div>
                    </div>
                </Link>

                {/* Shortlisted Candidate */}
                <Link to="/shortlisted-candidates" className="group card p-7 border-none ring-1 ring-slate-200/80 hover:ring-[#5b4eff]/50 transition-all duration-300 relative overflow-hidden block bg-white shadow-sm hover:shadow-xl hover:shadow-[#5b4eff]/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5b4eff]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#5b4eff] text-white flex items-center justify-center shadow-lg shadow-[#5b4eff]/20 group-hover:rotate-6 transition-transform">
                            <HiOutlineCheckBadge className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 leading-none mb-1">{overview?.shortlisted || 0}</p>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Shortlisted Candidate</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Activity Overview */}
            <div className="card p-8 border-none ring-1 ring-slate-200/80 bg-white relative z-20 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-black">Activity Overview</h3>
                        <p className="text-slate-400 text-[13px] mt-1 font-bold">Track updates across statistics for companies, candidates, jobs, and applications</p>
                    </div>
                    <div className="flex items-center p-1 bg-slate-100/50 rounded-xl overflow-hidden self-end md:self-auto">
                        {['Week', 'Month', 'Year'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-5 py-2 text-xs font-black rounded-lg transition-all ${period === p ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-6 text-[13px] font-bold mb-8">
                    <button onClick={() => toggleSeries('employers')} className={`flex items-center gap-2 transition-all ${visibleSeries.employers ? 'opacity-100' : 'opacity-30'}`}>
                        <div className="w-4 h-4 rounded-sm bg-[#5b4eff]"></div>
                        <span className="text-slate-600">Companies</span>
                    </button>
                    <button onClick={() => toggleSeries('candidates')} className={`flex items-center gap-2 transition-all ${visibleSeries.candidates ? 'opacity-100' : 'opacity-30'}`}>
                        <div className="w-4 h-4 rounded-sm bg-[#36f0b4]"></div>
                        <span className="text-slate-600">Candidates</span>
                    </button>
                    <button onClick={() => toggleSeries('jobs')} className={`flex items-center gap-2 transition-all ${visibleSeries.jobs ? 'opacity-100' : 'opacity-30'}`}>
                        <div className="w-4 h-4 rounded-sm bg-[#f9a825]"></div>
                        <span className="text-slate-600">Jobs</span>
                    </button>
                    <button onClick={() => toggleSeries('applications')} className={`flex items-center gap-2 transition-all ${visibleSeries.applications ? 'opacity-100' : 'opacity-30'}`}>
                        <div className="w-4 h-4 rounded-sm bg-[#a855f7]"></div>
                        <span className="text-slate-600">Applications</span>
                    </button>
                </div>

                <div className="relative h-[320px] mt-4 flex items-end justify-between gap-4 px-6 md:px-10 overflow-visible">
                    {/* Y-Axis Grid Lines matching reference */}
                    <div className="absolute inset-x-0 inset-y-0 -top-4 bottom-8 flex flex-col justify-between pointer-events-none text-[11px] font-black text-slate-300">
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
                                    <div className="absolute inset-x-1 -inset-y-4 bg-slate-50/80 rounded-2xl -z-10 animate-in fade-in duration-200 ring-1 ring-slate-100"></div>
                                )}

                                <div className="w-full flex items-end justify-center gap-[6px] h-[200px] relative">
                                    {visibleSeries.employers && (
                                        <div className="w-[18px] md:w-[24px] bg-[#5b4eff] rounded-t-sm transition-all shadow-sm"
                                            style={{ height: `${Math.min((item.employers / maxVal) * 100, 100)}%` }}></div>
                                    )}
                                    {visibleSeries.candidates && (
                                        <div className="w-[18px] md:w-[24px] bg-[#36f0b4] rounded-t-sm transition-all shadow-sm"
                                            style={{ height: `${Math.min((item.candidates / maxVal) * 100, 100)}%` }}></div>
                                    )}
                                    {visibleSeries.jobs && (
                                        <div className="w-[18px] md:w-[24px] bg-[#f9a825] rounded-t-sm transition-all shadow-sm"
                                            style={{ height: `${Math.min((item.jobs / maxVal) * 100, 100)}%` }}></div>
                                    )}
                                    {visibleSeries.applications && (
                                        <div className="w-[18px] md:w-[24px] bg-[#a855f7] rounded-t-sm transition-all shadow-sm"
                                            style={{ height: `${Math.min((item.applications / maxVal) * 100, 100)}%` }}></div>
                                    )}

                                    {/* Tooltip Overlay */}
                                    {hoveredIdx === idx && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-[100] w-48 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(79,70,229,0.15)] rounded-2xl border border-slate-100 p-4 animate-in zoom-in-95 fade-in duration-200">
                                            <p className="text-[10px] font-black text-slate-400 mb-3 border-b border-slate-50 pb-2 uppercase tracking-widest leading-none">{item.label}</p>
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-[#5b4eff]"></div>
                                                        <span className="text-[11px] font-bold text-slate-600">Companies</span>
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-900 leading-none">{item.employers}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-[#36f0b4]"></div>
                                                        <span className="text-[11px] font-bold text-slate-600">Candidates</span>
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-900 leading-none">{item.candidates}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-[#f9a825]"></div>
                                                        <span className="text-[11px] font-bold text-slate-600">Jobs</span>
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-900 leading-none">{item.jobs}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-[#a855f7]"></div>
                                                        <span className="text-[11px] font-bold text-slate-600">Applications</span>
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-900 leading-none">{item.applications}</span>
                                                </div>
                                            </div>
                                            {/* Tooltip Arrow */}
                                            <div className="absolute top-[99%] left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 border-r border-b border-slate-100 rotate-45"></div>
                                        </div>
                                    )}
                                </div>
                                <p className={`mt-5 text-[11px] font-black transition-colors ${hoveredIdx === idx ? 'text-[#5b4eff]' : 'text-slate-400'}`}>{item.label}</p>
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
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-xl font-black text-black">Recent Activity</h3>
                        <Link to="/applications" className="text-xs font-black text-[#5b4eff] hover:text-[#5b4eff]/80 bg-[#5b4eff]/5 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest">View All</Link>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {stats?.recentApplications?.length > 0 ? (
                            stats.recentApplications.map((app) => (
                                <div key={app._id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                                            {app.candidate?.avatar ? (
                                                <img src={app.candidate.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{app.candidate?.firstName?.[0]}{app.candidate?.lastName?.[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-black text-black leading-none mb-1.5 group-hover:text-[#5b4eff] transition-colors">
                                                {app.candidate?.firstName} {app.candidate?.lastName}
                                            </p>
                                            <p className="text-xs font-bold text-slate-500">
                                                {app.job?.title} <span className="mx-1.5 opacity-30">•</span> {app.candidate?.email?.split('@')[0]}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-black text-slate-900 mb-1">{formatDate(app.createdAt)}</p>
                                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${app.status === 'applied' ? 'bg-amber-100 text-amber-700' : app.status === 'shortlisted' ? 'bg-[#5b4eff]/10 text-[#5b4eff]' : 'bg-slate-100 text-slate-700'}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center">
                                <HiOutlineDocumentText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold">No recent applications found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-6">
                    <div className="card p-8 border-none ring-1 ring-slate-200/80 bg-white shadow-sm">
                        <h3 className="text-xl font-black text-black mb-6">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link to="/jobs" className="flex items-center justify-center w-full py-4 bg-[#5b4eff] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-[#5b4eff]/20 hover:-translate-y-0.5 active:translate-y-0">
                                Manage Jobs
                            </Link>
                            <Link to="/applications" className="flex items-center justify-center w-full py-4 bg-white border border-slate-200 text-black rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all hover:border-slate-300">
                                Review Applications
                            </Link>
                            <Link to="/recruiters" className="flex items-center justify-center w-full py-4 bg-white border border-slate-200 text-black rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all hover:border-slate-300">
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
