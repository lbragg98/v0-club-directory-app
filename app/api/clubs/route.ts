import { NextResponse } from 'next/server'
import type { Club } from '@/lib/types'

/**
 * Google Sheets Club Data API
 * The Google Sheet tab name is "MASTER" — change SHEET_TAB_NAME if the tab is renamed.
 */

// The Google Sheet tab name. If the tab is ever renamed, update this value to match.
const SHEET_TAB_NAME = 'MASTER'

const HEADER_KEYWORDS = [
  'club name', 'name', 'open', 'type', 'platform', 'lbgc',
  'sfw', 'rating', 'calls', 'invite', 'door', 'comment', 'break', 'link'
]

const HEADER_MAPPINGS: Record<string, string[]> = {
  club_name: ['club_name', 'club name', 'name', 'club', 'clubname'],
  quick_link: ['quick_link', 'quick link', 'link', 'url', 'quicklink'],
  is_open: ['is_open', 'is open', 'open', 'status', 'open?'],
  club_type: ['club_type', 'club type', 'type', 'clubtype', 'category'],
  platform: ['platform', 'lbgc', 'line', 'disc', 'app'],
  sfw_friendly: ['sfw_friendly', 'sfw friendly', 'sfw', 'sfwfriendly', 'safe for work'],
  sfw_active: ['sfw_active', 'sfw active', 'active sfw', 'sfwactive'],
  break: ['break', 'on break', 'break status', 'onbreak', 'has break'],
  break_time: ['break_time', 'break time', 'breaktime', 'break time (club tz)', 'break_time_(club_tz)', 'break time club tz'],
  avg_rating: ['avg_rating', 'avg rating', 'avg. rating', 'rating', 'overall rating', 'average rating', 'avgrating'],
  invite_score: ['invite_score', 'invite score', 'invites', 'invite', 'invitescore'],
  door_score: ['door_score', 'door score', 'door', 'doorscore'],
  call_score: ['call_score', 'call score', 'calls', 'call', 'callscore'],
  invite_parties: ['invite_parties', 'invite parties', 'invs?', 'invs', 'inv party', 'inv?'],
  comments: ['comments', 'comment', 'notes', 'note', 'description'],
  avg_lb_speed: ['avg_lb_speed', 'avg lb speed', 'lb speed', 'lbspeed', 'avg speed', 'speed'],
}

function normalizeHeader(raw: string): string {
  const lower = raw.toLowerCase().trim()
  // Strip all non-alphanumeric characters to a single space for fuzzy matching
  const stripped = lower.replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()

  for (const [key, variants] of Object.entries(HEADER_MAPPINGS)) {
    for (const v of variants) {
      const vStripped = v.replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
      if (lower === v || stripped === v || lower === vStripped || stripped === vStripped) {
        return key
      }
    }
  }

  // Fallback: underscored version of the stripped string
  return stripped.replace(/\s+/g, '_')
}

function isValidHeaderRow(row: string[]): boolean {
  if (!row || row.length < 3) return false
  const cells = row.map(c => (c || '').toLowerCase().trim())
  const matches = cells.filter(c =>
    HEADER_KEYWORDS.some(kw => c.includes(kw))
  ).length
  return matches >= 3
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false
  const v = value.toString().toLowerCase().trim()
  return ['yes', 'true', '1', 'open', 'y'].includes(v)
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0
  const num = parseFloat(value.toString().replace(/[^0-9.-]/g, ''))
  return isNaN(num) ? 0 : Math.min(5, Math.max(0, num))
}

function parseBreakState(value: string | undefined): 'yes' | 'no' | null {
  if (!value) return null
  const v = value.toString().toLowerCase().trim()
  if (v === '' || v === 'n/a') return null
  // Check if starts with yes/no to handle values like "Yes (EST)" or "No (PST)"
  if (v.startsWith('yes') || v.startsWith('y ') || ['true', '1', 'y'].includes(v)) return 'yes'
  if (v.startsWith('no') || v.startsWith('n ') || ['false', '0', 'n'].includes(v)) return 'no'
  return null
}

function rowToClub(row: Record<string, string>, index: number): Club {
  const breakState = parseBreakState(row.break)

  // Open/Closed status is independent of break status
  let status: 'Open' | 'Closed' = 'Closed'
  if (row.is_open) {
    status = parseBoolean(row.is_open) ? 'Open' : 'Closed'
  }

  let type: 'Cat' | 'Dog' | 'Hybrid' = 'Cat'
  const rawType = (row.club_type || '').toLowerCase()
  if (rawType.includes('dog')) type = 'Dog'
  else if (rawType.includes('hybrid') || rawType.includes('both')) type = 'Hybrid'
  else if (rawType.includes('cat')) type = 'Cat'

  let platform: 'Line' | 'Disc' | 'Both' = 'Line'
  const rawPlatform = (row.platform || '').toLowerCase()
  if (rawPlatform.includes('disc') || rawPlatform.includes('discord')) platform = 'Disc'
  else if (rawPlatform.includes('both') || (rawPlatform.includes('line') && rawPlatform.includes('disc'))) platform = 'Both'
  else if (rawPlatform.includes('line')) platform = 'Line'

  const invitesScore = parseNumber(row.invite_score)
  const doorScore = parseNumber(row.door_score)
  const callsScore = parseNumber(row.call_score)

  // Use sheet avg_rating if present; otherwise compute mean of individual scores
  let overallRating = parseNumber(row.avg_rating)
  if (overallRating === 0 && (invitesScore > 0 || doorScore > 0 || callsScore > 0)) {
    const scores = [invitesScore, doorScore, callsScore].filter(s => s > 0)
    overallRating = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
  }

  const rawBreakTime = (row.break_time || '').trim()
  const breakTime = rawBreakTime && rawBreakTime.toLowerCase() !== 'n/a' ? rawBreakTime : ''

  return {
    id: `club-${index}`,
    name: (row.club_name || row.name || '').trim(),
    type,
    platform,
    status,
    sfwFriendly: parseBoolean(row.sfw_friendly),
    sfwActive: parseBoolean(row.sfw_active),
    inviteParties: parseBoolean(row.invite_parties),
    overallRating,
    invitesScore,
    doorScore,
    callsScore,
    notes: (row.comments || '').trim(),
    break: breakState,
    breakTime,
    quickLink: (row.quick_link || '').trim(),
    avgLbSpeed: (row.avg_lb_speed || '').trim(),
    lastUpdated: new Date().toISOString(),
  }
}

export async function GET() {
  const sheetId = 1jcqzekwOPvVKrG4Zaq589DK0kUbntIFrR1mNiiBLSEI
  const apiKey = AIzaSyB6zf5i9yXH8aYnE7U_7g - F4zpT_08pfWk

  if (!sheetId || !apiKey) {
    return NextResponse.json({ error: 'Missing Google Sheets configuration' }, { status: 500 })
  }

  try {
    const range = `${SHEET_TAB_NAME}!A1:Z500`
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`

    const response = await fetch(url, { cache: 'no-store' })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: 'Failed to fetch from Google Sheets', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    const rows: string[][] = data.values || []

    if (rows.length === 0) {
      return NextResponse.json({ clubs: [], error: 'Sheet appears to be empty' })
    }

    // Auto-detect the header row by scanning the first 15 rows
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
      return NextResponse.json({
        clubs: [],
        error: 'Could not find a valid header row in the MASTER sheet.',
      }, { status: 400 })
    }

    const normalizedHeaders = headerRow.map(h => normalizeHeader(h || ''))
    const dataRows = rows.slice(headerRowIndex + 1)

    const clubs: Club[] = dataRows
      .filter(row => row.some((cell, i) => i < 5 && cell && cell.trim()))
      .map((row, index) => {
        const rowObj: Record<string, string> = {}
        normalizedHeaders.forEach((header, colIndex) => {
          if (header) rowObj[header] = (row[colIndex] || '').toString().trim()
        })
        return rowToClub(rowObj, index)
      })
      .filter(club => club.name)

    return NextResponse.json({ clubs })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
