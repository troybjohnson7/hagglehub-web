import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout wrapper (header with centered logo, login button, bell, footer, bottom nav)
import Layout from "./Layout.jsx";

// Pages (these files already exist in your project)
import About from "./about.jsx";
import Dashboard from "./Dashboard.jsx";
import AddVehicle from "./AddVehicle.jsx";
import DealDetails from "./DealDetails.jsx";
import Messages from "./Messages.jsx";
import Account from "./Account.jsx";
import PrivacyPolicy from "./privacypolicy.jsx";
import TermsOfService from "./termsofservice.jsx";

// Helper to pass the page name into Layout (your Layout uses currentPageName)
const withLayout = (Component, pageName) => (
  <Layout currentPageName={pageName}>
    <Component />
  </Layout>
);

export default function Pages() {
  return (
    <Routes>
      {/* Public landing route */}
      <Route path="/" element={withLayout(About, "About")} />

      {/* App routes */}
      <Route path="/dashboard" element={withLayout(Dashboard, "Dashboard")} />
      <Route path="/add-vehicle" element={withLayout(AddVehicle, "AddVehicle")} />
      <Route path="/deal" element={withLayout(DealDetails, "DealDetails")} />
      <Route path="/messages" element={withLayout(Messages, "Messages")} />
      <Route path="/account" element={withLayout(Account, "Account")} />

      {/* Legal */}
      <Route path="/privacy" element={withLayout(PrivacyPolicy, "PrivacyPolicy")} />
      <Route path="/terms" element={withLayout(TermsOfService, "TermsOfService")} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
