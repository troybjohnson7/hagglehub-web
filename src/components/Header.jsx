import React from 'react'

const API = import.meta.env.VITE_API_URL || 'https://api.hagglehub.app'

export default function Header(){
  const [ping, setPing] = React.useState('…')
  React.useEffect(()=>{
    fetch(`${API}/health`).then(r=>r.json()).then(()=>setPing('API ✓')).catch(()=>setPing('API ✗'))
  },[])
  return (
    <header style={{background:'#fff',borderBottom:'1px solid #e2e8f0'}}>
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,background:'var(--lime)',borderRadius:8}}/>
          <strong style={{color:'var(--teal)',fontSize:18}}>HaggleHub</strong>
        </div>
        <span className="badge">{ping}</span>
      </div>
    </header>
  )
}
