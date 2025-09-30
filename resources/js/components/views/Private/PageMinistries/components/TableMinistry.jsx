import { useContext, useState, useEffect, useMemo } from "react";
import { Card, Button, Table, Space, Popconfirm, Col, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGear, faPencil, faTrash, faInboxIn, faPenToSquare } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";

import PageMinistryContext from "./PageMinistryContext";

export const MINISTRY_DATA = {
    "Worship Volunteers": [
        { id: 1, fullname: "John Doe", activities: "Choir Practice", date_scheduled: "2024-06-01", status: "active" },
        { id: 2, fullname: "Jane Smith", activities: "Sunday Mass", date_scheduled: "2024-06-02", status: "active" },
        { id: 3, fullname: "Michael Johnson", activities: "Worship Night", date_scheduled: "2024-06-15", status: "archive" },
        { id: 4, fullname: "Emily Davis", activities: "Prayer Gathering", date_scheduled: "2024-06-16", status: "archive" },
        { id: 29, fullname: "Lillian Parker", activities: "Special Needs Ministry", date_scheduled: "2024-06-29", status: "active" },
        { id: 30, fullname: "Samuel Edwards", activities: "Leadership Training", date_scheduled: "2024-06-30", status: "active" },
        { id: 31, fullname: "Madison Stewart", activities: "Worship Team Practice", date_scheduled: "2024-07-01", status: "active" },
        { id: 32, fullname: "Elijah Collins", activities: "Media Ministry", date_scheduled: "2024-07-02", status: "active" },
        { id: 33, fullname: "Natalie Sanchez", activities: "Drama Ministry", date_scheduled: "2024-07-03", status: "active" },
        { id: 34, fullname: "James Carter", activities: "Faith Workshop", date_scheduled: "2024-06-08", status: "active" },
        { id: 35, fullname: "Hannah Perez", activities: "Community Cleaning", date_scheduled: "2024-07-05", status: "active" },
        { id: 36, fullname: "Zachary Morgan", activities: "Tech Team Training", date_scheduled: "2024-07-06", status: "active" },
        { id: 37, fullname: "Victoria Rogers", activities: "Missionary Support", date_scheduled: "2024-07-07", status: "active" },
        { id: 38, fullname: "Caleb Rivera", activities: "Easter Preparation", date_scheduled: "2024-07-08", status: "active" },
        { id: 39, fullname: "Scarlett Foster", activities: "Youth Camp", date_scheduled: "2024-07-09", status: "active" },
        { id: 40, fullname: "Wyatt Gonzalez", activities: "Music Workshop", date_scheduled: "2024-07-10", status: "active" },
        { id: 41, fullname: "Penelope Simmons", activities: "Mission Trip Fundraiser", date_scheduled: "2024-07-11", status: "active" },
        { id: 42, fullname: "Daniel Bell", activities: "Orphanage Visit", date_scheduled: "2024-07-12", status: "active" },
        { id: 43, fullname: "Aurora Cook", activities: "Online Prayer Group", date_scheduled: "2024-07-13", status: "active" },
        { id: 44, fullname: "Leo Bailey", activities: "Teacher Training", date_scheduled: "2024-07-14", status: "active" },
        { id: 45, fullname: "Violet Cooper", activities: "Church Decorations", date_scheduled: "2024-07-15", status: "active" },
    ],

    "Evangelization Volunteers": [
        // { id: 5, fullname: "Alice Johnson", activities: "Bible Study", date_scheduled: "2024-06-03", status: "active" },
        // { id: 6, fullname: "Bob Williams", activities: "Missionary Work", date_scheduled: "2024-06-04", status: "active" },
        { id: 5, fullname: "Sophia Lee", activities: "Street Preaching", date_scheduled: "2024-06-17", status: "archive" },
        { id: 6, fullname: "Daniel Clark", activities: "Gospel Sharing", date_scheduled: "2024-06-18", status: "archive" }
    ],

    "Social Services Volunteers": [
        { id: 9, fullname: "Charlie Brown", activities: "Charity Work", date_scheduled: "2024-06-05", status: "active" },
        { id: 10, fullname: "Diana Prince", activities: "Community Service", date_scheduled: "2024-06-06", status: "active" },
        { id: 11, fullname: "Olivia Harris", activities: "Food Drive", date_scheduled: "2024-06-19", status: "archive" },
        { id: 12, fullname: "Ethan Wright", activities: "Disaster Relief", date_scheduled: "2024-06-20", status: "archive" }
    ],

    "Temporalities Volunteers": [
        { id: 13, fullname: "Edward Norton", activities: "Church Maintenance", date_scheduled: "2024-06-07", status: "active" },
        { id: 14, fullname: "Fiona Gallagher", activities: "Fundraising", date_scheduled: "2024-06-08", status: "active" },
        { id: 15, fullname: "Mason Brooks", activities: "Building Repairs", date_scheduled: "2024-06-21", status: "archive" },
        { id: 16, fullname: "Emma Scott", activities: "Equipment Check", date_scheduled: "2024-06-22", status: "archive" }
    ],

    "Organization Volunteers": [
        { id: 17, fullname: "George Martin", activities: "Event Planning", date_scheduled: "2024-06-09", status: "active" },
        { id: 18, fullname: "Hannah Baker", activities: "Leadership Training", date_scheduled: "2024-06-10", status: "active" },
        { id: 19, fullname: "Noah Mitchell", activities: "Volunteer Coordination", date_scheduled: "2024-06-23", status: "archive" },
        { id: 20, fullname: "Ava Richardson", activities: "Logistics Management", date_scheduled: "2024-06-24", status: "archive" }
    ],

    "Youth Volunteers": [
        { id: 21, fullname: "Ian Carter", activities: "Youth Camp", date_scheduled: "2024-06-11", status: "active" },
        { id: 22, fullname: "Jessica Alba", activities: "Sports Festival", date_scheduled: "2024-06-12", status: "active" },
        { id: 23, fullname: "Benjamin Carter", activities: "Youth Fellowship", date_scheduled: "2024-06-25", status: "archive" },
        { id: 24, fullname: "Sophia Martinez", activities: "Teen Worship Night", date_scheduled: "2024-06-26", status: "archive" }
    ],

    "Vocation Volunteers": [
        { id: 25, fullname: "Kevin Hart", activities: "Seminary Visit", date_scheduled: "2024-06-13", status: "active" },
        { id: 26, fullname: "Laura Croft", activities: "Spiritual Retreat", date_scheduled: "2024-06-14", status: "active" },
        { id: 27, fullname: "Henry Adams", activities: "Priesthood Discernment", date_scheduled: "2024-06-27", status: "archive" },
        { id: 28, fullname: "Grace Thompson", activities: "Religious Formation", date_scheduled: "2024-06-28", status: "archive" }
    ]

};

export default function TableMinistry({ tableFilter, setTableFilter }) {
    const { tabActive, viewMode } = useContext(PageMinistryContext);

    const safeTableFilter = tableFilter || { page: 1, page_size: 50, search: "" };

    const filteredData = useMemo(() => {
        return (MINISTRY_DATA[tabActive] || []).filter((item) => item.status === viewMode);
    }, [tabActive, viewMode]);

    const [currentPageData, setCurrentPageData] = useState([]);

    useEffect(() => {
        setTableFilter((prev) => ({
            ...prev,
            page: 1,
        }));
    }, [tabActive]);

    useEffect(() => {
        const start = (safeTableFilter.page - 1) * safeTableFilter.page_size;
        const end = start + safeTableFilter.page_size;
        setCurrentPageData(filteredData.slice(start, end));
    }, [safeTableFilter.page, safeTableFilter.page_size, filteredData]);

    const handleDeactivate = (record) => {
        console.log("Deactivating record: ", record);
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setTableFilter((prev) => ({
            ...prev,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: pagination.current,
            page_size: pagination.pageSize,
        }));
    };

    return (
        <>
            {/* Top Pagination & Search */}
            <Col xs={24} sm={24} md={24} lg={24}>
                <Flex justify="space-between" align="center" className="tbl-top-filter">
                    <TableGlobalSearchAnimated
                        tableFilter={safeTableFilter}
                        setTableFilter={setTableFilter}
                    />
                    <Flex justify="end" align="center">
                        <TableShowingEntriesV2 total={filteredData.length} />
                        <TablePagination
                            tableFilter={safeTableFilter}
                            setTableFilter={setTableFilter}
                            total={filteredData.length}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_wrapper"
                        />
                    </Flex>
                </Flex>
            </Col>

            {/* Table */}
            <Table
                id="tbl_profile"
                className="ant-table-default ant-table-striped"
                dataSource={currentPageData}
                rowKey={(record) => record.id}
                pagination={false}
                onChange={handleTableChange}
                bordered={false}
                scroll={{ x: "max-content" }}
                sticky
            >
                <Table.Column
                    title="Action"
                    key="action"
                    dataIndex="action"
                    align="center"
                    render={(text, record) => (
                        <Space size="middle">
                            <Button
                                type="link"
                                onClick={() => alert(`Edit Permission for ${record.fullname}`)}
                                icon={<FontAwesomeIcon icon={faInboxIn} />}
                            />
                            <Button
                                type="link"
                                onClick={() => alert(`Edit ${record.fullname}`)}
                                icon={<FontAwesomeIcon icon={faPenToSquare} />}
                            />

                        </Space>
                    )}
                    width={150}
                />

                <Table.Column
                    title="Full Name"
                    key="fullname"
                    dataIndex="fullname"
                    sorter
                    render={(text) => (
                        <Button type="link" className="p-0 w-auto h-auto" onClick={() => alert(`Viewing ${text}`)}>
                            {text}
                        </Button>
                    )}
                    width={220}
                />

                <Table.Column title="Activities" key="activities" dataIndex="activities" sorter width={150} />

                <Table.Column
                    title="Date Schedule"
                    key="date_scheduled"
                    dataIndex="date_scheduled"
                    render={(text) => (text ? dayjs(text).format("MM/DD/YYYY") : "")}
                    sorter
                    width={150}
                />
            </Table>

            {/* Bottom Pagination */}
            <Col xs={24} sm={24} md={24} lg={24}>
                <Flex justify="space-between" align="center" className="tbl-bottom-filter">
                    <div />
                    <Flex align="center">
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={safeTableFilter}
                            setTableFilter={setTableFilter}
                            total={filteredData.length}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_wrapper"
                        />
                    </Flex>
                </Flex>
            </Col>
        </>
    );
}
