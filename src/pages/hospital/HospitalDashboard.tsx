import React from 'react';
import { Navigate } from 'react-router-dom';

export default function HospitalDashboard() {
  return <Navigate to="/hospital/overview" replace />;
}
