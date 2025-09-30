import React, { useState, useEffect } from "react";
import { Table, Col, Flex } from "antd";
import { TablePageSize, TablePagination, TableGlobalSearchAnimated, TableShowingEntriesV2 } from "../../../../providers/CustomTableFilter";
import staticData from "../components/TemplateHistoricalStaticData.json"

const TableHistoricalData = () => {
    const [tableFilter, setTableFilter] = useState({ page: 1, page_size: 10 });
    const totalRecords = 15;

    const columns = [
        { title: "Time Stamp", dataIndex: "timestamp", key: "timestamp" },
        { title: "Edited By", dataIndex: "editedBy", key: "editedBy" },
        { title: "Subject Updated", dataIndex: "subjectUpdated", key: "subjectUpdated" },
        { title: "Full Name", dataIndex: "fullName", key: "fullName" },
        { title: "Field", dataIndex: "field", key: "field" },
        { title: "Old Value", dataIndex: "oldValue", key: "oldValue" },
        { title: "New Value", dataIndex: "newValue", key: "newValue" },
    ];

    const data = staticData.slice(
        (tableFilter.page - 1) * tableFilter.page_size,
        tableFilter.page * tableFilter.page_size
      );

    return (
        <>
            {/* Top Pagination, Page Size & Search */}
            <Col xs={24} sm={24} md={24} lg={24}>
                <Flex justify="space-between" align="center" className="tbl-top-filter">
                    <TableGlobalSearchAnimated tableFilter={tableFilter} setTableFilter={setTableFilter} />
                    <TablePageSize tableFilter={tableFilter} setTableFilter={setTableFilter} />
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24}>
                <Flex justify="end" align="center" className="tbl-bottom-filter">
                    <TableShowingEntriesV2 total={totalRecords} />
                    <TablePagination
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                        total={totalRecords}
                        showLessItems={true}
                        showSizeChanger={false}
                        tblIdWrapper="tbl_wrapper"
                        onPageChange={(page) => setTableFilter({ ...tableFilter, page })}
                    />
                </Flex>
            </Col>

            {/* Table */}
            <Table
                id="tbl_historical"
                className="ant-table-default ant-table-striped"
                dataSource={data}
                columns={columns}
                pagination={false}
                bordered={false}
                scroll={{ x: "max-content" }}
                sticky
            />

            {/* Bottom Pagination */}
            <Col xs={24} sm={24} md={24} lg={24}>
                <Flex justify="end" align="center" className="tbl-bottom-filter">
                    <TableShowingEntriesV2 total={totalRecords} />
                    <TablePagination
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                        total={totalRecords}
                        showLessItems={true}
                        showSizeChanger={false}
                        tblIdWrapper="tbl_wrapper"
                        onPageChange={(page) => setTableFilter({ ...tableFilter, page })}
                    />
                </Flex>
            </Col>
        </>
    );
};

export default TableHistoricalData;
