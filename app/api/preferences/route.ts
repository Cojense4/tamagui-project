import { NextRequest, NextResponse } from 'next/server'
import { PreferenceManager } from '@/lib/preferences/manager'
import { UserPreferences } from '@/types'

/**
 * GET /api/preferences
 * Get user preferences
 */
export async function GET() {
  try {
    // In a real app, this would fetch from a database based on user ID
    // For demo, we'll return default preferences
    const preferences = PreferenceManager.getPreferences()
    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error in GET /api/preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/preferences
 * Update user preferences
 */
export async function POST(request: NextRequest) {
  try {
    const preferences: UserPreferences = await request.json()
    
    // In a real app, this would save to a database
    // For demo, we'll use the preference manager
    PreferenceManager.savePreferences(preferences)
    
    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    console.error('Error in POST /api/preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}