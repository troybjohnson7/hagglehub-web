import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'

export default function App(){
  const loc = useLocation()
  return (
    <>
      <Header/>
      <div className="container">
        <nav className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
          <div className="row" style={{gap:8}}>
            <Link to="/" className={`badge ${loc.pathname==='/'?'lime':''}`}>Dashboard</Link>
            <Link to="/messages" className={`badge ${loc.pathname.startsWith('/messages')?'lime':''}`}>Messages</Link>
          </div>
        </nav>
        <div className="mt-3">
          <Outlet/>
        </div>
      </div>
    </>
  )
}
