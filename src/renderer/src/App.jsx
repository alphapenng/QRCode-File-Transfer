import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('sender');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>QRCode File Transfer</h1>
        <p className="version">v1.0.0</p>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'sender' ? 'active' : ''}`}
          onClick={() => setActiveTab('sender')}
        >
          发送
        </button>
        <button
          className={`tab-button ${activeTab === 'receiver' ? 'active' : ''}`}
          onClick={() => setActiveTab('receiver')}
        >
          接收
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'sender' ? (
          <div className="sender-panel">
            <h2>发送端</h2>
            <p>文件发送功能将在后续任务中实现</p>
          </div>
        ) : (
          <div className="receiver-panel">
            <h2>接收端</h2>
            <p>文件接收功能将在后续任务中实现</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>状态: 就绪</p>
      </footer>
    </div>
  );
}

export default App;

