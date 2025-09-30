import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Button, Col, Flex, Card, Alert } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh, faInfoCircle } from "@fortawesome/pro-regular-svg-icons";
import { useQueryClient } from "react-query";

import { GET } from "../../../../../providers/useAxiosQuery";
import TabDocumentTrackingsContext from "./components/TabDocumentTrackingsContext";
import TableDocumentTrackings from "./components/TableDocumentTrackings";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
    useTableScrollOnTop,
} from "../../../../../providers/CustomTableFilter";

export default function TabDocumentTrackings({ refreshKey }) {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    
    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showInfoAlert, setShowInfoAlert] = useState(false);
    
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        status: "Active",
        from: location.pathname,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/profile?${new URLSearchParams(tableFilter)}`,
        "document_trackings_list"
    );

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
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    // When tab becomes active, force-refresh data
    useEffect(() => {
        if (refreshKey === 'DocumentTrackings') {
            refetchSource();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    useTableScrollOnTop("tbl_document_trackings", location);

    const handleRefresh = async () => {
        try {
            // Method 1: Invalidate the query cache
            queryClient.invalidateQueries(["document_trackings_list", tableFilter]);
            queryClient.invalidateQueries("document_trackings_list");
            
            // Method 2: Force refetch
            await refetchSource();
            
            // Method 3: Trigger a state update to force re-render
            setTableFilter(prevState => ({ ...prevState, refreshTrigger: Date.now() }));
        } catch (error) {
            // Silent error handling
        }
    };

    return (
        <TabDocumentTrackingsContext.Provider
            value={{
                dataSource,
                onChangeTable,
                tableFilter,
                setTableFilter,
                selectedRowKeys,
                setSelectedRowKeys,
            }}
        >
            <Card>
                <Row gutter={[12, 12]}>
                    {/* Show info alert conditionally */}
                    {(!isMobile && showInfoAlert) && (
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                            <Alert
                                message="Document Tracking Information"
                                description="This section displays all students and their document generation status including Transcript of Records, Diploma, and Certificate of Units Earned."
                                type="info"
                                showIcon
                                closable
                                onClose={() => setShowInfoAlert(false)}
                                style={{ marginBottom: 16 }}
                            />
                        </Col>
                    )}
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                        <Flex
                            justify="space-between"
                            align="center"
                            style={{ marginBottom: 16 }}
                        >
                            <div style={{ flex: 1 }}>
                                {/* This will be empty for now, could add buttons here later */}
                            </div>
                            
                            <Flex gap={8} align="center">
                                {/* Info icon - only show on larger screens */}
                                {!isMobile && (
                                    <FontAwesomeIcon 
                                        icon={faInfoCircle} 
                                        onClick={() => setShowInfoAlert(!showInfoAlert)}
                                        title={showInfoAlert ? "Hide information" : "Show information"}
                                        style={{ 
                                            color: showInfoAlert ? '#1890ff' : '#666',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            transition: 'color 0.2s ease',
                                            flexShrink: 0
                                        }} 
                                    />
                                )}
                            </Flex>
                        </Flex>
                        
                        <Flex
                            gap={8}
                            wrap="nowrap"
                            align="center"
                            className="tbl-top-controls"
                            style={{ marginBottom: 16 }}
                        >
                            <div style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100% - 120px)' }}>
                                <TableGlobalSearchAnimated
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    placeholder="Search students..."
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
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                        <TableDocumentTrackings />
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
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
            </Card>
        </TabDocumentTrackingsContext.Provider>
    );
}