import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Col, Row } from "antd";

import CustomTabs from "../../../providers/CustomTabs";
import PageMinistryContent from "./components/PageMinistryContent";

export default function PageMinistries() {
    const location = useLocation();
    const navigate = useNavigate();

    const urlParams = new URLSearchParams(location.search);
    const defaultTab = urlParams.get("tab") || "Worship Volunteers";

    const [tabActive, setTabActive] = useState(defaultTab);

    useEffect(() => {
        const newParams = new URLSearchParams();
        newParams.set("tab", tabActive);
        newParams.set("status", "Active");
        navigate(`?${newParams.toString()}`, { replace: true });
    }, [tabActive, navigate]);

    const tabItems = [
        { key: "Worship Volunteers", label: "Worship" },
        { key: "Evangelization Volunteers", label: "Evangelization" },
        { key: "Social Services Volunteers", label: "Social Services" },
        { key: "Temporalities Volunteers", label: "Temporalities" },
        { key: "Organization Volunteers", label: "Organization" },
        { key: "Youth Volunteers", label: "Youth" },
        { key: "Vocation Volunteers", label: "Vocation" },
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
                    <PageMinistryContent tabActive={tabActive} />
                </Card>
            </Col>
        </Row>
    );
}
