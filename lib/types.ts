export interface Club {
  id: string
  name: string
  type: 'Cat' | 'Dog' | 'Hybrid' | 'Invite'
  platform: 'Line' | 'Disc' | 'Both'
  status: 'Open' | 'Closed'
  sfwFriendly: 'yes' | 'no' | 'cbc'
  sfwActive: boolean
  inviteParties: boolean
  overallRating: number
  invitesScore: number
  doorScore: number
  callsScore: number
  notes: string
  break: 'yes' | 'no' | 'na'
  breakTime: string
  quickLink: string
  avgLbSpeed: string
  clubAge: string
  lastUpdated: string
}

export interface ClubFilters {
  search: string
  type: 'All' | 'Cat' | 'Dog' | 'Hybrid' | 'Invite'
  platform: 'All' | 'Line' | 'Disc' | 'Both'
  breakFilter: 'All' | 'Has Break' | 'No Break'
  openOnly: boolean
  sfwOnly: 'All Clubs' | 'Active SFW' | 'No Active SFW'
  sfwFriendlyFilter: 'All Clubs' | 'SFW Friendly' | 'Not Friendly' | 'Case by Case'
  ratingFilter: 'All Clubs' | '1+' | '2+' | '3+' | '4+' | '5'
  invitePartiesOnly: boolean
}

export interface AdminSession {
  isAuthenticated: boolean
  expiresAt: number
}
