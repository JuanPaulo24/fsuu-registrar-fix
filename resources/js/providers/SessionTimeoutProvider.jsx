import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiUrl, token } from '../components/providers/appConfig';

const SessionTimeoutContext = createContext();

export const useSessionTimeout = () => {
    const context = useContext(SessionTimeoutContext);
    if (!context) {
        throw new Error('useSessionTimeout must be used within a SessionTimeoutProvider');
    }
    return context;
};

export default function SessionTimeoutProvider({ children }) {
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(5 * 60); // 1 minute in seconds for testing
    const [isWarning, setIsWarning] = useState(false);
    const navigate = useNavigate();
    
    const activityTimerRef = useRef(null);
    const warningTimerRef = useRef(null);
    const countdownTimerRef = useRef(null);
    const lastActivityRef = useRef(Date.now());
    
    const TIMEOUT_DURATION = 5 * 60 * 1000; // 1 minute in milliseconds for testing
    const WARNING_DURATION = 30 * 1000; // Show warning 30 seconds before timeout

    // Clear all timers
    const clearAllTimers = useCallback(() => {
        if (activityTimerRef.current) {
            clearTimeout(activityTimerRef.current);
            activityTimerRef.current = null;
        }
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
            warningTimerRef.current = null;
        }
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
        }
    }, []);

    // Check if user is still authenticated
    const checkAuth = useCallback(async () => {
        try {
            const authToken = token();
            if (!authToken) {
                handleLogout();
                return false;
            }

            const response = await axios.get(apiUrl('api/check_auth_status'), {
                headers: {
                    'Authorization': authToken,
                    'Accept': 'application/json'
                }
            });

            if (!response.data.success) {
                handleLogout();
                return false;
            }
            
            return true;
        } catch (error) {
            handleLogout();
            return false;
        }
    }, []);

    // Handle logout
    const handleLogout = useCallback(async () => {
        clearAllTimers();
        
        try {
            const authToken = token();
            if (authToken) {
                // Call logout API to invalidate token on server
                await axios.post(apiUrl('api/logout'), {}, {
                    headers: {
                        'Authorization': authToken,
                        'Accept': 'application/json'
                    }
                });
            }
        } catch (error) {
            // Continue with logout even if API call fails
        }
        
        // Set session expiry flag
        localStorage.setItem('sessionExpired', 'true');
        
        // Only remove the token for security, keep user data and permissions
        localStorage.removeItem('token');
        
        // Redirect to login
        navigate('/', { replace: true });
    }, [navigate, clearAllTimers]);

    // Show timeout warning
    const showTimeoutWarning = useCallback(() => {
        setIsWarning(true);
        setShowTimeoutModal(true);
        setTimeRemaining(30); // 30 seconds countdown
        
        // Start countdown
        countdownTimerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    // Time's up, logout
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [handleLogout]);

    // Reset activity timer
    const resetActivityTimer = useCallback(() => {
        const now = Date.now();
        lastActivityRef.current = now;
        
        // Clear existing timers
        clearAllTimers();
        
        // Hide modal if showing
        if (showTimeoutModal) {
            setShowTimeoutModal(false);
            setIsWarning(false);
        }

        // Set warning timer
        warningTimerRef.current = setTimeout(() => {
            checkAuth().then(isAuthenticated => {
                if (isAuthenticated) {
                    showTimeoutWarning();
                }
            });
        }, TIMEOUT_DURATION - WARNING_DURATION);

        // Set logout timer
        activityTimerRef.current = setTimeout(() => {
            handleLogout();
        }, TIMEOUT_DURATION);
    }, [showTimeoutModal, checkAuth, showTimeoutWarning, handleLogout, clearAllTimers]);

    // Extend session manually
    const extendSession = useCallback(() => {
        resetActivityTimer();
    }, [resetActivityTimer]);

    // Activity event handler
    const handleActivity = useCallback(() => {
        // Only reset if significant time has passed to avoid excessive resets
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;
        if (timeSinceLastActivity > 5000) { // 5 seconds minimum for testing
            resetActivityTimer();
        }
    }, [resetActivityTimer]);

    // Logout from modal
    const confirmLogout = useCallback(() => {
        handleLogout();
    }, [handleLogout]);

    // Initialize session timeout on mount
    useEffect(() => {
        const authToken = token();
        if (authToken) {
            resetActivityTimer();
            
            // Activity listeners
            const activityEvents = [
                'mousedown',
                'mousemove', 
                'keypress',
                'scroll',
                'touchstart',
                'click'
            ];

            // Add activity listeners with throttling
            activityEvents.forEach(event => {
                document.addEventListener(event, handleActivity, { passive: true });
            });

            return () => {
                clearAllTimers();
                activityEvents.forEach(event => {
                    document.removeEventListener(event, handleActivity);
                });
            };
        }
    }, [resetActivityTimer, handleActivity, clearAllTimers]);

    // Format time for display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const contextValue = {
        showTimeoutModal,
        timeRemaining: formatTime(timeRemaining),
        isWarning,
        extendSession,
        confirmLogout,
        handleLogout
    };

    return (
        <SessionTimeoutContext.Provider value={contextValue}>
            {children}
        </SessionTimeoutContext.Provider>
    );
}