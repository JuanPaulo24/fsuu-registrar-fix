import React, { useState, useRef, useEffect } from 'react';
import { Input, Typography, Empty, Spin, Flex, Button, Tag, Divider, Modal } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faArrowRight, faFaceSadTear } from '@fortawesome/pro-regular-svg-icons';
import { useGlobalSearch } from '../providers/GlobalSearchContext';
import { userData } from '../providers/appConfig';

const { Text } = Typography;

export default function GlobalSearchBar({ isMobile = false, onMobileToggle = null }) {
    const {
        searchQuery,
        searchResults,
        isSearching,
        showResults,
        handleSearchChange,
        navigateToResult,
        clearSearch,
        setShowResults
    } = useGlobalSearch();

    const [inputFocused, setInputFocused] = useState(false);
    const [mobileModalOpen, setMobileModalOpen] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Force white backgrounds after render
    useEffect(() => {
        if (showResults && dropdownRef.current) {
            const dropdown = dropdownRef.current;
            const results = dropdown.querySelectorAll('.search-result-item');
            
            // Force white background on dropdown
            dropdown.style.setProperty('background', '#ffffff', 'important');
            dropdown.style.setProperty('background-color', '#ffffff', 'important');
            
            // Force white background on all result items
            results.forEach(item => {
                item.style.setProperty('background', '#ffffff', 'important');
                item.style.setProperty('background-color', '#ffffff', 'important');
            });
        }
    }, [showResults, searchResults]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !inputRef.current?.input?.contains(event.target)
            ) {
                setShowResults(false);
                setInputFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setShowResults]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ctrl/Cmd + K to focus search
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                if (isMobile) {
                    setMobileModalOpen(true);
                } else {
                    inputRef.current?.focus();
                }
            }
            // Escape to close results or mobile modal
            if (event.key === 'Escape') {
                if (isMobile && mobileModalOpen) {
                    setMobileModalOpen(false);
                } else if (showResults) {
                    setShowResults(false);
                    inputRef.current?.blur();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showResults, setShowResults, isMobile, mobileModalOpen]);

    const renderSearchResults = () => {
        if (isSearching) {
            return (
                <div className="global-search-loading">
                    <Spin size="small" />
                    <Text type="secondary" style={{ marginLeft: 8 }}>Searching...</Text>
                </div>
            );
        }

        if (searchResults.length === 0 && searchQuery.length >= 2) {
            return (
                <div style={{ 
                    padding: '40px 20px', 
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '200px'
                }}>
                    <div style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        maxWidth: '300px',
                        width: '100%'
                    }}>
                        <FontAwesomeIcon 
                            icon={faFaceSadTear} 
                            style={{ 
                                fontSize: '48px', 
                                color: '#adb5bd',
                                marginBottom: '16px',
                                display: 'block'
                            }} 
                        />
                        <Text style={{ 
                            fontSize: '16px',
                            color: '#495057',
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: 500
                        }}>
                            No results found
                        </Text>
                        <Text style={{ 
                            fontSize: '12px',
                            color: '#6c757d',
                            textAlign: 'center',
                            lineHeight: '1.4'
                        }}>
                            Try different keywords or check spelling
                        </Text>
                    </div>
                </div>
            );
        }

        if (searchResults.length === 0) {
            const user = userData();
            const accessibleModules = user?.accessible_modules || [];
            
            // Filter quick access items based on user permissions
            const quickAccessItems = [
                { name: 'Dashboard', path: '/dashboard-view', moduleName: 'Dashboard' },
                { name: 'Student Profiles', path: '/student-profile', moduleName: 'Student Profiles' },
                { name: 'Document Management', path: '/document-management', moduleName: 'Document Management' },
                { name: 'Users', path: '/users', moduleName: 'Users' }
            ].filter(item => 
                accessibleModules.some(module => module.module_name === item.moduleName)
            );

            return (
                <div className="global-search-suggestions">
                    <Text type="secondary" style={{ padding: '12px 16px', display: 'block' }}>
                        Start typing to search across all system components...
                    </Text>
                    {quickAccessItems.length > 0 && (
                        <>
                            <Divider style={{ margin: '8px 0' }} />
                            <div style={{ padding: '8px 16px' }}>
                                <Text strong style={{ fontSize: '12px', color: 'var(--ant-color-text-secondary)' }}>
                                    QUICK ACCESS:
                                </Text>
                                <div className="quick-access-items" style={{ marginTop: 8 }}>
                                    {quickAccessItems.map((item) => {
                                        return (
                                            <Button
                                                key={item.name}
                                                type="text"
                                                size="small"
                                                onClick={() => {
                                                    // Navigate directly to the tab/page
                                                    navigateToResult({ path: item.path });
                                                }}
                                                style={{ 
                                                    marginRight: 8, 
                                                    marginBottom: 4,
                                                    fontSize: '11px',
                                                    height: 'auto',
                                                    padding: '2px 8px',
                                                    color: '#333333',
                                                    border: '1px solid #d9d9d9',
                                                    backgroundColor: '#ffffff'
                                                }}
                                            >
                                                {item.name}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            );
        }

        return (
            <div className="global-search-results" style={{ background: '#ffffff', backgroundColor: '#ffffff' }}>
                {searchResults.slice(0, 8).map((result, index) => (
                    <div
                        key={result.id}
                        className="search-result-item search-result-item-solid"
                        onClick={() => navigateToResult(result)}
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            borderBottom: index < searchResults.length - 1 ? '1px solid #e8e8e8' : 'none',
                            transition: 'background-color 0.2s',
                            backgroundColor: '#ffffff',
                            background: '#ffffff'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                            e.currentTarget.style.setProperty('background-color', '#f0f0f0', 'important');
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.setProperty('background-color', '#ffffff', 'important');
                        }}
                    >
                        <Flex justify="space-between" align="center">
                            <div style={{ flex: 1 }}>
                                <Flex align="flex-start" gap={8} style={{ flexDirection: 'column' }}>
                                    <Text strong style={{ 
                                        fontSize: '14px',
                                        color: '#333333'
                                    }}>
                                        {result.parentTitle ? `${result.parentTitle} > ${result.title}` : result.title}
                                    </Text>
                                    <Tag size="small" style={{ 
                                        fontSize: '10px',
                                        backgroundColor: 'transparent',
                                        color: '#0027ae',
                                        border: 'none',
                                        padding: '2px 8px',
                                        margin: 0,
                                        alignSelf: 'flex-start'
                                    }}>
                                        {result.category}
                                    </Tag>
                                </Flex>
                                <Text style={{ 
                                    fontSize: '12px', 
                                    display: 'block', 
                                    marginTop: 2,
                                    color: '#666666'
                                }}>
                                    {result.description}
                                </Text>
                                <Text style={{ 
                                    fontSize: '11px', 
                                    display: 'block', 
                                    marginTop: 4,
                                    color: '#999999'
                                }}>
                                    {result.path}
                                </Text>
                            </div>
                            <FontAwesomeIcon 
                                icon={faArrowRight} 
                                style={{ color: '#cccccc', fontSize: '12px' }}
                            />
                        </Flex>
                    </div>
                ))}
                
                {searchResults.length > 8 && (
                    <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0' }}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            Showing {Math.min(8, searchResults.length)} of {searchResults.length} results
                        </Text>
                    </div>
                )}
            </div>
        );
    };

    const handleMobileSearch = () => {
        setMobileModalOpen(true);
    };

    const handleMobileClose = () => {
        setMobileModalOpen(false);
        clearSearch();
    };

    // Mobile button version
    if (isMobile) {
        return (
            <>
                <Button
                    type="text"
                    icon={<FontAwesomeIcon icon={faSearch} />}
                    onClick={handleMobileSearch}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--ant-color-fill-quaternary)',
                        border: '1px solid var(--ant-color-border)',
                        color: 'var(--ant-color-text-secondary)'
                    }}
                />
                
                <Modal
                    title="Search System"
                    open={mobileModalOpen}
                    onCancel={handleMobileClose}
                    footer={null}
                    width="90%"
                    style={{ top: 20 }}
                    destroyOnClose
                >
                    <div className="mobile-search-content">
                        <Input
                            ref={inputRef}
                            placeholder={inputFocused || searchQuery ? "" : "Search system..."}
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => {
                                setInputFocused(true);
                                if (searchQuery.length >= 2) {
                                    setShowResults(true);
                                }
                            }}
                            onBlur={() => {
                                setInputFocused(false);
                            }}
                            prefix={<FontAwesomeIcon icon={faSearch} style={{ color: 'var(--ant-color-text-tertiary)' }} />}
                            suffix={
                                searchQuery && (
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<FontAwesomeIcon icon={faTimes} />}
                                        onClick={clearSearch}
                                        style={{ 
                                            border: 'none', 
                                            boxShadow: 'none',
                                            padding: '0 4px',
                                            height: 'auto',
                                            color: 'var(--ant-color-text-tertiary)'
                                        }}
                                    />
                                )
                            }
                            style={{
                                borderRadius: '8px',
                                marginBottom: '16px'
                            }}
                            autoFocus
                        />
                        
                        {showResults && (
                            <div style={{ 
                                maxHeight: '60vh', 
                                overflowY: 'auto',
                                border: '1px solid var(--ant-color-border)',
                                borderRadius: '8px'
                            }}>
                                {renderSearchResults()}
                            </div>
                        )}
                    </div>
                </Modal>
            </>
        );
    }

    // Desktop version
    return (
        <div className="global-search-container" style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
            <div className="search-input-wrapper" style={{ position: 'relative' }}>
                <Input
                    ref={inputRef}
                    placeholder={inputFocused || searchQuery ? "" : "Search system... (Ctrl+K)"}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => {
                        setInputFocused(true);
                        if (searchQuery.length >= 2) {
                            setShowResults(true);
                        }
                    }}
                    onBlur={() => {
                        setInputFocused(false);
                    }}
                    prefix={<FontAwesomeIcon icon={faSearch} style={{ color: '#6c757d' }} />}
                    suffix={
                        searchQuery && (
                            <Button
                                type="text"
                                size="small"
                                icon={<FontAwesomeIcon icon={faTimes} />}
                                onClick={clearSearch}
                                style={{ 
                                    border: 'none', 
                                    boxShadow: 'none',
                                    padding: '0 4px',
                                    height: 'auto',
                                    color: '#6c757d'
                                }}
                            />
                        )
                    }
                    style={{
                        borderRadius: '8px',
                        backgroundColor: '#f8f9fa',
                        border: 'none',
                        boxShadow: 'none',
                        transition: 'all 0.3s',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#e9ecef';
                        e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#f8f9fa';
                        e.target.style.transform = 'translateY(0)';
                    }}
                />
            </div>

            {showResults && (
                <div
                    ref={dropdownRef}
                    className="global-search-dropdown"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: 4,
                        backgroundColor: '#ffffff',
                        background: '#ffffff',
                        border: '1px solid #d9d9d9',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 1050,
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}
                >
                    {renderSearchResults()}
                </div>
            )}
        </div>
    );
}
