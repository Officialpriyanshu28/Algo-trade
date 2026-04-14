/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Brokers from "./pages/Brokers";
import Community from "./pages/Community";
import Dashboard from "./pages/Dashboard";
import LiveMarkets from "./pages/LiveMarkets";
import MarketOverview from "./pages/MarketOverview";
import StrategyBuilder from "./pages/StrategyBuilder";
import Backtesting from "./pages/Backtesting";
import PaperTrading from "./pages/PaperTrading";
import LiveTrading from "./pages/LiveTrading";
import Analytics from "./pages/Analytics";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { NotificationProvider } from "./components/NotificationProvider";
import { AuthProvider } from "./components/AuthProvider";

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <NotificationProvider>
          <AuthProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/brokers" element={<ProtectedRoute><Brokers /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                <Route path="/markets" element={<ProtectedRoute><LiveMarkets /></ProtectedRoute>} />
                <Route path="/market-overview" element={<ProtectedRoute><MarketOverview /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/strategy" element={<ProtectedRoute><StrategyBuilder /></ProtectedRoute>} />
                <Route path="/backtesting" element={<ProtectedRoute><Backtesting /></ProtectedRoute>} />
                <Route path="/paper-trading" element={<ProtectedRoute><PaperTrading /></ProtectedRoute>} />
                <Route path="/live-trading" element={<ProtectedRoute><LiveTrading /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              </Routes>
            </Layout>
          </AuthProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </Router>
  );
}
