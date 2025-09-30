import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Button, Col, Flex, Card, Typography, Space } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRefresh } from "@fortawesome/pro-regular-svg-icons";
import { useQueryClient } from "react-query";

import { GET } from "../../../../providers/useAxiosQuery";
import { showGlobalLoading, hideGlobalLoading, ensureGlobalLoadingExists } from "../../../../providers/globalLoading";
import PageProfileContext from "./PageProfileContext";
import TableProfile from "./TableProfile";
import ModalFormProfile from "./ModalFormProfile";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
    useTableScrollOnTop,
} from "../../../../providers/CustomTableFilter";
import { hasButtonPermission } from "@/hooks/useButtonPermissions";

const { Title, Text } = Typography;

export default function ProfileContent() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [toggleModalForm, setToggleModalForm] = useState({
        open: false,
        data: null,
    });

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        status: "Active",
        from: location.pathname,
    });

    const [isDataReady, setIsDataReady] = useState(false);
    const [isTableRendered, setIsTableRendered] = useState(false);

    const { data: dataSource, refetch: refetchSource, isLoading } = GET(
        `api/profile?${new URLSearchParams(tableFilter)}`,
        ["profiles_active_list", tableFilter],
        {
            onSuccess: (res) => {
                // Data fetched successfully, but wait for table to render
                if (res?.success && res?.data) {
                    setIsDataReady(true);
                }
            },
            isLoading: false // Disable automatic global loading, we'll handle it manually
        }
    );

    // Monitor when table data is actually available and rendered
    useEffect(() => {
        if (isDataReady) {
            if (dataSource?.data?.data && dataSource.data.data.length > 0) {
                // Data exists, wait for table to render
                setTimeout(() => {
                    setIsTableRendered(true);
                    hideGlobalLoading();
                }, 300);
            } else if (dataSource?.data?.data && dataSource.data.data.length === 0) {
                // No data but response is valid, hide loading faster
                setTimeout(() => {
                    setIsTableRendered(true);
                    hideGlobalLoading();
                }, 150);
            } else if (dataSource?.data) {
                // Data structure might be different, hide loading with short delay
                setTimeout(() => {
                    setIsTableRendered(true);
                    hideGlobalLoading();
                }, 200);
            }
        }
    }, [isDataReady, dataSource]);

    // Manual global loading control
    useEffect(() => {
        if (isLoading && !isTableRendered) {
            ensureGlobalLoadingExists();
            showGlobalLoading();
        }
    }, [isLoading, isTableRendered]);

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((prevState) => ({
            ...prevState,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    useEffect(() => {
        setIsDataReady(false); // Reset data ready state when filter changes
        setIsTableRendered(false); // Reset table rendered state
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    useTableScrollOnTop("tbl_profile", location);

    const handleRefresh = async () => {
        try {
            setIsDataReady(false); // Reset data ready state for refresh
            setIsTableRendered(false); // Reset table rendered state for refresh
            
            // Method 1: Invalidate the query cache
            queryClient.invalidateQueries(["profiles_active_list", tableFilter]);
            queryClient.invalidateQueries("profiles_active_list");
            
            // Method 2: Force refetch
            await refetchSource();
            
            // Method 3: Trigger a state update to force re-render
            setTableFilter(prevState => ({ ...prevState, refreshTrigger: Date.now() }));
        } catch (error) {
            // Silent error handling
            hideGlobalLoading(); // Ensure loading is hidden on error
        }
    };

    return (
        <PageProfileContext.Provider
            value={{
                dataSource,
                onChangeTable,
                toggleModalForm,
                setToggleModalForm,
                tableFilter,
                setTableFilter,
                selectedRowKeys,
                setSelectedRowKeys,
                refetch: refetchSource,
            }}
        >
            <Card>
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <div className="module-header">
                        <Title level={3} className="module-title">
                            Student Profile Management
                        </Title>
                        <Text type="secondary" className="module-description">
                            Student Profiles Data Resource
                        </Text>
                    </div>
                    
                    <Row gutter={[20, 20]} id="tbl_wrapper">
                    <Col xs={24} sm={24} md={24} lg={24}>
                        {hasButtonPermission('M-02-NEW') && (
                            <Button
                                type="primary"
                                icon={<FontAwesomeIcon icon={faPlus} />}
                                onClick={() =>
                                    setToggleModalForm({ open: true, data: null })
                                }
                                style={{ marginBottom: 16 }}
                            >
                                New Profile
                            </Button>
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
                        <TableProfile />
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

            <ModalFormProfile />
        </PageProfileContext.Provider>
    );
}
