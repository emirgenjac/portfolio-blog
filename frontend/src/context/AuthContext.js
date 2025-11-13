import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => localStorage.getItem('token'));

    const login = (token) => {
        localStorage.setItem('token', token);
        setUser(token);
        navigate('/blog');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
