import { useState } from "react";
import { Tabs } from "antd";

import TablePermission from "./TablePermission";

export default function TabSystem(props) {
    const { tabParentActive, userRoleId } = props;

    const [systemId, setSystemId] = useState("1");

    let ITEMS = [
        {
            value: "1",
            label: "OPIS",
        },
        {
            value: "2",
            label: "Faculty Monitoring",
        },
        {
            value: "3",
            label: "Guidance",
        },
        {
            value: "4",
            label: "Evaluation",
        },
        {
            value: "5",
            label: "ECOM",
        },
        {
            value: "6",
            label: "Scholarship",
        },
    ];

    return (
        <Tabs
            defaultActiveKey="1"
            onChange={(key) => setSystemId(key)}
            size="small"
            items={ITEMS.map((item) => ({
                key: item.value,
                label: item.label,
                children: (
                    <TablePermission
                        tabParentActive={tabParentActive}
                        systemId={systemId}
                        userRoleId={userRoleId}
                    />
                ),
            }))}
        />
    );
}
