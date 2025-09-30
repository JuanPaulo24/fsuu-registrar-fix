import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Col, Row } from "antd";

import CustomTabs from "../../../../providers/CustomTabs";
import PagePaymentContent from "./components/PagePaymentContent";

export default function PagePayment() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract tab from URL or default to "Email Template"
    const urlParams = new URLSearchParams(location.search);
    const defaultTab = urlParams.get("tab") || "Payment";

    const [tabActive, setTabActive] = useState(defaultTab);

    useEffect(() => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabActive);
    
        // Set status for breadcrumb
        if (tabActive !== "Historical Data") {
            newParams.set("status", "Active"); // or "Archive", depending on default state
        }
    
        navigate(`?${newParams.toString()}`, { replace: true });
    }, [tabActive, navigate]);

    const tabItems = [
        { key: "Payment", label: "Payment" },
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
                <>
                    <PagePaymentContent tabActive={tabActive} />
                </>
            </Col>
        </Row>
    );
}
