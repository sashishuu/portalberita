import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    // You can return a loading spinner here
    return <div>Loading...</div>;
  }

  // If user is authenticated and is an admin, render the child routes
  // Otherwise, redirect to the home page or a "not authorized" page
  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;