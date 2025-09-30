import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Button, Col, Flex, Card } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { GET } from "../../../../../providers/useAxiosQuery";
import TableHistoricalData from "../components/TableHistoricalData";
import TableHistoricalDataData from "./TableHistoricalDataData.json";

import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
    useTableScrollOnTop,
} from "../../../../../providers/CustomTableFilter";

export default function TabItemHistoricalData() {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Manage modal state
    const [toggleModalModule, setToggleModalModule] = useState({
        open: false,
        data: null,
    });

    // Manage table filter state
    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 10, // Set default page size
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        from: location.pathname,
    });

    // Fetch data based on filter
    const { data: apiData, refetch: refetchSource } = GET(
        `api/historical_data?${new URLSearchParams(tableFilter)}`,
        "historical_data_list"
    );

    // Function to filter data based on search input
    const filteredDataSource = (apiData?.data || TableHistoricalDataData)
        .filter((item) =>
            item.fullName.toLowerCase().includes(tableFilter.search.toLowerCase())
        );

    // Handle Pagination
    const paginatedData = filteredDataSource.slice(
        (tableFilter.page - 1) * tableFilter.page_size,
        tableFilter.page * tableFilter.page_size
    );

    useEffect(() => {
        refetchSource();
    }, [tableFilter]);

    useTableScrollOnTop("tbl_user", location);

    // Handle search input change
    const handleSearchChange = (search) => {
        setTableFilter((prev) => ({
            ...prev,
            search,
            page: 1, // Reset to first page
        }));
    };
    
    return (    
        <Card id="TabItemHistoricalData">
            <Row gutter={[20, 20]} id="tbl_wrapper">

                {/* Search & Page Size Filter */}
                <Col xs={24} sm={24} md={24} lg={24}>
                    <Flex justify="space-between" align="center">
                        <TableGlobalSearchAnimated
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            onSearchChange={handleSearchChange} // Handle search changes
                        />
                        <TablePageSize
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                        />
                    </Flex>
                </Col>

                {/* Top Pagination */}
                <Col xs={24} sm={24} md={24} lg={24}>
                    <Flex justify="space-between" align="center" className="tbl-top-filter">
                        <div /> {/* Placeholder to align pagination right */}
                        <Flex align="center">
                            <div>
                            <strong>Results</strong> {(tableFilter.page - 1) * tableFilter.page_size + 1} to{" "}
                            
                            {filteredDataSource.length} records
                            </div>
                            <TablePagination
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                                total={filteredDataSource.length}
                                showLessItems
                                showSizeChanger={false}
                                tblIdWrapper="tbl_wrapper"
                            />
                        </Flex>
                    </Flex>
                </Col>

                {/* Table Content */}
                <Col xs={24} sm={24} md={24} lg={24}>
                    <TableHistoricalData
                        dataSource={paginatedData} // Use paginated data
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                        selectedRowKeys={selectedRowKeys}
                        setSelectedRowKeys={setSelectedRowKeys}
                    />
                </Col>

                {/* Pagination at the Bottom */}
                <Col xs={24} sm={24} md={24} lg={24}>
                    <Flex justify="space-between" align="center" className="tbl-bottom-filter">
                        <div/>
                        <Flex align="center">
                        <div>
                            <strong>Results</strong> {(tableFilter.page - 1) * tableFilter.page_size + 1} to{" "}
                            {Math.min(tableFilter.page * tableFilter.page_size, filteredDataSource.length)} of{" "}
                            {filteredDataSource.length} records
                        </div>
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={filteredDataSource.length}
                            showLessItems
                            showSizeChanger={false}
                            tblIdWrapper="tbl_wrapper"
                        />
                        </Flex>
                    </Flex>
                </Col>
            </Row>
        </Card>
    );
}   