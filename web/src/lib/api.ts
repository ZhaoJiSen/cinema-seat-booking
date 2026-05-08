const API_BASE = '/api'

export interface SeatInfo {
  seat_id: string
  user_id: string
  booked: boolean
}

export interface HoldResponse {
  session_id: string
  movie_id: string
  seat_id: string
  expires_at: string
}

export interface SessionResponse {
  session_id: string
  movie_id: string
  seat_id: string
  user_id: string
  status: string
}

export async function listSeats(movieID: string): Promise<SeatInfo[]> {
  const res = await fetch(`${API_BASE}/movies/${movieID}/seats`)
  if (!res.ok) throw new Error('Failed to list seats')
  return res.json()
}

export async function holdSeat(
  movieID: string,
  seatID: string,
  userID: string
): Promise<HoldResponse> {
  const res = await fetch(`${API_BASE}/movies/${movieID}/seats/${seatID}/hold`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userID }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error ?? 'Failed to hold seat')
  }
  return res.json()
}

export async function confirmSession(
  sessionID: string,
  userID: string
): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE}/sessions/${sessionID}/confirm`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userID }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error ?? 'Failed to confirm booking')
  }
  return res.json()
}

export async function releaseSession(sessionID: string): Promise<void> {
  await fetch(`${API_BASE}/sessions/${sessionID}`, { method: 'DELETE' })
}
