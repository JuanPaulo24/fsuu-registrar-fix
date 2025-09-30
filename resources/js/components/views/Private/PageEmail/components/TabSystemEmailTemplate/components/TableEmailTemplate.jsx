import React, { useContext, useMemo } from "react";
import { Table, Card, Button, Tag, Typography, Space, Tooltip, Empty } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faEye, faPlus } from "@fortawesome/pro-regular-svg-icons";
import PageEmailContext from "./PageEmailContext";
import { hasMultipleButtonPermissions } from "@/hooks/useButtonPermissions";

const { Text } = Typography;

const TableEmailTemplate = ({ dataSource = [], setTableFilter }) => {
    const { setToggleModalForm } = useContext(PageEmailContext);
    
    // Check button permissions
    const buttonPermissions = hasMultipleButtonPermissions([
        'M-04-PREVIEW',
        'M-04-EDIT-TEMPLATE'
    ]);
    
    // Check if user has any action permissions
    const hasAnyActionPermission = useMemo(() => {
        return buttonPermissions['M-04-PREVIEW'] || buttonPermissions['M-04-EDIT-TEMPLATE'];
    }, [buttonPermissions]);

    const getTemplateTypeColor = (type) => {
        const colors = {
            verification_result_success: "green",
            verification_result_revoked: "red",
            two_factor_auth: "orange",
            auto_reply: "purple",
        };
        return colors[type] || "default";
    };

    const getTemplateTypeLabel = (type) => {
        const labels = {
            verification_result_success: "Verification (Success)",
            verification_result_revoked: "Verification (Revoked)",
            two_factor_auth: "Two-Factor Auth",
            auto_reply: "Auto-Reply",
        };
        return labels[type] || type;
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return "No content";
        const plainText = text.replace(/<[^>]*>/g, ""); // Remove HTML tags
        return plainText.length > maxLength ? plainText.substring(0, maxLength) + "..." : plainText;
    };

    const columns = useMemo(() => {
        const baseColumns = [];
        
        // Only add Actions column if user has any action permissions
        if (hasAnyActionPermission) {
            baseColumns.push({
                title: "Actions",
                key: "actions",
                width: "8%",
                render: (_, record) => (
                    <Space size="small">
                        {buttonPermissions['M-04-PREVIEW'] && (
                            <Tooltip title="Preview Template">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<FontAwesomeIcon icon={faEye} />}
                                    onClick={() => handlePreview(record)}
                                />
                            </Tooltip>
                        )}
                        {buttonPermissions['M-04-EDIT-TEMPLATE'] && (
                            <Tooltip title="Edit Template">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<FontAwesomeIcon icon={faEdit} />}
                                    onClick={() => handleEdit(record)}
                                />
                            </Tooltip>
                        )}
                    </Space>
                ),
            });
        }
        
        baseColumns.push({
            title: "Template",
            dataIndex: "title",
            key: "title",
            width: hasAnyActionPermission ? "20%" : "25%",
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        {record.subject}
                    </Text>
                </div>
            ),
        });
        
        baseColumns.push(
            {
                title: "Type",
                dataIndex: "template_type",
                key: "template_type",
                width: "15%",
                render: (type) => (
                    <Tag color={getTemplateTypeColor(type)}>
                        {getTemplateTypeLabel(type)}
                    </Tag>
                ),
            },
            {
                title: "Content Preview",
                key: "content",
                width: "35%",
                render: (_, record) => (
                    <div style={{ fontSize: "12px" }}>
                        {record.header && (
                            <div style={{ marginBottom: "4px" }}>
                                <Text type="secondary">Header: </Text>
                                <Text>{truncateText(record.header, 50)}</Text>
                            </div>
                        )}
                        <div style={{ marginBottom: "4px" }}>
                            <Text type="secondary">Body: </Text>
                            <Text>{truncateText(record.body, 80)}</Text>
                        </div>
                        {record.footer && (
                            <div>
                                <Text type="secondary">Footer: </Text>
                                <Text>{truncateText(record.footer, 50)}</Text>
                            </div>
                        )}
                    </div>
                ),
            },
            {
                title: "Status",
                dataIndex: "is_active",
                key: "is_active",
                width: "10%",
                render: (isActive) => (
                    <Tag color={isActive ? "success" : "default"}>
                        {isActive ? "Active" : "Inactive"}
                    </Tag>
                ),
            },
            {
                title: "Last Updated",
                dataIndex: "updated_at",
                key: "updated_at",
                width: "12%",
                render: (date) => (
                    <Text style={{ fontSize: "12px" }}>
                        {date ? new Date(date).toLocaleDateString() : "N/A"}
                    </Text>
                ),
            }
        );
        
        return baseColumns;
    }, [hasAnyActionPermission, buttonPermissions]);

    const handleEdit = (record) => {
        setToggleModalForm({
            open: true,
            data: record,
        });
    };

    const handlePreview = (record) => {
        // For now, we'll use the edit modal for preview
        // You could create a separate preview modal if needed
        setToggleModalForm({
            open: true,
            data: { ...record, preview: true },
        });
    };

    if (!dataSource || dataSource.length === 0) {
        return (
            <Card>
                <Empty
                    description="No email templates found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button 
                        type="primary" 
                        onClick={() => setToggleModalForm({ open: true, data: null })}
                    >
                        Create First Template
                    </Button>
                </Empty>
            </Card>
        );
    }

    return (
        <Card >
            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} templates`,
                }}
                scroll={{ x: 1000 }}
                size="small"
            />
        </Card>
    );
};

export default TableEmailTemplate;
