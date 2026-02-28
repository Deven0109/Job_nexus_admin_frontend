import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    HiOutlineCheckBadge
} from 'react-icons/hi2';

const sidebarItems = [
    { label: 'Dashboard', to: '/dashboard', icon: HiOutlineHome },
    { label: 'Recruiters', to: '/recruiters', icon: HiOutlineUserGroup },
    { label: 'Employers', to: '/employers', icon: HiOutlineBuildingOffice2 },
    { label: 'Candidates', to: '/candidates', icon: HiOutlineUsers },
    { label: 'Jobs', to: '/jobs', icon: HiOutlineBriefcase },
    { label: 'Applications', to: '/applications', icon: HiOutlineClipboardDocumentList },
    { label: 'Shortlisted Candidate', to: '/shortlisted-candidates', icon: HiOutlineCheckBadge },
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
                className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-50 transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between px-6 py-6 border-b border-slate-50">
                        <Link to="/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#5b4eff] rounded-xl flex items-center justify-center shadow-lg shadow-[#5b4eff]/20">
                                <HiOutlineBriefcase className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-[19px] font-black text-slate-900 tracking-tighter whitespace-nowrap">
                                Job <span className="text-[#5b4eff]">Consultancy</span>
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-md hover:bg-slate-100"
                        >
                            <HiOutlineXMark className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Menu Label */}
                    <div className="px-5 pt-4 pb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menu</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-4 py-4">
                        <div className="space-y-1.5">
                            {sidebarItems.map((item) => {
                                const isActive = location.pathname === item.to ||
                                    (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-300 group ${isActive
                                            ? 'bg-[#5b4eff] text-white shadow-lg shadow-[#5b4eff]/20'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <Icon
                                            className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                                                }`}
                                        />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Logout Footer */}
                    <div className="p-4 border-t border-slate-50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[14px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 group"
                        >
                            <HiOutlineArrowRightOnRectangle className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* ======= MAIN AREA ======= */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100">
                    <div className="flex items-center justify-between px-4 sm:px-6 h-16">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <HiOutlineBars3 className="w-5 h-5 text-slate-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-black text-black tracking-tight">
                                    {sidebarItems.find((item) =>
                                        location.pathname === item.to || location.pathname.startsWith(item.to)
                                    )?.label || 'Dashboard'}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                className="relative p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                                aria-label="Notifications"
                            >
                                <HiOutlineBell className="w-5 h-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>

                            {/* User Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#5b4eff] flex items-center justify-center shadow-lg shadow-[#5b4eff]/20 overflow-hidden border-2 border-white">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-black text-sm uppercase">
                                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-[13px] font-bold text-slate-900 leading-none mb-1 group-hover:text-[#5b4eff] transition-colors uppercase">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                    </div>
                                    <HiOutlineChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-5 py-4 border-b border-slate-50 mb-2">
                                                <p className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                                                <p className="text-[11px] text-slate-400 font-medium truncate">{user?.email}</p>
                                            </div>

                                            <Link
                                                to="/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all"
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
                <main className="flex-1 p-4 sm:p-6">
                    <div className="page-enter">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
