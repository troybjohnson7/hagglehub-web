import React from 'react'
import { Users, Inbox, Deals, Dealers } from '../api'
import AttachToDealSelect from '../components/AttachToDealSelect.jsx'

export default function Messages(){
  const [user, setUser] = React.useState(null)
  const [unmatched, setUnmatched] = React.useState([])
  const [deals, setDeals] = React.useState([])
  const [dealId, setDealId] = React.useState('')
  const [thread, setThread] = React.useState([])
  const [form, setForm] = React.useState({to:'',subject:'',body:''})
  const [sending, setSending] = React.useState(false)

  React.useEffect(()=>{
    (async ()=>{
      const me = await Users.me()
      setUser(me)
      setDeals(await Deals.list())
      if(me?.key){
        setUnmatched(await Inbox.listUnmatched(me.key))
      }
    })().catch(console.error)
  },[])

  React.useEffect(()=>{
    if(!dealId){ setThread([]); return }
    Deals.messages(dealId).then(setThread).catch(()=>setThread([]))
  },[dealId])

  async function attach(msgId, dId){
    await Inbox.attach(msgId, dId)
    setUnmatched(prev => prev.filter(m => m.id !== msgId))
    if(String(dId)===String(dealId)){
      setThread(await Deals.messages(dealId))
    }
    alert('Attached to deal.')
  }

  async function createFromMessage(msgId){
    const { deal } = await Inbox.createDeal(msgId)
    setUnmatched(prev => prev.filter(m => m.id !== msgId))
    setDeals(prev => [...prev, deal])
    setDealId(String(deal.id))
    alert(`Created Deal #${deal.id} and attached the message.`)
  }

  async function send(e){
    e.preventDefault()
    if(!dealId) return alert('Enter a Deal ID first.')
    setSending(true)
    try{
      await Deals.send(dealId, form)
      setForm({to:'',subject:'',body:''})
      setThread(await Deals.messages(dealId))
    } catch(err){
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="row">
      {/* Unmatched Inbox */}
      <div className="card" style={{flex:'1 1 480px', minWidth:360}}>
        <h3>Unmatched</h3>
        {user && <div className="badge mt-2">Receiving: deals-{user.key}@hagglehub.app</div>}
        <div className="list mt-3">
          {unmatched.length===0 && <div>No unmatched messages.</div>}
          {unmatched.map(m => (
            <div key={m.id} className="card">
              <div style={{fontWeight:600}}>{m.subject || '(no subject)'}</div>
              <div className="mt-2" style={{fontSize:14,color:'#475569'}}>
                <strong>{m.sender}</strong> → <span>{m.recipient}</span>
                <span className="badge" style={{marginLeft:8}}>{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <div className="mt-2" style={{whiteSpace:'pre-wrap'}}>{m.preview || m.body}</div>
              <div className="row mt-3">
                <AttachToDealSelect deals={deals} onAttach={(d)=>attach(m.id,d)} />
                <button className="btn" onClick={()=>createFromMessage(m.id)}>Create New Deal</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deal Thread */}
      <div className="card" style={{flex:'1 1 480px', minWidth:360}}>
        <h3>Deal Thread</h3>
        <div className="mt-2">
          <label>Deal ID</label>
          <input className="input mt-2" value={dealId} onChange={e=>setDealId(e.target.value)} placeholder="e.g., 1"/>
        </div>

        <form onSubmit={send} className="mt-3">
          <div className="row" style={{gap:10}}>
            <div style={{flex:1}}>
              <label>To</label>
              <input className="input" value={form.to} onChange={e=>setForm({...form,to:e.target.value})} placeholder="internet.sales@dealer.com" required/>
            </div>
            <div style={{flex:1}}>
              <label>Subject</label>
              <input className="input" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="Request for OTD"/>
            </div>
          </div>
          <div className="mt-2">
            <label>Message</label>
            <textarea rows="5" className="input" value={form.body} onChange={e=>setForm({...form,body:e.target.value})} required/>
          </div>
          <button className="btn mt-3" disabled={sending}>{sending?'Sending…':'Send'}</button>
        </form>

        <div className="list mt-4">
          {thread.map(m=>(
            <div key={m.id} className="card">
              <div className="badge">{m.direction.toUpperCase()}</div>
              <div className="badge" style={{marginLeft:8}}>{new Date(m.createdAt).toLocaleString()}</div>
              <div className="mt-2" style={{whiteSpace:'pre-wrap'}}>{m.body}</div>
            </div>
          ))}
          {dealId && thread.length===0 && <div>No messages for this deal yet.</div>}
        </div>
      </div>
    </div>
  )
}
