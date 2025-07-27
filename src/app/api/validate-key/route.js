import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Next.js API Route for API Key Validation
 * 
 * FILE-BASED ROUTING:
 * This file's location (src/app/api/validate-key/route.js) automatically creates
 * an API endpoint at: http://localhost:3000/api/validate-key
 * 
 * HOW IT WORKS:
 * 1. Frontend calls: fetch('/api/validate-key', { method: 'POST' })
 * 2. Next.js sees the URL and routes it to this file
 * 3. The POST function below handles the request
 * 4. We query Supabase database to validate the API key
 * 5. Return JSON response back to the frontend
 * 
 * SECURITY BENEFITS:
 * - Database credentials stay on server (not exposed to frontend)
 * - API key values are not returned to frontend
 * - Server-side validation prevents client-side tampering
 */

export async function POST(request) {
  try {
    // STEP 1: Extract API key from request body
    // The frontend sends JSON: { apiKey: "pk_live_..." }
    const { apiKey } = await request.json();

    // STEP 2: Input validation - check if API key is provided and valid
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'API key is required and must be a string' 
        },
        { status: 400 } // Bad Request
      );
    }

    // STEP 3: Sanitize input - remove whitespace
    const trimmedApiKey = apiKey.trim();
    if (!trimmedApiKey) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'API key cannot be empty' 
        },
        { status: 400 } // Bad Request
      );
    }

    // STEP 4: Database validation - query Supabase to check if API key exists and is active
    // This is the core validation logic that runs on the server
    const { data, error } = await supabase
      .from('api_keys')                    // Query the api_keys table
      .select('*')                         // Select all columns
      .eq('key_value', trimmedApiKey)      // Where key_value matches input
      .eq('status', 'active')              // AND status is 'active'
      .single();                           // Expect only one result

    // STEP 5: Handle database errors
    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 = No rows returned - means API key doesn't exist or isn't active
        return NextResponse.json(
          { 
            valid: false, 
            error: 'Invalid API key' 
          },
          { status: 404 } // Not Found
        );
      }
      
      // Other database errors (connection issues, etc.)
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Database error occurred' 
        },
        { status: 500 } // Internal Server Error
      );
    }

    // STEP 6: Success! API key is valid - return data to frontend
    // SECURITY NOTE: We don't return the actual key_value for security reasons
    return NextResponse.json(
      { 
        valid: true, 
        data: {
          id: data.id,
          name: data.name,
          status: data.status,
          usage_count: data.usage_count,
          usage_limit: data.usage_limit,
          created_at: data.created_at,
          updated_at: data.updated_at
          // Note: key_value is intentionally excluded for security
        }
      },
      { status: 200 } // Success
    );

  } catch (error) {
    // STEP 7: Handle any unexpected errors
    console.error('API validation error:', error);
    return NextResponse.json(
      { 
        valid: false, 
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
 * to /api/validate-key instead of POST
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 } // Method Not Allowed
  );
} 