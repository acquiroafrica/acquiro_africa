'use client'

import { useState } from 'react'
import { approveListing } from '../actions'

export default function ApproveButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    try {
      setLoading(true)
      await approveListing(listingId)
    } catch (err) {
      console.error(err)
      alert('Failed to approve listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleApprove} 
      disabled={loading} 
      className="btn btn-teal btn-sm"
    >
      {loading ? 'Approving...' : 'Approve'}
    </button>
  )
}
