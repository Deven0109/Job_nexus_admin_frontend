import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth.api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('jobnexus_admin_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check auth state on mount
    useEffect(() => {
        const token = localStorage.getItem('jobnexus_admin_token');
        if (token && user) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (credentials) => {
        const { data } = await authAPI.login(credentials);
        const { accessToken, user: userData } = data.data;

        if (userData.role !== 'admin') {
            throw new Error('Access denied. This panel is restricted to administrators.');
        }

        localStorage.setItem('jobnexus_admin_token', accessToken);
        localStorage.setItem('jobnexus_admin_user', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        return userData;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            localStorage.removeItem('jobnexus_admin_token');
            localStorage.removeItem('jobnexus_admin_user');
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    const updateUser = useCallback((updates) => {
        setUser((prev) => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('jobnexus_admin_user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
