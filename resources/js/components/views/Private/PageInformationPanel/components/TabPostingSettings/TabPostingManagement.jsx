import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Card, Typography, Button, Table, Popconfirm, message, Flex, Statistic } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPencil, faArchive, faBox, faRefresh, faCheck, faEllipsisV, faBullhorn, faChartLine, faExclamationTriangle, faPlay } from "@fortawesome/pro-regular-svg-icons";
import ModalPostingForm from "./ModalPostingForm";
import { GET, POST } from "../../../../../providers/useAxiosQuery";
import { TableGlobalSearchAnimated, TablePageSize, TablePagination, TableShowingEntriesV2, useTableScrollOnTop } from "../../../../../providers/CustomTableFilter";
import dayjs from "dayjs";
import { hasMultipleButtonPermissions } from "@/hooks/useButtonPermissions";

const { Title, Text } = Typography;

export default function TabPostingManagement() {
    const location = useLocation();
    
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
    
    const [filteredPostings, setFilteredPostings] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPosting, setEditingPosting] = useState(null);
    const [isArchived, setIsArchived] = useState(false); // Archive state
    const [hoverActiveBtn, setHoverActiveBtn] = useState(false);
    const [hoverArchivedBtn, setHoverArchivedBtn] = useState(false);
    const [showFilterButtons, setShowFilterButtons] = useState(false);
    
    // Check button permissions
    const buttonPermissions = hasMultipleButtonPermissions([
        'M-07-CMS-ADD',
        'M-07-CMS-EDIT',
        'M-07-CMS-ARCHIVE',
        'M-07-CMS-RESTORE'
    ]);
    
    // Check if user has any action permissions
    const hasAnyActionPermission = useMemo(() => {
        if (isArchived) {
            return buttonPermissions['M-07-CMS-RESTORE'];
        } else {
            return buttonPermissions['M-07-CMS-EDIT'] || buttonPermissions['M-07-CMS-ARCHIVE'];
        }
    }, [buttonPermissions, isArchived]);

    // Table filter parameters (similar to other components)
    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 10,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
    });

    // Fetch postings from API
    const { data: postingsData, refetch: refetchPostings } = GET(
        `api/posting?${new URLSearchParams({...tableFilter, isTrash: isArchived})}`,
        "postings_list"
    );

    // API mutations
    const { mutate: createPosting } = POST("api/posting", "postings_list");
    const { mutate: deletePosting } = POST("api/posting_archived", "postings_list");

    // Handle different data structures safely
    const postings = (() => {
        if (!postingsData) return [];
        
        // If data is directly an array
        if (Array.isArray(postingsData)) return postingsData;
        
        // If data has a 'data' property that is an array
        if (postingsData.data && Array.isArray(postingsData.data)) return postingsData.data;
        
        // If it's paginated data with 'data' property (Laravel pagination)
        if (postingsData.data && postingsData.data.data && Array.isArray(postingsData.data.data)) {
            return postingsData.data.data;
        }
        
        // Default to empty array if structure is unexpected
        return [];
    })();

    // Refresh data on component mount
    useEffect(() => {
        refetchPostings();
    }, []);

    // Debug logging
    useEffect(() => {
        console.log("postingsData:", postingsData);
        console.log("postings:", postings);
    }, [postingsData, postings]);

    // Set filtered postings directly from postings data
    useEffect(() => {
        setFilteredPostings(postings || []);
    }, [postings]);

    // Calculate dashboard statistics
    const getDashboardStats = () => {
        const totalPostings = postings.length;
        const activePostings = postings.filter(p => p.status === 'active').length;
        const highPriorityPostings = postings.filter(p => p.priority_level === 'high').length;
        
        return {
            total: totalPostings,
            active: activePostings,
            highPriority: highPriorityPostings
        };
    };

    const dashboardStats = getDashboardStats();

    // Refetch data when archive state changes
    useEffect(() => {
        refetchPostings();
    }, [isArchived]);

    const handleRefresh = async () => {
        try {
            await refetchPostings();
        } catch (error) {
            // Silent error handling
        }
    };

    useTableScrollOnTop("tbl_postings", location);

    // Pagination logic
    const paginatedPostings = filteredPostings.slice(
        (tableFilter.page - 1) * tableFilter.page_size,
        tableFilter.page * tableFilter.page_size
    );

    // Update pagination display
    useEffect(() => {
        const from = (tableFilter.page - 1) * tableFilter.page_size + 1;
        const to = Math.min(tableFilter.page * tableFilter.page_size, filteredPostings.length);
    
        const spansFrom = document.querySelectorAll(".span_page_from");
        const spansTotal = document.querySelectorAll(".span_page_total");
    
        spansFrom.forEach((el) => {
            el.textContent = from > filteredPostings.length ? 0 : from;
        });
    
        spansTotal.forEach((el) => {
            el.textContent = to;
        });
    }, [tableFilter, filteredPostings]);

    const handleAddPosting = () => {
        setEditingPosting(null);
        setModalVisible(true);
    };

    const handleEditPosting = (posting) => {
        setEditingPosting(posting);
        setModalVisible(true);
    };

    const handleArchivePosting = (id) => {
        const actionText = isArchived ? "restore" : "archive";
        deletePosting({ ids: [id], isTrash: isArchived }, {
            onSuccess: (res) => {
                if (res.success) {
                    message.success(`Posting ${actionText}d successfully`);
                    refetchPostings();
                } else {
                    message.error(res.message || `Failed to ${actionText} posting`);
                }
            },
            onError: (error) => {
                message.error(`Failed to ${actionText} posting`);
                console.error(`${actionText} error:`, error);
            }
        });
    };



    const handleSubmitPosting = (formData) => {
        const payload = {
            ...formData,
            id: formData.id || editingPosting?.id || null
        };

        createPosting(payload, {
            onSuccess: (res) => {
                if (res.success) {
                    message.success(editingPosting ? "Posting updated successfully" : "Posting created successfully");
                    refetchPostings();
                    setModalVisible(false);
                    setEditingPosting(null);
                } else {
                    message.error(res.message || "Failed to save posting");
                }
            },
            onError: (error) => {
                message.error("Failed to save posting");
                console.error("Save error:", error);
            }
        });
    };


    const columns = useMemo(() => {
        const baseColumns = [];
        
        // Only add Actions column if user has any action permissions
        if (hasAnyActionPermission) {
            baseColumns.push({
                title: 'Action',
                key: 'actions',
                align: 'center',
                width: 150,
                render: (_, record) => (
                    <Flex gap={10} justify="center">
                        {!isArchived && buttonPermissions['M-07-CMS-EDIT'] && (
                            <Button
                                type="link"
                                className="w-auto h-auto p-0"
                                onClick={() => handleEditPosting(record)}
                                icon={<FontAwesomeIcon icon={faPencil} />}
                            />
                        )}

                        {(isArchived ? buttonPermissions['M-07-CMS-RESTORE'] : buttonPermissions['M-07-CMS-ARCHIVE']) && (
                            <Popconfirm
                                title={`Are you sure you want to ${isArchived ? 'restore' : 'archive'} this posting?`}
                                onConfirm={() => handleArchivePosting(record.id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button
                                    type="link"
                                    className="w-auto h-auto p-0"
                                    icon={<FontAwesomeIcon icon={isArchived ? faBox : faArchive} />}
                                />
                            </Popconfirm>
                        )}
                    </Flex>
                ),
            });
        }
        
        baseColumns.push({
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: true,
            width: 250,
            render: (text, record) => text,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            sorter: true,
            align: 'center',
            width: 120,
            render: (type) => type?.charAt(0).toUpperCase() + type?.slice(1),
        },

        {
            title: 'Priority',
            dataIndex: 'priority_level',
            key: 'priority_level',
            sorter: true,
            align: 'center',
            width: 100,
            render: (priority) => priority?.charAt(0).toUpperCase() + priority?.slice(1),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            align: 'center',
            width: 110,
            render: (status) => status?.charAt(0).toUpperCase() + status?.slice(1),
        },
        {
            title: 'Date Range',
            key: 'dateRange',
            width: 200,
            render: (_, record) => {
                const startDate = record.start_date ? dayjs(record.start_date).format('MM/DD/YYYY') : '';
                const endDate = record.end_date ? dayjs(record.end_date).format('MM/DD/YYYY') : '';
                return startDate + (endDate ? ` - ${endDate}` : '');
            },
        });
        
        return baseColumns;
    }, [hasAnyActionPermission, isArchived, buttonPermissions]);

    return (
        <>
            {/* Dashboard Statistics Cards */}
            <Row gutter={[20, 20]} style={{ marginBottom: 24, marginTop: 20, padding: '0 8px' }}>
                <Col xs={24} sm={8} lg={8}>
                    <Card 
                        className="kpi-card"
                        bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
                        style={{
                            borderRadius: '0.875rem',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <Statistic
                            title={
                                <Flex align="center" gap={8}>
                                    <FontAwesomeIcon 
                                        icon={faBullhorn} 
                                        style={{ color: 'var(--color-primary, #1890ff)' }}
                                    />
                                    <span style={{ 
                                        fontFamily: 'PoppinsSemiBold', 
                                        color: '#64748b', 
                                        fontSize: isMobile ? '0.8rem' : '0.875rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        PUBLISHED
                                    </span>
                                </Flex>
                            }
                            value={dashboardStats.total}
                            valueStyle={{ 
                                color: 'var(--color-primary, #1890ff)',
                                fontFamily: 'PoppinsBold',
                                fontSize: isMobile ? '1.75rem' : '2.25rem',
                                fontWeight: '700'
                            }}
                        />
                    </Card>
                </Col>
                
                <Col xs={24} sm={8} lg={8}>
                    <Card 
                        className="kpi-card"
                        bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
                        style={{
                            borderRadius: '0.875rem',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <Statistic
                            title={
                                <Flex align="center" gap={8}>
                                    <FontAwesomeIcon 
                                        icon={faPlay} 
                                        style={{ color: 'var(--color-success, #52c41a)' }}
                                    />
                                    <span style={{ 
                                        fontFamily: 'PoppinsSemiBold', 
                                        color: '#64748b', 
                                        fontSize: isMobile ? '0.8rem' : '0.875rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        ACTIVE
                                    </span>
                                </Flex>
                            }
                            value={dashboardStats.active}
                            valueStyle={{ 
                                color: 'var(--color-success, #52c41a)',
                                fontFamily: 'PoppinsBold',
                                fontSize: isMobile ? '1.75rem' : '2.25rem',
                                fontWeight: '700'
                            }}
                        />
                    </Card>
                </Col>
                
                <Col xs={24} sm={8} lg={8}>
                    <Card 
                        className="kpi-card"
                        bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
                        style={{
                            borderRadius: '0.875rem',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <Statistic
                            title={
                                <Flex align="center" gap={8}>
                                    <FontAwesomeIcon 
                                        icon={faExclamationTriangle} 
                                        style={{ color: 'var(--color-danger, #ff4d4f)' }}
                                    />
                                    <span style={{ 
                                        fontFamily: 'PoppinsSemiBold', 
                                        color: '#64748b', 
                                        fontSize: isMobile ? '0.8rem' : '0.875rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        HIGH PRIORITY
                                    </span>
                                </Flex>
                            }
                            value={dashboardStats.highPriority}
                            valueStyle={{ 
                                color: 'var(--color-danger, #ff4d4f)',
                                fontFamily: 'PoppinsBold',
                                fontSize: isMobile ? '1.75rem' : '2.25rem',
                                fontWeight: '700'
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[20, 20]} id="tbl_wrapper_postings">
                <Col span={24}>
                    <Card>
                        <Flex
                            justify="space-between"
                            align="center"
                            style={{ marginBottom: 16 }}
                        >
                            {buttonPermissions['M-07-CMS-ADD'] && (
                                <Button
                                    type="primary"
                                    className="btn-main-primary"
                                    icon={<FontAwesomeIcon icon={faPlus} />}
                                    onClick={handleAddPosting}
                                    disabled={isArchived}
                                    style={{ flexShrink: 0 }}
                                >
                                    {isMobile ? 'New Posting' : 'New Posting'}
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
                                                    color: (!isArchived || hoverActiveBtn) ? '#52c41a' : '#666'
                                                }} 
                                            />}
                                            onClick={() => setIsArchived(false)}
                                            title="Active Postings"
                                            className="table-refresh-btn"
                                            style={{ flexShrink: 0 }}
                                            onMouseEnter={() => setHoverActiveBtn(true)}
                                            onMouseLeave={() => setHoverActiveBtn(false)}
                                        />
                                        
                                        <Button
                                            type="default"
                                            size={isMobile ? "small" : "middle"}
                                            icon={<FontAwesomeIcon 
                                                icon={faArchive} 
                                                style={{ 
                                                    color: (isArchived || hoverArchivedBtn) ? '#ff4d4f' : '#666'
                                                }} 
                                            />}
                                            onClick={() => setIsArchived(true)}
                                            title="Archived Postings"
                                            className="table-refresh-btn"
                                            style={{ flexShrink: 0 }}
                                            onMouseEnter={() => setHoverArchivedBtn(true)}
                                            onMouseLeave={() => setHoverArchivedBtn(false)}
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




                        <Row>
                            <Col xs={24} sm={24} md={24} lg={24}>
                                <Table
                                    id="tbl_postings"
                                    className="ant-table-default ant-table-striped"
                                    columns={columns}
                                    dataSource={paginatedPostings}
                                    rowKey="id"
                                    pagination={false}
                                    bordered={false}
                                    onChange={(pagination, filters, sorter) => {
                                        setTableFilter((prevState) => ({
                                            ...prevState,
                                            sort_field: sorter.columnKey,
                                            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
                                            page: 1,
                                            page_size: "50",
                                        }));
                                    }}
                                    scroll={{ x: "max-content" }}
                                    sticky
                                />
                            </Col>
                        </Row>

                        <Row>
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
                                                total={filteredPostings.length}
                                                showLessItems={true}
                                                showSizeChanger={false}
                                                tblIdWrapper="tbl_wrapper_postings"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <ModalPostingForm
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingPosting(null);
                }}
                onSubmit={handleSubmitPosting}
                editingData={editingPosting}
            />
        </>
    );
}
