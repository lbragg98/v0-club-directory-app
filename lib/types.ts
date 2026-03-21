export interface Club {
  id: string
  name: string
  type: 'Cat' | 'Dog' | 'Hybrid'
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
  break: boolean
  breakTime: string
  quickLink: string
  avgLbSpeed: string
  lastUpdated: string
}

export interface ClubFilters {
  search: string
  type: 'All' | 'Cat' | 'Dog' | 'Hybrid'
  platform: 'All' | 'Line' | 'Disc' | 'Both'
  openOnly: boolean
  sfwOnly: boolean
  invitePartiesOnly: boolean
}

export interface AdminSession {
  isAuthenticated: boolean
  expiresAt: number
}
