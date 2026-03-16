import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../api/axios';
import {
    HiOutlineBriefcase,
    HiOutlineHome,
    HiOutlineUsers,
    HiOutlineCog6Tooth,
    HiOutlineBell,
    HiOutlineArrowRightOnRectangle,
    HiOutlineBars3,
    HiOutlineXMark,
    HiOutlineBuildingOffice2,
    HiOutlineClipboardDocumentList,
    HiOutlineShieldCheck,
    HiOutlineUserGroup,
    HiOutlineChevronDown,
    HiOutlineCheckBadge,
    HiOutlineQuestionMarkCircle,
    HiOutlineMagnifyingGlass
} from 'react-icons/hi2';
import NotificationBell from '../notifications/NotificationBell';

const sidebarItems = [
    { label: 'Dashboard', to: '/dashboard', icon: HiOutlineHome },
    { label: 'Recruiters', to: '/recruiters', icon: HiOutlineUserGroup },
    { label: 'Employers', to: '/employers', icon: HiOutlineBuildingOffice2 },
    { label: 'Candidates', to: '/candidates', icon: HiOutlineUsers },
    { label: 'Jobs', to: '/jobs', icon: HiOutlineBriefcase },
    { label: 'FAQ Management', to: '/faqs', icon: HiOutlineQuestionMarkCircle },
    { label: 'Manage Jobs', to: '/applications', icon: HiOutlineClipboardDocumentList },
    { label: 'Hire Candidate', to: '/shortlisted-candidates', icon: HiOutlineCheckBadge },
    { label: 'Profile Settings', to: '/profile', icon: HiOutlineCog6Tooth },
];

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/signin');
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* ======= SIDEBAR ======= */}
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 flex-shrink-0 bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 mb-2">
                        <Link to="/dashboard" className="flex items-center gap-2.5 group">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                <HiOutlineBriefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black text-black/80 tracking-tight whitespace-nowrap">
                                Job <span className="text-blue-600">Nexus</span>
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-md hover:bg-slate-100"
                        >
                            <HiOutlineXMark className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-4 py-1 scrollbar-hide">
                        <div className="space-y-1 font-medium">
                            {sidebarItems.map((item) => {
                                const isActive = location.pathname === item.to ||
                                    (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-1 rounded-xl text-[14px] transition-all duration-300 group ${isActive
                                            ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 ${isActive ? 'bg-white shadow-md text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-600'
                                            }`}>
                                            <Icon className="w-4.5 h-4.5" />
                                        </div>
                                        <span className="font-semibold tracking-tight">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Logout Footer */}
                    <div className="p-2 mt-auto border-t border-slate-50">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-1.5 text-xs font-black text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-xl transition-all duration-300 group border border-slate-100"
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm text-slate-400 group-hover:text-red-500 border border-slate-100 transition-all">
                                <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                            </div>
                            <span className="uppercase tracking-widest">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ======= MAIN AREA ======= */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Bar */}
                <header className="sticky top-0 z-[90] bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 shrink-0">
                    <div className="flex items-center justify-between px-6 h-full">
                        <div className="flex items-center gap-4 flex-1 max-w-xl">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <HiOutlineBars3 className="w-6 h-6 text-slate-600" />
                            </button>


                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <NotificationBell />
                            </div>

                            {/* User Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent"
                                >
                                    <div className="flex flex-col text-right hidden sm:block">
                                        <p className="text-[13px] font-black text-black/80 leading-none mb-1 group-hover:text-blue-600 transition-colors">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 lowercase tracking-normal">{user?.email}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 overflow-hidden border-2 border-white">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar.startsWith('http') || user.avatar.startsWith('data:') || user.avatar.startsWith('blob:')
                                                    ? user.avatar
                                                    : `${BASE_URL}${user.avatar}`
                                                }
                                                alt="Admin"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white font-black text-sm">
                                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <HiOutlineChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-5 py-4 border-b border-slate-50 mb-2">
                                                <p className="text-sm font-bold text-black/80">{user?.firstName} {user?.lastName}</p>
                                                <p className="text-[11px] text-slate-400 font-medium truncate">{user?.email}</p>
                                            </div>

                                            <Link
                                                to="/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                                            >
                                                <HiOutlineCog6Tooth className="w-5 h-5" />
                                                Profile Settings
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-danger-500 hover:bg-danger-50 transition-all"
                                            >
                                                <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                                                Sign out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 pt-0 pb-8 overflow-y-auto overflow-x-hidden bg-slate-50/50">
                    <div className="page-enter">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
