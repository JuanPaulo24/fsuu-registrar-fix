import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Col, Row } from "antd";

import CustomTabs from "../../../providers/CustomTabs";
import PageEmailContent from "./components/PageEmailContent";

export default function PageEmailTemplate() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract tab from URL or default to "Email Template"
    const urlParams = new URLSearchParams(location.search);
    const defaultTab = urlParams.get("tab") || "Email Template";

    const [tabActive, setTabActive] = useState(defaultTab);

    useEffect(() => {
        // Update URL when tab changes
        navigate(`?tab=${encodeURIComponent(tabActive)}`, { replace: true });
    }, [tabActive, navigate]);

    const tabItems = [
        { key: "Email Template", label: "Email Template" },
        { key: "Historical Data", label: "Historical Data" },
    ];

    return (
        <Row>
            <Col xs={24} md={24} lg={24} xl={24}>
                <CustomTabs
                    active={tabActive}
                    onChange={(key) => setTabActive(key)}
                    items={tabItems.map(({ key, label }) => ({
                        key,
                        label,
                        children: <></>,
                    }))}
                />
                <Card>
                    <PageEmailContent tabActive={tabActive} />
                </Card>
            </Col>
        </Row>
    );
}
