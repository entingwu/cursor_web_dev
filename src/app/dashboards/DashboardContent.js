'use client';

import { useState } from 'react';
import { useApiKeys } from '@/app/hooks/useApiKeys';
import { calculateTotalUsage } from '@/app/utils/apiKeyUtils';
import DashboardHeader from '@/app/components/DashboardHeader';
import PlanCard from '@/app/components/PlanCard';
import ApiKeyTable from '@/app/components/ApiKeyTable';
import ApiKeyModal from '@/app/components/ApiKeyModal';

export default function DashboardContent({ isSidebarOpen = true, onToggleSidebar }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Use our custom hook for API key management
  const {
    apiKeys,
    loading,
    error,
    submitting,
    createApiKey,
    updateApiKey,
    deleteApiKey
  } = useApiKeys();

  // Calculate total usage for the plan card
  const totalUsage = calculateTotalUsage(apiKeys);

  // Handle modal actions
  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateApiKey = async (keyData) => {
    return await createApiKey(keyData);
  };

  return (
    <div className={`transition-all duration-300 ease-in-out ${
      isSidebarOpen ? 'lg:ml-64' : 'ml-0'
    }`}>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <DashboardHeader onToggleSidebar={onToggleSidebar} />

        {/* Current Plan Card */}
        <PlanCard totalUsage={totalUsage} />

        {/* API Keys Table */}
        <ApiKeyTable
          apiKeys={apiKeys}
          loading={loading}
          error={error}
          onEdit={() => {}} // Will be handled by the table component
          onDelete={deleteApiKey}
          onUpdate={updateApiKey}
          onCreateNew={handleCreateNew}
          submitting={submitting}
        />

        {/* Create API Key Modal */}
        <ApiKeyModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onSubmit={handleCreateApiKey}
          submitting={submitting}
        />
      </div>
    </div>
  );
}
