'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { NotificationContainer, showNotification } from '@/app/components/Notifications';
import { validateApiKey } from '@/app/utils/apiValidation';

export default function Protected() {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [apiKeyData, setApiKeyData] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Prevent duplicate API calls in React StrictMode (development)
  const hasValidated = useRef(false);

  const handleApiKeyValidation = async (apiKey) => {
    // Prevent duplicate calls
    if (hasValidated.current) {
      return;
    }
    hasValidated.current = true;

    try {
      setIsValidating(true);
      setError(null);

      // Use the plain validation function and handle notifications manually
      const result = await validateApiKey(apiKey);

      if (result.success && result.valid) {
        setApiKeyData(result.data);
        setIsValid(true);
        // Show success notification only once
        showNotification('Valid API key', 'success');
      } else {
        setError(result.error || 'Invalid API key');
        setIsValid(false);
        // Show error notification only once
        showNotification(result.error || 'Invalid API key', 'error');
      }
    } catch (err) {
      setError(err.message);
      setIsValid(false);
      showNotification('Validation error occurred', 'error');
      console.error('Error validating API key:', err);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    const apiKey = searchParams.get('apiKey');
    
    if (!apiKey) {
      setError('No API key provided');
      setIsValid(false);
      setIsValidating(false);
      showNotification('No API key provided', 'error');
      return;
    }

    handleApiKeyValidation(apiKey);
  }, [searchParams]);

  const handleRetry = () => {
    router.push('/playground');
  };

  if (isValidating) {
    return (
      <NotificationContainer>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Validating API key...</p>
          </div>
        </div>
      </NotificationContainer>
    );
  }

  if (!isValid) {
    return (
      <NotificationContainer>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-6">
                {error || 'The provided API key is invalid or inactive.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
                <Link
                  href="/dashboards"
                  className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </NotificationContainer>
    );
  }

  return (
    <NotificationContainer>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/playground"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Protected Area</h1>
                  <p className="text-gray-600 mt-1">Secure API access granted</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Authenticated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">Access Granted!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your API key has been successfully validated. Welcome to the protected area!</p>
                </div>
              </div>
            </div>
          </div>

          {/* API Key Information */}
          {apiKeyData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">API Key Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{apiKeyData.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {apiKeyData.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Usage Count</dt>
                  <dd className="mt-1 text-sm text-gray-900">{apiKeyData.usage_count || 0}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Usage Limit</dt>
                  <dd className="mt-1 text-sm text-gray-900">{apiKeyData.usage_limit}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(apiKeyData.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(apiKeyData.updated_at).toLocaleDateString()}
                  </dd>
                </div>
              </div>

              {/* Navigation buttons moved here */}
              <div className="mt-6 flex space-x-4">
                <Link
                  href="/dashboards"
                  className="bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Back to Dashboard
                </Link>
                <Link
                  href="/playground"
                  className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Test Another Key
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </NotificationContainer>
  );
} 