import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { showNotification } from '@/app/components/Notifications';

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch API keys from Supabase
  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setApiKeys(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load API keys on hook mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  // Create new API key
  const createApiKey = async (keyData) => {
    if (submitting) return false;

    try {
      setSubmitting(true);
      setError(null);

      const { data, error } = await supabase
        .from('api_keys')
        .insert([keyData])
        .select();

      if (error) throw error;

      setApiKeys([data[0], ...apiKeys]);
      showNotification('API key created successfully!', 'success');
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error creating API key:', err);
      showNotification('Failed to create API key', 'error');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Update existing API key
  const updateApiKey = async (keyId, updateData) => {
    if (submitting) return false;

    try {
      setSubmitting(true);
      setError(null);

      const { data, error } = await supabase
        .from('api_keys')
        .update(updateData)
        .eq('id', keyId)
        .select();

      if (error) throw error;

      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? data[0] : key
      ));
      
      showNotification('API key updated successfully!', 'success');
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error updating API key:', err);
      showNotification('Failed to update API key', 'error');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete API key
  const deleteApiKey = async (keyId) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      showNotification('✗ API key deleted successfully ✗', 'error');
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting API key:', err);
      showNotification('Failed to delete API key', 'error');
      return false;
    }
  };

  return {
    apiKeys,
    loading,
    error,
    submitting,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    refetch: fetchApiKeys
  };
}; 