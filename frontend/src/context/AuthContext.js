import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('[auth] Checking /auth/me');
        API.get("/auth/me")
            .then(res => {
                console.log('[auth] /auth/me response', res.status, res.data);
                if (res.status === 200) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            })
            .catch(err => {
                console.log('[auth] /auth/me failed', err?.response?.status ?? 'no-response', err?.message ?? err);
                setIsAuthenticated(false);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = () => {
        setIsAuthenticated(true)
        navigate('/blog');
    };

    const logout = async () => {
        try {
            await API.post("/auth/logout");
        } catch (err) {
            // Still clear local auth if API is down / CSRF fails (e.g. backend restart)
            console.warn('[auth] logout request failed', err?.message ?? err);
        } finally {
            setIsAuthenticated(false);
            navigate('/auth/login');
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};


