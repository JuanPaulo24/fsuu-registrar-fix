import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CustomTabs from "../../../providers/CustomTabs";
import TabItemParish from "../PageParish/components/TabItemParish";
import TabItemHistoricalData from "../PageParish/components/TabItemHistoricalData";

export default function PageParish() {
    const location = useLocation();
    const navigate = useNavigate();

    const urlParams = new URLSearchParams(location.search);
    const defaultTab = urlParams.get("tab") || "Parish";

    const [tabActive, setTabActive] = useState(defaultTab);

    useEffect(() => {
        navigate(`?tab=${encodeURIComponent(tabActive)}`, { replace: true });
    }, [tabActive, navigate]);

    const tabItems = [
        { key: "Parish", label: "Parish", component: <TabItemParish /> },
        { key: "Historical Data", label: "Historical Data", component: <TabItemHistoricalData /> }
    ];

    return (
        <CustomTabs
            active={tabActive}
            onChange={(key) => setTabActive(key)}
            items={tabItems.map(({ key, label, component }) => ({
                key,
                label,
                children: component,
            }))}
        />
    );
}
