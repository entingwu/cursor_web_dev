/**
 * Frontend API Key Validation Utilities
 * 
 * OVERVIEW:
 * These functions handle API key validation from the frontend by calling
 * our Next.js API route at /api/validate-key
 * 
 * FLOW:
 * 1. Frontend calls validateApiKey('pk_live_...')
 * 2. Function makes HTTP POST to /api/validate-key
 * 3. Next.js routes request to src/app/api/validate-key/route.js
 * 4. Server validates key against Supabase database
 * 5. Server returns JSON response
 * 6. Frontend processes response and returns result
 * 
 * BENEFITS:
 * - Keeps database logic on server (secure)
 * - Reusable across different components
 * - Consistent error handling
 * - Clean separation of concerns
 */

/**
 * Validates an API key by calling the server-side validation endpoint
 * 
 * HOW IT CONNECTS:
 * This function makes an HTTP request to '/api/validate-key' which Next.js
 * automatically routes to src/app/api/validate-key/route.js
 * 
 * @param {string} apiKey - The API key to validate (e.g., "pk_live_abc123")
 * @returns {Promise<Object>} - Validation result with valid flag and data/error
 * 
 * RETURN FORMAT:
 * Success: { success: true, valid: true, data: {...}, error: null }
 * Failure: { success: false, valid: false, data: null, error: "message" }
 */
export const validateApiKey = async (apiKey) => {
  try {
    // STEP 1: Frontend input validation
    // Check if API key is provided and is a string before making network request
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key is required and must be a string');
    }

    // STEP 2: Make HTTP request to our Next.js API route
    // Next.js will automatically route '/api/validate-key' to route.js
    const response = await fetch('/api/validate-key', {
      method: 'POST',                           // Must match the export in route.js
      headers: {
        'Content-Type': 'application/json',     // Tell server we're sending JSON
      },
      body: JSON.stringify({ 
        apiKey: apiKey.trim()                   // Send API key in request body
      }),
    });

    // STEP 3: Parse the JSON response from the server
    // This contains the validation result from route.js
    const result = await response.json();

    // STEP 4: Check if the HTTP request was successful
    // response.ok is false for 4xx and 5xx status codes
    if (!response.ok) {
      throw new Error(result.error || `HTTP Error: ${response.status}`);
    }

    // STEP 5: Return standardized success response
    // Convert server response to our consistent format
    return {
      success: true,                            // Request succeeded
      valid: result.valid,                      // Whether API key is valid
      data: result.data || null,                // API key details (if valid)
      error: result.error || null               // Error message (if any)
    };
  } catch (error) {
    // STEP 6: Handle any errors (network, parsing, validation, etc.)
    // Return standardized error response
    return {
      success: false,                           // Request failed
      valid: false,                             // API key is invalid
      data: null,                               // No data available
      error: error.message || 'Unknown error occurred'
    };
  }
};

/**
 * Validates an API key and handles the response with notifications
 * 
 * CONVENIENCE FUNCTION:
 * This wrapper function combines API key validation with automatic
 * notification handling for a better user experience
 * 
 * @param {string} apiKey - The API key to validate
 * @param {Function} showNotification - Notification function from Notifications.js
 * @returns {Promise<Object>} - Validation result (same as validateApiKey)
 * 
 * USAGE EXAMPLE:
 * const result = await validateApiKeyWithNotification(
 *   'pk_live_abc123', 
 *   showNotification
 * );
 * // Notifications are automatically shown based on validation result
 */
export const validateApiKeyWithNotification = async (apiKey, showNotification) => {
  // STEP 1: Call the main validation function
  const result = await validateApiKey(apiKey);
  
  // STEP 2: Show appropriate notification based on result
  if (result.success && result.valid) {
    // API key is valid - show green success notification
    showNotification('Valid API key', 'success');
  } else {
    // API key is invalid or error occurred - show red error notification
    showNotification(result.error || 'Invalid API key', 'error');
  }
  
  // STEP 3: Return the result for further processing
  return result;
}; 