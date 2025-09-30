import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Breadcrumb, Layout, Card, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGifts, faHome, faRefresh } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../providers/useAxiosQuery";
import { primaryColor, appName, userData } from "../../providers/appConfig";
import ClearCache from "../../providers/ClearCache";
import Sidemenu from "./Sidemenu";
import Header from "./Header";
import Footer from "./Footer";
import { adminSideMenu, getFilteredAdminSideMenu } from "./components/SideMenuList";
import PreventDragRightClick from "../../providers/PreventDragRightClick";
import { GlobalSearchProvider } from "../../providers/GlobalSearchContext";
import { ensureGlobalLoadingExists } from "../../providers/globalLoading";

export default function Private(props) {
    const {
        children,
        moduleName,
        title,
        subtitle,
        pageHeaderIcon,
        pageHeaderClass,
        pageId,
        className,
        breadcrumb,
    } = props;

    const location = useLocation();
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [width, setWidth] = useState(window.innerWidth);
    const [sideMenuCollapse, setSideMenuCollapse] = useState(
        window.innerWidth <= 768
    );
    const [globalBreadcrumb, setGlobalBreadcrumb] = useState([]);
    const [userDataForBreadcrumb, setUserDataForBreadcrumb] = useState({});

    // Calculate path segments once and reuse
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    // 🛠️ Update breadcrumbs based on selected tabs and current location
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const activeTab = urlParams.get("tab");
        const status = urlParams.get("status");

        let breadcrumbs = [
            {
                title: (
                    <Link to="/">
                        <FontAwesomeIcon icon={faHome} />
                    </Link>
                ),
            },
        ];

        // Use manual breadcrumbs if provided, otherwise generate from URL
        if (breadcrumb && breadcrumb.length > 0) {
            breadcrumbs = [
                ...breadcrumbs,
                ...breadcrumb.map(item => ({
                    name: item.name,
                    link: item.link
                }))
            ];
            
            // Add dynamic segments like IDs/UUIDs that appear at the end of the URL
            // Look for numeric segments (IDs) or UUIDs at the end of the path
            const lastSegment = pathSegments[pathSegments.length - 1];
            if (lastSegment && (isNumericId || isUuid)) {
                // For user edit pages, show username if available
                const isUserEditPage = location.pathname.includes('/users/edit/') || location.pathname.includes('/system-configurations/users/edit/');
                const isStudentProfilePage = location.pathname.includes('/student-profile/view/');
                
                if (isUserEditPage || isStudentProfilePage) {
                    // Show username for both user edit pages and student profile pages
                    if (userDataForBreadcrumb[lastSegment]) {
                        breadcrumbs.push({
                            name: userDataForBreadcrumb[lastSegment],
                            // Don't add link for the last segment (current page)
                        });
                    } else if (shouldFetchUserData) {
                        // Show loading placeholder while fetching
                        breadcrumbs.push({
                            name: "Loading...",
                            // Don't add link for the last segment (current page)
                        });
                    }
                } else {
                    // For other pages, show the segment as-is (but only for numeric IDs, not UUIDs)
                    if (isNumericId) {
                        breadcrumbs.push({
                            name: lastSegment,
                            // Don't add link for the last segment (current page)
                        });
                    }
                }
            }
        } else {
            breadcrumbs = [
                ...breadcrumbs,
                ...pathSegments.map((segment, index) => {
                    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
                    return {
                        name: segment
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (char) => char.toUpperCase()),
                        link: path,
                    };
                }),
            ];
        }

        const fullPath = `/${pathSegments.join("/")}`;

        // Only add tab-specific breadcrumbs if no manual breadcrumbs were provided
        if (!breadcrumb || breadcrumb.length === 0) {
            const tabLabelMap = {
            tab1: "All",
            tab2: "Territory/Clusters",
            tab3: "Population",
            tab4: "Sacramental and Pastoral Life",
            tab5: "Pastoral Co-Workers",
            tab6: "Finances",
            "Worship Volunteers": "Worship",
            "Evangelization Volunteers": "Evangelization",
            "Social Services Volunteers": "Social Services",
            "Temporalities Volunteers": "Temporalities",
            "Organization Volunteers": "Organization",
            "Youth Volunteers": "Youth",
            "Vocation Volunteers": "Vocation",
            account: "Account Code",
            role: "Roles",
            organization: "Organizations",
            religion: "Religions",
            citizenship: "Citizenships",
            civil: "Civil Status",
        };

        // ✅ Donations logic
        if (fullPath.includes("/donations")) {
            if (activeTab === "Historical Data") {
                breadcrumbs.push({
                    name: "Historical Data",
                    link: `${location.pathname}?tab=${activeTab}`,
                });
            } else if (status) {
                breadcrumbs.push({
                    name: status,
                    link: `${location.pathname}?tab=${activeTab}&status=${status}`,
                });
            }
        }

        // ✅ Payments (Official Receipt) logic
        else if (fullPath.includes("/accounting/official-receipt")) {
            if (activeTab === "Historical Data") {
                breadcrumbs.push({
                    name: "Historical Data",
                    link: `${location.pathname}?tab=${activeTab}`,
                });
            } else if (status) {
                breadcrumbs.push({
                    name: status,
                    link: `${location.pathname}?tab=${activeTab}&status=${status}`,
                });
            }
        }

        // ✅ Email logic
        else if (fullPath.includes("/email")) {
            if (activeTab) {
                breadcrumbs.push({
                    name: activeTab,
                    link: `${location.pathname}?tab=${encodeURIComponent(activeTab)}`,
                });
            } else {
                // Default to Email tab if no tab specified
                breadcrumbs.push({
                    name: "Email",
                    link: `${location.pathname}?tab=Email`,
                });
            }
        }

        // ✅ System Configurations logic (only for main page, not sub-routes)
        else if (fullPath === "/system-configurations") {
            if (activeTab) {
                breadcrumbs.push({
                    name: activeTab,
                    link: `${location.pathname}?tab=${encodeURIComponent(activeTab)}`,
                });
            } else {
                // Default to Users tab if no tab specified
                breadcrumbs.push({
                    name: "Users",
                    link: `${location.pathname}?tab=Users`,
                });
            }
        }

        // ✅ Information Panel logic (only for main page, not sub-routes)
        else if (fullPath === "/information-panel") {
            if (activeTab) {
                // Map tab keys to display names
                const tabDisplayNames = {
                    'posting': 'CMS',
                    'calendar': 'Events'
                };
                const displayName = tabDisplayNames[activeTab] || activeTab;
                breadcrumbs.push({
                    name: displayName,
                    link: `${location.pathname}?tab=${encodeURIComponent(activeTab)}`,
                });
            } else {
                // Default to CMS tab if no tab specified
                breadcrumbs.push({
                    name: "CMS",
                    link: `${location.pathname}?tab=posting`,
                });
            }
        }

        // ✅ Document Management logic (only for main page, not sub-routes)
        else if (fullPath === "/document-management") {
            if (activeTab) {
                // Map tab keys to display names
                const tabDisplayNames = {
                    'TranscriptOfRecords': 'Transcript of Records',
                    'Certifications': 'Certifications',
                    'DocumentTrackings': 'Document Trackings'
                };
                const displayName = tabDisplayNames[activeTab] || activeTab;
                breadcrumbs.push({
                    name: displayName,
                    link: `${location.pathname}?tab=${encodeURIComponent(activeTab)}`,
                });
            } else {
                // Default to Transcript of Records tab if no tab specified
                breadcrumbs.push({
                    name: "Transcript of Records",
                    link: `${location.pathname}?tab=TranscriptOfRecords`,
                });
            }
        }

        // ✅ Support logic (only for main page, not sub-routes)
        else if (fullPath === "/support") {
            if (activeTab) {
                // Map tab keys to display names
                const tabDisplayNames = {
                    'TicketingSystem': 'Ticketing System',
                    'ContactInformation': 'Contact Information',
                    'SystemStatus': 'System Status'
                };
                const displayName = tabDisplayNames[activeTab] || activeTab;
                breadcrumbs.push({
                    name: displayName,
                    link: `${location.pathname}?tab=${encodeURIComponent(activeTab)}`,
                });
            } else {
                // Default to Ticketing System tab if no tab specified
                breadcrumbs.push({
                    name: "Ticketing System",
                    link: `${location.pathname}?tab=TicketingSystem`,
                });
            }
        }

        // ✅ Email Template logic (legacy - keeping for backward compatibility)
        else if (
            fullPath.includes("/email-template") &&
            activeTab === "Historical Data"
        ) {
            breadcrumbs.push({
                name: "Historical Data",
                link: `${location.pathname}?tab=${activeTab}`,
            });
        }



        // ✅ General tabbed pages fallback
        else if (activeTab) {
            breadcrumbs.push({
                name: tabLabelMap[activeTab] || activeTab,
                link: `${location.pathname}?tab=${activeTab}`,
            });
        }
        
        } // Close the if block for manual breadcrumbs check

        setGlobalBreadcrumb(breadcrumbs);
    }, [location.pathname, location.search, userDataForBreadcrumb]);

    // Determine if we need to fetch user data for breadcrumb
    // Check for both numeric IDs and UUIDs (only if lastSegment exists)
    const isNumericId = lastSegment && /^\d+$/.test(lastSegment);
    const isUuid = lastSegment && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment);
    
    // Determine what type of data to fetch based on the route
    const isUserEditRoute = location.pathname.includes('/users/edit/') || location.pathname.includes('/system-configurations/users/edit/');
    const isStudentProfileRoute = location.pathname.includes('/student-profile/view/');
    const isValidSegment = (isNumericId || isUuid) && lastSegment !== 'add' && lastSegment !== 'edit';
    
    // Both user edit routes and student profile routes now use UUIDs and fetch user data
    // But skip fetching for numeric IDs on student profile routes (legacy routes will handle redirect)
    const shouldFetchUserData = (isUserEditRoute || (isStudentProfileRoute && isUuid)) && isValidSegment;
    const shouldFetchProfileData = false; // No longer needed since we'll use user data for both
    
    
    // Conditionally fetch user data for breadcrumb display
    const { data: userDataFromAPI, error: userDataError } = GET(
        shouldFetchUserData ? `api/users/${lastSegment}` : null,
        shouldFetchUserData ? [`user_breadcrumb_${lastSegment}`] : null,
        {
            enabled: shouldFetchUserData,
        }
    );

    // Profile data fetching is no longer needed since we use user data for both user edit and student profile pages


    // Update breadcrumb user data when userDataFromAPI changes
    useEffect(() => {
        if (userDataFromAPI?.data && shouldFetchUserData) {
            setUserDataForBreadcrumb(prev => ({
                ...prev,
                [lastSegment]: userDataFromAPI.data.username
            }));
        }
    }, [userDataFromAPI, shouldFetchUserData, lastSegment]);

    // Profile data useEffect is no longer needed

    const updateMenuItems = () => {
        // Get user data from localStorage to access their modules
        const user = userData();
        
        if (user && user.accessible_modules) {
            // Filter menu items based on user's accessible modules
            const filteredMenu = getFilteredAdminSideMenu(user.accessible_modules);
            setMenuItems(filteredMenu);
        } else {
            // Fallback to full menu if no user data or modules found
            setMenuItems(adminSideMenu);
        }
    };

    useEffect(() => {
        updateMenuItems();
    }, []);

    // Listen for permission refresh events
    useEffect(() => {
        const handlePermissionRefresh = () => {
            updateMenuItems();
        };

        window.addEventListener('userPermissionsRefreshed', handlePermissionRefresh);

        return () => {
            window.removeEventListener('userPermissionsRefreshed', handlePermissionRefresh);
        };
    }, []);
    // }, [dataServiceType]);


    useEffect(() => {
        // Ensure global loading element exists and is properly initialized
        ensureGlobalLoadingExists();

        const section = document.querySelector(".private-layout");
        section.scrollIntoView({ behavior: "smooth", block: "start" });

        document.title = (moduleName ?? title).toUpperCase() + " | " + appName;

        function handleResize() {
            setWidth(window.innerWidth);
            setSideMenuCollapse(window.innerWidth <= 768);
        }
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [title, moduleName]);

    return (
        <ClearCache>
            {({ isLatestVersion, emptyCacheStorage }) => (
                <>
                    <PreventDragRightClick />
                    
                    {!isLatestVersion && (
                        <div className="notification-notice">
                            <div className="notification-notice-content">
                                <div className="notification-notice-icon">
                                    <FontAwesomeIcon icon={faGifts} />
                                </div>
                                <div className="notification-notice-message">
                                    <div className="title">
                                        Updates Now Available
                                    </div>
                                    <div className="description">
                                        A new version of this Web App is ready
                                    </div>
                                    <div className="action">
                                        <Button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                emptyCacheStorage();
                                            }}
                                            icon={
                                                <FontAwesomeIcon
                                                    icon={faRefresh}
                                                />
                                            }
                                        >
                                            Refresh
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="globalLoading hidden">
                        <div className="loader">Loading...</div>
                    </div>

                    <GlobalSearchProvider>
                        <Layout
                            hasSider
                            className={`private-layout ${className ?? ""}`}
                            id={pageId ?? ""}
                        >
                            {/* Mobile menu overlay */}
                            <div 
                                className={`mobile-menu-overlay ${!sideMenuCollapse && width <= 768 ? 'visible' : ''}`}
                                onClick={() => setSideMenuCollapse(true)}
                            />
                            
                            <Sidemenu
                                location={location}
                                sideMenuCollapse={sideMenuCollapse}
                                setSideMenuCollapse={setSideMenuCollapse}
                                width={width}
                                menuItems={menuItems}
                                setMenuItems={setMenuItems}
                            />

                            <Layout
                                className={
                                    sideMenuCollapse
                                        ? "ant-layout-has-collapse"
                                        : ""
                                }
                            >
                                <Header
                                    sideMenuCollapse={sideMenuCollapse}
                                    setSideMenuCollapse={setSideMenuCollapse}
                                    width={width}
                                />

                            <Layout.Content
                                onClick={() => {
                                    if (width <= 767) {
                                        setSideMenuCollapse(true);
                                    }
                                }}
                            >
                                <Breadcrumb
                                    separator={<span className="arrow" />}
                                    items={[
                                        {
                                            title: (
                                                <Link to="/">
                                                    <FontAwesomeIcon
                                                        icon={faHome}
                                                    />
                                                </Link>
                                            ),
                                        },
                                        ...globalBreadcrumb.map(
                                            (item, index) => ({
                                                title: item.name,
                                                className: `${item.link ? 'cursor-pointer' : ''} font-14px breadcrumb-item-text ${
                                                    index ===
                                                    globalBreadcrumb.length - 1
                                                        ? "breadcrumb-item-last"
                                                        : ""
                                                }`,
                                                ...(item.link && {
                                                    onClick: () => navigate(item.link)
                                                }),
                                            })
                                        ),
                                    ]}
                                />

                                <Card variant="borderless">{children}</Card>
                            </Layout.Content>

                                <Footer />
                            </Layout>
                        </Layout>
                    </GlobalSearchProvider>
                </>
            )}
        </ClearCache>
    );
}
