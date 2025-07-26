'use client';

import { useState } from 'react';
import { generateApiKey } from '@/app/utils/apiKeyUtils';

export default function ApiKeyModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  submitting = false 
}) {
  const [formData, setFormData] = useState({ 
    name: '', 
    status: 'active', 
    limit: 1000 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const keyData = {
      name: formData.name,
      key_value: generateApiKey(formData.name),
      status: formData.status,
      usage_count: 0,
      usage_limit: formData.limit
    };

    const success = await onSubmit(keyData);
    if (success) {
      setFormData({ name: '', status: 'active', limit: 1000 });
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.3)', 
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)' 
      }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Create a new API key</h2>
          <p className="text-gray-600 text-sm mb-6">Enter a name and limit for the new API key</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
                placeholder="e.g., Production API"
              />
              <p className="text-xs text-gray-500 mt-1">A unique name to identify this key</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit monthly usage*
              </label>
              <input
                type="number"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
                min="1"
                placeholder="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                If usage exceeds this limit, requests will be rejected according to your plan
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 