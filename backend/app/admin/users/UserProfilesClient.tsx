'use client'

import { useState } from 'react'

interface UserProfile {
  id: string
  email: string | undefined
  role: string
  created_at: string
  name: string
  phone: string
}

interface Props {
  users: UserProfile[]
}

export default function UserProfilesClient({ users }: Props) {
  const [search, setSearch] = useState('')
  const [repairing, setRepairing] = useState<string | null>(null)
  const [repairResult, setRepairResult] = useState<Record<string, string>>({})
  const [localRoles, setLocalRoles] = useState<Record<string, string>>({})
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const filteredUsers = users.filter(u =>
    !deletedIds.has(u.id) && (
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
    )
  )

  async function handleRepair(userId: string, role: string) {
    setRepairing(userId)
    try {
      const res = await fetch('/api/repair-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      const json = await res.json()
      if (res.ok) {
        setRepairResult(prev => ({ ...prev, [userId]: '✓ Repaired' }))
        setLocalRoles(prev => ({ ...prev, [userId]: json.role ?? role }))
      } else {
        setRepairResult(prev => ({ ...prev, [userId]: `✗ ${json.error}` }))
      }
    } catch {
      setRepairResult(prev => ({ ...prev, [userId]: '✗ Network error' }))
    } finally {
      setRepairing(null)
    }
  }

  async function handleDelete(userId: string, email: string | undefined) {
    if (!confirm(`Are you sure you want to permanently delete ${email ?? 'this user'}? This cannot be undone.`)) return
    setDeleting(userId)
    try {
      const res = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const json = await res.json()
      if (res.ok) {
        setDeletedIds(prev => {
          const next = new Set(prev)
          next.add(userId)
          return next
        })
      } else {
        alert(`Failed to delete user: ${json.error}`)
      }
    } catch {
      alert('Network error while deleting user.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24, maxWidth: 400 }}>
        <input
          type="search"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-group"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line)', outline: 'none' }}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Date Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No users found.</td>
              </tr>
            ) : (
              filteredUsers.map(u => {
                const displayRole = localRoles[u.id] ?? u.role
                const isBroken = displayRole === 'N/A'
                const isDeleting = deleting === u.id
                return (
                  <tr key={u.id} style={{ opacity: isDeleting ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                    <td><strong>{u.email}</strong></td>
                    <td>{u.name}</td>
                    <td>{u.phone}</td>
                    <td>
                      <span
                        className={`tag ${displayRole === 'admin' ? 'badge-approved' : displayRole === 'seller' ? 'badge-pending' : ''}`}
                        style={{ textTransform: 'capitalize', opacity: isBroken ? 0.5 : 1 }}
                      >
                        {displayRole}
                      </span>
                    </td>
                    <td>{u.created_at}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {/* Repair controls — only shown for N/A role */}
                        {isBroken && (
                          <>
                            <select
                              id={`role-select-${u.id}`}
                              defaultValue="buyer"
                              style={{ fontSize: 12, padding: '3px 6px', borderRadius: 6, border: '1px solid var(--line)' }}
                            >
                              <option value="buyer">Buyer</option>
                              <option value="seller">Seller</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => {
                                const sel = document.getElementById(`role-select-${u.id}`) as HTMLSelectElement
                                handleRepair(u.id, sel.value)
                              }}
                              disabled={repairing === u.id}
                              style={{
                                fontSize: 12,
                                padding: '4px 10px',
                                borderRadius: 6,
                                border: 'none',
                                background: 'var(--teal, #0d9488)',
                                color: '#fff',
                                cursor: 'pointer',
                                opacity: repairing === u.id ? 0.6 : 1,
                              }}
                            >
                              {repairing === u.id ? 'Fixing…' : 'Repair'}
                            </button>
                            {repairResult[u.id] && (
                              <span style={{ fontSize: 12, color: repairResult[u.id].startsWith('✓') ? 'green' : 'red' }}>
                                {repairResult[u.id]}
                              </span>
                            )}
                          </>
                        )}

                        {/* Delete button — always shown */}
                        <button
                          onClick={() => handleDelete(u.id, u.email)}
                          disabled={isDeleting}
                          style={{
                            fontSize: 12,
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: '1px solid #ef4444',
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            opacity: isDeleting ? 0.5 : 1,
                          }}
                        >
                          {isDeleting ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
