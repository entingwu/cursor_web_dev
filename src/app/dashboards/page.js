'use client';

import { useState } from 'react';
import { NotificationContainer } from '@/app/components/Notifications';
import Sidebar from '@/app/components/Sidebar';
import DashboardContent from './DashboardContent';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <NotificationContainer>
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <DashboardContent isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
      </div>
    </NotificationContainer>
  );
} 