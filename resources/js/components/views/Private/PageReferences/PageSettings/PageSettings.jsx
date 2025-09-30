import React, { useState } from "react";
import { Tabs } from "antd/lib";

import PageUserRole from "../PageUserRole/PageUserRole";
import PageBuilding from "../PageBuilding/PageBuilding";
import PageFloor from "../PageFloor/PageFloor";
import PageRoom from "../PageRoom/PageRoom";
import PageSubject from "../PageSubject/PageSubject";
import PageDepartment from "../PageDepartment/PageDepartment";
import PageStatus from "../PageStatus/PageStatus";
import PageStatusCategory from "../PageStatusCategory/PageStatusCategory";
import PageDaySchedule from "../PageDaySchedule/PageDaySchedule";
import PageRate from "../PageRate/PageRate";
import PagePosition from "../PagePosition/PagePosition";
import PageSection from "../PageSection/PageSection";
import PageTimeSchedule from "../PageTimeSchedule/PageTimeSchedule";
import PageSchoolYear from "../PageSchoolYear/PageSchoolYear";
import PageCourse from "../PageCourse/PageCourse";

export default function PageSettings() {
    const [activeTab, setActiveTab] = useState("1");

    const tabListTitle = [
        {
            key: "2",
            label: "Building",
            children: <PageBuilding activeTab={activeTab} />,
        },
        {
            key: "3",
            label: "Floor",
            children: <PageFloor activeTab={activeTab} />,
        },
        {
            key: "4",
            label: "Room",
            children: <PageRoom activeTab={activeTab} />,
        },
        {
            key: "5",
            label: "Department",
            children: <PageDepartment activeTab={activeTab} />,
        },
        {
            key: "6",
            label: "Course",
            children: <PageCourse activeTab={activeTab} />,
        },
        {
            key: "7",
            label: "Time Schedule",
            children: <PageTimeSchedule activeTab={activeTab} />,
        },
        {
            key: "8",
            label: "Day Schedule",
            children: <PageDaySchedule activeTab={activeTab} />,
        },
        {
            key: "9",
            label: "School Year",
            children: <PageSchoolYear activeTab={activeTab} />,
        },

        {
            key: "10",
            label: "Section",
            children: <PageSection activeTab={activeTab} />,
        },
        {
            key: "11",
            label: "Subject",
            children: <PageSubject activeTab={activeTab} />,
        },
        {
            key: "12",
            label: "Position",
            children: <PagePosition activeTab={activeTab} />,
        },
        {
            key: "13",
            label: "Rate",
            children: <PageRate activeTab={activeTab} />,
        },
        {
            key: "14",
            label: "Status Category",
            children: <PageStatusCategory activeTab={activeTab} />,
        },
        {
            key: "15",
            label: "Status",
            children: <PageStatus activeTab={activeTab} />,
        },
    ];

    const onChange = (key) => {
        console.log(key);
        setActiveTab(key);
    };

    return (
        <Tabs
            defaultActiveKey="1"
            onChange={onChange}
            type="card"
            items={tabListTitle}
        />
    );
}
