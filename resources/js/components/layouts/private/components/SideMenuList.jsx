import { Menu } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faUsers,
    faShieldKeyhole,
    faCog,
    faCalendar,
    faChartLine,
    faBook,
    faChurch,
    faWallet,
    faEnvelope,
    faClockRotateLeft,
    faHistory,
    faFileText,
    faGraduationCap,
    faLifeRing,
    faUserCircle,
    faClipboardList,
    faHeadset,
    faInfoCircle,
    faQrcode,
} from "@fortawesome/pro-regular-svg-icons";

export const adminHeaderMenuLeft = (
    <>
        {/* <div className="ant-menu-left-icon">
            <Link to="/subscribers/current">
                <span className="anticon">
                    <FontAwesomeIcon icon={faUsers} />
                </span>
                <Typography.Text>Subscribers</Typography.Text>
            </Link>
        </div> */}
    </>
);

export const adminHeaderDropDownMenuLeft = () => {
    const items = [
        // {
        //     key: "/subscribers/current",
        //     icon: <FontAwesomeIcon icon={faUsers} />,
        //     label: <Link to="/subscribers/current">Subscribers</Link>,
        // },
    ];

    return <Menu items={items} />;
};

export const adminSideMenu = [
    {
        title: "Dashboard",
        path: "/dashboard-view",
        icon: <FontAwesomeIcon icon={faHome} />,
        moduleCode: "M-01",
        moduleName: "Dashboard",
    },
    {
        title: "Student Profiles",
        path: "/student-profile",
        icon: <FontAwesomeIcon icon={faUserCircle} />,
        moduleCode: "M-02",
        moduleName: "Student Profiles",
    },
    {
        title: "Users",
        path: "/users",
        icon: <FontAwesomeIcon icon={faUsers} />,
        moduleCode: "M-03",
        moduleName: "Users",
    },
    {
        title: "Email",
        path: "/email",
        icon: <FontAwesomeIcon icon={faEnvelope} />,
        moduleCode: "M-04",
        moduleName: "Email",
    },
    {
        title: "QR Scanner",
        path: "/qr-scanner",
        icon: <FontAwesomeIcon icon={faQrcode} />,
        moduleCode: "M-05",
        moduleName: "QR Scanner",
    },
    {
        title: "Document Management",
        path: "/document-management",
        icon: <FontAwesomeIcon icon={faFileText} />,
        moduleCode: "M-06",
        moduleName: "Document Management",
    },
    {
        title: "Information Panel",
        path: "/information-panel",
        icon: <FontAwesomeIcon icon={faInfoCircle} />,
        moduleCode: "M-07",
        moduleName: "Information Panel",
    },
    {
        type: "divider",
        key: "divider-1",
    },
    {
        title: "Support",
        path: "/support",
        icon: <FontAwesomeIcon icon={faHeadset} />,
        moduleCode: "M-08",
        moduleName: "Support",
    },
    {
        title: "System Configurations",
        path: "/system-configurations",
        icon: <FontAwesomeIcon icon={faCog} />,
        moduleCode: "M-09",
        moduleName: "System Configurations",
    }
];

/**
 * Filter admin side menu based on user's accessible modules
 * @param {Array} userModules - Array of modules user has access to
 * @returns {Array} - Filtered menu items
 */
export const getFilteredAdminSideMenu = (userModules) => {
    if (!userModules || userModules.length === 0) {
        return [];
    }

    // Create a Set of accessible module codes for faster lookup
    const accessibleModuleCodes = new Set(userModules.map(module => module.module_code));

    return adminSideMenu.filter(menuItem => {
        // Keep dividers and special items (they don't have moduleCode)
        if (menuItem.type === "divider" || !menuItem.moduleCode) {
            return true;
        }

        // Check if user has access to this module
        return accessibleModuleCodes.has(menuItem.moduleCode);
    });
};
