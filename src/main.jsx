import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '@/index.css'

import About from '@/pages/About.jsx'
import Dashboard from '@/pages/Dashboard.jsx'
import Messages from '@/pages/Messages.jsx'
import DealDetails from '@/pages/DealDetails.jsx'
import EditDeal from '@/pages/EditDeal.jsx'
import EditDealer from '@/pages/EditDealer.jsx'
import Account from '@/pages/Account.jsx'
import AddVehicle from '@/pages/AddVehicle.jsx'
import Onboarding from '@/pages/onboarding.jsx'
import Layout from '@/pages/Layout.jsx'

const withLayout = (Component, currentPageName) => (
  <Layout currentPageName={currentPageName}>
    <Component />
  </Layout>
);

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/about" element={<About />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={withLayout(Dashboard, 'Dashboard')} />
        <Route path="/deals" element={withLayout(Dashboard, 'Deals')} />
        <Route path="/deals/:id" element={withLayout(DealDetails, 'Deal Details')} />
        <Route path="/messages" element={withLayout(Messages, 'Messages')} />
        <Route path="/account" element={withLayout(Account, 'Account')} />
        <Route path="/add-vehicle" element={withLayout(AddVehicle, 'Add Vehicle')} />
        <Route path="/edit-deal/:id" element={withLayout(EditDeal, 'Edit Deal')} />
        <Route path="/edit-dealer/:id" element={withLayout(EditDealer, 'Edit Dealer')} />
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppRouter />)
