import { useNavigate } from "react-router-dom";
import { Table, Button, notification, Popconfirm, Flex, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBan,
    faEye,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";
import { useMemo, useState } from "react";
import ModalPasswordVerification from "./ModalPasswordVerification";
import ModalRevocationWarning from "./ModalRevocationWarning";
import { hasMultipleButtonPermissions } from "@/hooks/useButtonPermissions";

export default function TableDocument(props) {
    const {
        dataSource,
        tableFilter,
        setTableFilter,
        selectedRowKeys,
        setSelectedRowKeys,
        tableId = "tbl_document",
        documentType = "",
        refetchKeys = [],
        onViewDocument,
    } = props;

    const navigate = useNavigate();
    
    // Get document-specific permission codes based on document type
    const getPermissionCodes = () => {
        switch (documentType) {
            case 'Transcript of Records':
                return {
                    view: 'M-06-TRANSCRIPT-VIEW',
                    revoke: 'M-06-TRANSCRIPT-REVOKE'
                };
            case 'Certification':
                return {
                    view: 'M-06-CERT-VIEW',
                    revoke: 'M-06-CERT-REVOKE'
                };
            default:
                return {
                    view: 'M-06-TRACKINGS-VIEW',
                    revoke: null
                };
        }
    };

    const permissionCodes = getPermissionCodes();
    const buttonPermissions = hasMultipleButtonPermissions([
        permissionCodes.view,
        permissionCodes.revoke
    ].filter(Boolean));
    
    // Modal states for revocation process
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isRevoking, setIsRevoking] = useState(false);

    const { mutate: mutateDeleteDocument, loading: loadingDeleteDocument } =
        POST(`api/issued_document_delete`, refetchKeys);

    const { mutate: mutateRevokeDocument, loading: loadingRevokeDocument } =
        POST(`api/issued_documents/revoke`, refetchKeys);

    const showRevoked = Number(props?.tableFilter?.revoked || 0) === 1;

    const handleDelete = (record) => {
        mutateDeleteDocument(record, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Document",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Document",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((ps) => ({
            ...ps,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'issued':
                return 'green';
            case 'revoked':
                return 'red';
            case 'pending':
                return 'orange';
            default:
                return 'default';
        }
    };

    // Step 1: Initial revoke click - show confirmation
    const handleRevokeClick = (record) => {
        setSelectedDocument(record);
        // This will be handled by Popconfirm first
    };

    // Step 2: After Popconfirm - show password modal
    const handleRevokeConfirmed = () => {
        setShowPasswordModal(true);
    };

    // Step 3: After password verified - show warning modal
    const handlePasswordVerified = () => {
        setShowPasswordModal(false);
        setShowWarningModal(true);
    };

    // Step 4: Final revocation after warning confirmation
    const handleFinalRevoke = (revocationReason) => {
        if (!selectedDocument) return;
        
        setIsRevoking(true);
        
        try {
            const payload = {
                id: selectedDocument.id,
                document_id: selectedDocument.document_id_number,
                revocation_reason: revocationReason
            };

            mutateRevokeDocument(payload, {
                onSuccess: (res) => {
                    if (res.success) {
                        notification.success({
                            message: "Document Revoked",
                            description: `Document ${selectedDocument.serial_number} has been permanently revoked and moved to Revoked Documents.`,
                            duration: 5,
                        });
                        setShowWarningModal(false);
                        setSelectedDocument(null);
                        
                        // Refresh the table data by triggering a refetch
                        // Force a re-render by updating the table filter timestamp
                        if (props.setTableFilter) {
                            props.setTableFilter(prev => ({ 
                                ...prev, 
                                _refresh: Date.now() // Add timestamp to force refetch
                            }));
                        }
                    } else {
                        notification.error({
                            message: "Revocation Failed",
                            description: res.message || "Failed to revoke document. Please try again.",
                        });
                    }
                    setIsRevoking(false);
                },
                onError: (err) => {
                    notificationErrors(err);
                    setIsRevoking(false);
                },
            });
        } catch (e) {
            notification.error({
                message: "Revocation Error",
                description: "An unexpected error occurred while revoking the document.",
            });
            setIsRevoking(false);
        }
    };

    // Cancel handlers
    const handleCancelRevocation = () => {
        setShowPasswordModal(false);
        setShowWarningModal(false);
        setSelectedDocument(null);
        setIsRevoking(false);
    };

    const filteredData = useMemo(() => {
        // Since we're now filtering on the backend, just return the data as-is
        const list = dataSource && dataSource.data && dataSource.data.data ? dataSource.data.data : [];
        return list;
    }, [dataSource]);

    // Check if user has any action permissions
    const hasAnyActionPermission = useMemo(() => {
        if (showRevoked) {
            return false; // No actions in revoked view
        } else {
            return buttonPermissions[permissionCodes.view] || 
                   (permissionCodes.revoke && buttonPermissions[permissionCodes.revoke]);
        }
    }, [buttonPermissions, permissionCodes, showRevoked]);

    return (
        <>
        <Table
            id={tableId}
            className="ant-table-default ant-table-striped"
            dataSource={filteredData}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            sticky
        >
            {hasAnyActionPermission && (
                <Table.Column
                    title="Action"
                    key="action"
                    dataIndex="action"
                    align="center"
                    render={(text, record) => {
                        return (
                            <Flex gap={10} justify="center">
                                {buttonPermissions[permissionCodes.view] && (
                                    <Button
                                        type="link"
                                        className="w-auto h-auto p-0"
                                        onClick={() => {
                                            if (onViewDocument) {
                                                onViewDocument(record);
                                            } else {
                                                navigate(`/documents/view/${record.id}`);
                                            }
                                        }}
                                        name="btn_view"
                                        title="View Document"
                                        icon={<FontAwesomeIcon icon={faEye} />}
                                    />
                                )}
                                {!showRevoked && permissionCodes.revoke && buttonPermissions[permissionCodes.revoke] && (
                                    <Popconfirm
                                        title="Are you sure you want to revoke this document?"
                                        description="This action will require password verification."
                                        onConfirm={() => {
                                            setSelectedDocument(record);
                                            handleRevokeConfirmed();
                                        }}
                                        okText="Yes, Continue"
                                        cancelText="No"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button
                                            type="link"
                                            className="w-auto h-auto p-0 text-danger"
                                            loading={loadingRevokeDocument || isRevoking}
                                            name="btn_revoke"
                                            title="Revoke Document"
                                            icon={<FontAwesomeIcon icon={faBan} />}
                                        />
                                    </Popconfirm>
                                )}
                            </Flex>
                        );
                    }}
                    width={180}
                />
            )}
            <Table.Column
                title="Profile"
                key="profile_fullname"
                dataIndex="profile"
                render={(text, record) => {
                    return record.profile?.fullname || record.profile?.firstname + ' ' + record.profile?.lastname || 'N/A';
                }}
                sorter={true}
                width={200}
            />
            <Table.Column
                title="Document Type"
                key="document_type"
                dataIndex="document_type"
                sorter={true}
                width={180}
            />

            <Table.Column
                title="Serial Number"
                key="serial_number"
                dataIndex="serial_number"
                sorter={true}
                render={(text, record) =>
                    text ? (
                        <Button
                            type="link"
                            className="p-0 w-auto h-auto"
                            onClick={() => {
                                navigate(`/documents/view/${record.id}`);
                            }}
                        >
                            {text}
                        </Button>
                    ) : null
                }
                width={200}
            />

            <Table.Column
                title="Version"
                key="current_version"
                dataIndex="current_version"
                sorter={true}
                align="center"
                render={(text, record) => `v${parseFloat(record.current_version || 0).toFixed(1)}`}
                width={100}
            />
            <Table.Column
                title="Status"
                key="status"
                dataIndex="status"
                sorter={true}
                align="center"
                render={(text, record) => {
                    const status = record.date_revoked && dayjs(record.date_revoked).isBefore(dayjs()) ? 'Revoked' : 'Issued';
                    return (
                        <Tag color={getStatusColor(status)}>
                            {status.toUpperCase()}
                        </Tag>
                    );
                }}
                width={120}
            />
            <Table.Column
                title="Date Issued"
                key="date_issued"
                dataIndex="date_issued"
                render={(text, _) =>
                    text ? dayjs(text).format("MM/DD/YYYY") : ""
                }
                sorter
                width={150}
            />
        </Table>
        
        {/* Password Verification Modal */}
        <ModalPasswordVerification
            open={showPasswordModal}
            onCancel={handleCancelRevocation}
            onSuccess={handlePasswordVerified}
            title="Security Verification Required"
            description="To revoke this document, please verify your identity by entering your password."
        />
        
        {/* Final Warning Modal */}
        <ModalRevocationWarning
            open={showWarningModal}
            onCancel={handleCancelRevocation}
            onConfirm={handleFinalRevoke}
            documentData={selectedDocument}
            loading={isRevoking}
        />
        </>
    );
}
