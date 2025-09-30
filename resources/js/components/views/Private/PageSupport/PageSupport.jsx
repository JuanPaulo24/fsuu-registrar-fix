import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Card, Typography, Space } from "antd";
import CustomTabs from "../../../providers/CustomTabs";
import TabSystemManual from "./components/TabSystemManual/TabSystemManual";
import TabContactInformation from "./components/TabContactInformation/TabContactInformation";
import TabSystemStatus from "./components/TabSystemStatus/TabSystemStatus";
import { filterAccessibleTabs } from "@/hooks/useTabPermissions";

const { Title, Text } = Typography;

export default function PageSupport() {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [tabActive, setTabActive] = useState("");

    // Define all possible tabs
    const allTabItems = [
        {
            key: "SystemManual",
            label: "System Manual",
            children: <TabSystemManual />,
            permissionCode: "M-08-MANUAL"
        },
        {
            key: "ContactInformation", 
            label: "Contact Information",
            children: <TabContactInformation />,
            permissionCode: "M-08-CONTACT"
        },
        {
            key: "SystemStatus",
            label: "System Status", 
            children: <TabSystemStatus />,
            permissionCode: "M-08-STATUS"
        }
    ];
    
    // Filter tabs based on permissions from localStorage
    const accessibleTabs = filterAccessibleTabs("Support", allTabItems);
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
                            Support Center
                        </Title>
                        <Text type="secondary" className="module-description">
                            Technical support, contact information, and system status
                        </Text>
                    </div>
                    
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Text type="secondary">
                            You don't have permission to access any support features.
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
                        Support Center
                    </Title>
                    <Text type="secondary" className="module-description">
                        Technical support, contact information, and system status
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
