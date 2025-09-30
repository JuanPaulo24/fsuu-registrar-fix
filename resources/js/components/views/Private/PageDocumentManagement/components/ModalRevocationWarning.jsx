import React, { useState, useEffect } from "react";
import { Modal, Alert, Space, Typography, Button, Divider, Form, Select, Input } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faExclamationTriangle, 
    faBan,
    faCircleExclamation,
    faFileCircleXmark
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

const { Text, Title, Paragraph } = Typography;

export default function ModalRevocationWarning({
    open,
    onCancel,
    onConfirm,
    documentData,
    loading = false,
}) {
    const [form] = Form.useForm();
    const [revocationReason, setRevocationReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (open && documentData) {
            form.resetFields();
            setRevocationReason('');
            setCustomReason('');
            setShowCustomInput(false);
        }
    }, [open, form, documentData]);

    if (!documentData) return null;

    const revocationOptions = [
        { value: 'validity_period_lapsed', label: 'Validity period lapsed' },
        { value: 'replaced_by_newer_version', label: 'Replaced by a newer version' },
        { value: 'issuer_requested_revocation', label: 'Issuer requested revocation' },
        { value: 'missing_or_incorrect_fields', label: 'Missing or incorrect fields' },
        { value: 'data_compromise', label: 'Data compromise' },
        { value: 'reported_stolen', label: 'Reported stolen' },
        { value: 'others', label: 'Others' }
    ];

    const handleRevocationReasonChange = (value) => {
        setRevocationReason(value);
        setShowCustomInput(value === 'others');
        if (value !== 'others') {
            setCustomReason('');
        }
    };

    const handleConfirm = () => {
        const finalReason = revocationReason === 'others' 
            ? customReason 
            : revocationOptions.find(opt => opt.value === revocationReason)?.label || '';
        
        if (!revocationReason) {
            form.setFields([
                { name: 'revocation_reason', errors: ['Please select a revocation reason'] }
            ]);
            return;
        }

        if (revocationReason === 'others' && !customReason.trim()) {
            form.setFields([
                { name: 'custom_reason', errors: ['Please specify the reason'] }
            ]);
            return;
        }

        onConfirm(finalReason);
    };

    const profileName = documentData.profile?.fullname || 
        `${documentData.profile?.firstname} ${documentData.profile?.lastname}` || 
        'N/A';
    
    const documentType = documentData.document_type || 'Document';
    const serialNumber = documentData.serial_number || 'N/A';
    const documentId = documentData.document_id_number || 'N/A';
    const dateIssued = documentData.date_issued ? 
        dayjs(documentData.date_issued).format("MMMM DD, YYYY") : 'N/A';
    const version = `v${parseFloat(documentData.current_version || 0).toFixed(1)}`;

    return (
        <Modal
            wrapClassName="modal-revocation-warning-wrap"
            title={
                <Space align="center">
                    <FontAwesomeIcon 
                        icon={faExclamationTriangle} 
                        className="text-danger" 
                        style={{ fontSize: "24px" }}
                    />
                    <span className="text-danger">
                        Document Revocation Warning
                    </span>
                </Space>
            }
            open={open}
            onCancel={onCancel}
            footer={[
                <Button 
                    key="cancel" 
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>,
                <Button
                    key="confirm"
                    type="primary"
                    danger
                    loading={loading}
                    onClick={handleConfirm}
                    icon={<FontAwesomeIcon icon={faBan} />}
                >
                    Confirm Revocation
                </Button>,
            ]}
            width={640}
            height={600}
            centered
            maskClosable={false}
            closable={!loading}
            className="modal-revocation-warning"
            styles={{
                body: {
                    height: '520px',
                    overflowY: 'auto',
                    padding: '0'
                }
            }}
        >
            <div className="py-4 px-6">
                {/* Critical Warning Alert */}
                <Alert
                    message="IRREVERSIBLE ACTION"
                    description="This action cannot be undone. Once revoked, this document will be permanently invalidated."
                    type="error"
                    showIcon
                    icon={<FontAwesomeIcon icon={faCircleExclamation} />}
                    className="mb-4"
                />

                {/* Document Information */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <Title level={5} className="mb-3 text-gray-700">
                        Document Information
                    </Title>
                    <Space direction="vertical" className="w-full" size={8}>
                        <div className="flex justify-between">
                            <Text className="text-gray-600">Student Name:</Text>
                            <Text strong>{profileName}</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text className="text-gray-600">Document Type:</Text>
                            <Text strong>{documentType}</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text className="text-gray-600">Serial Number:</Text>
                            <Text strong className="font-mono">{serialNumber}</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text className="text-gray-600">Document ID:</Text>
                            <Text strong className="font-mono">{documentId}</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text className="text-gray-600">Version:</Text>
                            <Text strong>{version}</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text className="text-gray-600">Date Issued:</Text>
                            <Text strong>{dateIssued}</Text>
                        </div>
                    </Space>
                </div>

                <Divider />

                {/* Revocation Reason Form */}
                <div className="mb-4">
                    <Title level={5} className="mb-3 text-gray-700">
                        Revocation Reason
                    </Title>
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="revocation_reason"
                            label="Please select the reason for revocation"
                            rules={[{ required: true, message: 'Please select a revocation reason' }]}
                        >
                            <Select
                                placeholder="Select revocation reason"
                                value={revocationReason}
                                onChange={handleRevocationReasonChange}
                                size="large"
                            >
                                {revocationOptions.map(option => (
                                    <Select.Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {showCustomInput && (
                            <Form.Item
                                name="custom_reason"
                                label="Specify the reason (max 100 characters)"
                                rules={[
                                    { required: true, message: 'Please specify the reason' },
                                    { max: 100, message: 'Reason cannot exceed 100 characters' }
                                ]}
                            >
                                <Input.TextArea
                                    placeholder="Enter the specific reason for revocation..."
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    maxLength={100}
                                    showCount
                                    rows={3}
                                    size="large"
                                />
                            </Form.Item>
                        )}
                    </Form>
                </div>


                {/* Final Confirmation Text */}
                <Alert
                    message="Final Confirmation"
                    description={
                        <Text>
                            Please ensure this revocation is necessary and authorized. 
                            Click <Text strong className="text-danger">"Confirm Revocation"</Text> only 
                            if you are absolutely certain you want to proceed with this irreversible action.
                        </Text>
                    }
                    type="warning"
                    className="mt-4"
                />
            </div>
        </Modal>
    );
}