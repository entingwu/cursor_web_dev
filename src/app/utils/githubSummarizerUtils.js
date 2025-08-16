/**
 * Frontend GitHub Summarizer Utilities
 * 
 * OVERVIEW:
 * These functions handle GitHub repository summarization from the frontend by calling
 * our Next.js API route at /api/github-summarizer
 * 
 * FLOW:
 * 1. Frontend calls summarizeGithubRepo('pk_live_...', 'https://github.com/user/repo')
 * 2. Function makes HTTP POST to /api/github-summarizer
 * 3. Next.js routes request to src/app/api/github-summarizer/route.js
 * 4. Server validates API key against Supabase database
 * 5. Server processes GitHub repository and returns summary
 * 6. Frontend processes response and returns result
 * 
 * BENEFITS:
 * - Keeps database logic on server (secure)
 * - Reusable across different components
 * - Consistent error handling
 * - Clean separation of concerns
 * - API key validation and usage tracking
 */

/**
 * Summarizes a GitHub repository by calling the server-side endpoint
 * 
 * HOW IT CONNECTS:
 * This function makes an HTTP request to '/api/github-summarizer' which Next.js
 * automatically routes to src/app/api/github-summarizer/route.js
 * 
 * @param {string} apiKey - The API key to authenticate (e.g., "pk_live_abc123")
 * @param {string} githubUrl - The GitHub repository URL to summarize
 * @param {Object} options - Optional configuration for summarization
 * @returns {Promise<Object>} - Summarization result with success flag and data/error
 * 
 * RETURN FORMAT:
 * Success: { success: true, data: {...}, usage: {...}, error: null }
 * Failure: { success: false, data: null, usage: null, error: "message" }
 */
export const summarizeGithubRepo = async (apiKey, githubUrl, options = {}) => {
  try {
    // STEP 1: Frontend input validation
    // Check if required parameters are provided and valid before making network request
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key is required and must be a string');
    }

    if (!githubUrl || typeof githubUrl !== 'string') {
      throw new Error('GitHub URL is required and must be a string');
    }

    // STEP 2: Basic GitHub URL validation
    const githubUrlPattern = /^https:\/\/github\.com\/[\w\-._]+\/[\w\-._]+/;
    if (!githubUrlPattern.test(githubUrl.trim())) {
      throw new Error('Invalid GitHub URL format. Must be a valid GitHub repository URL.');
    }

    // STEP 3: Make HTTP request to our Next.js API route
    // Next.js will automatically route '/api/github-summarizer' to route.js
    const response = await fetch('/api/github-summarizer', {
      method: 'POST',                           // Must match the export in route.js
      headers: {
        'Content-Type': 'application/json',     // Tell server we're sending JSON
      },
      body: JSON.stringify({ 
        apiKey: apiKey.trim(),                  // Send API key in request body
        githubUrl: githubUrl.trim(),            // Send GitHub URL in request body
        options: options                        // Send any additional options
      }),
    });

    // STEP 4: Parse the JSON response from the server
    // This contains the summarization result from route.js
    const result = await response.json();

    // STEP 5: Check if the HTTP request was successful
    // response.ok is false for 4xx and 5xx status codes
    if (!response.ok) {
      throw new Error(result.error || `HTTP Error: ${response.status}`);
    }

    // STEP 6: Return standardized success response
    // Convert server response to our consistent format
    return {
      success: true,                            // Request succeeded
      data: result.data || null,                // Summarization data
      usage: result.usage || null,              // API key usage information
      error: result.error || null               // Error message (if any)
    };
  } catch (error) {
    // STEP 7: Handle any errors (network, parsing, validation, etc.)
    // Return standardized error response
    return {
      success: false,                           // Request failed
      data: null,                               // No data available
      usage: null,                              // No usage information
      error: error.message || 'Unknown error occurred'
    };
  }
};

/**
 * Summarizes a GitHub repository and handles the response with notifications
 * 
 * CONVENIENCE FUNCTION:
 * This wrapper function combines GitHub repository summarization with automatic
 * notification handling for a better user experience
 * 
 * @param {string} apiKey - The API key to authenticate
 * @param {string} githubUrl - The GitHub repository URL to summarize
 * @param {Function} showNotification - Notification function from Notifications.js
 * @param {Object} options - Optional configuration for summarization
 * @returns {Promise<Object>} - Summarization result (same as summarizeGithubRepo)
 * 
 * USAGE EXAMPLE:
 * const result = await summarizeGithubRepoWithNotification(
 *   'pk_live_abc123', 
 *   'https://github.com/user/repo',
 *   showNotification,
 *   { includeReadme: true }
 * );
 * // Notifications are automatically shown based on summarization result
 */
export const summarizeGithubRepoWithNotification = async (apiKey, githubUrl, showNotification, options = {}) => {
  // STEP 1: Show loading notification
  const loadingNotification = showNotification('Processing GitHub repository...', 'info');
  
  // STEP 2: Call the main summarization function
  const result = await summarizeGithubRepo(apiKey, githubUrl, options);
  
  // STEP 3: Clear loading notification (if your notification system supports it)
  // Note: This depends on your notification implementation
  if (loadingNotification && typeof loadingNotification.clear === 'function') {
    loadingNotification.clear();
  }
  
  // STEP 4: Show appropriate notification based on result
  if (result.success && result.data) {
    // Summarization successful - show green success notification
    showNotification('GitHub repository summarized successfully!', 'success');
  } else {
    // Summarization failed or error occurred - show red error notification
    showNotification(result.error || 'Failed to summarize GitHub repository', 'error');
  }
  
  // STEP 5: Return the result for further processing
  return result;
};

/**
 * Validates if a string is a valid GitHub repository URL
 * 
 * UTILITY FUNCTION:
 * This function can be used to validate GitHub URLs before making API calls
 * 
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid GitHub repository URL, false otherwise
 * 
 * USAGE EXAMPLE:
 * if (isValidGithubUrl(userInput)) {
 *   // Proceed with summarization
 * } else {
 *   // Show error message
 * }
 */
export const isValidGithubUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  const githubUrlPattern = /^https:\/\/github\.com\/[\w\-._]+\/[\w\-._]+/;
  return githubUrlPattern.test(url.trim());
};

/**
 * Extracts repository information from a GitHub URL
 * 
 * UTILITY FUNCTION:
 * This function parses a GitHub URL to extract owner and repository name
 * 
 * @param {string} githubUrl - The GitHub repository URL
 * @returns {Object|null} - Object with owner and repo properties, or null if invalid
 * 
 * USAGE EXAMPLE:
 * const repoInfo = parseGithubUrl('https://github.com/facebook/react');
 * // Returns: { owner: 'facebook', repo: 'react' }
 */
export const parseGithubUrl = (githubUrl) => {
  if (!isValidGithubUrl(githubUrl)) {
    return null;
  }
  
  try {
    const url = new URL(githubUrl.trim());
    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
    
    if (pathParts.length >= 2) {
      return {
        owner: pathParts[0],
        repo: pathParts[1]
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}; 