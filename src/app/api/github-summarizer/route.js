import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Next.js API Route for GitHub Summarizer with API Key Validation
 * 
 * FILE-BASED ROUTING:
 * This file's location (src/app/api/github-summarizer/route.js) automatically creates
 * an API endpoint at: http://localhost:3000/api/github-summarizer
 * 
 * HOW IT WORKS:
 * 1. Frontend calls: fetch('/api/github-summarizer', { method: 'POST' })
 * 2. Next.js sees the URL and routes it to this file
 * 3. The POST function below handles the request
 * 4. We validate the API key against Supabase database
 * 5. If valid, process the GitHub summarization request
 * 6. Return JSON response back to the frontend
 * 
 * SECURITY BENEFITS:
 * - Database credentials stay on server (not exposed to frontend)
 * - API key validation ensures only authorized users can access the service
 * - Server-side processing prevents client-side tampering
 */

export async function POST(request) {
  try {
    // STEP 1: Extract API key and request data from request body
    // The frontend sends JSON: { apiKey: "pk_live_...", githubUrl: "...", options: {...} }
    const { apiKey, githubUrl, options } = await request.json();

    // STEP 2: Input validation - check if API key is provided and valid
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          error: 'API key is required and must be a string' 
        },
        { status: 400 } // Bad Request
      );
    }

    // STEP 3: Validate GitHub URL is provided
    if (!githubUrl || typeof githubUrl !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          error: 'GitHub URL is required and must be a string' 
        },
        { status: 400 } // Bad Request
      );
    }

    // STEP 4: Sanitize input - remove whitespace
    const trimmedApiKey = apiKey.trim();
    const trimmedGithubUrl = githubUrl.trim();
    
    if (!trimmedApiKey) {
      return NextResponse.json(
        { 
          success: false,
          error: 'API key cannot be empty' 
        },
        { status: 400 } // Bad Request
      );
    }

    if (!trimmedGithubUrl) {
      return NextResponse.json(
        { 
          success: false,
          error: 'GitHub URL cannot be empty' 
        },
        { status: 400 } // Bad Request
      );
    }

    // STEP 5: Database validation - query Supabase to check if API key exists and is active
    // This follows the exact same pattern as the validate-key endpoint
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')                    // Query the api_keys table
      .select('*')                         // Select all columns
      .eq('key_value', trimmedApiKey)      // Where key_value matches input
      .eq('status', 'active')              // AND status is 'active'
      .single();                           // Expect only one result

    // STEP 6: Handle database errors
    if (apiKeyError) {
      if (apiKeyError.code === 'PGRST116') {
        // PGRST116 = No rows returned - means API key doesn't exist or isn't active
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid API key' 
          },
          { status: 401 } // Unauthorized
        );
      }
      
      // Other database errors (connection issues, etc.)
      console.error('Database error:', apiKeyError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error occurred' 
        },
        { status: 500 } // Internal Server Error
      );
    }

    // STEP 7: API key is valid - check usage limits
    if (apiKeyData.usage_limit && apiKeyData.usage_count >= apiKeyData.usage_limit) {
      return NextResponse.json(
        { 
          success: false,
          error: 'API key usage limit exceeded' 
        },
        { status: 429 } // Too Many Requests
      );
    }

    // STEP 8: Validate GitHub URL format (basic validation)
    const githubUrlPattern = /^https:\/\/github\.com\/[\w\-._]+\/[\w\-._]+/;
    if (!githubUrlPattern.test(trimmedGithubUrl)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid GitHub URL format. Must be a valid GitHub repository URL.' 
        },
        { status: 400 } // Bad Request
      );
    }

    // STEP 9: Process GitHub summarization request
    // TODO: Implement actual GitHub summarization logic here
    // For now, return a placeholder response
    const summary = {
      repository: trimmedGithubUrl,
      summary: "This is a placeholder summary. Actual GitHub summarization logic would be implemented here.",
      timestamp: new Date().toISOString(),
      processed_by: apiKeyData.name
    };

    // STEP 10: Update usage count for the API key
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ 
        usage_count: apiKeyData.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', apiKeyData.id);

    if (updateError) {
      console.error('Failed to update usage count:', updateError);
      // Continue execution even if usage count update fails
    }

    // STEP 11: Success! Return the summarization result
    return NextResponse.json(
      { 
        success: true,
        data: summary,
        usage: {
          current: apiKeyData.usage_count + 1,
          limit: apiKeyData.usage_limit
        }
      },
      { status: 200 } // Success
    );

  } catch (error) {
    // STEP 12: Handle any unexpected errors
    console.error('GitHub summarizer error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 } // Internal Server Error
    );
  }
}

/**
 * Handle unsupported HTTP methods
 * 
 * Next.js will call this function if someone tries to make a GET request
 * to /api/github-summarizer instead of POST
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit GitHub URLs for summarization.' },
    { status: 405 } // Method Not Allowed
  );
} 