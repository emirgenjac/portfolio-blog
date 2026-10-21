import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import ApiLoading from './ApiLoading';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);
    const { showAlert } = useModal();
    const [redirect, setRedirect] = useState(false);
    const [notified, setNotified] = useState(false);

    useEffect(() => {
        if (loading || isAuthenticated || notified) return;

        setNotified(true);
        showAlert({
            title: "Login required",
            message: "You need to be logged in to access this page.",
            variant: "error",
        }).finally(() => setRedirect(true));
    }, [loading, isAuthenticated, notified, showAlert]);

    if (loading) return <ApiLoading />;

    if (!isAuthenticated) {
        if (redirect) return <Navigate to="/auth/login" replace />;
        return null;
    }

    return children;
};

export default ProtectedRoute;
