import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Col } from "antd";
import CustomTabs from "../../../../providers/CustomTabs";
import TabItemHistoricalData from "./components/TabItemHistoricalData";
import TabItemDonations from "./components/TabItemDonations";

export default function PageDonations() {
    const location = useLocation();
    const navigate = useNavigate();

    const urlParams = new URLSearchParams(location.search);
    const defaultTab = urlParams.get("tab") || "Donations";
    const defaultStatus = urlParams.get("status") || "Active";

    const [tabActive, setTabActive] = useState(defaultTab);
    const [activeStatus, setActiveStatus] = useState(defaultStatus);

    // ✅ Sync tab + status into the URL, but only include `status` on "Donations"
    useEffect(() => {
        const params = new URLSearchParams();
        params.set("tab", tabActive);
        if (tabActive === "Donations") {
            params.set("status", activeStatus);
        }
        navigate(`?${params.toString()}`, { replace: true });
    }, [tabActive, activeStatus, navigate]);

    return (
        <Row>
            <Col xs={24}>
                <CustomTabs
                    active={tabActive}
                    onChange={(key) => setTabActive(key)}
                    items={[
                        {
                            key: "Donations",
                            label: "Donations",
                            children: (
                                <TabItemDonations
                                    activeStatus={activeStatus}
                                    setActiveStatus={setActiveStatus}
                                />
                            ),
                        },
                        {
                            key: "Historical Data",
                            label: "Historical Data",
                            children: <TabItemHistoricalData />,
                        },
                    ]}
                />
            </Col>
        </Row>
    );
}
