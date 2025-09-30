import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown, Image, Layout, Typography, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPowerOff } from "@fortawesome/pro-light-svg-icons";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { faBell /*, faMessageMinus */ } from "@fortawesome/pro-solid-svg-icons";

import {
    apiUrl,
    defaultProfile,
    role,
    userData,
} from "../../providers/appConfig";
// TEMPORARILY DISABLED - Conversation/Messaging Feature
// import ModalMessage from "./components/ModalMessage";
import GlobalSearchBar from "../../common/GlobalSearchBar";

export default function Header(props) {
    const { width, sideMenuCollapse, setSideMenuCollapse } = props;

    const [profilePicture, setProfilePicture] = useState(defaultProfile);

    // TEMPORARILY DISABLED - Conversation/Messaging Feature
    // const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (userData().profile_picture) {
            let profile_picture = userData().profile_picture.split("//");

            if (
                profile_picture[0] === "http:" ||
                profile_picture[0] === "https:"
            ) {
                setProfilePicture(userData().profile_picture);
            } else {
                setProfilePicture(apiUrl(userData().profile_picture));
            }
        }

        return () => {};
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userdata");
        window.location.reload();
    };

    const menuNotification = () => {
        const items = [
            {
                label: "Notifications",
                key: "0",
            },

            {
                type: "divider",
            },

            {
                label: "No notification",
                key: "1",
            },
        ];

        return items;
    };

    const menuProfile = () => {
        const items = [
            {
                key: "/account/details",
                className: "menu-item-profile-details",
                label: (
                    <div className="menu-item-details-wrapper">
                        <div className="profile-avatar-wrapper">
                            <Image
                                preview={false}
                                src={profilePicture}
                                alt={`${userData().firstname} ${userData().lastname}`}
                                className="profile-avatar"
                            />
                            <div className="avatar-status-indicator"></div>
                        </div>

                        <div className="info-wrapper">
                            <Typography.Text className="info-username">
                                {`${userData().firstname} ${userData().lastname}`}
                            </Typography.Text>
                            <Typography.Text className="info-role">
                                {role()}
                            </Typography.Text>
                            <Typography.Text className="info-status">
                                Online
                            </Typography.Text>
                        </div>
                    </div>
                ),
            },
            {
                type: "divider",
                className: "profile-menu-divider"
            },
            {
                key: "/edit-profile",
                className: "menu-item-action",
                icon: <FontAwesomeIcon icon={faEdit} className="menu-icon" />,
                label: (
                    <Link to="/edit-profile" className="menu-link">
                        <span className="menu-text">Edit Profile</span>
                        <span className="menu-description">Update your account information</span>
                    </Link>
                ),
            },
        ];

        items.push({
            type: "divider",
            className: "profile-menu-divider logout-divider"
        });

        items.push({
            key: "/signout",
            className: "ant-menu-item-logout menu-item-action",
            icon: <FontAwesomeIcon icon={faPowerOff} className="menu-icon logout-icon" />,
            label: (
                <Typography.Link onClick={handleLogout} className="menu-link logout-link">
                    <span className="menu-text">Sign Out</span>
                    <span className="menu-description">Logout from your account</span>
                </Typography.Link>
            ),
        });

        return items;
    };

    return (
        <Layout.Header>
            <div className="header-left-menu">
                {width < 768 ? (
                    <div className="menu-left-icon menu-left-icon-menu-collapse-on-close">
                        {sideMenuCollapse ? (
                            <MenuUnfoldOutlined
                                onClick={() => setSideMenuCollapse(false)}
                                className="menuCollapseOnClose"
                            />
                        ) : (
                            <MenuFoldOutlined
                                onClick={() => setSideMenuCollapse(true)}
                                className="menuCollapseOnClose"
                            />
                        )}
                    </div>
                ) : null}
                
                {/* Desktop Search Bar */}
                {width >= 768 && (
                    <div className="header-search-container" style={{ 
                        flex: 1, 
                        maxWidth: 400, 
                        marginLeft: 20,
                        marginRight: 20 
                    }}>
                        <GlobalSearchBar isMobile={false} />
                    </div>
                )}
            </div>

            <div className="header-center-menu">
                {/* Mobile Search Button - replaces title on small screens */}
                {width < 768 && width >= 480 && (
                    <div className="header-search-mobile" style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 10,
                        marginRight: 10
                    }}>
                        <GlobalSearchBar isMobile={true} />
                    </div>
                )}

                {/* Very small screens - show both search button and compact title */}
                {width < 480 && (
                    <Flex align="center" justify="space-between" style={{ width: '100%' }}>
                        <GlobalSearchBar isMobile={true} />
                        <Typography.Title level={5} className="header-title" style={{
                            margin: 0,
                            fontSize: '12px',
                            color: 'var(--ant-color-text-secondary)'
                        }}>
                            FSUU
                        </Typography.Title>
                    </Flex>
                )}
                
                {/* Desktop Title */}
                {width >= 768 && (
                    <Typography.Title level={4} className="header-title" style={{
                        margin: 0,
                        whiteSpace: 'nowrap',
                        fontSize: '16px',
                        color: 'var(--ant-color-text)'
                    }}>
                        FSUU REGISTRAR
                    </Typography.Title>
                )}

                {/* Medium screens - only search button, no title */}
                {width >= 480 && width < 768 && (
                    <div style={{ display: 'none' }}></div>
                )}
            </div>

            <div className="header-right-menu">

                {/* TEMPORARILY DISABLED - Conversation/Messaging Feature */}
                {/* <FontAwesomeIcon
                    className="menu-submenu-message"
                    icon={faMessageMinus}
                    onClick={() => setIsModalOpen(true)}
                /> */}

                <Dropdown
                    menu={{
                        items: menuNotification(),
                    }}
                    placement="bottomRight"
                    overlayClassName="menu-submenu-notification-popup"
                    trigger={["click"]}
                >
                    <FontAwesomeIcon
                        className="menu-submenu-notification"
                        icon={faBell}
                    />
                </Dropdown>

                <Dropdown
                    menu={{
                        items: menuProfile(),
                    }}
                    placement="bottomRight"
                    overlayClassName="menu-submenu-profile-popup modern-profile-dropdown"
                    trigger={["click"]}
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                    <div 
                        className="menu-submenu-profile-trigger"
                        role="button"
                        tabIndex={0}
                        aria-label={`Profile menu for ${userData().firstname} ${userData().lastname}`}
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <div className="profile-trigger-content">
                            <Image
                                preview={false}
                                rootClassName="menu-submenu-profile"
                                src={profilePicture}
                                alt={`${userData().firstname} ${userData().lastname}`}
                                className="profile-trigger-avatar"
                            />
                            <div className="profile-trigger-indicator">
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </Dropdown>
            </div>

            {/* TEMPORARILY DISABLED - Conversation/Messaging Feature */}
            {/* <ModalMessage
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            /> */}
        </Layout.Header>
    );
}

Header.propTypes = {
    width: PropTypes.number,
    sideMenuCollapse: PropTypes.bool,
    setSideMenuCollapse: PropTypes.func,
};
