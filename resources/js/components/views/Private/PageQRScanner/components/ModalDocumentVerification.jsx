import { useState } from "react";
import { Modal, Card, Typography, Space, Button, Alert, Descriptions, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faCheckCircle, 
    faTimesCircle, 
    faExclamationTriangle,
    faFileText, 
    faUser, 
    faCalendar,
    faIdCard,
    faGraduationCap,
    faFilePdf
} from "@fortawesome/pro-regular-svg-icons";
import ModalDocumentViewer from "./ModalDocumentViewer";

const { Title, Text } = Typography;

export default function ModalDocumentVerification({ 
    open, 
    onClose, 
    verificationResult, 
    isValid, 
    errorMessage 
}) {
    const [showDocumentViewer, setShowDocumentViewer] = useState(false);
    const document = verificationResult?.data?.document;
    const qrData = verificationResult?.data?.qr_data;
    const verificationStatus = verificationResult?.data?.verification_status;
    const verificationDetails = verificationResult?.data?.verification_details;
    const scanStatus = verificationResult?.data?.scan_status;
    const profile = document?.profile;

    // Determine if this is a revoked document
    const isRevoked = scanStatus === 'revoked' || document?.date_revoked || errorMessage?.toLowerCase().includes('revoked');
    const isActuallyValid = isValid && !isRevoked;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Close
                </Button>,
                ...((isActuallyValid || isRevoked) && document ? [
                    <Button 
                        key="preview" 
                        type="primary" 
                        icon={<FontAwesomeIcon icon={faFilePdf} />}
                        onClick={() => setShowDocumentViewer(true)}
                    >
                        Preview Document
                    </Button>
                ] : [])
            ]}
            width={600}
            centered
            title={
                <Space>
                    <FontAwesomeIcon 
                        icon={isActuallyValid ? faCheckCircle : (isRevoked ? faExclamationTriangle : faTimesCircle)} 
                        style={{ color: isActuallyValid ? '#52c41a' : (isRevoked ? '#fa8c16' : '#ff4d4f') }}
                    />
                    {isActuallyValid ? 'Document Verified' : (isRevoked ? 'Document Revoked' : 'Verification Failed')}
                </Space>
            }
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {!isActuallyValid && errorMessage && (
                    <Alert
                        message={isRevoked ? "Document Revoked" : "Verification Error"}
                        description={errorMessage}
                        type={isRevoked ? "warning" : "error"}
                        showIcon
                    />
                )}

                {/* Show verification success details */}
                {isActuallyValid && verificationResult?.data?.verification_details?.pdf_hash_verified && (
                    <Alert
                        message="Document Integrity Verified"
                        description={`Original document hash verified successfully (${verificationResult.data.verification_details.verified_file})`}
                        type="success"
                        showIcon
                    />
                )}

                {(isActuallyValid || isRevoked) && document && (
                    <>
                        <Card 
                            title={
                                <Space>
                                    <FontAwesomeIcon icon={faFileText} />
                                    Document Information
                                </Space>
                            }
                            size="small"
                        >
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Document Type">
                                    <Tag color="blue">{document.document_type}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Document ID">
                                    <Text code>{document.document_id_number}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Serial Number">
                                    <Text code>{document.serial_number}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Version">
                                    {document.current_version}
                                </Descriptions.Item>
                                <Descriptions.Item label="Date Issued">
                                    {new Date(document.date_issued).toLocaleDateString()}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {profile && (
                            <Card 
                                title={
                                    <Space>
                                        <FontAwesomeIcon icon={faUser} />
                                        Student Information
                                    </Space>
                                }
                                size="small"
                            >
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Full Name">
                                        <Text strong>
                                            {`${profile.firstname} ${profile.middlename || ''} ${profile.lastname}`.replace(/\s+/g, ' ').trim()}
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Student ID">
                                        <Text code>{profile.id_number}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Course">
                                        <Tag color="green">{profile.course}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Birthdate">
                                        {new Date(profile.birthdate).toLocaleDateString()}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Gender">
                                        {profile.gender}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        )}

                        {isActuallyValid && (
                            <Alert
                                message="Document is Valid"
                                description="This document has been verified and is authentic. All digital signatures and hashes match the original document."
                                type="success"
                                showIcon
                            />
                        )}
                        
                        {isRevoked && (
                            <Alert
                                message="Document is Revoked"
                                description={`This document has been revoked and is no longer valid. ${document?.revocation_reason && document.revocation_reason !== 'No reason provided' ? `Reason: ${document.revocation_reason}` : 'No reason provided.'}`}
                                type="warning"
                                showIcon
                            />
                        )}
                    </>
                )}
            </Space>

            {/* Document Viewer Modal */}
            <ModalDocumentViewer
                open={showDocumentViewer}
                onClose={() => setShowDocumentViewer(false)}
                documentData={{
                    document_id: document?.document_id_number,
                    document_id_number: document?.document_id_number,
                    doc_category: document?.document_type,
                    document_type: document?.document_type,
                    serial_number: document?.serial_number,
                    current_version: document?.current_version,
                    full_name: profile ? `${profile.firstname} ${profile.middlename || ''} ${profile.lastname}`.replace(/\s+/g, ' ').trim() : '',
                    student_id: profile?.id_number,
                    program: profile?.course,
                    issued_document: document
                }}
                profileData={profile}
            />
        </Modal>
    );
}