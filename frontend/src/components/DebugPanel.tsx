// src/components/DebugPanel.tsx
import React, { useState } from 'react';
import { testConnection, askIA, getEnvironmentInfo } from '../services/ia.service';

interface DebugResult {
  test: string;
  status: 'success' | 'error' | 'running';
  message: string;
  data?: any;
  timestamp: string;
}

const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: DebugResult['status'], message: string, data?: any) => {
    const result: DebugResult = {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runAllTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    clearResults();
    
    // Test 1: Environment Info
    addResult('Environment', 'running', 'Getting environment info...');
    try {
      const envInfo = getEnvironmentInfo();
      addResult('Environment', 'success', 'Environment info retrieved', envInfo);
    } catch (error: any) {
      addResult('Environment', 'error', `Environment error: ${error.message}`);
    }

    // Test 2: Connection Test
    addResult('Connection', 'running', 'Testing connection...');
    try {
      const connectionResult = await testConnection();
      if (connectionResult.connected) {
        addResult('Connection', 'success', 'Connection successful', connectionResult.details);
      } else {
        addResult('Connection', 'error', 'Connection failed', connectionResult.details);
      }
    } catch (error: any) {
      addResult('Connection', 'error', `Connection error: ${error.message}`);
    }

    // Test 3: Simple Chat Test
    addResult('Chat API', 'running', 'Testing chat endpoint...');
    try {
      const testMessage = [{ role: 'user' as const, content: 'Test message' }];
      const reply = await askIA(testMessage);
      addResult('Chat API', 'success', `Chat test successful (${reply.length} chars)`, { 
        request: testMessage, 
        response: reply.substring(0, 100) + (reply.length > 100 ? '...' : '')
      });
    } catch (error: any) {
      addResult('Chat API', 'error', `Chat API error: ${error.message}`);
    }

    setIsRunning(false);
  };

  const runSingleTest = async (testType: 'connection' | 'chat' | 'environment') => {
    if (isRunning) return;
    
    setIsRunning(true);

    switch (testType) {
      case 'environment':
        try {
          const envInfo = getEnvironmentInfo();
          addResult('Environment', 'success', 'Environment info retrieved', envInfo);
        } catch (error: any) {
          addResult('Environment', 'error', `Environment error: ${error.message}`);
        }
        break;

      case 'connection':
        addResult('Connection', 'running', 'Testing connection...');
        try {
          const result = await testConnection();
          addResult('Connection', result.connected ? 'success' : 'error', 
                   result.connected ? 'Connection successful' : 'Connection failed', 
                   result.details);
        } catch (error: any) {
          addResult('Connection', 'error', `Connection error: ${error.message}`);
        }
        break;

      case 'chat':
        addResult('Chat Test', 'running', 'Testing simple chat...');
        try {
          const reply = await askIA([{ role: 'user', content: 'Hello, this is a test' }]);
          addResult('Chat Test', 'success', 'Chat test successful', { 
            responseLength: reply.length,
            preview: reply.substring(0, 200) + (reply.length > 200 ? '...' : '')
          });
        } catch (error: any) {
          addResult('Chat Test', 'error', `Chat error: ${error.message}`);
        }
        break;
    }

    setIsRunning(false);
  };

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg transition-colors z-50"
        title="Abrir panel de debug"
      >
        🔧 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white rounded-lg shadow-2xl max-w-md w-full max-h-96 flex flex-col z-50">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-bold text-sm flex items-center gap-2">
          🔧 Debug Panel
          {isRunning && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>}
        </h3>
        <button 
          onClick={() => setIsVisible(false)} 
          className="text-red-400 hover:text-red-300 text-lg leading-none"
          title="Cerrar"
        >
          ✕
        </button>
      </div>
      
      {/* Controls */}
      <div className="p-3 border-b border-gray-700">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button 
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 px-2 py-1 rounded text-xs font-medium transition-colors"
          >
            {isRunning ? '🔄 Testing...' : '🚀 Run All'}
          </button>
          
          <button 
            onClick={clearResults}
            className="bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-xs font-medium transition-colors"
          >
            🗑️ Clear
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1">
          <button 
            onClick={() => runSingleTest('environment')}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 px-2 py-1 rounded text-xs transition-colors"
          >
            📊 Env
          </button>
          
          <button 
            onClick={() => runSingleTest('connection')}
            disabled={isRunning}
            className="bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 px-2 py-1 rounded text-xs transition-colors"
          >
            🌐 Conn
          </button>
          
          <button 
            onClick={() => runSingleTest('chat')}
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 px-2 py-1 rounded text-xs transition-colors"
          >
            💬 Chat
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-3">
        {results.length === 0 ? (
          <div className="text-center text-gray-400 text-xs py-4">
            No tests run yet. Click "Run All" to start.
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="bg-gray-800 rounded p-2 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{result.test}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      result.status === 'success' ? 'bg-green-400' :
                      result.status === 'error' ? 'bg-red-400' :
                      'bg-yellow-400 animate-pulse'
                    }`}></span>
                  </div>
                  <span className="text-gray-400 text-xs">{result.timestamp}</span>
                </div>
                
                <div className={`${
                  result.status === 'success' ? 'text-green-300' :
                  result.status === 'error' ? 'text-red-300' :
                  'text-yellow-300'
                }`}>
                  {result.message}
                </div>
                
                {result.data && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-blue-300 hover:text-blue-200">
                      Show details
                    </summary>
                    <pre className="bg-gray-900 p-2 rounded mt-1 text-xs overflow-auto max-h-32">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-2 border-t border-gray-700 bg-gray-800 rounded-b-lg">
        <div className="text-xs text-gray-400 space-y-1">
          <div>Base URL: <span className="text-cyan-300">{import.meta.env.VITE_API_BASE || 'http://localhost:8000'}</span></div>
          <div>Mode: <span className="text-green-300">{import.meta.env.MODE}</span></div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;