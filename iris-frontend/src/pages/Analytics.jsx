import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { getStats } from '../services/api';

function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      const data = await getStats();
      setStats(data);
    };
    loadStats();
  }, []);

  return (
    <div className="app-container">
      <div className="iris-background"></div>
      <div className="organic-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <div className="container">
        <Header />
        
        <div className="main-content">
          <Sidebar />
          
          <main className="content-area">
            <div className="page-header">
              <h1 className="page-title">Analytics Dashboard</h1>
              <p className="page-subtitle">View your AI analysis statistics</p>
            </div>

            {stats && (
              <div className="stats-grid">
                <StatCard value={stats.totalImages} label="Total Images" />
                <StatCard value={stats.analyzed} label="AI Analysed" />
                <StatCard value={stats.objectsDetected} label="Objects Detected" />
                <StatCard value={stats.facesFound} label="Faces Found" />
              </div>
            )}

            <div className="section-header">
              <h2 className="section-title">Analysis Trends</h2>
            </div>

            <div className="analysis-panel">
              <div className="analysis-title">
                <span>📊</span>
                <span>Coming Soon: Detailed Analytics</span>
              </div>
              <p style={{ color: '#d8b4fe', textAlign: 'center', padding: '40px' }}>
                Analytics charts and trends will be displayed here!
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Analytics;