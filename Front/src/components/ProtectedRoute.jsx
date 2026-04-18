import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getCookie } from '../utils/cookies';

const ProtectedRoute = ({ isAuthenticated }) => {
    // Проверяем токен в cookies (на случай если state сбросился при обновлении)
    const token = getCookie('catsgram_token');
    const isAuth = isAuthenticated || !!token;

    return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;