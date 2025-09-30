import React from "react";
import { Modal, Row, Col, Typography, Card, Tag, Space, Divider, Timeline, Empty, Collapse } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faCheckCircle, 
    faTimesCircle, 
    faFileAlt,
    faClock,
    faExclamationTriangle,
    faHistory,
    faFolder
} from "@fortawesome/pro-solid-svg-icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function ModalStudentDocumentHistory({ 
    visible, 
    onCancel, 
    profileData 
}) {

    // Helper function to get document status for a specific document type
    const getDocumentsByType = (documentType) => {
        if (!profileData?.issued_document) return [];
        
        return profileData.issued_document.filter(doc => 
            doc.document_type === documentType
        ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    };

    // Helper function to determine if a document is active (not revoked)
    const isDocumentActive = (document) => {
        return !document.date_revoked;
    };

    // Helper function to get the latest active document for a type
    const getLatestActiveDocument = (documentType) => {
        const documents = getDocumentsByType(documentType);
        return documents.find(doc => isDocumentActive(doc)) || null;
    };

    // Helper function to render document status
    const renderDocumentStatus = (documentType) => {
        const latestActive = getLatestActiveDocument(documentType);
        const allDocuments = getDocumentsByType(documentType);
        
        let icon, color, text, iconColor;
        
        if (latestActive) {
            icon = faCheckCircle;
            color = 'success';
            text = 'Has Document';
            iconColor = 'text-green-500';
        } else if (allDocuments.length > 0) {
            // Has documents but all are revoked
            icon = faExclamationTriangle;
            color = 'warning';
            text = 'No Active Document';
            iconColor = 'text-orange-500';
        } else {
            icon = faTimesCircle;
            color = 'error';
            text = 'No Document';
            iconColor = 'text-red-500';
        }

        return (
            <Space size="small">
                <FontAwesomeIcon 
                    icon={icon} 
                    className={iconColor}
                />
                <Tag color={color} size="small">
                    {text}
                </Tag>
                {latestActive && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        v{latestActive.current_version} • {dayjs(latestActive.date_issued).format('MMM DD, YYYY')}
                    </Text>
                )}
            </Space>
        );
    };

    // Helper function to render document history timeline
    const renderDocumentHistory = (documentType) => {
        const documents = getDocumentsByType(documentType);
        
        if (documents.length === 0) {
            return (
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No documents found"
                    style={{ margin: '20px 0' }}
                />
            );
        }

        const timelineItems = documents.map(doc => ({
            dot: (
                <FontAwesomeIcon 
                    icon={isDocumentActive(doc) ? faCheckCircle : faTimesCircle}
                    className={isDocumentActive(doc) ? 'text-green-500' : 'text-red-500'}
                />
            ),
            children: (
                <div>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Space>
                            <Tag color={isDocumentActive(doc) ? 'success' : 'error'}>
                                {isDocumentActive(doc) ? 'Active' : 'Revoked'}
                            </Tag>
                            <Text strong>Version {doc.current_version}</Text>
                            <Text type="secondary">
                                ID: {doc.document_id_number}
                            </Text>
                        </Space>
                        <Text type="secondary">
                            <FontAwesomeIcon icon={faClock} style={{ marginRight: 8 }} />
                            Issued: {dayjs(doc.date_issued).format('MMMM DD, YYYY [at] h:mm A')}
                        </Text>
                        {doc.date_revoked && (
                            <Text type="danger">
                                <FontAwesomeIcon icon={faTimesCircle} style={{ marginRight: 8 }} />
                                Revoked: {dayjs(doc.date_revoked).format('MMMM DD, YYYY [at] h:mm A')}
                            </Text>
                        )}
                        {doc.serial_number && (
                            <Text type="secondary">
                                Serial: {doc.serial_number}
                            </Text>
                        )}
                    </Space>
                </div>
            )
        }));

        return <Timeline items={timelineItems} />;
    };

    const documentTypes = [
        { key: 'Transcript of Records', label: 'Transcript of Records (TOR)' },
        { key: 'Diploma', label: 'Diploma' },
        { key: 'Certificate of Units Earned', label: 'Certificate of Units Earned' }
    ];

    return (
        <Modal
            title={
                <div>
                    <FontAwesomeIcon icon={faHistory} style={{ marginRight: 10 }} />
                    Student Document History
                </div>
            }
            open={visible}
            onCancel={onCancel}
            width={1000}
            footer={null}
            destroyOnClose
        >
            {profileData && (
                <>
                    {/* Student Basic Information */}
                    <Card size="small" className="mb-4">
                        <Row gutter={[16, 8]}>
                            <Col span={24}>
                                <Title level={4} className="mb-2">
                                    {profileData.firstname} {profileData.middlename} {profileData.lastname} {profileData.name_ext}
                                </Title>
                            </Col>
                            {/* Student ID */}
                            <Col xs={24} sm={12} md={12}>
                                <Text strong>Student ID: </Text>
                                <Text>{profileData.id_number || 'N/A'}</Text>
                            </Col>
                            {/* Email */}
                            <Col xs={24} sm={12} md={12}>
                                <Text strong>Email: </Text>
                                <Text>{profileData.email || 'N/A'}</Text>
                            </Col>
                            {/* Course on its own row for better readability */}
                            <Col xs={24} sm={24} md={24}>
                                <Text strong>Program: </Text>
                                <Text>{profileData.course || 'N/A'}</Text>
                            </Col>
                        </Row>
                    </Card>

                    <Divider>Document Status Summary</Divider>
                    
                    {/* Document Status Overview */}
                    <Row gutter={[16, 16]} className="mb-4">
                        {documentTypes.map(docType => (
                            <Col xs={24} sm={8} key={docType.key}>
                                <Card size="small">
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Text strong>{docType.label}</Text>
                                        {renderDocumentStatus(docType.key)}
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Divider>Document History</Divider>

                    {/* Document History Timelines */}
                    <Collapse 
                        defaultActiveKey={['tor']} 
                        ghost
                        size="small"
                    >
                        {documentTypes.map(docType => {
                            const key = docType.key === 'Transcript of Records' ? 'tor' : 
                                      docType.key === 'Diploma' ? 'diploma' : 'coe';
                            
                            return (
                                <Collapse.Panel 
                                    key={key}
                                    header={
                                        <Space className="text-white" style={{ color: '#fff' }}>
                                            <FontAwesomeIcon icon={faFolder} className="text-white" style={{ marginRight: 8 }} />
                                            <Text strong className="text-white" style={{ color: '#fff' }}>{docType.label}</Text>
                                            {(() => {
                                                const documents = getDocumentsByType(docType.key);
                                                const activeCount = documents.filter(doc => isDocumentActive(doc)).length;
                                                const totalCount = documents.length;
                                                
                                                if (totalCount > 0) {
                                                    return (
                                                        <Tag color={activeCount > 0 ? 'success' : 'warning'} size="small">
                                                            {activeCount}/{totalCount} Active
                                                        </Tag>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </Space>
                                    }
                                >
                                    {renderDocumentHistory(docType.key)}
                                </Collapse.Panel>
                            );
                        })}
                    </Collapse>
                </>
            )}
        </Modal>
    );
}
