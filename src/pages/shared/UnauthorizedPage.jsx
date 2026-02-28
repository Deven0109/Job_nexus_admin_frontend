import { Link } from 'react-router-dom';
import { HiOutlineShieldExclamation } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';

const UnauthorizedPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-danger-50 rounded-2xl flex items-center justify-center mb-6">
                    <HiOutlineShieldExclamation className="w-10 h-10 text-danger-500" />
                </div>
                <h1 className="text-4xl font-extrabold text-dark-900 mb-3">403</h1>
                <h2 className="text-xl font-semibold text-dark-700 mb-2">Access Denied</h2>
                <p className="text-dark-500 text-sm mb-8 max-w-sm mx-auto">
                    You don't have permission to access this page.
                </p>
                <Link
                    to={user?.role === 'admin' ? "/dashboard" : "/signin"}
                    className="inline-flex items-center gap-2 px-6 py-2.5 gradient-primary text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                    {user?.role === 'admin' ? "Go to Dashboard" : "Back to Login"}
                </Link>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
