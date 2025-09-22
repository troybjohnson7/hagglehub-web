import React from 'react';
import { User } from '@/api/entities';

const API = import.meta.env.VITE_API_URL || 'https://api.hagglehub.app';

export default function NotificationCenter(){
  const [count, setCount] = React.useState(0);

  async function refresh(){
    try{
      const me = await User.me();
      if(!me?.key){ setCount(0); return; }
      const r = await fetch(`${API}/inbox/unmatched?userKey=${encodeURIComponent(me.key)}`, { credentials: 'include' });
      if(!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setCount(Array.isArray(data) ? data.length : 0);
    }catch(e){
      setCount(0);
    }
  }

  React.useEffect(()=>{
    refresh();
    const t = setInterval(refresh, 60000);
    return ()=>clearInterval(t);
  },[]);

  return (
    <div className="relative">
      <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-slate-100">
        🔔
      </span>
      {count>0 && (
        <span style={{position:'absolute',top:-4,right:-2,background:'#5EE83F',color:'#0f766e',borderRadius:12,padding:'0 6px',fontSize:12,fontWeight:700}}>
          {count}
        </span>
      )}
    </div>
  );
}
