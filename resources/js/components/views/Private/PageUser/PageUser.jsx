import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Button, Col, Flex, Card, Typography, Space } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRefresh } from "@fortawesome/pro-regular-svg-icons";
import { useQueryClient } from "react-query";

import { GET } from "../../../providers/useAxiosQuery";
import PageUserContext from "./components/PageUserContext";
import TableUser from "./components/TableUser";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
    useTableScrollOnTop,
} from "../../../providers/CustomTableFilter";
import { hasButtonPermission, hasMultipleButtonPermissions } from "@/hooks/useButtonPermissions";

const { Title, Text } = Typography;

export default function PageUser() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [viewMode, setViewMode] = useState("active");
    
    // Check if user has reactivate permission
    const buttonPermissions = hasMultipleButtonPermissions([
        'M-03-REACTIVATE'
    ]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        status: viewMode === "active" ? ["Active"] : ["Deactivated"],
        user_role: "REGISTRAR STAFF",
        from: location.pathname,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/users?${new URLSearchParams(tableFilter)}`,
        ["users_registrar_staff_list", tableFilter] // Use unique cache key that includes filter to prevent data leaks
    );

    useEffect(() => {
        setTableFilter(prev => ({
            ...prev,
            page: 1,
            status: viewMode === "active" ? ["Active"] : ["Deactivated"]
        }));
    }, [viewMode]);

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((prevState) => ({
            ...prevState,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    useTableScrollOnTop("tbl_user", location);

    const handleRefresh = async () => {
        try {
            // Method 1: Invalidate the query cache with correct cache key
            queryClient.invalidateQueries(["users_registrar_staff_list", tableFilter]);
            queryClient.invalidateQueries("users_registrar_staff_list");
            
            // Method 2: Force refetch
            await refetchSource();
            
            // Method 3: Trigger a state update to force re-render
            setTableFilter(prevState => ({ ...prevState, refreshTrigger: Date.now() }));
        } catch (error) {
            // Silent error handling
        }
    };

    return (
        <PageUserContext.Provider
            value={{
                dataSource,
                onChangeTable,
                tableFilter,
                setTableFilter,
                selectedRowKeys,
                setSelectedRowKeys,
                refetch: refetchSource,
                viewMode,
            }}
        >
            <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div className="module-header">
                    <Title level={3} className="module-title">
                        User Management
                    </Title>
                    <Text type="secondary" className="module-description">
                        Manage system users, permissions, and access control
                    </Text>
                </div>
                
                <Row gutter={[20, 20]} id="tbl_wrapper">
                <Col xs={24} sm={24} md={24} lg={24}>
                    {hasButtonPermission('M-03-ADD') && (
                        <Button
                            type="primary"
                            icon={<FontAwesomeIcon icon={faPlus} />}
                            onClick={() => navigate(`/users/add`)}
                            style={{ marginBottom: 16 }}
                        >
                            Add User
                        </Button>
                    )}
                    
                    {buttonPermissions['M-03-REACTIVATE'] && (
                        <Flex
                            gap={8}
                            wrap="wrap"
                            align="center"
                            className="tbl-top-controls"
                            style={{ marginBottom: 16 }}
                        >
                            <Flex align="center" gap={8}>
                                <Button 
                                    type={viewMode === "active" ? "primary" : "default"} 
                                    onClick={() => setViewMode("active")}
                                >
                                    Active
                                </Button>
                                <Button 
                                    type={viewMode === "deactivated" ? "primary" : "default"} 
                                    onClick={() => setViewMode("deactivated")}
                                >
                                    Deactivated
                                </Button>
                            </Flex>
                        </Flex>
                    )}
                    
                    <Flex
                        gap={8}
                        wrap="nowrap"
                        align="center"
                        className="tbl-top-controls"
                        style={{ marginBottom: 16 }}
                    >
                        <div style={{ flex: 1, minWidth: 150 }}>
                            <TableGlobalSearchAnimated
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        </div>
                        
                        <Button
                            type="default"
                            size="middle"
                            icon={<FontAwesomeIcon icon={faRefresh} />}
                            onClick={handleRefresh}
                            title="Refresh table data"
                            className="table-refresh-btn"
                            style={{ flexShrink: 0 }}
                        />
                        
                        <div style={{ flexShrink: 0 }}>
                            <TablePageSize
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        </div>
                    </Flex>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24}>
                    <TableUser />
                </Col>

                <Col xs={24} sm={24} md={24} lg={24}>
                    <div 
                        className="tbl-bottom-filter-custom"
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'nowrap',
                            margin: '15px 0px 15px 0px'
                        }}
                    >
                        <div />

                        <div 
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'nowrap',
                                gap: '8px'
                            }}
                        >
                            <div 
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    whiteSpace: 'nowrap',
                                    fontSize: '12px'
                                }}
                            >
                                <TableShowingEntriesV2 />
                            </div>
                            <div 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    flexShrink: 0
                                }}
                            >
                                <TablePagination
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    total={dataSource?.data?.total || 0}
                                    showLessItems={true}
                                    showSizeChanger={false}
                                    tblIdWrapper="tbl_wrapper"
                                />
                            </div>
                        </div>
                    </div>
                </Col>
                </Row>
            </Space>
        </Card>
        </PageUserContext.Provider>
    );
}
