import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// Fixed: emailCache initialization error - moved emailCache state before folderOptions usage
import { Row, Col, Button, Card, Typography, message, Input, Space, Badge, Select } from "antd";
import { faPlus, faSearch, faWifi, faWifiSlash, faBars, faRefresh, faInbox, faPaperPlane, faFileEdit, faArchive, faTrashCan, faTrash } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { userData } from "../../../../../providers/appConfig";
import { showGlobalLoading, hideGlobalLoading, ensureGlobalLoadingExists } from "../../../../../providers/globalLoading";

import EmailSidebar from "./components/EmailSidebar";
import EmailContainer from "./components/EmailContainer";
import ComposeEmailModal from "./components/ComposeEmailModal";
import EmailViewer from "./components/EmailViewer";
import { hasButtonPermission } from "@/hooks/useButtonPermissions";

export default function TabSystemEmail({ initialComposeData, isTabActive = false }) {
    const [activeFolder, setActiveFolder] = useState("inbox");
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [composeModalOpen, setComposeModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [replyData, setReplyData] = useState(null);
    const [draftData, setDraftData] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingActions, setPendingActions] = useState([]);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [loadingFolders, setLoadingFolders] = useState(new Set());

    // Auto-open compose modal when initialComposeData is provided
    useEffect(() => {
        if (initialComposeData) {
            setComposeModalOpen(true);
        }
    }, [initialComposeData]);

    // Email cache system - stores all folder data
    const [emailCache, setEmailCache] = useState({
        inbox: { data: [], loading: false, loaded: false, lastFetch: null, backgroundLoading: false },
        sent: { data: [], loading: false, loaded: false, lastFetch: null, backgroundLoading: false },
        draft: { data: [], loading: false, loaded: false, lastFetch: null, backgroundLoading: false },
        archive: { data: [], loading: false, loaded: false, lastFetch: null, backgroundLoading: false },
        spam: { data: [], loading: false, loaded: false, lastFetch: null, backgroundLoading: false }
    });

    // Folder options for dropdown - memoized to depend on emailCache
    const folderOptions = useMemo(() => [
        { 
            value: 'inbox', 
            label: (
                <Space>
                    <FontAwesomeIcon icon={faInbox} />
                    <span>Inbox</span>
                    {emailCache?.inbox?.loaded && emailCache.inbox.data.some(email => !email.isRead) && (
                        <Badge 
                            count={emailCache.inbox.data.filter(email => !email.isRead).length} 
                            style={{ backgroundColor: '#ff4d4f' }} 
                            size="small"
                        />
                    )}
                </Space>
            ) 
        },
        { 
            value: 'sent', 
            label: (
                <Space>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <span>Sent</span>
                    {/* Sent emails don't need unread badges */}
                </Space>
            ) 
        },
        { 
            value: 'draft', 
            label: (
                <Space>
                    <FontAwesomeIcon icon={faFileEdit} />
                    <span>Draft</span>
                    {/* Draft emails don't need unread badges */}
                </Space>
            ) 
        },
        { 
            value: 'archive', 
            label: (
                <Space>
                    <FontAwesomeIcon icon={faArchive} />
                    <span>Archive</span>
                    {/* Archive emails don't need unread badges */}
                </Space>
            ) 
        },
        { 
            value: 'spam', 
            label: (
                <Space>
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Spam</span>
                    {emailCache?.spam?.loaded && emailCache.spam.data.some(email => !email.isRead) && (
                        <Badge 
                            count={emailCache.spam.data.filter(email => !email.isRead).length} 
                            style={{ backgroundColor: '#ff4d4f' }} 
                            size="small"
                        />
                    )}
                </Space>
            ) 
        }
    ], [emailCache]);

    // Handle responsive sidebar visibility
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarVisible(false);
            } else {
                setSidebarVisible(true);
            }
        };

        // Set initial state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Effect to monitor loading completion and hide global loading
    useEffect(() => {
        // Check if all folders have finished loading during initial load
        if (isInitialLoad && loadingFolders.size === 0) {
            // All folders have completed loading, hide global loading
            hideGlobalLoading();
            setIsInitialLoad(false);
        }
    }, [loadingFolders, isInitialLoad]);
    
    // Removed isRefreshing state - now using global loading for all operations
    const currentUserId = userData()?.id;
    const emailCheckIntervalRef = useRef(null);
    const initialCheckTimeoutRef = useRef(null);
    const wsConnectionRef = useRef(null);

    // Gmail API endpoint mapping
    const getApiEndpoint = (folder) => {
        const endpoints = {
            inbox: 'api/gmail/inbox',
            sent: 'api/gmail/sent',
            draft: 'api/gmail/drafts',
            archive: 'api/gmail/archive',
            spam: 'api/gmail/spam'
        };
        return endpoints[folder] || 'api/gmail/inbox';
    };

    // Offline Support Functions
    const saveToLocalStorage = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify({
                data,
                timestamp: Date.now(),
                userId: currentUserId
            }));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    };

    const loadFromLocalStorage = (key) => {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Check if data is less than 1 hour old and belongs to current user
                if (parsed.userId === currentUserId && (Date.now() - parsed.timestamp) < 3600000) {
                    return parsed.data;
                }
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
        return null;
    };

    const savePendingAction = (action) => {
        const newAction = { ...action, id: Date.now(), timestamp: Date.now() };
        setPendingActions(prev => [...prev, newAction]);
        saveToLocalStorage('pendingEmailActions', [...pendingActions, newAction]);
    };

    const processPendingActions = async () => {
        if (!isOnline || pendingActions.length === 0) return;

        const actionsToProcess = [...pendingActions];
        setPendingActions([]);
        localStorage.removeItem('pendingEmailActions');

        for (const action of actionsToProcess) {
            try {
                switch (action.type) {
                    case 'send':
                        await fetch('/api/gmail/send', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(action.data)
                        });
                        break;
                    case 'draft':
                        await fetch('/api/gmail/save-draft', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(action.data)
                        });
                        break;
                    case 'spam':
                        await fetch(`/api/gmail/mark-spam/${action.emailId}`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                'Content-Type': 'application/json',
                            }
                        });
                        break;
                }
                console.log('Processed pending action:', action.type);
            } catch (error) {
                console.error('Error processing pending action:', error);
                // Re-add failed action to pending list
                setPendingActions(prev => [...prev, action]);
            }
        }
    };

    // Search functionality
    const searchEmails = (emails, query) => {
        if (!query.trim()) return emails;
        
        const searchTerm = query.toLowerCase();
        return emails.filter(email => 
            email.subject?.toLowerCase().includes(searchTerm) ||
            email.from?.toLowerCase().includes(searchTerm) ||
            email.to?.toLowerCase().includes(searchTerm) ||
            email.body?.toLowerCase().includes(searchTerm) ||
            email.bodyHtml?.toLowerCase().includes(searchTerm)
        );
    };

    // Get filtered emails based on search
    const getFilteredEmails = (folder) => {
        const folderData = emailCache[folder]?.data || [];
        return searchEmails(folderData, searchQuery);
    };

    // Fetch only new emails for a specific folder (incremental update)
    const fetchNewFolderEmails = async (folder) => {
        const currentFolderData = emailCache[folder];
        if (!currentFolderData?.lastFetch) {
            console.log(`No last fetch time for ${folder}, skipping incremental fetch`);
            return;
        }

        try {
            const params = new URLSearchParams({
                folder: folder,
                last_fetch_time: new Date(currentFolderData.lastFetch).toISOString(),
                max_results: '20'
            });

            const response = await fetch(`/api/gmail/new-emails?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success && result.data.new_count > 0) {
                    const newEmails = result.data.data;
                    
                    setEmailCache(prev => {
                        const existingEmails = prev[folder]?.data || [];
                        
                        // Filter out duplicates and merge new emails
                        const uniqueNewEmails = newEmails.filter(newEmail => 
                            !existingEmails.some(existing => existing.id === newEmail.id)
                        );
                        
                        if (uniqueNewEmails.length > 0) {
                            const updatedEmails = [...uniqueNewEmails, ...existingEmails];
                            
                            // Save to localStorage
                            saveToLocalStorage(`emails_${folder}`, updatedEmails);
                            
                            console.log(`Incremental fetch: Added ${uniqueNewEmails.length} new emails to ${folder}`);
                            
                            return {
                                ...prev,
                                [folder]: {
                                    ...prev[folder],
                                    data: updatedEmails,
                                    lastFetch: new Date(),
                                    backgroundLoading: false
                                }
                            };
                        }
                        
                        return prev;
                    });
                    
                    // Show notification for new emails
                    if (folder === 'inbox' && newEmails.length > 0) {
                        message.success(`📧 ${newEmails.length} new email${newEmails.length > 1 ? 's' : ''} received`);
                    }
                }
            }
        } catch (error) {
            console.error(`Incremental fetch failed for ${folder}:`, error);
        }
    };

    // Fetch emails for a specific folder
    const fetchFolderEmails = async (folder, isRefresh = false, backgroundSync = false) => {
        // Track loading folders for global loading state
        if (!backgroundSync && isInitialLoad) {
            setLoadingFolders(prev => new Set([...prev, folder]));
        }
        
        // If offline, try to load from localStorage
        if (!isOnline) {
            const cachedData = loadFromLocalStorage(`emails_${folder}`);
            if (cachedData) {
                setEmailCache(prev => ({
                    ...prev,
                    [folder]: {
                        data: cachedData,
                        loading: false,
                        loaded: true,
                        lastFetch: new Date(),
                        backgroundLoading: false
                    }
                }));
                if (isRefresh && !backgroundSync) {
                    message.info(`${folder.charAt(0).toUpperCase() + folder.slice(1)} loaded from offline cache`);
                }
                // Remove from loading folders
                if (!backgroundSync && isInitialLoad) {
                    setLoadingFolders(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(folder);
                        return newSet;
                    });
                }
                return;
            } else {
                setEmailCache(prev => ({
                    ...prev,
                    [folder]: { 
                        ...prev[folder], 
                        loading: false,
                        backgroundLoading: false 
                    }
                }));
                if (isRefresh && !backgroundSync) {
                    message.warning(`No offline data available for ${folder}`);
                }
                // Remove from loading folders
                if (!backgroundSync && isInitialLoad) {
                    setLoadingFolders(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(folder);
                        return newSet;
                    });
                }
                return;
            }
        }

        // Check if we have recent data (less than 5 minutes old) and this is a background sync
        const currentFolderData = emailCache[folder];
        if (backgroundSync && currentFolderData?.lastFetch) {
            const timeSinceLastFetch = Date.now() - new Date(currentFolderData.lastFetch).getTime();
            if (timeSinceLastFetch < 300000) { // 5 minutes (increased from 2 minutes)
                console.log(`Skipping background sync for ${folder} - data is recent (${Math.round(timeSinceLastFetch/60000)} min ago)`);
                return;
            }
        }

        // Update loading state - use backgroundLoading for background syncs
        if (backgroundSync) {
            setEmailCache(prev => ({
                ...prev,
                [folder]: { ...prev[folder], backgroundLoading: true }
            }));
        } else {
            setEmailCache(prev => ({
                ...prev,
                [folder]: { ...prev[folder], loading: !currentFolderData?.loaded }
            }));
        }

        try {
            const endpoint = getApiEndpoint(folder);
            const FETCH_LIMIT = 200; // fetch enough to cover several pages
            const params = new URLSearchParams({
                page: '1',
                page_size: FETCH_LIMIT.toString(),
                max_results: FETCH_LIMIT.toString()
            });

            const response = await fetch(`${endpoint}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    const rows = result.data?.data || [];
                    
                    // Save to localStorage for offline access
                    saveToLocalStorage(`emails_${folder}`, rows);
                    
                    // Update cache with new data
                    setEmailCache(prev => ({
                        ...prev,
                        [folder]: {
                            data: rows,
                            loading: false,
                            loaded: true,
                            lastFetch: new Date(),
                            backgroundLoading: false
                        }
                    }));
                    
                    // Remove from loading folders
                    if (!backgroundSync && isInitialLoad) {
                        setLoadingFolders(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(folder);
                            return newSet;
                        });
                    }
                    
                    if (isRefresh && !backgroundSync) {
                        message.success(`${folder.charAt(0).toUpperCase() + folder.slice(1)} refreshed (${rows.length} emails)`);
                    } else if (backgroundSync) {
                        console.log(`Background sync completed for ${folder}: ${rows.length} emails`);
                    }
                } else {
                    throw new Error(result.message || 'Failed to fetch emails');
                }
            } else {
                let errorMessage = response.statusText;
                try {
                    const errJson = await response.json();
                    if (errJson?.message) errorMessage = errJson.message;
                } catch (_) {
                    // ignore
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            
            // Update cache with error state
            setEmailCache(prev => ({
                ...prev,
                [folder]: { 
                    ...prev[folder], 
                    loading: false,
                    backgroundLoading: false 
                }
            }));

            // Remove from loading folders even on error
            if (!backgroundSync && isInitialLoad) {
                setLoadingFolders(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(folder);
                    return newSet;
                });
            }

            if (isRefresh && !backgroundSync) {
                message.error(`Failed to refresh ${folder}: ${error.message}`);
            } else if (backgroundSync) {
                console.error(`Background sync failed for ${folder}:`, error.message);
            }
        }
    };

    // Fetch new emails for all folders (incremental update)
    const fetchNewEmailsAllFolders = async () => {
        const folders = ['inbox', 'sent', 'draft', 'archive', 'spam'];
        
        try {
            // Fetch new emails for all folders in parallel
            await Promise.all(folders.map(folder => fetchNewFolderEmails(folder)));
            console.log('Incremental fetch completed for all folders');
        } catch (error) {
            console.error('Incremental fetch error:', error);
        }
    };

    // Fetch all folders
    const fetchAllFolders = async (isRefresh = false, backgroundSync = false) => {
        // Show global loading for both initial load and refreshes (but not background syncs)
        if (!backgroundSync) {
            ensureGlobalLoadingExists();
            showGlobalLoading();
        }

        const folders = ['inbox', 'sent', 'draft', 'archive', 'spam'];
        
        try {
            // Fetch all folders in parallel
            await Promise.all(folders.map(folder => fetchFolderEmails(folder, isRefresh, backgroundSync)));
        } catch (error) {
            // Silent error handling
        } finally {
            // Hide global loading for both initial load and refreshes (but not background syncs)
            if (!backgroundSync) {
                hideGlobalLoading();
            }
        }
    };

    // Manual refresh function
    const handleRefresh = () => {
        fetchAllFolders(true);
    };

    // Real-time email handling
    const handleNewEmailReceived = useCallback((emailData) => {
        // Add the new email to the appropriate folder cache
        const folder = emailData.folder || 'inbox';
        const newEmail = emailData.email;
        
        if (!newEmail || !newEmail.id) {
            return;
        }

        // Debounce to prevent duplicate notifications for the same email
        const emailKey = `${newEmail.id}_${folder}`;
        const now = Date.now();
        const lastNotification = sessionStorage.getItem(`email_notification_${emailKey}`);
        
        if (lastNotification && (now - parseInt(lastNotification)) < 5000) {
            console.log('Duplicate email notification prevented for:', emailKey);
            return; // Skip if same email was processed within last 5 seconds
        }
        
        sessionStorage.setItem(`email_notification_${emailKey}`, now.toString());
        
        setEmailCache(prev => {
            const currentFolderData = prev[folder] || { data: [], loading: false, loaded: false };
            const existingEmails = currentFolderData.data || [];
            
            // Check if email already exists to prevent duplicates
            const emailExists = existingEmails.some(email => email.id === newEmail.id);
            
            if (emailExists) {
                console.log('Email already exists in cache:', newEmail.id);
                return prev;
            }
            
            const updatedEmails = [newEmail, ...existingEmails];
            
            // Save to localStorage for offline access
            saveToLocalStorage(`emails_${folder}`, updatedEmails);
            
            return {
                ...prev,
                [folder]: {
                    ...currentFolderData,
                    data: updatedEmails,
                    loaded: true,
                    lastFetch: new Date()
                }
            };
        });
        
        // Show notification only if we're currently viewing the folder or it's inbox
        if (folder === activeFolder || folder === 'inbox') {
            message.success(`📧 New email: ${newEmail.subject || 'No subject'}`);
        }
    }, [activeFolder, saveToLocalStorage]);

    // Real-time WebSocket connection for instant email notifications
    const setupRealTimeConnection = useCallback(() => {
        if (!currentUserId || !isOnline) return;

        // Clean up existing connection first
        if (wsConnectionRef.current) {
            console.log('Cleaning up existing WebSocket connection');
            wsConnectionRef.current.stopListening('.email.received');
            wsConnectionRef.current.stopListening('.email.sent');
            wsConnectionRef.current.stopListening('.email.draft.saved');
            
            // Clear heartbeat interval
            if (wsConnectionRef.current.heartbeatInterval) {
                clearInterval(wsConnectionRef.current.heartbeatInterval);
            }
            
            window.Echo.leave(`user.emails.${currentUserId}`);
            wsConnectionRef.current = null;
        }

        // Setup Echo listeners for real-time email updates
        if (window.Echo) {
            console.log('Setting up real-time email connection for user:', currentUserId);
            
            const channel = window.Echo.private(`user.emails.${currentUserId}`)
                .listen('.email.received', (emailData) => {
                    console.log('Real-time email received:', emailData);
                    handleNewEmailReceived(emailData);
                })
                .listen('.email.sent', (emailData) => {
                    console.log('Real-time email sent notification:', emailData);
                    // Use incremental fetch for sent folder
                    setTimeout(() => fetchNewFolderEmails('sent'), 1000);
                })
                .listen('.email.draft.saved', (emailData) => {
                    console.log('Real-time draft saved notification:', emailData);
                    // Use incremental fetch for draft folder
                    setTimeout(() => fetchNewFolderEmails('draft'), 1000);
                })
                .error((error) => {
                    console.error('WebSocket connection error:', error);
                });

            wsConnectionRef.current = channel;

            // Set cache flag to indicate real-time is active (disable queue jobs)
            fetch('/api/set-realtime-status', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ active: true, userId: currentUserId })
            }).catch(error => console.error('Failed to set realtime status:', error));

            // Set up heartbeat to keep real-time status active
            const heartbeatInterval = setInterval(() => {
                if (wsConnectionRef.current && !document.hidden) {
                    fetch('/api/set-realtime-status', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ active: true, userId: currentUserId })
                    }).catch(error => console.error('Failed to refresh realtime status:', error));
                }
            }, 300000); // Every 5 minutes

            // Store heartbeat interval reference
            wsConnectionRef.current.heartbeatInterval = heartbeatInterval;
        } else {
            // Fallback to periodic checking if WebSocket is not available (only once every 10 minutes)
            console.log('WebSocket not available, using fallback polling');
            if (!emailCheckIntervalRef.current) {
                emailCheckIntervalRef.current = setInterval(() => {
                    checkForNewEmailsFallback();
                }, 600000); // 10 minutes
            }
        }
    }, [currentUserId, isOnline]);

    // Fallback email checking function (reduced frequency)
    const checkForNewEmailsFallback = useCallback(async () => {
        if (!isOnline) return;
        
        try {
            const response = await fetch('/api/gmail/trigger-monitor', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            await response.json();
        } catch (error) {
            console.error('Fallback email check error:', error);
        }
    }, [isOnline]);

    // Effect to handle online/offline state changes
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            message.success('🟢 Back online - syncing emails...');
            // Process pending actions and refresh emails
            processPendingActions();
            fetchAllFolders(false, true); // Background sync
        };

        const handleOffline = () => {
            setIsOnline(false);
            message.warning('🔴 Offline mode - using cached data');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Effect to load initial data and setup real-time connection ONLY when tab is active
    useEffect(() => {
        // Only initialize when tab is active
        if (!isTabActive) {
            console.log('Email tab is not active, skipping initialization');
            return;
        }

        console.log('Email tab is active, initializing email system');
        
        // Load pending actions from localStorage
        const storedPendingActions = loadFromLocalStorage('pendingEmailActions');
        if (storedPendingActions) {
            setPendingActions(storedPendingActions);
        }

        // Initialize loading folders and load from cache first for instant display
        const loadFromCache = () => {
            const folders = ['inbox', 'sent', 'draft', 'archive', 'spam'];
            const foldersToLoad = new Set();
            
            folders.forEach(folder => {
                const cachedData = loadFromLocalStorage(`emails_${folder}`);
                if (cachedData && cachedData.length > 0) {
                    setEmailCache(prev => ({
                        ...prev,
                        [folder]: {
                            data: cachedData,
                            loading: false,
                            loaded: true,
                            lastFetch: new Date(),
                            backgroundLoading: false
                        }
                    }));
                } else {
                    // No cached data, will need to load this folder
                    foldersToLoad.add(folder);
                }
            });
            
            // Set loading folders for those that need to be loaded
            setLoadingFolders(foldersToLoad);
            
            // If we have cached data for all folders, hide loading immediately
            if (foldersToLoad.size === 0) {
                hideGlobalLoading();
                setIsInitialLoad(false);
            }
        };

        // Load cached data immediately
        loadFromCache();
        
        // Then fetch fresh data (as foreground load if no cache, background if cache exists)
        setTimeout(() => {
            // Check if we need to do foreground loading or background sync
            const folders = ['inbox', 'sent', 'draft', 'archive', 'spam'];
            const hasAllCachedData = folders.every(folder => {
                const cachedData = loadFromLocalStorage(`emails_${folder}`);
                return cachedData && cachedData.length > 0;
            });
            
            if (hasAllCachedData) {
                // Use incremental fetch since we have cached data (much faster)
                fetchNewEmailsAllFolders();
            } else {
                // Foreground load since some folders lack cached data
                fetchAllFolders(false, false);
            }
        }, 100);
        
        // Setup real-time connection
        setupRealTimeConnection();

        // Only use fallback polling if WebSocket is not available and reduce frequency
        if (!window.Echo) {
            console.log('WebSocket not available, setting up fallback polling every 15 minutes');
            emailCheckIntervalRef.current = setInterval(() => {
                // Only check if tab is still active and visible
                if (isTabActive && !document.hidden) {
                    checkForNewEmailsFallback();
                }
            }, 900000); // 15 minutes = 900,000 milliseconds (increased from 10 min)
        } else {
            console.log('WebSocket available, no fallback polling needed');
        }

        // Cleanup when tab becomes inactive or component unmounts
        return () => {
            console.log('Cleaning up email system resources');
            
            if (window.Echo && currentUserId) {
                window.Echo.leave(`user.emails.${currentUserId}`);
                
                // Clear heartbeat interval
                if (wsConnectionRef.current?.heartbeatInterval) {
                    clearInterval(wsConnectionRef.current.heartbeatInterval);
                }
                
                // Disable real-time status when tab becomes inactive
                fetch('/api/set-realtime-status', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ active: false, userId: currentUserId })
                }).catch(error => console.error('Failed to disable realtime status:', error));
            }
            if (emailCheckIntervalRef.current) {
                clearInterval(emailCheckIntervalRef.current);
                emailCheckIntervalRef.current = null;
            }
            if (initialCheckTimeoutRef.current) {
                clearTimeout(initialCheckTimeoutRef.current);
                initialCheckTimeoutRef.current = null;
            }
        };
    }, [currentUserId, setupRealTimeConnection, isTabActive]);

    // Handle visibility change for real-time connection management
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && isOnline && isTabActive) {
                // Reconnect real-time when tab becomes visible
                setupRealTimeConnection();
                // Use incremental fetch when returning to tab (much faster)
                fetchNewEmailsAllFolders();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [setupRealTimeConnection, isOnline]);

    // Handle reply action from EmailViewer
    const handleReply = (replyData) => {
        setReplyData(replyData);
        setComposeModalOpen(true);
    };

    // Handle mark as spam action from EmailViewer
    const handleMarkAsSpam = (emailId) => {
        
        // Remove the email from current folder cache and add to spam folder
        setEmailCache(prevCache => {
            const newCache = { ...prevCache };
            let movedEmail = null;
            
            // Find and remove the email from its current folder
            Object.keys(newCache).forEach(folder => {
                if (newCache[folder].data) {
                    const emailIndex = newCache[folder].data.findIndex(email => email.id === emailId);
                    if (emailIndex !== -1) {
                        movedEmail = newCache[folder].data[emailIndex];
                        newCache[folder].data = newCache[folder].data.filter(email => email.id !== emailId);
                    }
                }
            });
            
            // Add the email to spam folder if we found it
            if (movedEmail && newCache.spam && newCache.spam.data) {
                movedEmail.folder = 'spam';
                newCache.spam.data.unshift(movedEmail);
            }
            
            return newCache;
        });
        
        // Refresh both current folder and spam folder to ensure accuracy
        fetchFolderEmails(activeFolder, true);
        fetchFolderEmails('spam', true);
    };

    // Handle report not spam action from EmailViewer
    const handleReportNotSpam = (emailId) => {
        
        // Remove the email from spam folder cache and add to inbox folder
        setEmailCache(prevCache => {
            const newCache = { ...prevCache };
            let movedEmail = null;
            
            // Find and remove the email from spam folder
            if (newCache.spam && newCache.spam.data) {
                const emailIndex = newCache.spam.data.findIndex(email => email.id === emailId);
                if (emailIndex !== -1) {
                    movedEmail = newCache.spam.data[emailIndex];
                    newCache.spam.data = newCache.spam.data.filter(email => email.id !== emailId);
                }
            }
            
            // Add the email to inbox folder if we found it
            if (movedEmail && newCache.inbox && newCache.inbox.data) {
                movedEmail.folder = 'inbox';
                newCache.inbox.data.unshift(movedEmail);
            }
            
            return newCache;
        });
        
        // Refresh both spam folder and inbox folder to ensure accuracy
        fetchFolderEmails('spam', true);
        fetchFolderEmails('inbox', true);
    };

    // Reset reply data when compose modal closes
    const handleComposeClose = () => {
        setComposeModalOpen(false);
        setReplyData(null);
        setDraftData(null);
    };

    return (
        <div className="email-module-container">
            {/* Sidebar backdrop for mobile */}
            {sidebarVisible && isMobile && (
                <div 
                    className="sidebar-backdrop" 
                    onClick={() => setSidebarVisible(false)}
                />
            )}
            
            <Card bodyStyle={{ padding: 16 }}>
                <Row gutter={[20, 12]} style={{ minHeight: 400 }} className="email-interface-row">
                    {/* Header with Compose Button, Search, and Status */}
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <div className="email-header-controls">
                            <Row gutter={[8, 8]} align="middle">
                                <Col xs={24} sm={24} md={12} lg={8}>
                                    <Space style={{ width: '100%' }}>
                                        {hasButtonPermission('M-04-COMPOSE') && (
                                            <Button
                                                type="default"
                                                size="large"
                                                icon={<FontAwesomeIcon icon={faPlus} style={{ color: '#666666' }} />}
                                                onClick={() => setComposeModalOpen(true)}
                                                disabled={!isOnline && pendingActions.some(a => a.type === 'send')}
                                                style={{ 
                                                    backgroundColor: '#f5f5f5', 
                                                    borderColor: '#d9d9d9',
                                                    color: '#666666',
                                                    flex: 1
                                                }}
                                            >
                                                Compose Email
                                            </Button>
                                        )}
                                        {isMobile ? (
                                            <Select
                                                value={activeFolder}
                                                onChange={(value) => {
                                                    setActiveFolder(value);
                                                    setSelectedEmail(null);
                                                }}
                                                options={folderOptions}
                                                style={{ 
                                                    width: 120,
                                                    backgroundColor: '#f5f5f5'
                                                }}
                                                size="large"
                                            />
                                        ) : null}
                                    </Space>
                                </Col>
                                
                                {!isMobile && pendingActions.length > 0 && (
                                    <Col xs={0} sm={0} md={6} lg={8}>
                                        <Space style={{ width: '100%', justifyContent: 'center' }}>
                                            <Badge 
                                                count={pendingActions.length} 
                                                title={`${pendingActions.length} pending action(s)`}
                                            >
                                                <Typography.Text type="secondary">
                                                    Pending
                                                </Typography.Text>
                                            </Badge>
                                        </Space>
                                    </Col>
                                )}
                                
                                <Col xs={24} sm={24} md={pendingActions.length > 0 && !isMobile ? 6 : 12} lg={8}>
                                    {/* Search Input Only */}
                                    <Input
                                        className="email-search-input"
                                        placeholder="Search emails..."
                                        prefix={<FontAwesomeIcon icon={faSearch} style={{ color: '#666666' }} />}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ 
                                            backgroundColor: '#fafafa',
                                            borderColor: '#d9d9d9',
                                            width: '100%'
                                        }}
                                        allowClear
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    {/* Email Interface */}
                    {sidebarVisible && !isMobile && (
                        <Col xs={24} sm={24} md={6} lg={5} xl={4} className="email-sidebar-col">
                            <EmailSidebar
                                activeFolder={activeFolder}
                                setActiveFolder={setActiveFolder}
                                setSelectedEmail={setSelectedEmail}
                                emailCache={emailCache}
                                onRefresh={handleRefresh}
                            />
                        </Col>
                    )}

                    <Col 
                        xs={24} 
                        sm={24} 
                        md={sidebarVisible && !isMobile ? 18 : 24} 
                        lg={sidebarVisible && !isMobile ? 19 : 24} 
                        xl={sidebarVisible && !isMobile ? 20 : 24} 
                        className="email-container-col"
                    >
                        <EmailContainer
                            activeFolder={activeFolder}
                            selectedEmail={selectedEmail}
                            setSelectedEmail={(email) => {
                                setSelectedEmail(email);
                                if (email) {
                                    // If we're in the draft folder, open compose modal for editing
                                    if (activeFolder === 'draft') {
                                        setDraftData({
                                            to: email.to,
                                            cc: email.cc,
                                            bcc: email.bcc,
                                            subject: email.subject,
                                            body: email.body || email.bodyHtml,
                                            draftId: email.id
                                        });
                                        setComposeModalOpen(true);
                                    } else {
                                        setViewModalOpen(true);
                                    }
                                }
                            }}
                            emailCache={{
                                ...emailCache,
                                [activeFolder]: {
                                    ...emailCache[activeFolder],
                                    data: getFilteredEmails(activeFolder)
                                }
                            }}
                            setEmailCache={setEmailCache}
                            searchQuery={searchQuery}
                            isOnline={isOnline}
                            sidebarVisible={sidebarVisible}
                            setSidebarVisible={setSidebarVisible}
                            isMobile={isMobile}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Compose Email Modal */}
            <ComposeEmailModal
                open={composeModalOpen}
                onClose={handleComposeClose}
                replyData={replyData}
                draftData={draftData}
                initialData={initialComposeData}
                isOnline={isOnline}
                onEmailSent={() => {
                    // Use incremental fetch for sent folder when email is sent
                    if (isOnline) {
                        setTimeout(() => fetchNewFolderEmails('sent'), 500);
                    }
                }}
                onDraftSaved={() => {
                    // Use incremental fetch for draft folder when draft is saved  
                    if (isOnline) {
                        setTimeout(() => fetchNewFolderEmails('draft'), 500);
                    }
                }}
                onOfflineAction={(action) => {
                    // Save action for when back online
                    savePendingAction(action);
                    message.info(`${action.type} saved for when back online`);
                }}
            />

            <EmailViewer
                email={selectedEmail}
                open={viewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedEmail(null);
                }}
                onReply={handleReply}
                onMarkAsSpam={handleMarkAsSpam}
                onReportNotSpam={handleReportNotSpam}
            />
        </div>
    );
}
