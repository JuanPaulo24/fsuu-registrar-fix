import React, { useState, useEffect } from "react";
import { Table, Col, Row } from "antd";
import { Flex } from "antd";
import FloatSelect from "../../../../providers/FloatSelect"
import { TablePageSize, TablePagination, TableShowingEntriesV2 } from "../../../../providers/CustomTableFilter";
import staticData from "../components/TableHistoricalStaticData.json"

const TableHistoricalData = () => {
    const [tableFilter, setTableFilter] = useState({ page: 1, page_size: 10 });
    // const totalRecords = 15;

    const columns = [
        { title: "Time Stamp", dataIndex: "timestamp", key: "timestamp" },
        { title: "Edited By", dataIndex: "editedBy", key: "editedBy" },
        { title: "Module", dataIndex: "module", key: "module" },
        { title: "Subject Updated", dataIndex: "subjectUpdated", key: "subjectUpdated" },
        { title: "Full Name", dataIndex: "fullName", key: "fullName" },
        { title: "Field", dataIndex: "field", key: "field" },
        { title: "Old Value", dataIndex: "oldValue", key: "oldValue" },
        { title: "New Value", dataIndex: "newValue", key: "newValue" },
    ];
    
    const filteredData = tableFilter.module
        ? staticData.filter((item) => item.module === tableFilter.module)
        : staticData;

    const paginatedData = filteredData.slice(
        (tableFilter.page - 1) * tableFilter.page_size,
        tableFilter.page * tableFilter.page_size
    );

    useEffect(() => {
        const from = (tableFilter.page - 1) * tableFilter.page_size + 1;
        const to = Math.min(tableFilter.page * tableFilter.page_size, filteredData.length);
    
        const spansFrom = document.querySelectorAll(".span_page_from");
        const spansTotal = document.querySelectorAll(".span_page_total");
    
        spansFrom.forEach((el) => {
            el.textContent = from > filteredData.length ? 0 : from;
        });
    
        spansTotal.forEach((el) => {
            el.textContent = to;
        });
    }, [tableFilter, filteredData]);
    
    

    // const data = staticData.slice(
    //     (tableFilter.page - 1) * tableFilter.page_size,
    //     tableFilter.page * tableFilter.page_size
    //   );

    // FloatSelect options
    const filterOptions = [
        { label: "All", value: null },
        { label: "Baptism", value: "Baptism" },
        { label: "Communion", value: "Communion" },
        { label: "Confirmation", value: "Confirmation" },
        { label: "Matrimony", value: "Matrimony" },
        { label: "Memorial", value: "Memorial" },
        { label: "Conversion", value: "Conversion" },
    ];

    return (
        <Row gutter={[20, 20]} className="tbl_wrapper">
            {/* Top Pagination, Page Size & Search */}
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Flex justify="space-between" align="center" className="tbl-top-filter">
                    <FloatSelect
                        placeholder="Select Module"
                        options={filterOptions}
                        value={tableFilter.module}
                        onChange={(value) => setTableFilter({ ...tableFilter, module: value })}
                    />
                    <TablePageSize tableFilter={tableFilter} setTableFilter={setTableFilter} />
                </Flex>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Flex justify="space-between" align="center" className="tbl-bottom-filter">
                    <div />
                    <Flex align="center">
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={filteredData.length}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_historical"
                        />
                    </Flex>
                </Flex>
            </Col>

            {/* Table */}
            <Table
                id="tbl_historical"
                className="ant-table-default ant-table-striped"
                dataSource={paginatedData}
                columns={columns}
                pagination={false}
                bordered={false}
                scroll={{ x: "max-content" }}
                sticky
            />

            {/* Bottom Pagination */}
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Flex justify="space-between" align="center" className="tbl-bottom-filter">
                    <div />
                    <Flex align="center">
                        <TableShowingEntriesV2 />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={filteredData.length}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_historical"
                        />
                    </Flex>
                </Flex>
            </Col>
        </Row>
    );
};

export default TableHistoricalData;
