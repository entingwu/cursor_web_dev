import { showNotification } from '@/app/components/Notifications';

// Generate a new API key
export const generateApiKey = (name) => {
  const prefix = name.toLowerCase().includes('prod') ? 'pk_live_' : 'pk_dev_';
  const randomKey = Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18);
  return prefix + randomKey;
};

// Mask API key for display
export const maskApiKey = (key) => {
  if (key.length <= 8) return key;
  const prefix = key.substring(0, 8);
  const masked = '*'.repeat(Math.min(24, key.length - 8));
  return prefix + masked;
};

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copied API Key to clipboard', 'success');
  } catch (err) {
    // Fallback for older browsers or if clipboard API fails
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showNotification('Copied API Key to clipboard', 'success');
  }
};

// Calculate usage percentage
export const calculateUsagePercentage = (totalUsage, usageLimit) => {
  return (totalUsage / usageLimit) * 100;
};

// Calculate total usage from API keys array
export const calculateTotalUsage = (apiKeys) => {
  return apiKeys.reduce((sum, key) => sum + (key.usage_count || 0), 0);
}; 