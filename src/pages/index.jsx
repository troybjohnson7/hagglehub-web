import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./Layout.jsx";

// Use Capitalized names in imports (stable on most projects)
import About from "./About.jsx";
import Dashboard from "./Dashboard.jsx";
import AddVehicle from "./AddVehicle.jsx";
import DealDetails from "./DealDetails.jsx";
import Messages from "./Messages.jsx";
import Account from "./Account.jsx";
import PrivacyPolicy from "./PrivacyPolicy.jsx";
import TermsOfService from "./TermsOfService.jsx";

const withLayout = (Component, pageName) => (
  <Layout currentPageName={pageName}>
    <Component />
  </Layout>
);

export default function Pages() {
  return (
    <Routes>
      <Route path="/" element={withLayout(About, "About")} />
      <Route path="/dashboard" element={withLayout(Dashboard, "Dashboard")} />
      <Route path="/add-vehicle" element={withLayout(AddVehicle, "AddVehicle")} />
      <Route path="/deal" element={withLayout(DealDetails, "DealDetails")} />
      <Route path="/messages" element={withLayout(Messages, "Messages")} />
      <Route path="/account" element={withLayout(Account, "Account")} />
      <Route path="/privacy" element={withLayout(PrivacyPolicy, "PrivacyPolicy")} />
      <Route path="/terms" element={withLayout(TermsOfService, "TermsOfService")} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
