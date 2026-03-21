import { NextResponse } from 'next/server'
import type { Club } from '@/lib/types'

const COLUMN_MAP = {
  name: 0,
  type: 1,
  platform: 2,
  status: 3,
  sfwFriendly: 4,
  inviteParties: 5,
  overallRating: 6,
  invitesScore: 7,
  doorScore: 8,
  callsScore: 9,
  notes: 10,
  lastUpdated: 11,
}

function parseBoolean(value: string): boolean {
  return value?.toLowerCase() === 'yes' || value?.toLowerCase() === 'true'
}

function parseNumber(value: string): number {
  const num = parseFloat(value)
  return isNaN(num) ? 0 : num
}

function rowToClub(row: string[], index: number): Club {
  return {
    id: `club-${index}`,
    name: row[COLUMN_MAP.name] || '',
    type: (row[COLUMN_MAP.type] as Club['type']) || 'Cat',
    platform: (row[COLUMN_MAP.platform] as Club['platform']) || 'Line',
    status: (row[COLUMN_MAP.status] as Club['status']) || 'Closed',
    sfwFriendly: parseBoolean(row[COLUMN_MAP.sfwFriendly]),
    inviteParties: parseBoolean(row[COLUMN_MAP.inviteParties]),
    overallRating: parseNumber(row[COLUMN_MAP.overallRating]),
    invitesScore: parseNumber(row[COLUMN_MAP.invitesScore]),
    doorScore: parseNumber(row[COLUMN_MAP.doorScore]),
    callsScore: parseNumber(row[COLUMN_MAP.callsScore]),
    notes: row[COLUMN_MAP.notes] || '',
    lastUpdated: row[COLUMN_MAP.lastUpdated] || new Date().toISOString(),
  }
}

export async function GET() {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const apiKey = process.env.GOOGLE_API_KEY

  if (!sheetId || !apiKey) {
    return NextResponse.json(
      { error: 'Missing Google Sheets configuration' },
      { status: 500 }
    )
  }

  try {
    const range = 'Sheet1!A2:L'
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Sheets API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch data from Google Sheets' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const rows: string[][] = data.values || []
    
    const clubs: Club[] = rows
      .filter((row) => row[COLUMN_MAP.name])
      .map((row, index) => rowToClub(row, index))

    return NextResponse.json({ clubs })
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
