import React, { useState, useEffect, useMemo } from "react";
import { Table, Avatar, Tag, Typography, Space, Col, Flex, Button, Tooltip, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faStar, 
    faPaperclip,
    faTrash,
    faEnvelopeOpen,
    faArchive,
    faExclamationTriangle,
    faClock,
    faCheckSquare,
    faSquare
} from "@fortawesome/pro-regular-svg-icons";
import { 
    faStar as faStarSolid,
    faExclamationTriangle as faExclamationTriangleSolid
} from "@fortawesome/pro-solid-svg-icons";
import { 
    TablePageSize, 
    TablePagination, 
    TableShowingEntriesV2 
} from "../../../../../../providers/CustomTableFilter";

const { Text } = Typography;

export default function EmailTable({ activeFolder, onSelectEmail, emailCache, setEmailCache }) {
    const [tableFilter, setTableFilter] = useState({ page: 1, page_size: 10 });
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [viewingAllFolders, setViewingAllFolders] = useState(false);

    // Get current folder data from cache or all folders data
    const getCurrentEmailData = () => {
        if (viewingAllFolders) {
            const allFoldersData = [];
            ['inbox', 'sent', 'draft', 'archive', 'spam'].forEach(folder => {
                const folderData = emailCache?.[folder]?.data || [];
                folderData.forEach(email => {
                    allFoldersData.push({ ...email, folder });
                });
            });
            return allFoldersData;
        } else {
            const currentFolderData = emailCache?.[activeFolder] || { data: [], loading: false, loaded: false };
            return currentFolderData.data || [];
        }
    };

    const allEmails = getCurrentEmailData();
    const currentFolderData = emailCache?.[activeFolder] || { data: [], loading: false, loaded: false };
    const { loading, loaded } = currentFolderData;

    // Update email in cache (for starring, marking as read, etc.)
    const updateEmailInCache = (emailId, updates) => {
        setEmailCache(prev => ({
            ...prev,
            [activeFolder]: {
                ...prev[activeFolder],
                data: prev[activeFolder].data.map(email => 
                    email.id === emailId ? { ...email, ...updates } : email
                )
            }
        }));
    };

    const toggleStar = (id) => {
        const email = allEmails.find(e => e.id === id);
        if (email) {
            updateEmailInCache(id, { isStarred: !email.isStarred });
        }
    };

    // Bulk update emails in cache
    const updateMultipleEmailsInCache = (emailIds, updates) => {
        setEmailCache(prev => ({
            ...prev,
            [activeFolder]: {
                ...prev[activeFolder],
                data: prev[activeFolder].data.map(email => 
                    emailIds.includes(email.id) ? { ...email, ...updates } : email
                )
            }
        }));
    };

    // Bulk action handlers
    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) return;
        
        // Permanently delete emails from current folder
        setEmailCache(prev => ({
            ...prev,
            [activeFolder]: {
                ...prev[activeFolder],
                data: prev[activeFolder].data.filter(email => !selectedRowKeys.includes(email.id))
            }
        }));
        
        setSelectedRowKeys([]);
        setSelectAll(false);
        message.success(`${selectedRowKeys.length} email(s) permanently deleted`);
    };

    const handleBulkMarkAsUnread = () => {
        if (selectedRowKeys.length === 0) return;
        
        updateMultipleEmailsInCache(selectedRowKeys, { isRead: false });
        setSelectedRowKeys([]);
        setSelectAll(false);
        message.success(`${selectedRowKeys.length} email(s) marked as unread`);
    };

    const handleBulkArchive = () => {
        if (selectedRowKeys.length === 0) return;
        
        // Move emails from current folder to archive folder
        const emailsToArchive = allEmails.filter(email => selectedRowKeys.includes(email.id));
        
        // Remove from current folder
        setEmailCache(prev => ({
            ...prev,
            [activeFolder]: {
                ...prev[activeFolder],
                data: prev[activeFolder].data.filter(email => !selectedRowKeys.includes(email.id))
            },
            // Add to archive folder
            archive: {
                ...prev.archive,
                data: [
                    ...emailsToArchive.map(email => ({ ...email, isArchived: true })),
                    ...(prev.archive?.data || [])
                ],
                loaded: true
            }
        }));
        
        setSelectedRowKeys([]);
        setSelectAll(false);
        message.success(`${selectedRowKeys.length} email(s) archived`);
    };

    const handleBulkMarkAsImportant = () => {
        if (selectedRowKeys.length === 0) return;
        
        updateMultipleEmailsInCache(selectedRowKeys, { isImportant: true });
        setSelectedRowKeys([]);
        setSelectAll(false);
        message.success(`${selectedRowKeys.length} email(s) marked as important`);
    };

    const handleBulkSnooze = () => {
        if (selectedRowKeys.length === 0) return;
        
        const snoozeUntil = new Date();
        snoozeUntil.setHours(snoozeUntil.getHours() + 1); // Default 1 hour snooze
        
        updateMultipleEmailsInCache(selectedRowKeys, { 
            isSnoozed: true,
            snoozeUntil: snoozeUntil.toISOString()
        });
        setSelectedRowKeys([]);
        setSelectAll(false);
        message.success(`${selectedRowKeys.length} email(s) snoozed for 1 hour`);
    };

    const handleBulkStar = () => {
        if (selectedRowKeys.length === 0) return;
        
        updateMultipleEmailsInCache(selectedRowKeys, { isStarred: true });
        setSelectedRowKeys([]);
        setSelectAll(false);
        message.success(`${selectedRowKeys.length} email(s) starred`);
    };

    // Selection handlers
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRowKeys([]);
            setSelectAll(false);
        } else {
            const allIds = pagedData.map(email => email.id);
            setSelectedRowKeys(allIds);
            setSelectAll(true);
        }
    };

    const handleRowSelection = (emailId) => {
        const newSelection = selectedRowKeys.includes(emailId)
            ? selectedRowKeys.filter(id => id !== emailId)
            : [...selectedRowKeys, emailId];
        
        setSelectedRowKeys(newSelection);
        setSelectAll(newSelection.length === pagedData.length);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "urgent": return "red";
            case "high": return "orange";
            case "normal": return "blue";
            case "low": return "gray";
            default: return "blue";
        }
    };

    const getColumns = () => {
        const baseColumns = [
            {
                title: (
                    <FontAwesomeIcon 
                        icon={selectAll ? faCheckSquare : faSquare}
                        style={{ 
                            color: selectAll ? "#1890ff" : "#d9d9d9",
                            cursor: "pointer"
                        }}
                        onClick={handleSelectAll}
                    />
                ),
                dataIndex: "selection",
                key: "selection",
                width: 40,
                render: (_, record) => (
                    <FontAwesomeIcon 
                        icon={selectedRowKeys.includes(record.id) ? faCheckSquare : faSquare}
                        style={{ 
                            color: selectedRowKeys.includes(record.id) ? "#1890ff" : "#d9d9d9",
                            cursor: "pointer"
                        }}
                        data-testid="selection-icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRowSelection(record.id);
                        }}
                    />
                ),
            },
            {
                title: "",
                dataIndex: "isStarred",
                key: "star",
                width: 40,
                render: (isStarred, record) => (
                    <FontAwesomeIcon 
                        icon={isStarred ? faStarSolid : faStar}
                        style={{ 
                            color: isStarred ? "#ffa940" : "#d9d9d9",
                            cursor: "pointer"
                        }}
                        data-testid="star-icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(record.id);
                        }}
                    />
                ),
            }
        ];

        if (viewingAllFolders) {
            baseColumns.push({
                title: "Folder",
                dataIndex: "folder",
                key: "folder",
                width: 100,
                render: (folder) => (
                    <Tag color="blue">
                        {folder ? folder.charAt(0).toUpperCase() + folder.slice(1) : 'Unknown'}
                    </Tag>
                ),
            });
        }

        baseColumns.push(
            {
                title: viewingAllFolders ? "From/To" : (activeFolder === "sent" || activeFolder === "draft" ? "To" : "From"),
                dataIndex: viewingAllFolders ? "from" : (activeFolder === "sent" || activeFolder === "draft" ? "to" : "from"),
                key: "contact",
                width: 200,
                render: (text, record) => (
                    <Space>
                        <Avatar size="small">
                            {(record.from || record.to || "").charAt(0).toUpperCase()}
                        </Avatar>
                        <Text strong={!record.isRead}>
                            {text}
                        </Text>
                    </Space>
                ),
            },
            {
                title: "Subject",
                dataIndex: "subject",
                key: "subject",
                render: (text, record) => (
                    <Space>
                        {record.isImportant && (
                            <FontAwesomeIcon 
                                icon={faExclamationTriangleSolid} 
                                style={{ color: "#fa8c16" }} 
                                title="Important"
                            />
                        )}
                        <Text strong={!record.isRead} ellipsis>
                            {text}
                        </Text>
                        {record.hasAttachment && (
                            <FontAwesomeIcon icon={faPaperclip} style={{ color: "#8c8c8c" }} />
                        )}
                        {record.isSnoozed && (
                            <FontAwesomeIcon 
                                icon={faClock} 
                                style={{ color: "#722ed1" }} 
                                title="Snoozed"
                            />
                        )}
                    </Space>
                ),
            },
            {
                title: "Date",
                dataIndex: "date",
                key: "date",
                width: 150,
                render: (text, record) => (
                    <Text type={record.isRead ? "secondary" : undefined}>
                        {text}
                    </Text>
                ),
            }
        );

        return baseColumns;
    };

    const columns = getColumns();

    const handleRowClick = (record) => {
        // Mark as read when clicked
        updateEmailInCache(record.id, { isRead: true });
        onSelectEmail(record);
    };

    // Reset to first page when folder changes and clear selections
    useEffect(() => {
        setTableFilter((prev) => ({ ...prev, page: 1 }));
        setSelectedRowKeys([]);
        setSelectAll(false);
        setViewingAllFolders(false);
    }, [activeFolder]);

    // Clear selections when page changes
    useEffect(() => {
        setSelectedRowKeys([]);
        setSelectAll(false);
    }, [tableFilter.page]);

    // Compute paged data client-side using cached data
    const pagedData = useMemo(() => {
        const start = (tableFilter.page - 1) * tableFilter.page_size;
        const end = start + tableFilter.page_size;
        return allEmails.slice(start, end);
    }, [allEmails, tableFilter]);

    // Total count from cached data
    const totalRecords = allEmails.length;

    return (
        <>
            {/* Bulk Actions Bar */}
            {selectedRowKeys.length > 0 && (
                <Col xs={24} sm={24} md={24} lg={24} style={{ marginBottom: 12 }}>
                    <div className="bulk-actions-bar" style={{ 
                        background: '#f0f8ff', 
                        padding: '8px 12px', 
                        borderRadius: '6px',
                        border: '1px solid #d1ecf1'
                    }}>
                        <Flex justify="space-between" align="center">
                            <Text style={{ color: '#0066cc', fontWeight: 500 }}>
                                {selectedRowKeys.length} email(s) selected
                            </Text>
                            <Space size="small">
                                <Tooltip title="Delete">
                                    <Button 
                                        type="text" 
                                        size="small"
                                        icon={<FontAwesomeIcon icon={faTrash} />}
                                        onClick={handleBulkDelete}
                                        style={{ color: '#666666' }}
                                    />
                                </Tooltip>
                                <Tooltip title="Mark as Unread">
                                    <Button 
                                        type="text" 
                                        size="small"
                                        icon={<FontAwesomeIcon icon={faEnvelopeOpen} />}
                                        onClick={handleBulkMarkAsUnread}
                                        style={{ color: '#666666' }}
                                    />
                                </Tooltip>
                                <Tooltip title="Archive">
                                    <Button 
                                        type="text" 
                                        size="small"
                                        icon={<FontAwesomeIcon icon={faArchive} />}
                                        onClick={handleBulkArchive}
                                        style={{ color: '#666666' }}
                                    />
                                </Tooltip>
                                <Tooltip title="Mark as Important">
                                    <Button 
                                        type="text" 
                                        size="small"
                                        icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
                                        onClick={handleBulkMarkAsImportant}
                                        style={{ color: '#666666' }}
                                    />
                                </Tooltip>
                                <Tooltip title="Snooze (1 hour)">
                                    <Button 
                                        type="text" 
                                        size="small"
                                        icon={<FontAwesomeIcon icon={faClock} />}
                                        onClick={handleBulkSnooze}
                                        style={{ color: '#666666' }}
                                    />
                                </Tooltip>
                                <Tooltip title="Star">
                                    <Button 
                                        type="text" 
                                        size="small"
                                        icon={<FontAwesomeIcon icon={faStar} />}
                                        onClick={handleBulkStar}
                                        style={{ color: '#666666' }}
                                    />
                                </Tooltip>
                            </Space>
                        </Flex>
                    </div>
                </Col>
            )}

            <Col xs={24} sm={24} md={24} lg={24}>
                <Flex justify="space-between" align="center" className="tbl-top-filter">
                    <span />
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            if (viewingAllFolders) {
                                setViewingAllFolders(false);
                                setTableFilter({ page: 1, page_size: 10 });
                            } else {
                                setViewingAllFolders(true);
                                setTableFilter({ page: 1, page_size: totalRecords || 1000 });
                            }
                        }}
                        style={{ 
                            padding: 0,
                            height: 'auto',
                            fontSize: '12px',
                            color: '#002a8d'
                        }}
                    >
                        {viewingAllFolders ? 'Back to Folder' : 'View All'}
                    </Button>
                </Flex>
            </Col>

            <Table
                dataSource={pagedData}
                columns={columns}
                pagination={false}
                size="small"
                rowKey={(record, index) => `${record.id}-${index}-${activeFolder}`}
                onRow={(record) => ({
                    onClick: (event) => {
                        // Don't trigger row click if clicking on selection checkbox or star
                        if (event.target.closest('.ant-checkbox') || 
                            event.target.closest('[data-testid="star-icon"]') ||
                            event.target.closest('[data-testid="selection-icon"]')) {
                            return;
                        }
                        
                        handleRowClick(record);
                    },
                    style: {
                        cursor: "pointer",
                        backgroundColor: selectedRowKeys.includes(record.id) ? '#e6f7ff' : 'transparent',
                    },
                })}
                scroll={{ x: "max-content" }}
            />

            <Col xs={24} sm={24} md={24} lg={24} style={{ marginTop: 8 }}>
                <div className="tbl-bottom-filter" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
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
                            <TableShowingEntriesV2 total={totalRecords} />
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
                                total={totalRecords}
                                showLessItems={true}
                                showSizeChanger={false}
                                tblIdWrapper="tbl_wrapper"
                                onPageChange={(page) => setTableFilter({ ...tableFilter, page })}
                            />
                        </div>
                    </div>
                </div>
            </Col>
        </>
    );
}