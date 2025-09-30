    import { useEffect, useState } from "react";
    import { useLocation, useNavigate } from "react-router-dom";
    import { Row, Button, Col, Card, Space, Flex } from "antd";
    import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
    import { faPlus} from "@fortawesome/pro-solid-svg-icons";
    import {GET} from "../../../../providers/useAxiosQuery";
    import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
    useTableScrollOnTop,
    } from "../../../../providers/CustomTableFilter";
    import TableParish from "../../../Private/PageParish/components/TableParish";
    import ModalFormParish from "../../../Private/PageParish/components/ModalFormParish";
    import ModalEditParish from "../../../Private/PageParish/components/ModalEditParish";
    import DataParish from "../../../Private/PageParish/components/DataParish.json";

    export default function TabItemParish() {
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState("active");
    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 10,
        search: "",
        sort_field: "church",
        sort_order: "desc",
        from: location.pathname,
    });

    useEffect(() => {
        setTableFilter((prev) => ({
        ...prev,
        page: 1,
        }));
    }, [activeTab]);

    {/* Fetch */}
    const { data: apiData, refetch: refetchSource } = GET(
        `api/parish?${new URLSearchParams(tableFilter)}`,
        "parish_active_list"
    );

    const [DataParishList, setDataParishList] = useState(DataParish);
    
    {/* filtered data */}
    const filteredData = (DataParishList || []).filter((item) => {
        const matchesStatus = activeTab === "active" ? item.status !== "Archived" : item.status === 
    "Archived";
        const matchesSearch = tableFilter.search
        ? item.church.toLowerCase().includes(tableFilter.search.toLowerCase())
        : true;
        return matchesStatus && matchesSearch;
    });

    {/* Slice page */}
    const start = (tableFilter.page - 1) * tableFilter.page_size;
    const end = start + tableFilter.page_size;
    const slicedData = filteredData.slice(start, end);

    const dataSource = {
        data: {
        total: filteredData.length,
        parish: slicedData,
        },
    };

    useEffect(() => {
        refetchSource();
    }, [tableFilter]);

    useTableScrollOnTop("tbl_wrapper", location);

    const [isModalOpen, setModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    const handleSettings = (action, record) => {
        if (action === "edit") {
        setEditModalOpen(true);
        }
    };

    return (
        <Card id="TabItemParish">
        <Row gutter={[20, 20]} id="tbl_wrapper">
            {/* Top Action Buttons */}
            <Col xs={24} sm={24} md={24} lg={24}>
            {/* <Space> */}
                <Button
                className="primary-btn"
                type="primary"
                onClick={() => setModalOpen(true)}
                icon={<FontAwesomeIcon icon={faPlus} />}
                >
                Add Parish
                </Button>
            {/* </Space> */}
            </Col>

            {/* Active/Archive Toggle */}
            <Col xs={24} sm={24} md={24} lg={24}>
            <Flex justify="space-between" align="center">
                <Flex justify="start" align="center" gap={10}>
                <Button
                    className={activeTab === "active" ? "active" : ""}
                    type={activeTab === "active" ? "secondary" : "default"}
                    onClick={() => setActiveTab("active")}
                >
                    Active
                </Button>
                <Button
                    className={activeTab === "archive" ? "active" : ""}
                    type={activeTab === "archive" ? "secondary" : "default"}
                    onClick={() => setActiveTab("archive")}
                >
                    Archive
                </Button>
                </Flex>
                <Flex align="center">
                <TablePageSize tableFilter={tableFilter} setTableFilter={setTableFilter} />
                </Flex>
            </Flex>
            </Col>

            {/* Search Bar & Top Pagination */}
            <Col xs={24} sm={24} md={24} lg={24}>
            <Flex justify="space-between" align="center" className="tbl-bottom-filter">
                <TableGlobalSearchAnimated
                tableFilter={tableFilter}
                setTableFilter={setTableFilter}
                placeholder="Search by name"
                />
                <Flex align="center" gap={10}>
                <TableShowingEntriesV2 />
                <TablePagination
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    total={dataSource?.data?.total || 0}
                    showLessItems={true}
                    showSizeChanger={false}
                    tblIdWrapper="tbl_wrapper"
                />
                </Flex>
            </Flex>
            </Col>

            {/* Parish Table */}
            <Col xs={24} sm={24} md={24} lg={24}>
            <TableParish
                data={dataSource?.data?.parish || []}
                handleSettings={handleSettings}
            />
            </Col>

            {/* Bottom Pagination */}
            <Col xs={24} sm={24} md={24} lg={24}>
            <Flex justify="space-between" align="center" className="tbl-bottom-filter">
                <div />
                <Flex align="center">
                <TableShowingEntriesV2 />
                <TablePagination
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    total={dataSource?.data?.total || 0}
                    showLessItems={true}
                    showSizeChanger={false}
                    tblIdWrapper="tbl_wrapper"
                />
                </Flex>
            </Flex>
            </Col>
        </Row>

        <ModalEditParish isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} />
        <ModalFormParish isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add Parish" />
        </Card>
    );
    }