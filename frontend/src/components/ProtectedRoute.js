import React, {useContext} from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) return null;

    if (!isAuthenticated) {
        alert("Niste prijavljeni!")
        return <Navigate to="/auth/login" replace />;
    }
    return children;
};

export default ProtectedRoute;