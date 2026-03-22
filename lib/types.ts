export interface Club {
  id: string
  name: string
  type: 'Cat' | 'Dog' | 'Hybrid' | 'Invite'
  platform: 'Line' | 'Disc' | 'Both'
  status: 'Open' | 'Closed'
  sfwFriendly: boolean
  sfwActive: boolean
  inviteParties: boolean
  overallRating: number
  invitesScore: number
  doorScore: number
  callsScore: number
  notes: string
  break: 'yes' | 'no' | null
  breakTime: string
  quickLink: string
  avgLbSpeed: string
  lastUpdated: string
}

export interface ClubFilters {
  search: string
  type: 'All' | 'Cat' | 'Dog' | 'Hybrid' | 'Invite'
  platform: 'All' | 'Line' | 'Disc' | 'Both'
  breakFilter: 'All' | 'Has Break' | 'No Break'
  openOnly: boolean
  sfwOnly: 'All Clubs' | 'Active SFW' | 'No Active SFW'
  invitePartiesOnly: boolean
}

export interface AdminSession {
  isAuthenticated: boolean
  expiresAt: number
}
