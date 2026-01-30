import React from 'react';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">Collections</div>
        <div className="sidebar-item active">
          <span className="sidebar-item-icon">📁</span>
          <span>All Images</span>
        </div>
        <div className="sidebar-item">
          <span className="sidebar-item-icon">⭐</span>
          <span>Favorites</span>
        </div>
        <div className="sidebar-item">
          <span className="sidebar-item-icon">🔍</span>
          <span>Recently Analysed</span>
        </div>
        <div className="sidebar-item">
          <span className="sidebar-item-icon">📤</span>
          <span>Shared</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">AI Features</div>
        <div className="sidebar-item">
          <span className="sidebar-item-icon">🤖</span>
          <span>Object Detection</span>
        </div>
        <div className="sidebar-item">
          <span className="sidebar-item-icon">😊</span>
          <span>Face Analysis</span>
        </div>
        <div className="sidebar-item">
          <span className="sidebar-item-icon">📝</span>
          <span>Text Extraction</span>
        </div>
        <div className="sidebar-item">
          <span className="sidebar-item-icon">🏷️</span>
          <span>Auto Tagging</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">Premium</div>
        <div className="sidebar-item">
          <span className="sidebar-item-icon">✨</span>
          <span>AI Generation</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;