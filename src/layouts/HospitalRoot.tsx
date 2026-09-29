import React from 'react';
import { HospitalProvider } from '../contexts/HospitalContext';
import { HospitalLayout } from './HospitalLayout';

export const HospitalRoot: React.FC = () => {
  return (
    <HospitalProvider>
      <HospitalLayout />
    </HospitalProvider>
  );
};
