import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth.api';
import toast from 'react-hot-toast';
import {
    HiOutlineUser,
    HiOutlineEnvelope,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineCalendar,
    HiOutlineShieldCheck,
} from 'react-icons/hi2';

const ProfileSettings = () => {
    const { user, updateUser } = useAuth();
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!profileData.firstName || !profileData.email) {
            toast.error('First name and email are required');
            return;
        }

        setIsUpdatingProfile(true);
        try {
            const { data } = await authAPI.updateProfile(profileData);
            updateUser(data.data.user);
            toast.success('Profile updated successfully');
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData?.errors && errorData.errors.length > 0) {
                errorData.errors.forEach(err => {
                    toast.error(`${err.field}: ${err.message}`);
                });
            } else {
                toast.error(errorData?.message || 'Failed to update profile');
            }
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('All password fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsChangingPassword(true);
        try {
            await authAPI.changePassword({
                currentPassword,
                newPassword,
                confirmNewPassword: confirmPassword
            });
            toast.success('Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData?.errors && errorData.errors.length > 0) {
                errorData.errors.forEach(err => {
                    toast.error(`${err.field}: ${err.message}`);
                });
            } else {
                toast.error(errorData?.message || 'Failed to change password');
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Update Profile Form */}
                <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <HiOutlineUser className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Update Profile</h3>
                            <p className="text-sm text-slate-500 font-medium">Update your personal information</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                                <HiOutlineUser className="w-4 h-4 text-slate-400" />
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="firstName"
                                    value={profileData.firstName}
                                    onChange={handleProfileChange}
                                    placeholder="First Name"
                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold outline-none text-slate-700 placeholder:text-slate-300"
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    value={profileData.lastName}
                                    onChange={handleProfileChange}
                                    placeholder="Last Name"
                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold outline-none text-slate-700 placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                                <HiOutlineEnvelope className="w-4 h-4 text-slate-400" />
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleProfileChange}
                                placeholder="Email Address"
                                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold outline-none text-slate-700 placeholder:text-slate-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                                <HiOutlineEnvelope className="w-4 h-4 text-slate-400" />
                                Current Email
                            </label>
                            <input
                                type="text"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 font-semibold cursor-not-allowed"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            {isUpdatingProfile ? 'Updating...' : (
                                <>
                                    <HiOutlineUser className="w-5 h-5" />
                                    Update Profile
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Change Password Form */}
                <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                            <HiOutlineLockClosed className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                            <p className="text-sm text-slate-500 font-medium">Update your account password</p>
                        </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                                <HiOutlineLockClosed className="w-4 h-4 text-slate-400" />
                                Current Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter your current password"
                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold outline-none text-slate-700 placeholder:text-slate-300 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('current')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPasswords.current ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                                <HiOutlineLockClosed className="w-4 h-4 text-slate-400" />
                                New Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter your new password"
                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold outline-none text-slate-700 placeholder:text-slate-300 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPasswords.new ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                                <HiOutlineLockClosed className="w-4 h-4 text-slate-400" />
                                Confirm New Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm your new password"
                                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold outline-none text-slate-700 placeholder:text-slate-300 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPasswords.confirm ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            {isChangingPassword ? 'Changing...' : (
                                <>
                                    <HiOutlineLockClosed className="w-5 h-5" />
                                    Change Password
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
