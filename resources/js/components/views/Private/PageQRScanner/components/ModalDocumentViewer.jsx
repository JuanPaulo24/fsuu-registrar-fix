import { Modal, Typography, Card, Row, Col, Button, Tag, Avatar, Flex, Spin, Table } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faFilePdf, 
    faUser, 
    faQrcode,
    faFileSignature,
    faCalendar,
    faIdCard,
    faGraduationCap,
    faTimes,
    faDownload,
    faCheckCircle
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";
import { defaultProfile, apiUrl, token } from "../../../../providers/appConfig";
// Document print functionality removed as it's not used in this component
import React, { useState, useEffect } from "react";
import DocumentPDFRouter, { DocumentPDFViewer, DocumentPDFDownload } from "./DocumentPDFRouter";
import CustomPDFViewer from "./CustomPDFViewer";

const { Text, Title } = Typography;

// Function to generate a random UUID
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export default function ModalDocumentViewer({ open, onClose, documentData, profileData, profilesData }) {
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [finalPdfUrl, setFinalPdfUrl] = useState(null);
    const [isLoadingPdf, setIsLoadingPdf] = useState(false);
    const [displayFilename, setDisplayFilename] = useState('');
    const [selectedDocumentForPreview, setSelectedDocumentForPreview] = useState(null);
    const [enhancedProfile, setEnhancedProfile] = useState(null);

    // Debug: Log the data structure when component mounts
    React.useEffect(() => {
        if (open && profilesData) {
            console.log('=== ModalDocumentViewer Debug ===');
            console.log('documentData:', documentData);
            console.log('profileData:', profileData);
            console.log('profilesData (completedProfiles):', profilesData);
            
            profilesData.forEach((profile, index) => {
                console.log(`Profile ${index + 1} (${profile.fullname || profile.firstname}):`, {
                    profile: profile,
                    generatedDocument: profile.generatedDocument,
                    hasGeneratedDocument: !!profile.generatedDocument
                });
            });
        }
    }, [open, profilesData, documentData]);

    // Handle preview document for individual profile
    const handlePreviewDocument = (profile) => {
        console.log('=== handlePreviewDocument Debug ===');
        console.log('Selected profile:', profile);
        console.log('Profile.generatedDocument:', profile.generatedDocument);
        console.log('Shared documentData:', documentData);
        
        // Reset any previously resolved URL so we don't reuse another profile's PDF
        setFinalPdfUrl(null);
        setDisplayFilename('');
        setIsLoadingPdf(true);

        // Use the individual document data for this profile if available
        const individualDocumentData = profile.generatedDocument || documentData;
        
        console.log('Using documentData:', individualDocumentData);
        console.log('Serial number will be:', individualDocumentData.serial_number || individualDocumentData.serialNumber);
        
        setSelectedDocumentForPreview({
            ...individualDocumentData,
            profile_data: profile,
            full_name: profile.fullname || `${profile.firstname || ''} ${profile.lastname || ''}`,
            student_id: profile.id_number || profile.id,
            program: profile.course || 'N/A'
        });
        setShowPreviewModal(true);
    };

    // Render multiple profiles table
    const renderMultipleProfilesTable = () => {
        const columns = [
            {
                title: "Action",
                key: "action",
                render: (_, record) => (
                    <Button
                        type="primary"
                        size="small"
                        icon={<FontAwesomeIcon icon={faFilePdf} />}
                        onClick={() => handlePreviewDocument(record)}
                        className="btn-main-primary"
                    >
                        Preview Document
                    </Button>
                ),
                width: 160,
                align: 'center'
            },
            {
                title: "Profile",
                key: "fullname",
                dataIndex: "fullname",
                render: (_, record) => {
                    const resolveProfilePicture = (p) => {
                        try {
                            if (p.profile_picture) {
                                return p.profile_picture;
                            }
                            const attachments = p?.attachments || p?.profile?.attachments || [];
                            const pics = Array.isArray(attachments) 
                                ? attachments.filter((f) => f?.file_description === "Profile Picture") 
                                : [];
                            if (pics.length > 0 && pics[pics.length - 1]?.file_path) {
                                return apiUrl(pics[pics.length - 1].file_path);
                            }
                        } catch (error) {
                            console.log('Error resolving profile picture:', error);
                        }
                        return defaultProfile;
                    };

                    const src = resolveProfilePicture(record);
                    
                    return (
                        <Flex align="center" gap={12}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f5f5f5' }}>
                                <img src={src} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>
                            <div>
                                <Text strong>{record.fullname || `${record.firstname || ''} ${record.lastname || ''}`}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    ID: {record.id_number || record.id}
                                </Text>
                            </div>
                        </Flex>
                    );
                },
                width: 250
            },
            {
                title: "Course/Program",
                dataIndex: "course",
                key: "course",
                render: (text) => text || "N/A",
                width: 200
            },
            {
                title: "Gender",
                dataIndex: "gender",
                key: "gender",
                render: (text) => text ? (
                    <Tag color={text === 'Male' ? 'blue' : 'pink'}>{text}</Tag>
                ) : "N/A",
                width: 100
            },
            {
                title: "Document Status",
                key: "status",
                render: () => (
                    <Tag color="green">
                        <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: 4 }} />
                        Generated
                    </Tag>
                ),
                width: 120
            }
        ];

        return (
            <div>
                <Title level={4} style={{ marginBottom: 16, color: 'var(--color-primary)' }}>
                    <FontAwesomeIcon icon={faFileSignature} style={{ marginRight: 8 }} />
                    Generated Documents ({profilesData?.length || 0})
                </Title>
                <Table
                    columns={columns}
                    dataSource={profilesData || []}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ x: 800 }}
                    style={{ marginBottom: 16 }}
                />
            </div>
        );
    };

    // Fetch the final document PDF when modal opens
    useEffect(() => {
        const run = async () => {
            if (!open) {
                setFinalPdfUrl(null);
                setDisplayFilename('');
                return;
            }

            setIsLoadingPdf(true);

            // Decide which document/profile is active for preview
            const activeDoc = selectedDocumentForPreview || documentData;
            const activeProfile = selectedDocumentForPreview?.profile_data || profileData;

            // 1) If caller already provided a path, use it
            if (activeDoc?.final_document_path) {
                setFinalPdfUrl(apiUrl(activeDoc.final_document_path));
                setDisplayFilename(`${generateUUID()}.pdf`);
                setIsLoadingPdf(false);
                return;
            }

            // 2) Try to fetch details to resolve attachments -> final_document
            try {
                const idParam =
                    activeDoc?.document_id ||
                    activeDoc?.document_id_number ||
                    activeDoc?.issued_document?.document_id_number ||
                    activeDoc?.id;
                if (idParam) {
                    const response = await fetch(apiUrl(`api/document-verification/details/${idParam}`), {
                        headers: {
                            Authorization: token(),
                            Accept: 'application/json'
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const doc = data?.data?.document;
                        const finalAttachment = doc?.attachments?.find?.(a => a.file_type === 'final_document');
                        if (finalAttachment?.file_path) {
                            setFinalPdfUrl(apiUrl(finalAttachment.file_path));
                            setDisplayFilename(`${generateUUID()}.pdf`);
                            setIsLoadingPdf(false);
                            return;
                        }
                    }
                }
            } catch (err) {
                // Ignore and fall back
                console.warn('Failed to resolve final document. Falling back to dynamic viewer.', err);
            }

            // 3) Last resort: Construct expected storage path based on naming convention
            // But skip this for certification documents that don't have backend files
            try {
                const docType = activeDoc?.doc_category || activeDoc?.document_type || 'Transcript of Records';
                
                // For certification documents without real backend processing, skip file loading
                // and let it fall back to dynamic PDF generation
                if (docType === 'Certification' && !activeDoc?.final_document_generated) {
                    console.log('Certification document without backend file - using dynamic generation');
                    setIsLoadingPdf(false);
                    return;
                }
                
                const typeMapping = {
                    'Transcript of Records': 'TOR',
                    'Certification': 'CERT',
                    'Diploma': 'DIP',
                    'Certificate of Units Earned': 'COUE'
                };
                const code = typeMapping[docType] || 'DOC';
                const version = activeDoc?.current_version || activeDoc?.issued_document?.current_version || 1;
                const idNumber =
                    activeProfile?.id_number ||
                    activeDoc?.profile?.id_number ||
                    activeDoc?.profile_data?.id_number ||
                    activeDoc?.profile_id_number ||
                    activeDoc?.issued_document?.profile?.id_number ||
                    null;
                if (idNumber) {
                    const guess = `storage/documents/profile/${idNumber}/${code}/FinalDocument_v${version}-${idNumber}.pdf`;
                    setFinalPdfUrl(apiUrl(guess));
                    setDisplayFilename(`${generateUUID()}.pdf`);
                }
            } catch (_) {}

            setIsLoadingPdf(false);
        };

        run();
    }, [open, showPreviewModal, selectedDocumentForPreview, documentData?.final_document_path, documentData?.document_id, documentData?.document_id_number, documentData?.id]);

    // Fetch profile with attachments if not present, so we can resolve profile picture consistently
    useEffect(() => {
        const resolveAndFetch = async () => {
            if (!open) {
                setEnhancedProfile(null);
                return;
            }

            const candidateProfile = selectedDocumentForPreview?.profile_data || profileData || null;
            const hasDirectPhoto = !!(candidateProfile?.profile_picture || candidateProfile?.photo);
            const hasAttachments = Array.isArray(candidateProfile?.attachments) && candidateProfile.attachments.length > 0;

            // Determine a usable profile id to fetch if needed
            const candidateId =
                candidateProfile?.id ||
                candidateProfile?.profile_id ||
                documentData?.profile_id ||
                documentData?.profile?.id ||
                documentData?.issued_document?.profile?.id ||
                null;

            if ((hasDirectPhoto || hasAttachments) && candidateProfile) {
                setEnhancedProfile(candidateProfile);
                return;
            }

            if (!candidateId) {
                setEnhancedProfile(candidateProfile);
                return;
            }

            try {
                const res = await fetch(apiUrl(`api/profile/${candidateId}`), {
                    headers: {
                        Authorization: token(),
                        Accept: 'application/json'
                    }
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json?.data) {
                        setEnhancedProfile(json.data);
                        return;
                    }
                }
                setEnhancedProfile(candidateProfile);
            } catch (_) {
                setEnhancedProfile(candidateProfile);
            }
        };

        resolveAndFetch();
    }, [open, profileData, documentData, selectedDocumentForPreview]);

    const resolveProfilePicture = () => {
        try {
            const p = enhancedProfile || selectedDocumentForPreview?.profile_data || profileData || {};
            if (p?.profile_picture) return p.profile_picture;
            if (p?.photo) return p.photo;
            
            const attachments = p?.attachments || p?.profile?.attachments || [];
            const pics = Array.isArray(attachments)
                ? attachments.filter((f) => f?.file_description === "Profile Picture")
                : [];
            if (pics.length > 0 && pics[pics.length - 1]?.file_path) {
                return apiUrl(pics[pics.length - 1].file_path);
            }
        } catch (error) {
            console.log('Error resolving profile picture in ModalDocumentViewer:', error);
        }
        return defaultProfile;
    };

    const renderProfileInfo = () => (
        <Card size="small" style={{ marginBottom: 16, backgroundColor: 'var(--color-highlight)' }}>
            <Flex align="center" gap={16}>
                <Avatar 
                    src={resolveProfilePicture() || defaultProfile} 
                    size={64}
                    icon={<FontAwesomeIcon icon={faUser} />}
                />
                <div style={{ flex: 1 }}>
                    <Title level={4} style={{ margin: 0, color: 'var(--color-primary)' }}>
                        {documentData?.full_name || profileData?.fullname || `${profileData?.firstname || ''} ${profileData?.lastname || ''}`}
                    </Title>
                    <Text type="secondary">
                        <FontAwesomeIcon icon={faIdCard} style={{ marginRight: 4 }} />
                        Student ID: {documentData?.student_id || profileData?.id_number || profileData?.id}
                    </Text>
                    <br />
                    <Text type="secondary">
                        <FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: 4 }} />
                        Program: {documentData?.program || profileData?.course || 'N/A'}
                    </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <Tag color="green" style={{ marginBottom: 8 }}>
                        <FontAwesomeIcon icon={faFileSignature} style={{ marginRight: 4 }} />
                        Digitally Signed
                    </Tag>
                    <br />
                    <Tag color="blue">
                        <FontAwesomeIcon icon={faQrcode} style={{ marginRight: 4 }} />
                        QR Verified
                    </Tag>
                </div>
            </Flex>
        </Card>
    );

    const renderDocumentDetails = () => (
        <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 8]}>
                <Col xs={24} sm={12}>
                    <Text strong>Document Type:</Text>
                    <br />
                    <Text>
                        <FontAwesomeIcon icon={faFilePdf} style={{ marginRight: 4 }} />
                        {documentData?.doc_category || 'Transcript of Records'}
                    </Text>
                </Col>
                <Col xs={24} sm={12}>
                    <Text strong>Version:</Text>
                    <br />
                    <Text>
                        <FontAwesomeIcon icon={faFileSignature} style={{ marginRight: 4 }} />
                        v{documentData?.current_version || '1.0'}
                    </Text>
                </Col>
                <Col xs={24} sm={12}>
                    <Text strong>Generated On:</Text>
                    <br />
                    <Text>
                        <FontAwesomeIcon icon={faCalendar} style={{ marginRight: 4 }} />
                        {dayjs().format("MM/DD/YYYY HH:mm A")}
                    </Text>
                </Col>
                {documentData?.serial_number && (
                    <Col xs={24} sm={12}>
                        <Text strong>Serial Number:</Text>
                        <br />
                        <Text style={{ fontFamily: 'monospace', fontSize: 13 }}>
                            {documentData.serial_number}
                        </Text>
                    </Col>
                )}
                {documentData?.document_id && (
                    <Col xs={24} sm={12}>
                        <Text strong>Document ID:</Text>
                        <br />
                        <Text style={{ fontFamily: 'monospace', fontSize: 13 }}>
                            {documentData.document_id}
                        </Text>
                    </Col>
                )}
            </Row>
        </Card>
    );

    const renderDocumentPreview = () => {
        // Use selectedDocumentForPreview if available (for individual profile preview), otherwise use shared documentData
        const currentDocumentData = selectedDocumentForPreview || documentData;
        const currentProfileData = selectedDocumentForPreview?.profile_data || profileData;
        
        // Determine document type for optimal sizing
        const docType = currentDocumentData?.doc_category || currentDocumentData?.document_type || '';
        const certType = currentDocumentData?.cert_type || '';
        
        // Diploma documents are landscape and need different height
        const isDiploma = (docType === 'Certification' && certType === 'Diploma') || 
                         (docType === 'Diploma');
        
        // Calculate optimal height based on document type and screen size
        const isSmallScreen = window.innerWidth < 768;
        const baseHeight = isDiploma ? 85 : 80; // Diploma needs more height due to landscape orientation
        const previewHeight = isSmallScreen ? `${baseHeight - 15}vh` : `${baseHeight}vh`;
        
        // If we have a final document path, show the actual PDF from storage
        if (finalPdfUrl) {
            return (
                <div style={{ 
                    height: previewHeight,
                    minHeight: isDiploma ? '700px' : '600px', // Higher minimum height for diplomas
                    backgroundColor: '#f8f9fa',
                    borderRadius: 8,
                    border: '1px solid #dee2e6'
                }}>
                    <CustomPDFViewer 
                        pdfUrl={finalPdfUrl} 
                        displayFilename={displayFilename}
                    />
                </div>
            );
        }

        // Fallback to dynamic PDF generation if no final document path
        return (
            <div style={{ 
                height: previewHeight,
                minHeight: isDiploma ? '700px' : '600px', // Higher minimum height for diplomas
                backgroundColor: '#f8f9fa',
                borderRadius: 8,
                border: '1px solid #dee2e6'
            }}>
                <DocumentPDFViewer 
                    documentData={currentDocumentData} 
                    profileData={enhancedProfile || currentProfileData}
                    qrCodeData={currentDocumentData}
                />
            </div>
        );
    };

    return (
        <>
            <Modal
                open={open}
                onCancel={onClose}
                width={900}
                centered
                title={
                    <Flex align="center" gap={8}>
                        <FontAwesomeIcon icon={faFilePdf} />
                        {profilesData && profilesData.length > 1 ? 'Document Viewer - Multiple Documents' : 'Document Viewer'}
                    </Flex>
                }
                footer={[
                    <Button key="close" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} style={{ marginRight: 4 }} />
                        Close
                    </Button>,
                    ...(profilesData && profilesData.length > 1 ? [] : [
                        <Button 
                            key="preview" 
                            type="primary"
                            className="btn-main-primary"
                            onClick={() => setShowPreviewModal(true)}
                            size="large"
                        >
                            <FontAwesomeIcon 
                                icon={faFilePdf}
                                style={{ marginRight: 6 }} 
                            />
                            Preview Document
                        </Button>
                    ])
                ]}
                styles={{
                    header: {
                        backgroundColor: 'var(--color-success)',
                        color: 'var(--color-white)'
                    }
                }}
            >
                {profilesData && profilesData.length > 1 
                    ? renderMultipleProfilesTable() 
                    : (
                        <>
                            {renderProfileInfo()}
                            {renderDocumentDetails()}
                        </>
                    )
                }
            </Modal>

            {/* Preview Modal */}
            <Modal
                open={showPreviewModal}
                onCancel={() => setShowPreviewModal(false)}
                width={window.innerWidth < 768 ? '95vw' : 1600} // Responsive width
                centered
                className={`document-preview ${(documentData?.doc_category === 'Certification' && documentData?.cert_type === 'Diploma') || documentData?.document_type === 'Diploma' ? 'diploma-preview' : ''}`}
                title={
                    <Flex align="center" gap={8}>
                        <FontAwesomeIcon icon={faFilePdf} />
                        Document Preview
                    </Flex>
                }
                footer={[
                    <div key="buttons" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
                        {finalPdfUrl && (
                            <Button 
                                type="primary"
                                className="btn-main-primary"
                                onClick={async () => {
                                    try {
                                        const response = await fetch(finalPdfUrl);
                                        if (!response.ok) {
                                            throw new Error('Failed to fetch PDF');
                                        }
                                        
                                        const blob = await response.blob();
                                        const blobUrl = URL.createObjectURL(blob);
                                        
                                        const link = document.createElement('a');
                                        link.href = blobUrl;
                                        link.download = displayFilename || 'document.pdf';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        
                                        // Clean up blob URL
                                        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                                    } catch (error) {
                                        console.error('Download failed:', error);
                                        // Fallback to direct download
                                        const link = document.createElement('a');
                                        link.href = finalPdfUrl;
                                        link.download = displayFilename || 'document.pdf';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }
                                }}
                                icon={<FontAwesomeIcon icon={faDownload} />}
                            >
                                Download PDF
                            </Button>
                        )}
                        <Button onClick={() => setShowPreviewModal(false)}>
                            <FontAwesomeIcon icon={faTimes} style={{ marginRight: 4 }} />
                            Close
                        </Button>
                    </div>
                ]}
                styles={{
                    header: {
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-white)'
                    }
                }}
            >
                {renderDocumentPreview()}
            </Modal>
        </>
    );
}
