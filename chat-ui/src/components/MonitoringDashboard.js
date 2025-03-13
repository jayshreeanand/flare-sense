import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AlertSeverityBadge = ({ severity }) => {
  const getColor = () => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getColor()}`}>
      {severity.toUpperCase()}
    </span>
  );
};

const AlertTypeIcon = ({ type }) => {
  const getIcon = () => {
    switch (type.toLowerCase()) {
      case 'whale_transaction':
        return '🐋';
      case 'unusual_activity':
        return '⚠️';
      case 'vulnerable_contract':
        return '🔓';
      case 'security_news':
        return '📰';
      case 'protocol_compromise':
        return '🚨';
      default:
        return '📌';
    }
  };

  return <span className="text-xl mr-2">{getIcon()}</span>;
};

const AlertCard = ({ alert }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-indigo-500">
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <AlertTypeIcon type={alert.type} />
          <div>
            <h3 className="font-semibold text-gray-800">{alert.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {expanded ? alert.description : `${alert.description.substring(0, 100)}${alert.description.length > 100 ? '...' : ''}`}
            </p>
            {alert.description.length > 100 && (
              <button 
                className="text-indigo-600 text-xs mt-1 hover:underline"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <AlertSeverityBadge severity={alert.severity} />
          <span className="text-xs text-gray-500 mt-1">
            {new Date(alert.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Source:</span> {alert.source}
            </div>
            <div>
              <span className="font-medium text-gray-700">Alert ID:</span> {alert.id.substring(0, 8)}...
            </div>
            {alert.affected_protocols.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Affected Protocols:</span>{' '}
                {alert.affected_protocols.join(', ')}
              </div>
            )}
            {alert.affected_addresses.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Affected Addresses:</span>{' '}
                {alert.affected_addresses.map(addr => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MonitoringDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    type: '',
    severity: '',
  });
  const [addressInput, setAddressInput] = useState('');
  const [protocolInput, setProtocolInput] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState({
    message: '',
    type: '' // 'success' or 'error'
  });

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        
        try {
          // Try to fetch from the real API
          const response = await axios.get('/api/routes/monitoring/alerts', {
            params: {
              limit: 50,
              ...(filter.type && { alert_type: filter.type }),
              ...(filter.severity && { severity: filter.severity }),
            }
          });
          setAlerts(response.data);
          setError(null);
        } catch (err) {
          console.log('Using mock data due to API error:', err);
          
          // If the API fails, use mock data for demonstration
          const mockAlerts = [
            {
              id: "mock-1",
              type: "whale_transaction",
              title: "Large FLR Transfer Detected",
              description: "A transaction of 15,000 FLR was detected from a known exchange wallet to an unknown wallet. This could indicate accumulation by a large holder.",
              source: "Blockchain Monitor",
              severity: "medium",
              timestamp: new Date().toISOString(),
              affected_protocols: [],
              affected_addresses: ["0x742d35Cc6634C0532925a3b844Bc454e4438f44e"]
            },
            {
              id: "mock-2",
              type: "security_news",
              title: "Potential Vulnerability in DeFi Protocol",
              description: "Security researchers have identified a potential reentrancy vulnerability in a popular DeFi lending protocol. No exploits have been reported yet, but users should exercise caution.",
              source: "DeFi Security News",
              severity: "high",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              affected_protocols: ["LendingProtocol"],
              affected_addresses: []
            },
            {
              id: "mock-3",
              type: "unusual_activity",
              title: "Unusual Transaction Pattern Detected",
              description: "Multiple rapid transactions have been detected from a single address, potentially indicating automated trading or an attempt to manipulate market conditions.",
              source: "Blockchain Monitor",
              severity: "low",
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              affected_protocols: [],
              affected_addresses: ["0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t"]
            }
          ];
          
          // Filter mock data based on user filters
          let filteredMockAlerts = [...mockAlerts];
          
          if (filter.type) {
            filteredMockAlerts = filteredMockAlerts.filter(alert => 
              alert.type === filter.type
            );
          }
          
          if (filter.severity) {
            filteredMockAlerts = filteredMockAlerts.filter(alert => 
              alert.severity === filter.severity
            );
          }
          
          setAlerts(filteredMockAlerts);
          setError("This is a demonstration with mock data. The monitoring API is still in development.");
        }
      } catch (err) {
        console.error('Error in alert handling:', err);
        setError('Failed to process alerts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    
    return () => clearInterval(interval);
  }, [filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressRegistration = async () => {
    if (!addressInput || !addressInput.trim()) {
      setRegistrationStatus({
        message: 'Please enter a valid blockchain address',
        type: 'error'
      });
      return;
    }

    try {
      // Try to register with the real API
      await axios.post('/api/routes/monitoring/register/address', {
        user_id: 'demo_user',
        address: addressInput.trim()
      });
      
      setRegistrationStatus({
        message: 'Address registered successfully!',
        type: 'success'
      });
      setAddressInput('');
      
      // Add a mock alert for demonstration
      const newMockAlert = {
        id: `mock-address-${Date.now()}`,
        type: "whale_transaction",
        title: "Address Registration Confirmed",
        description: `The address ${addressInput.trim().substring(0, 8)}... has been registered for monitoring. You will receive alerts for any suspicious activity related to this address.`,
        source: "Monitoring Dashboard",
        severity: "low",
        timestamp: new Date().toISOString(),
        affected_protocols: [],
        affected_addresses: [addressInput.trim()]
      };
      
      setAlerts(prev => [newMockAlert, ...prev]);
    } catch (err) {
      console.error('Error registering address:', err);
      setRegistrationStatus({
        message: 'Failed to register address. This is a demonstration - address would be registered in production.',
        type: 'error'
      });
    }
    
    // Clear status message after 3 seconds
    setTimeout(() => {
      setRegistrationStatus({ message: '', type: '' });
    }, 3000);
  };

  const handleProtocolRegistration = async () => {
    if (!protocolInput || !protocolInput.trim()) {
      setRegistrationStatus({
        message: 'Please enter a valid protocol name',
        type: 'error'
      });
      return;
    }

    try {
      // Try to register with the real API
      await axios.post('/api/routes/monitoring/register/protocol', {
        user_id: 'demo_user',
        protocol: protocolInput.trim()
      });
      
      setRegistrationStatus({
        message: 'Protocol registered successfully!',
        type: 'success'
      });
      setProtocolInput('');
      
      // Add a mock alert for demonstration
      const newMockAlert = {
        id: `mock-protocol-${Date.now()}`,
        type: "security_news",
        title: "Protocol Registration Confirmed",
        description: `The protocol ${protocolInput.trim()} has been registered for monitoring. You will receive alerts for any security news or vulnerabilities related to this protocol.`,
        source: "Monitoring Dashboard",
        severity: "low",
        timestamp: new Date().toISOString(),
        affected_protocols: [protocolInput.trim()],
        affected_addresses: []
      };
      
      setAlerts(prev => [newMockAlert, ...prev]);
    } catch (err) {
      console.error('Error registering protocol:', err);
      setRegistrationStatus({
        message: 'Failed to register protocol. This is a demonstration - protocol would be registered in production.',
        type: 'error'
      });
    }
    
    // Clear status message after 3 seconds
    setTimeout(() => {
      setRegistrationStatus({ message: '', type: '' });
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blockchain & News Monitoring</h1>
        <div className="flex space-x-4">
          <select
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Alert Types</option>
            <option value="whale_transaction">Whale Transactions</option>
            <option value="unusual_activity">Unusual Activity</option>
            <option value="vulnerable_contract">Vulnerable Contracts</option>
            <option value="security_news">Security News</option>
            <option value="protocol_compromise">Protocol Compromise</option>
          </select>
          <select
            name="severity"
            value={filter.severity}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error && !alerts.length ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No alerts found</p>
            <p className="text-gray-400 text-sm mt-2">
              Alerts will appear here when suspicious activity is detected
            </p>
          </div>
        ) : (
          <div>
            {error && (
              <div className="mb-4 bg-yellow-100 text-yellow-800 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700">Recent Alerts</h2>
              <span className="text-sm text-gray-500">
                Showing {alerts.length} alerts
              </span>
            </div>
            <div className="space-y-4">
              {alerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Register for Alerts</h2>
          {registrationStatus.message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              registrationStatus.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-700'
            }`}>
              {registrationStatus.message}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monitor Address
              </label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter blockchain address"
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                />
                <button 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r-md text-sm hover:bg-indigo-700"
                  onClick={handleAddressRegistration}
                >
                  Register
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monitor Protocol
              </label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter protocol name"
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                  value={protocolInput}
                  onChange={(e) => setProtocolInput(e.target.value)}
                />
                <button 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r-md text-sm hover:bg-indigo-700"
                  onClick={handleProtocolRegistration}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monitoring Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Blockchain Monitoring</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">News Monitoring</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleString()}
              </span>
            </div>
            <div className="pt-3 mt-3 border-t border-gray-100">
              <button 
                className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-200"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 500);
                }}
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard; 