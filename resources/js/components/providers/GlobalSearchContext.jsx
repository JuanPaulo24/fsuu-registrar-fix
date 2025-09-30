import React, { createContext, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSideMenu } from '../layouts/private/components/SideMenuList';
import { userData } from '../providers/appConfig';

const GlobalSearchContext = createContext();

export const useGlobalSearch = () => {
    const context = useContext(GlobalSearchContext);
    if (!context) {
        throw new Error('useGlobalSearch must be used within GlobalSearchProvider');
    }
    return context;
};

export const GlobalSearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    // Removed filter functionality as requested
    const navigate = useNavigate();

    // Define searchable system components/modules
    const systemModules = useMemo(() => [
        {
            id: 'dashboard',
            title: 'Dashboard',
            description: 'Main dashboard with system overview and analytics',
            path: '/dashboard-view',
            category: 'navigation',
            keywords: ['home', 'overview', 'analytics', 'stats', 'summary', 'main', 'tab']
        },
        {
            id: 'student-profiles',
            title: 'Student Profiles',
            description: 'Manage student profiles and personal information',
            path: '/student-profile',
            category: 'profiles',
            keywords: ['student', 'profile', 'personal', 'information', 'records', 'add profile', 'new profile', 'tab', 'student tab']
        },
        {
            id: 'users',
            title: 'Users',
            description: 'User management and account administration',
            path: '/users',
            category: 'administration',
            keywords: ['user', 'account', 'management', 'admin', 'tab', 'users tab', 'administration tab']
        },
        {
            id: 'system-configurations-users',
            title: 'Users',
            description: 'User management within system configurations',
            path: '/system-configurations',
            parentTitle: 'System Configurations',
            tabKey: 'Users',
            category: 'administration',
            keywords: ['user', 'account', 'management', 'admin', 'system', 'configuration', 'settings', 'tab']
        },
        {
            id: 'email',
            title: 'Email',
            description: 'Email management and templates',
            path: '/email',
            category: 'communication',
            keywords: ['email', 'template', 'communication', 'messages', 'notifications', 'tab', 'email tab', 'mail']
        },
        {
            id: 'email-system',
            title: 'Email',
            description: 'Email inbox and messaging system',
            path: '/email',
            parentTitle: 'Email',
            tabKey: 'Email',
            category: 'communication',
            keywords: ['email', 'inbox', 'messages', 'communication', 'mail', 'system', 'tab']
        },
        {
            id: 'email-template',
            title: 'Email Template',
            description: 'Manage email templates and formats',
            path: '/email',
            parentTitle: 'Email',
            tabKey: 'Email Template',
            category: 'communication',
            keywords: ['email', 'template', 'format', 'design', 'communication', 'mail', 'tab']
        },
        {
            id: 'qr-scanner',
            title: 'QR Scanner',
            description: 'Scan QR codes for document verification',
            path: '/qr-scanner',
            category: 'tools',
            keywords: ['qr', 'scanner', 'verification', 'document', 'scan', 'tab', 'qr tab', 'scanner tab']
        },
        {
            id: 'document-management',
            title: 'Document Management',
            description: 'Manage and track documents and certifications',
            path: '/document-management',
            category: 'documents',
            keywords: ['document', 'management', 'certificate', 'diploma', 'records', 'files', 'tab', 'document tab', 'documents']
        },
        {
            id: 'document-management-transcript',
            title: 'Transcript of Records',
            description: 'Manage transcript of records documents',
            path: '/document-management',
            parentTitle: 'Document Management',
            tabKey: 'TranscriptOfRecords',
            category: 'documents',
            keywords: ['transcript', 'records', 'tor', 'academic', 'document', 'management', 'tab']
        },
        {
            id: 'document-management-certifications',
            title: 'Certifications',
            description: 'Manage certification documents',
            path: '/document-management',
            parentTitle: 'Document Management',
            tabKey: 'Certifications',
            category: 'documents',
            keywords: ['certification', 'certificate', 'diploma', 'document', 'management', 'tab']
        },
        {
            id: 'document-management-trackings',
            title: 'Document Trackings',
            description: 'Track document processing and status',
            path: '/document-management',
            parentTitle: 'Document Management',
            tabKey: 'DocumentTrackings',
            category: 'documents',
            keywords: ['tracking', 'status', 'processing', 'document', 'management', 'monitor', 'tab']
        },
        {
            id: 'information-panel',
            title: 'Information Panel',
            description: 'System information and announcements',
            path: '/information-panel',
            category: 'information',
            keywords: ['information', 'panel', 'announcements', 'news', 'updates', 'tab', 'info tab', 'information tab']
        },
        {
            id: 'information-panel-calendar',
            title: 'Events',
            description: 'Events management within information panel',
            path: '/information-panel',
            parentTitle: 'Information Panel',
            tabKey: 'calendar',
            category: 'information',
            keywords: ['events', 'calendar', 'schedule', 'information', 'panel', 'date', 'tab']
        },
        {
            id: 'support',
            title: 'Support',
            description: 'Help and support resources',
            path: '/support',
            category: 'help',
            keywords: ['support', 'help', 'assistance', 'troubleshooting', 'guides', 'tab', 'support tab', 'help tab']
        },
        {
            id: 'support-system-manual',
            title: 'System Manual',
            description: 'Comprehensive guide to navigating and using the system',
            path: '/support',
            parentTitle: 'Support',
            tabKey: 'SystemManual',
            category: 'help',
            keywords: ['manual', 'guide', 'navigation', 'help', 'system', 'documentation', 'tutorial', 'tab']
        },
        {
            id: 'support-contact-information',
            title: 'Contact Information',
            description: 'Support contact details and information',
            path: '/support',
            parentTitle: 'Support',
            tabKey: 'ContactInformation',
            category: 'help',
            keywords: ['contact', 'information', 'support', 'phone', 'email', 'help', 'tab']
        },
        {
            id: 'support-system-status',
            title: 'System Status',
            description: 'Current system status and health monitoring',
            path: '/support',
            parentTitle: 'Support',
            tabKey: 'SystemStatus',
            category: 'help',
            keywords: ['system', 'status', 'health', 'monitoring', 'uptime', 'support', 'tab']
        },

        {
            id: 'system-configurations',
            title: 'System Configurations',
            description: 'System settings and configuration management',
            path: '/system-configurations',
            category: 'administration',
            keywords: ['system', 'configuration', 'settings', 'admin', 'setup', 'tab']
        },

        {
            id: 'system-configurations-titles',
            title: 'Titles',
            description: 'Title management within system configurations',
            path: '/system-configurations',
            parentTitle: 'System Configurations',
            tabKey: 'Titles',
            category: 'administration',
            keywords: ['title', 'system', 'configuration', 'settings', 'tab', 'titles']
        },
        {
            id: 'system-configurations-rolesandpermissions',
            title: 'Roles and Permissions',
            description: 'Role and permission management within system configurations',
            path: '/system-configurations',
            parentTitle: 'System Configurations',
            tabKey: 'RolesAndPermissions',
            category: 'administration',
            keywords: ['role', 'access', 'security', 'system', 'configuration', 'settings', 'tab', 'roles', 'and', 'permissions']
        },
        {
            id: 'system-configurations-loginlogs',
            title: 'Login Logs',
            description: 'Login logs within system configurations',
            path: '/system-configurations',
            parentTitle: 'System Configurations',
            tabKey: 'LoginLogs',
            category: 'administration',
            keywords: ['login', 'log', 'audit', 'security', 'access', 'system', 'configuration', 'settings', 'tab']
        },
        {
            id: 'system-configurations-qrhistory',
            title: 'QR History',
            description: 'QR history within system configurations',
            path: '/system-configurations',
            parentTitle: 'System Configurations',
            tabKey: 'QRHistory',
            category: 'administration',
            keywords: ['qr', 'history', 'system', 'configuration', 'settings', 'tab']
        }
    ], []);

    // Filter functionality removed as requested

    // Check if user has access to a module
    const hasModuleAccess = (modulePath, moduleName, tabKey) => {
        const user = userData();
        if (!user) return false;

        // Map paths to module names
        const moduleMap = {
            '/dashboard-view': 'Dashboard',
            '/student-profile': 'Student Profiles',
            '/users': 'Users',
            '/email': 'Email',
            '/qr-scanner': 'QR Scanner',
            '/document-management': 'Document Management',
            '/information-panel': 'Information Panel',
            '/support': 'Support',
            '/system-configurations': 'System Configurations'
        };

        const moduleNameToCheck = moduleMap[modulePath];
        
        // Check if user has access to the module
        const hasModulePermission = user.accessible_modules?.some(
            module => module.module_name === moduleNameToCheck
        );

        if (!hasModulePermission) return false;

        // If it's a tab, check tab permission
        if (tabKey) {
            const tabPermissions = user.tab_permissions?.[moduleNameToCheck] || {};
            
            // Map tabKey to actual permission codes
            const tabCodeMap = {
                'Email': 'M-04-EMAIL',
                'Email Template': 'M-04-TEMPLATE',
                'TranscriptOfRecords': 'M-06-TRANSCRIPT',
                'Certifications': 'M-06-CERTIFICATIONS',
                'DocumentTrackings': 'M-06-TRACKINGS',
                'calendar': 'M-07-EVENTS',
                'SystemManual': 'M-08-MANUAL',
                'ContactInformation': 'M-08-CONTACT',
                'SystemStatus': 'M-08-STATUS',
                'Users': 'M-09-USERS',
                'Titles': 'M-09-TITLES',
                'RolesAndPermissions': 'M-09-ROLES',
                'LoginLogs': 'M-09-LOGS',
                'QRHistory': 'M-09-QR'
            };

            const tabCode = tabCodeMap[tabKey];
            return tabPermissions[tabCode] === true;
        }

        return true;
    };

    // Perform search
    const performSearch = (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        
        const normalizedQuery = query.toLowerCase().trim();
        
        // Filter modules based on search query AND user permissions
        const results = systemModules.filter(module => {
            // First check permissions
            const hasAccess = hasModuleAccess(module.path, module.title, module.tabKey);
            if (!hasAccess) return false;

            // Then check if it matches the search query
            const titleMatch = module.title.toLowerCase().includes(normalizedQuery);
            const descriptionMatch = module.description.toLowerCase().includes(normalizedQuery);
            const keywordMatch = module.keywords.some(keyword => 
                keyword.toLowerCase().includes(normalizedQuery)
            );
            
            return titleMatch || descriptionMatch || keywordMatch;
        });

        // Sort results by relevance
        const sortedResults = results.sort((a, b) => {
            const aScore = calculateRelevanceScore(a, normalizedQuery);
            const bScore = calculateRelevanceScore(b, normalizedQuery);
            return bScore - aScore;
        });

        setSearchResults(sortedResults);
        setIsSearching(false);
    };

    // Calculate relevance score for sorting
    const calculateRelevanceScore = (module, query) => {
        let score = 0;
        
        // Title exact match gets highest score
        if (module.title.toLowerCase() === query) score += 100;
        else if (module.title.toLowerCase().includes(query)) score += 50;
        
        // Description match
        if (module.description.toLowerCase().includes(query)) score += 20;
        
        // Keyword exact match
        if (module.keywords.some(keyword => keyword.toLowerCase() === query)) score += 80;
        else if (module.keywords.some(keyword => keyword.toLowerCase().includes(query))) score += 30;
        
        return score;
    };

    // Return all search results (no filtering)

    // Navigate to selected result
    const navigateToResult = (result) => {
        if (result.tabKey) {
            // For nested tabs, navigate with URL parameter to specify which tab to open
            navigate(`${result.path}?tab=${result.tabKey}`);
        } else {
            // For regular pages, navigate normally
            navigate(result.path);
        }
        setShowResults(false);
        setSearchQuery('');
    };

    // Handle search input change
    const handleSearchChange = (query) => {
        setSearchQuery(query);
        if (query.length >= 2) {
            setShowResults(true);
            performSearch(query);
        } else {
            setShowResults(false);
            setSearchResults([]);
        }
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    const value = {
        searchQuery,
        searchResults,
        isSearching,
        showResults,
        handleSearchChange,
        navigateToResult,
        clearSearch,
        setShowResults
    };

    return (
        <GlobalSearchContext.Provider value={value}>
            {children}
        </GlobalSearchContext.Provider>
    );
};
