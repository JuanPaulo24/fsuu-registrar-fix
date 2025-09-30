import { Modal, Descriptions, Tag, Typography } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function ModalQRHistoryDetails({ visible, onCancel, scanData }) {
    if (!scanData) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'green';
            case 'revoked': return 'orange';
            case 'failed': return 'red';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'success': return 'Success';
            case 'revoked': return 'Revoked';
            case 'failed': return 'Failed';
            default: return status;
        }
    };

    return (
        <Modal
            title="QR Scan Details"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <div style={{ marginBottom: '16px' }}>
                <Title level={5}>Scan Information</Title>
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Scan Date & Time" span={2}>
                        {dayjs(scanData.scanned_at).format('MMMM DD, YYYY - HH:mm:ss')}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Status">
                        <Tag color={getStatusColor(scanData.scan_status)}>
                            {getStatusText(scanData.scan_status)}
                        </Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Email Sent">
                        <Tag color={scanData.email_sent ? 'green' : 'default'}>
                            {scanData.email_sent ? 'Yes' : 'No'}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <Title level={5}>Student Information</Title>
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Full Name">
                        {scanData.student_name}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Student ID">
                        {scanData.student_id || 'N/A'}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Document Type">
                        {scanData.document_type}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Serial Number">
                        {scanData.serial_number}
                    </Descriptions.Item>
                </Descriptions>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <Title level={5}>Contact Information</Title>
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Email Address">
                        {scanData.email}
                    </Descriptions.Item>
                </Descriptions>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <Title level={5}>Technical Information</Title>
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="IP Address">
                        {scanData.ip_address}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Browser">
                        {scanData.browser}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Device Type">
                        {scanData.device}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="User Agent" span={2}>
                        <Text code style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                            {scanData.user_agent}
                        </Text>
                    </Descriptions.Item>
                </Descriptions>
            </div>

            {scanData.failure_reason && (
                <div>
                    <Title level={5}>Failure Details</Title>
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Failure Reason">
                            <Text type="danger">{scanData.failure_reason}</Text>
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            )}
        </Modal>
    );
}