import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8080/auth/me", {
            credentials: "include",
        }).then(res => {
            if (res.ok) setIsAuthenticated(true);
        })
        .finally(() => setLoading(false));
    }, []);

    const login = () => {
        setIsAuthenticated(true)
        navigate('/blog');
    };

    const logout = async () => {
        await fetch("http://localhost:8080/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        setIsAuthenticated(false);
        navigate('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
