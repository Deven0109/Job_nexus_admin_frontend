import { Link } from 'react-router-dom';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

const NotFoundPage = () => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-warning-50 rounded-2xl flex items-center justify-center mb-6">
                    <HiOutlineExclamationTriangle className="w-10 h-10 text-warning-500" />
                </div>
                <h1 className="text-6xl font-extrabold text-dark-900 mb-3">404</h1>
                <h2 className="text-xl font-semibold text-dark-700 mb-2">Page Not Found</h2>
                <p className="text-dark-500 text-sm mb-8 max-w-sm mx-auto">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-2.5 gradient-primary text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
