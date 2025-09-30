import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Card, Typography, Space } from "antd";
import CustomTabs from "../../../providers/CustomTabs";
import TabSystemConfigurationsRoles from "./components/TabSystemConfigurationsRolesPermission/TabSystemConfigurationsRolesPermission";
import TabSystemConfigurationsLoginLogs from "./components/TabSystemConfigurationsLoginLogs/TabSystemConfigurationsLoginLogs";
import TabSystemConfigurationsCourse from "./components/TabSystemConfigurationsCourses/TabSystemConfigurationsCourse";
import TabSystemConfigurationsUsers from "./components/TabSystemConfigurationsUsers/TabSystemConfigurationsUser";
import TabSystemConfigurationsQRHistory from "./components/TabSystemConfigurationsQRHistory/TabSystemConfigurationsQRHistory";
import { filterAccessibleTabs } from "@/hooks/useTabPermissions";

const { Title, Text } = Typography;

export default function PageSystemConfigurations() {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [tabActive, setTabActive] = useState("");

    // Define all possible tabs with permission codes
    const allTabItems = [
        {
            key: "Users",
            label: "Users",
            children: <TabSystemConfigurationsUsers />,
            permissionCode: "M-09-USERS"
        },
        {
            key: "Titles",
            label: "Titles", 
            children: <TabSystemConfigurationsCourse />,
            permissionCode: "M-09-TITLES"
        },
        {
            key: "Roles and Permissions",
            label: "Roles and Permissions",
            children: <TabSystemConfigurationsRoles />,
            permissionCode: "M-09-ROLES"
        },
        {
            key: "LoginLogs",
            label: "Login Logs",
            children: <TabSystemConfigurationsLoginLogs />,
            permissionCode: "M-09-LOGS"
        },
        {
            key: "QRHistory",
            label: "QR History",
            children: <TabSystemConfigurationsQRHistory />,
            permissionCode: "M-09-QR"
        }
    ];

    // Filter tabs based on permissions from localStorage
    const accessibleTabs = filterAccessibleTabs("System Configurations", allTabItems);
    const firstAccessibleTab = accessibleTabs.length > 0 ? accessibleTabs[0].key : null;

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        const tabFromState = location?.state?.tab;
        
        // If no accessible tabs, don't set any tab
        if (!firstAccessibleTab) {
            return;
        }
        
        // If no tab in URL, redirect to first accessible tab
        if (!tabFromUrl && !tabFromState) {
            setSearchParams({ tab: firstAccessibleTab }, { replace: true });
            setTabActive(firstAccessibleTab);
            return;
        }
        
        // Check if preferred tab is accessible
        const preferredTab = tabFromUrl || tabFromState || firstAccessibleTab;
        const isTabAccessible = accessibleTabs.some(tab => tab.key === preferredTab);
        
        if (isTabAccessible) {
            setTabActive(preferredTab);
        } else if (!isTabAccessible && preferredTab !== firstAccessibleTab) {
            // If preferred tab is not accessible, redirect to first accessible tab
            setSearchParams({ tab: firstAccessibleTab }, { replace: true });
            setTabActive(firstAccessibleTab);
        }
    }, [searchParams, location?.state?.tab, setSearchParams]);

    // If no accessible tabs, show message
    if (accessibleTabs.length === 0) {
        return (
            <Card>
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <div className="module-header">
                        <Title level={3} className="module-title">
                            System Configurations
                        </Title>
                        <Text type="secondary" className="module-description">
                            Configure system settings, users, roles, and permissions
                        </Text>
                    </div>
                    
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Text type="secondary">
                            You don't have permission to access any system configuration features.
                        </Text>
                    </div>
                </Space>
            </Card>
        );
    }

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div className="module-header">
                    <Title level={3} className="module-title">
                        System Configurations
                    </Title>
                    <Text type="secondary" className="module-description">
                        Configure system settings, users, roles, and permissions
                    </Text>
                </div>

                <CustomTabs
                    activeKey={tabActive}
                    onChange={(key) => {
                        setTabActive(key);
                        setSearchParams({ tab: key });
                    }}
                    items={accessibleTabs}
                />
            </Space>
        </Card>
    );
}
