'use client';

import { useState, useEffect } from 'react';

// Simple notification component
export const NotificationContainer = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Function to add a new notification
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    const newNotification = { id, message, type };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after 2.5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500);
  };

  // Make the function available globally
  useEffect(() => {
    window.showNotification = addNotification;
    
    // Cleanup when component unmounts
    return () => {
      delete window.showNotification;
    };
  }, []);

  return (
    <>
      {children}
      
      {/* Render notifications */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification 
            key={notification.id} 
            message={notification.message} 
            type={notification.type} 
          />
        ))}
      </div>
    </>
  );
};

// Individual notification component
const Notification = ({ message, type }) => {
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-600' : 'bg-red-600';
  
  return (
    <div 
      className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-2`}
      style={{ animation: 'slideInFromTop 0.3s ease-out forwards' }}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {isSuccess ? (
          // Checkmark icon for success
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          // X icon for error
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      
      {/* Message */}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};

// Simple function to show notifications from anywhere
export const showNotification = (message, type = 'success') => {
  if (window.showNotification) {
    window.showNotification(message, type);
  }
};
