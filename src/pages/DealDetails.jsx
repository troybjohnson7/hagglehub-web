import React from 'react'
import { useParams } from 'react-router-dom'
import { Deals } from '../api'

export default function DealDetails(){
  const { id } = useParams()
  const [deal, setDeal] = React.useState(null)
  const [thread, setThread] = React.useState([])

  React.useEffect(()=>{
    Deals.get(id).then(setDeal).catch(()=>setDeal(null))
    Deals.messages(id).then(setThread).catch(()=>setThread([]))
  },[id])

  if(!deal) return <div className="card">Deal not found.</div>

  return (
    <div className="card">
      <h2>Deal #{deal.id}</h2>
      <div className="mt-2">Dealer ID: {deal.dealer_id} • Status: {deal.status}</div>
      <div className="list mt-3">
        {thread.map(m=>(
          <div key={m.id} className="card">
            <div className="badge">{m.direction.toUpperCase()}</div>
            <div className="badge" style={{marginLeft:8}}>{new Date(m.createdAt).toLocaleString()}</div>
            <div className="mt-2" style={{whiteSpace:'pre-wrap'}}>{m.body}</div>
          </div>
        ))}
        {thread.length===0 && <div>No messages yet.</div>}
      </div>
    </div>
  )
}
