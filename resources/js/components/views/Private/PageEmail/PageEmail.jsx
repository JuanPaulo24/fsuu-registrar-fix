import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Card, Typography, Space } from "antd";
import CustomTabs from "../../../providers/CustomTabs";
import TabSystemEmail from "./components/TabSystemEmail/TabSystemEmail";
import TabSystemEmailTemplate from "./components/TabSystemEmailTemplate/PageEmailTemplate";
import { filterAccessibleTabs } from "@/hooks/useTabPermissions";

const { Title, Text } = Typography;

export default function PageEmail() {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [tabActive, setTabActive] = useState("");

    // Extract compose data from navigation state
    const composeData = location?.state?.composeData;

    // Define all possible tabs with permission codes
    const allTabItems = [
        {
            key: "Email",
            label: "Email",
            children: <TabSystemEmail initialComposeData={composeData} isTabActive={tabActive === "Email"} />,
            permissionCode: "M-04-EMAIL"
        },
        {
            key: "Email Template",
            label: "Email Template", 
            children: <TabSystemEmailTemplate />,
            permissionCode: "M-04-TEMPLATE"
        }
    ];

    // Filter tabs based on permissions from localStorage
    const accessibleTabs = filterAccessibleTabs("Email", allTabItems);
    const firstAccessibleTab = accessibleTabs.length > 0 ? accessibleTabs[0].key : null;

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        const tabFromState = location?.state?.tab;
        
        // If no accessible tabs, don't set any tab
        if (!firstAccessibleTab) {
            return;
        }
        
        // If compose data is provided, automatically go to Email tab (if accessible)
        if (composeData) {
            const emailTabAccessible = accessibleTabs.some(tab => tab.key === "Email");
            if (emailTabAccessible) {
                setTabActive("Email");
                setSearchParams({ tab: "Email" }, { replace: true });
                return;
            }
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
    }, [searchParams, location?.state?.tab, composeData, setSearchParams]);

    // If no accessible tabs, show message
    if (accessibleTabs.length === 0) {
        return (
            <Card>
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <div className="module-header">
                        <Title level={3} className="module-title">
                            Email Management
                        </Title>
                        <Text type="secondary" className="module-description">
                            Configure email settings and manage email templates
                        </Text>
                    </div>
                    
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Text type="secondary">
                            You don't have permission to access any email features.
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
                        Email Management
                    </Title>
                    <Text type="secondary" className="module-description">
                        Configure email settings and manage email templates
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
