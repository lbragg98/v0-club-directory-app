import { NextResponse } from 'next/server'
import type { Club } from '@/lib/types'

/**
 * Google Sheets Club Data API
 * 
 * CONFIGURATION:
 * - Google Sheet tab name is "MASTER" - change here if tab is renamed
 * - The range A1:Z500 fetches all columns A-Z, rows 1-500
 * - This route auto-detects the header row by scanning first 15 rows
 * - Only server-side: fetches use GOOGLE_SHEET_ID and GOOGLE_API_KEY env vars
 */

// The Google Sheet tab name. If the tab is ever renamed, update this value to match.
const SHEET_TAB_NAME = 'MASTER'

// Expected header keywords to identify the actual table header row
const HEADER_KEYWORDS = [
  'club_name', 'club name', 'name', 'open', 'is_open', 'type', 'club type',
  'platform', 'lbgc', 'sfw', 'rating', 'calls', 'invites', 'door', 'comment',
  'break', 'link', 'url'
]

// Header name variants that map to our normalized keys
const HEADER_MAPPINGS: Record<string, string[]> = {
  club_name: ['club_name', 'club name', 'name', 'club', 'clubname'],
  quick_link: ['quick_link', 'quick link', 'link', 'url', 'quicklink'],
  is_open: ['is_open', 'is open', 'open', 'status', 'isopen', 'open?'],
  club_type: ['club_type', 'club type', 'type', 'clubtype', 'category'],
  platform: ['platform', 'lbgc', 'line', 'disc', 'app'],
  sfw_friendly: ['sfw_friendly', 'sfw friendly', 'sfw', 'sfwfriendly', 'safe for work'],
  sfw_active: ['sfw_active', 'sfw active', 'active sfw', 'sfwactive', 'active_sfw'],
  break: ['break', 'on break', 'break status', 'onbreak'],
  break_time: ['break_time', 'break time', 'breaktime', 'break_end', 'break end', 'break_time_(club_tz)', 'break time (club tz)'],
  avg_rating: ['avg_rating', 'avg rating', 'rating', 'overall', 'overall_rating', 'overall rating', 'avgrating', 'average rating', 'average_rating'],
  invite_score: ['invite_score', 'invite score', 'invites', 'invite', 'invitescore', 'invites_score'],
  door_score: ['door_score', 'door score', 'door', 'doors', 'doorscore', 'doors_score'],
  call_score: ['call_score', 'call score', 'calls', 'call', 'callscore', 'calls_score'],
  comments: ['comments', 'comment', 'notes', 'note', 'description', 'desc'],
  avg_lb_speed: ['avg_lb_speed', 'avg lb speed', 'lb speed', 'lbspeed', 'avg_speed', 'avg speed', 'speed'],
}

function normalizeHeader(header: string): string {
  const cleaned = header.toLowerCase().trim()
  
  for (const [normalizedKey, variants] of Object.entries(HEADER_MAPPINGS)) {
    if (variants.includes(cleaned)) {
      return normalizedKey
    }
    // Also try matching without parentheses and special chars
    const cleanedNoParens = cleaned.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim()
    if (variants.some(v => v === cleanedNoParens || v.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim() === cleanedNoParens)) {
      return normalizedKey
    }
  }
  
  return cleaned.replace(/\s+/g, '_')
}

function isValidHeaderRow(row: string[]): boolean {
  /**
   * Check if a row looks like a header row by counting how many expected keywords it contains
   * A valid header row should have at least 3 keywords
   */
  if (!row || row.length < 3) return false
  
  const cellsLower = row.map(cell => (cell || '').toLowerCase().trim())
  const keywordMatches = cellsLower.filter(cell => 
    HEADER_KEYWORDS.some(keyword => cell.includes(keyword) || keyword.includes(cell.replace(/\s+/g, '_')))
  ).length
  
  return keywordMatches >= 3
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false
  const cleaned = value.toString().toLowerCase().trim()
  return ['yes', 'true', '1', 'open', 'y'].includes(cleaned)
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0
  const num = parseFloat(value.toString().replace(/[^0-9.-]/g, ''))
  return isNaN(num) ? 0 : Math.min(5, Math.max(0, num))
}

function rowToClub(row: Record<string, string>, index: number): Club {
  let status: 'Open' | 'Closed' = 'Closed'
  if (row.is_open) {
    status = parseBoolean(row.is_open) ? 'Open' : 'Closed'
  }
  if (parseBoolean(row.break)) {
    status = 'Closed'
  }
  
  let type: 'Cat' | 'Dog' | 'Hybrid' = 'Cat'
  const rawType = (row.club_type || '').toLowerCase().trim()
  if (rawType.includes('dog')) {
    type = 'Dog'
  } else if (rawType.includes('hybrid') || rawType.includes('both')) {
    type = 'Hybrid'
  } else if (rawType.includes('cat')) {
    type = 'Cat'
  }
  
  let platform: 'Line' | 'Disc' | 'Both' = 'Line'
  const rawPlatform = (row.platform || '').toLowerCase().trim()
  if (rawPlatform.includes('disc') || rawPlatform.includes('discord')) {
    platform = 'Disc'
  } else if (rawPlatform.includes('both') || (rawPlatform.includes('line') && rawPlatform.includes('disc'))) {
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
    inviteParties: parseBoolean(row.invite_score) || parseNumber(row.invite_score) > 0,
    overallRating: parseNumber(row.avg_rating),
    invitesScore: parseNumber(row.invite_score),
    doorScore: parseNumber(row.door_score),
    callsScore: parseNumber(row.call_score),
    notes: (row.comments || '').trim(),
    break: parseBoolean(row.break),
    breakTime: row.break_time && row.break_time !== 'N/A' ? (row.break_time || '').trim() : '',
    quickLink: (row.quick_link || '').trim(),
    avgLbSpeed: (row.avg_lb_speed || '').trim(),
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
    const range = `${SHEET_TAB_NAME}!A1:Z500`
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
    
    console.log('[v0] Fetching from Google Sheets, range:', range)
    
    const response = await fetch(url, {
      next: { revalidate: 300 },
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
      return NextResponse.json({ 
        error: 'No data found in sheet',
        clubs: [],
        debug: { message: 'Sheet is empty' }
      })
    }

    // Scan first 15 rows to find the header row
    let headerRowIndex = -1
    let headerRow: string[] = []
    
    for (let i = 0; i < Math.min(15, rows.length); i++) {
      if (isValidHeaderRow(rows[i])) {
        headerRowIndex = i
        headerRow = rows[i]
        break
      }
    }
    
    if (headerRowIndex === -1) {
      console.error('[v0] Could not find valid header row in first 15 rows')
      return NextResponse.json({
        error: 'Could not detect table header row. Please ensure the MASTER sheet has a proper header row with column names like: Club Name, Open, Type, Platform, SFW, Rating, Calls, Invites, Door, Comments, etc.',
        clubs: [],
        debug: { 
          message: 'Invalid header row',
          firstRows: rows.slice(0, 5)
        }
      }, { status: 400 })
    }
    
    console.log('[v0] Detected header row at index:', headerRowIndex)
    console.log('[v0] Raw header values:', headerRow)
    
    // Normalize headers
    const normalizedHeaders = headerRow.map(h => normalizeHeader(h || ''))
    console.log('[v0] Normalized headers:', normalizedHeaders)
    
    // Parse data rows (everything after header row)
    const dataRows = rows.slice(headerRowIndex + 1)
    console.log('[v0] Data rows count:', dataRows.length)
    
    const clubs: Club[] = dataRows
      .filter(row => {
        const hasContent = row.some((cell, idx) => idx < 5 && cell && cell.trim())
        return hasContent
      })
      .map((row, index) => {
        const rowObj: Record<string, string> = {}
        normalizedHeaders.forEach((header, colIndex) => {
          rowObj[header] = (row[colIndex] || '').toString().trim()
        })
        
        if (index === 0) {
          console.log('[v0] First parsed row object:', rowObj)
        }
        
        return rowToClub(rowObj, index)
      })
      .filter(club => club.name)

    console.log('[v0] Final parsed clubs count:', clubs.length)
    
    if (clubs.length > 0) {
      console.log('[v0] First club (sample):', JSON.stringify(clubs[0], null, 2))
    }

    return NextResponse.json({ 
      clubs,
      debug: {
        headerRowIndex,
        headerValues: headerRow,
        normalizedHeaders,
        totalRows: rows.length,
        dataRows: dataRows.length,
        parsedClubs: clubs.length
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
