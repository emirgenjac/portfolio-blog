import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token');

    if (!isAuthenticated) {
        alert("Niste prijavljeni!")
        return <Navigate to="/auth/login" replace />;
    }


    return children;
};

export default ProtectedRoute;