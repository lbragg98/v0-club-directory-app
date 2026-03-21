import { NextResponse } from 'next/server'
import type { Club } from '@/lib/types'

/**
 * Google Sheets Club Data API
 * 
 * CONFIGURATION:
 * - Change SHEET_TAB_NAME to match your actual sheet tab name
 * - The range A1:Z500 fetches all columns A-Z, rows 1-500
 * - Row 1 is expected to contain headers
 * - Row 2+ contains actual club data
 */

// The Google Sheet tab name. If the tab is ever renamed, update this value to match.
const SHEET_TAB_NAME = 'MASTER'

// Header name variants that map to our normalized keys
// Add more variants here if your sheet uses different column names
const HEADER_MAPPINGS: Record<string, string[]> = {
  // Normalized key: [possible header names in sheet]
  club_name: ['club_name', 'club name', 'name', 'club', 'clubname'],
  quick_link: ['quick_link', 'quick link', 'link', 'url', 'quicklink'],
  is_open: ['is_open', 'is open', 'open', 'status', 'isopen', 'open?'],
  club_type: ['club_type', 'club type', 'type', 'clubtype', 'category'],
  platform: ['platform', 'lbgc', 'line', 'disc', 'app'],
  sfw_friendly: ['sfw_friendly', 'sfw friendly', 'sfw', 'sfwfriendly', 'safe for work'],
  sfw_active: ['sfw_active', 'sfw active', 'active sfw', 'sfwactive', 'active_sfw'],
  break: ['break', 'on break', 'break status', 'onbreak'],
  break_time: ['break_time', 'break time', 'breaktime', 'break_end', 'break end'],
  avg_rating: ['avg_rating', 'avg rating', 'rating', 'overall', 'overall_rating', 'overall rating', 'avgrating', 'average rating', 'average_rating'],
  invite_score: ['invite_score', 'invite score', 'invites', 'invite', 'invitescore', 'invites_score'],
  door_score: ['door_score', 'door score', 'door', 'doors', 'doorscore', 'doors_score'],
  call_score: ['call_score', 'call score', 'calls', 'call', 'callscore', 'calls_score'],
  comments: ['comments', 'comment', 'notes', 'note', 'description', 'desc'],
}

function normalizeHeader(header: string): string {
  const cleaned = header.toLowerCase().trim()
  
  for (const [normalizedKey, variants] of Object.entries(HEADER_MAPPINGS)) {
    if (variants.includes(cleaned)) {
      return normalizedKey
    }
  }
  
  // Return the cleaned header if no mapping found
  return cleaned.replace(/\s+/g, '_')
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false
  const cleaned = value.toString().toLowerCase().trim()
  return ['yes', 'true', '1', 'open', 'y'].includes(cleaned)
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0
  const num = parseFloat(value.toString().replace(/[^0-9.-]/g, ''))
  return isNaN(num) ? 0 : Math.min(5, Math.max(0, num)) // Clamp to 0-5
}

function rowToClub(row: Record<string, string>, index: number): Club {
  /**
   * Transform a row object into a Club object
   * The row object has normalized keys from the header mapping
   * 
   * DEBUG: Add console.log here to inspect individual row transformations
   */
  
  // Determine status: check is_open first, then break status
  let status: 'Open' | 'Closed' = 'Closed'
  if (row.is_open) {
    status = parseBoolean(row.is_open) ? 'Open' : 'Closed'
  }
  
  // If on break, mark as closed
  if (parseBoolean(row.break)) {
    status = 'Closed'
  }
  
  // Determine type: Cat, Dog, or Hybrid
  let type: 'Cat' | 'Dog' | 'Hybrid' = 'Cat'
  const rawType = (row.club_type || '').toLowerCase().trim()
  if (rawType.includes('dog')) {
    type = 'Dog'
  } else if (rawType.includes('hybrid') || rawType.includes('both')) {
    type = 'Hybrid'
  } else if (rawType.includes('cat')) {
    type = 'Cat'
  }
  
  // Determine platform: Line, Disc, or Both
  let platform: 'Line' | 'Disc' | 'Both' = 'Line'
  const rawPlatform = (row.platform || '').toLowerCase().trim()
  if (rawPlatform.includes('disc') || rawPlatform.includes('discord')) {
    platform = 'Disc'
  } else if (rawPlatform.includes('both') || rawPlatform.includes('line') && rawPlatform.includes('disc')) {
    platform = 'Both'
  } else if (rawPlatform.includes('line')) {
    platform = 'Line'
  }
  
  return {
    id: `club-${index}`,
    name: (row.club_name || row.name || '').trim(),
    type,
    platform,
    status,
    sfwFriendly: parseBoolean(row.sfw_friendly),
    sfwActive: parseBoolean(row.sfw_active),
    inviteParties: parseBoolean(row.invite_score) || parseNumber(row.invite_score) > 0, // Has invite parties if score > 0
    overallRating: parseNumber(row.avg_rating),
    invitesScore: parseNumber(row.invite_score),
    doorScore: parseNumber(row.door_score),
    callsScore: parseNumber(row.call_score),
    notes: (row.comments || '').trim(),
    break: parseBoolean(row.break),
    breakTime: (row.break_time || '').trim(),
    quickLink: (row.quick_link || '').trim(),
    lastUpdated: new Date().toISOString(),
  }
}

export async function GET() {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const apiKey = process.env.GOOGLE_API_KEY

  if (!sheetId || !apiKey) {
    console.error('[v0] Missing GOOGLE_SHEET_ID or GOOGLE_API_KEY environment variables')
    return NextResponse.json(
      { error: 'Missing Google Sheets configuration' },
      { status: 500 }
    )
  }

  try {
    // Fetch from row 1 to include headers
    const range = `${SHEET_TAB_NAME}!A1:Z500`
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
    
    console.log('[v0] Fetching from Google Sheets, range:', range)
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    console.log('[v0] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] Google Sheets API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch data from Google Sheets', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    const rows: string[][] = data.values || []
    
    console.log('[v0] Raw rows received:', rows.length)
    
    if (rows.length === 0) {
      console.log('[v0] No data in sheet')
      return NextResponse.json({ clubs: [], debug: { message: 'No data in sheet' } })
    }

    // First row is headers
    const rawHeaders = rows[0]
    console.log('[v0] Raw headers:', rawHeaders)
    
    // Normalize headers to our standard keys
    const normalizedHeaders = rawHeaders.map(h => normalizeHeader(h || ''))
    console.log('[v0] Normalized headers:', normalizedHeaders)
    
    // Data rows start from index 1
    const dataRows = rows.slice(1)
    console.log('[v0] Data rows count:', dataRows.length)
    
    // Convert each row to an object with normalized keys
    const clubs: Club[] = dataRows
      .filter(row => {
        // Filter out empty rows - check if club_name or any cell in first 3 cols has content
        const hasContent = row.some((cell, idx) => idx < 5 && cell && cell.trim())
        return hasContent
      })
      .map((row, index) => {
        // Create object mapping normalized headers to values
        const rowObj: Record<string, string> = {}
        normalizedHeaders.forEach((header, colIndex) => {
          rowObj[header] = (row[colIndex] || '').toString().trim()
        })
        
        // Debug: log first row object to verify mapping
        if (index === 0) {
          console.log('[v0] First row object (for debugging):', rowObj)
        }
        
        return rowToClub(rowObj, index)
      })
      .filter(club => club.name) // Final filter: must have a name

    console.log('[v0] Final parsed clubs count:', clubs.length)
    
    // Log first club for debugging
    if (clubs.length > 0) {
      console.log('[v0] First club (sample):', JSON.stringify(clubs[0], null, 2))
    }

    return NextResponse.json({ 
      clubs,
      debug: {
        totalRows: rows.length,
        dataRows: dataRows.length,
        parsedClubs: clubs.length,
        headers: rawHeaders,
        normalizedHeaders
      }
    })
  } catch (error) {
    console.error('[v0] Error fetching clubs:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
