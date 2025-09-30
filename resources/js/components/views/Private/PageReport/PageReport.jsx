import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CustomTabs from "../../../providers/CustomTabs";
import TabItemReportAll from "./components/TabItemReportAll";
import TabItemReportFinances from "./components/TabItemReportFinances";
import TabItemReportPastoralCoWorkers from "./components/TabItemReportPastoralCoWorkers";
import TabItemReportPopulation from "./components/TabItemReportPopulation";
import TabItemReportSacramentalAndPastoralLife from "./components/TabItemReportSacramentalAndPastoralLife";
import TabItemReportTerritoryClusters from "./components/TabItemReportTerritoryClusters";

export default function PageReport() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract tab from URL or default to "tab1"
    const urlParams = new URLSearchParams(location.search);
    const defaultTab = urlParams.get("tab") || "All";

    const [tabActive, setTabActive] = useState(defaultTab);

    useEffect(() => {
        // Update the URL with the selected tab (without reloading)
        navigate(`?tab=${encodeURIComponent(tabActive)}`, { replace: true });
    }, [tabActive, navigate]);

    // Define tab items
    const tabItems = [
        { key: "All", label: "All", component: <TabItemReportAll /> },
        { key: "Territory/Clusters", label: "Territory/Clusters", component: <TabItemReportTerritoryClusters /> },
        { key: "Population", label: "Population", component: <TabItemReportPopulation /> },
        { key: "Sacramental and Pastoral Life", label: "Sacramental and Pastoral Life", component: <TabItemReportSacramentalAndPastoralLife /> },
        { key: "Pastoral Co-Workers", label: "Pastoral Co-Workers", component: <TabItemReportPastoralCoWorkers /> },
        { key: "Finances", label: "Finances", component: <TabItemReportFinances /> },
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
