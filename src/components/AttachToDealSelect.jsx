import React from 'react'

export default function AttachToDealSelect({ deals, onAttach }){
  const [selected, setSelected] = React.useState('')
  return (
    <div style={{display:'flex',gap:8,alignItems:'center'}}>
      <select className="select" value={selected} onChange={e=>setSelected(e.target.value)} style={{maxWidth:220}}>
        <option value="">Attach to deal…</option>
        {deals.map(d => <option key={d.id} value={d.id}>Deal #{d.id}</option>)}
      </select>
      <button className="btn lime" disabled={!selected} onClick={()=>selected && onAttach(selected)}>Attach</button>
    </div>
  )
}
