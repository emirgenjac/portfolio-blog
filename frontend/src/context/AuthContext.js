import { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';

export const AuthContext = createContext();

function needsSessionCheck(pathname) {
    return pathname.startsWith('/blog') || pathname.startsWith('/auth');
}

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const checkSession = needsSessionCheck(location.pathname);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(checkSession);

    useEffect(() => {
        if (!checkSession) {
            setLoading(false);
            return undefined;
        }

        let cancelled = false;
        setLoading(true);

        API.get("/auth/me")
            .then(res => {
                if (!cancelled) {
                    setIsAuthenticated(res.status === 200);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setIsAuthenticated(false);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [checkSession]);

    const login = () => {
        setIsAuthenticated(true)
        navigate('/blog');
    };

    const logout = async () => {
        try {
            await API.post("/auth/logout");
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.warn('[auth] logout request failed', err?.message ?? err);
            }
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
