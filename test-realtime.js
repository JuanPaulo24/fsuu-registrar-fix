// Simple test script to verify WebSocket and queue job control
console.log('Testing real-time email system...');

// Test setting real-time status
async function testRealtimeStatus() {
    try {
        const response = await fetch('/api/set-realtime-status', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ active: true, userId: 1 })
        });
        
        const result = await response.json();
        console.log('Real-time status test result:', result);
        
        if (result.success) {
            console.log('✅ Real-time status successfully set - queue jobs should be disabled');
        } else {
            console.log('❌ Failed to set real-time status');
        }
    } catch (error) {
        console.error('Error testing real-time status:', error);
    }
}

// Test WebSocket connection
function testWebSocket() {
    if (window.Echo) {
        console.log('✅ Echo (WebSocket) is available');
        
        // Test connection
        const channel = window.Echo.private('user.emails.1');
        if (channel) {
            console.log('✅ WebSocket channel created successfully');
        } else {
            console.log('❌ Failed to create WebSocket channel');
        }
    } else {
        console.log('❌ Echo (WebSocket) is not available - will use fallback polling');
    }
}

// Run tests
testWebSocket();
testRealtimeStatus();