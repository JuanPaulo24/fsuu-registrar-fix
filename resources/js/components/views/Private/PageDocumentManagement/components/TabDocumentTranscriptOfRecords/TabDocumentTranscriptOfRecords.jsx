import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Button, Col, Flex, Card, Space, notification, Alert } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faFileSignature, faExclamationTriangle, faCheck, faBan, faRefresh, faEllipsisV } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../../../providers/useAxiosQuery";
import TableDocument from "../TableDocument";
import { ModalManagerProvider, useModalManager, MODAL_TYPES } from "../ModalManager";
import ModalRenderer from "../ModalRenderer";
import { hasButtonPermission } from "@/hooks/useButtonPermissions";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
    useTableScrollOnTop,
} from "../../../../../providers/CustomTableFilter";

function TabDocumentTranscriptOfRecordsInner() {
    const navigate = useNavigate();
    const location = useLocation();
    const { openModal } = useModalManager();
    
    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
    const [isExtraSmall, setIsExtraSmall] = useState(window.innerWidth <= 480);
    const [isVerySmall, setIsVerySmall] = useState(window.innerWidth <= 360);
    
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 576);
            setIsExtraSmall(window.innerWidth <= 480);
            setIsVerySmall(window.innerWidth <= 360);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [showFilterButtons, setShowFilterButtons] = useState(false);
    const [hoverActiveBtn, setHoverActiveBtn] = useState(false);
    const [hoverRevokedBtn, setHoverRevokedBtn] = useState(false);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        status: ["Active"],
        revoked: 0,
        document_type: "Transcript of Records",
        from: location.pathname,
    });

    // Create proper query parameters
    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        Object.entries(tableFilter).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
                if (Array.isArray(value)) {
                    params.append(key, value.join(','));
                } else {
                    params.append(key, value);
                }
            }
        });
        return params.toString();
    }, [tableFilter]);

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/issued_documents?${queryString}`,
        ["issued_documents_transcript_list", queryString]
    );

    useEffect(() => {
        console.log("Table filter changed:", tableFilter);
        console.log("Query string:", queryString);
        console.log("Full API URL:", `api/issued_documents?${queryString}`);
    }, [tableFilter, queryString]);

    useEffect(() => {
        console.log("dataSource Transcript: ", dataSource);
    }, [dataSource]);

    useTableScrollOnTop("tbl_document_transcript", location);

    return (
        <Card>
            <Row gutter={[20, 20]} id="tbl_wrapper_transcript">
                <Col xs={24} sm={24} md={24} lg={24}>
                    <Flex
                        justify="space-between"
                        align="center"
                        style={{ marginBottom: 16 }}
                    >
                        {hasButtonPermission('M-06-TRANSCRIPT-GENERATE') && (
                            <Button
                                type="primary"
                                className="btn-main-primary"
                                icon={<FontAwesomeIcon icon={faFileSignature} />}
                                onClick={() => openModal(MODAL_TYPES.DOCUMENT_GENERATION, {
                                documentType: "Transcript of Records",
                                record: {},
                                onSubmit: (documentData) => {
                                    console.log('New Transcript Document Data:', documentData);
                                    notification.success({
                                        message: "Transcript of Records",
                                        description: "Transcript generated successfully with QR code and digital signature!",
                                    });
                                    refetchSource();
                                }
                            })}
                            name="btn_generate_new_transcript"
                            style={{ flexShrink: 0 }}
                        >
                            {isMobile ? 'New Transcript' : 'Generate New Transcript'}
                        </Button>
                        )}
                        
                        <Flex gap={8} align="center">
                            {showFilterButtons && (
                                <>
                                    <Button
                                        type="default"
                                        size={isMobile ? "small" : "middle"}
                                        icon={<FontAwesomeIcon 
                                            icon={faCheck} 
                                            style={{ 
                                                color: (tableFilter.revoked === 0 || hoverActiveBtn) ? '#52c41a' : '#666'
                                            }} 
                                        />}
                                        onClick={() => setTableFilter((p) => ({ ...p, revoked: 0, page: 1 }))}
                                        title="Active Documents"
                                        className="table-refresh-btn"
                                        style={{ flexShrink: 0 }}
                                        onMouseEnter={() => setHoverActiveBtn(true)}
                                        onMouseLeave={() => setHoverActiveBtn(false)}
                                    />
                                    
                                    <Button
                                        type="default"
                                        size={isMobile ? "small" : "middle"}
                                        icon={<FontAwesomeIcon 
                                            icon={faBan} 
                                            style={{ 
                                                color: (tableFilter.revoked === 1 || hoverRevokedBtn) ? '#ff4d4f' : '#666'
                                            }} 
                                        />}
                                        onClick={() => setTableFilter((p) => ({ ...p, revoked: 1, page: 1 }))}
                                        title="Revoked Documents"
                                        className="table-refresh-btn"
                                        style={{ flexShrink: 0 }}
                                        onMouseEnter={() => setHoverRevokedBtn(true)}
                                        onMouseLeave={() => setHoverRevokedBtn(false)}
                                    />
                                </>
                            )}
                            
                            <span
                                onClick={() => {
                                    setShowFilterButtons(!showFilterButtons);
                                }}
                                title={showFilterButtons ? "Hide Filter Buttons" : "Show Filter Buttons"}
                                style={{ 
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    padding: '4px 8px',
                                    fontSize: isMobile ? '14px' : '16px',
                                    color: '#666'
                                }}
                            >
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </span>
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
                            />
                        </div>
                        
                        <Button
                            type="default"
                            size="middle"
                            icon={<FontAwesomeIcon icon={faRefresh} />}
                            onClick={() => refetchSource()}
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
                    <TableDocument
                        dataSource={dataSource}
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                        selectedRowKeys={selectedRowKeys}
                        setSelectedRowKeys={setSelectedRowKeys}
                        tableId="tbl_document_transcript"
                        documentType="Transcript of Records"
                        refetchKeys={["issued_documents_transcript_list"]}
                        onViewDocument={(record) => {
                            const viewerData = {
                                ...record,
                                final_document_path: record?.attachments?.find?.(a => a.file_type === 'final_document')?.file_path || record?.final_document_path,
                                serial_number: record?.serial_number,
                                current_version: record?.current_version,
                                doc_category: record?.document_type,
                                document_id: record?.document_id_number,
                            };
                            
                            openModal(MODAL_TYPES.DOCUMENT_VIEWER, {
                                documentData: viewerData,
                                profileData: record?.profile
                            });
                        }}
                    />
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
                                    tblIdWrapper="tbl_wrapper_transcript"
                                />
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
            
            <ModalRenderer />
        </Card>
    );
}

// Wrapper component with ModalManagerProvider
export default function TabDocumentTranscriptOfRecords() {
    return (
        <ModalManagerProvider>
            <TabDocumentTranscriptOfRecordsInner />
        </ModalManagerProvider>
    );
}
