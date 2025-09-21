import React from 'react'
import { Users, Deals } from '../api'

export default function Dashboard(){
  const [user,setUser] = React.useState(null)
  const [deals,setDeals] = React.useState([])

  React.useEffect(()=>{
    Users.me().then(setUser).catch(()=>setUser(null))
    Deals.list().then(setDeals).catch(()=>setDeals([]))
  },[])

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <div className="mt-2">Welcome {user?.name || 'there'}.</div>
      <div className="mt-3"><strong>Deals</strong></div>
      {deals.length===0 ? <div className="mt-2">No deals yet.</div> :
        <ul className="mt-2">
          {deals.map(d => <li key={d.id}>Deal #{d.id} (dealer_id: {d.dealer_id}) — status: {d.status}</li>)}
        </ul>
      }
    </div>
  )
}
