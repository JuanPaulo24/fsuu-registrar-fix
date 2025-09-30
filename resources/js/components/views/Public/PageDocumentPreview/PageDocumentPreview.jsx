import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Spin, Alert, Button, Typography, Space } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShieldCheck, faExclamationTriangle } from '@fortawesome/pro-regular-svg-icons';
import { apiUrl, token } from '../../../providers/appConfig';
import CustomPDFViewer from '../../Private/PageDocumentManagement/components/CustomPDFViewer';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function PageDocumentPreview() {
    const { uuid, id } = useParams();
    const documentId = uuid || id; // Support both parameter names
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [documentData, setDocumentData] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        const fetchDocumentByUuid = async () => {
            console.log('PageDocumentPreview: documentId =', documentId);
            console.log('PageDocumentPreview: uuid =', uuid, ', id =', id);
            
            if (!documentId) {
                setError('Invalid document identifier');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Try to fetch document details using the document ID (use public endpoint)
                const userToken = token();
                const endpoint = userToken ? `api/document-verification/details/${documentId}` : `api/public/document-verification/details/${documentId}`;
                const headers = {
                    Accept: 'application/json'
                };
                
                // Add authorization header only if token is available
                if (userToken) {
                    headers.Authorization = userToken;
                }

                const response = await fetch(apiUrl(endpoint), { headers });

                if (!response.ok) {
                    throw new Error('Document not found or access denied');
                }

                const data = await response.json();
                const doc = data?.data?.document;

                if (!doc) {
                    throw new Error('Document data not available');
                }

                setDocumentData(doc);

                // Try to find the final document attachment
                const finalAttachment = doc?.attachments?.find?.(a => a.file_type === 'final_document');
                if (finalAttachment?.file_path) {
                    setPdfUrl(apiUrl(finalAttachment.file_path));
                } else if (doc.final_document_path) {
                    setPdfUrl(apiUrl(doc.final_document_path));
                } else {
                    // Fallback: construct expected storage path
                    const typeMapping = {
                        'Certification': 'CERT',
                        'Diploma': 'DIP',
                        'Certificate of Units Earned': 'COUE'
                    };
                    const docType = doc?.doc_category || doc?.document_type || 'Transcript of Records';
                    const code = typeMapping[docType] || 'DOC';
                    const version = doc?.current_version || 1;
                    const idNumber = doc?.profile?.id_number || doc?.profile_id_number;
                    
                    if (idNumber) {
                        const fallbackPath = `storage/documents/profile/${idNumber}/${code}/FinalDocument_v${version}-${idNumber}.pdf`;
                        setPdfUrl(apiUrl(fallbackPath));
                    } else {
                        throw new Error('Unable to locate document file');
                    }
                }

            } catch (err) {
                console.error('Error fetching document:', err);
                setError(err.message || 'Failed to load document');
            } finally {
                setLoading(false);
            }
        };

        fetchDocumentByUuid();
    }, [documentId]);

    const handleGoBack = () => {
        navigate('/verifier');
    };

    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <Content style={{ 
                    padding: '48px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: '16px', color: '#6b7280' }}>
                            Loading document...
                        </div>
                    </div>
                </Content>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <Content style={{ 
                    padding: '48px 24px',
                    maxWidth: '800px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Button 
                            type="text" 
                            icon={<FontAwesomeIcon icon={faArrowLeft} />}
                            onClick={handleGoBack}
                            style={{ color: '#1e40af' }}
                        >
                            Back to Verifier
                        </Button>

                        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
                            <FontAwesomeIcon 
                                icon={faExclamationTriangle} 
                                style={{ fontSize: '64px', color: '#f59e0b', marginBottom: '24px' }} 
                            />
                            <Title level={3} style={{ color: '#dc2626', marginBottom: '16px' }}>
                                Document Not Found
                            </Title>
                            <Text style={{ color: '#6b7280', fontSize: '16px' }}>
                                {error}
                            </Text>
                        </Card>
                    </Space>
                </Content>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Content style={{ 
                padding: '24px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%'
            }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button 
                            type="text" 
                            icon={<FontAwesomeIcon icon={faArrowLeft} />}
                            onClick={handleGoBack}
                            style={{ color: '#1e40af' }}
                        >
                            Back to Verifier
                        </Button>

                        <Space>
                            <FontAwesomeIcon icon={faShieldCheck} style={{ color: '#10b981' }} />
                            <Text style={{ color: '#10b981', fontWeight: 'bold' }}>
                                Verified Document
                            </Text>
                        </Space>
                    </div>

                    {documentData && (
                        <Card 
                            title={
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {documentData.doc_category || documentData.document_type || 'Document Preview'}
                                    </Title>
                                    <Text type="secondary">
                                        {documentData.profile?.first_name} {documentData.profile?.last_name} 
                                        {documentData.profile?.id_number && ` • ID: ${documentData.profile.id_number}`}
                                    </Text>
                                </div>
                            }
                            style={{ 
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <div style={{ 
                                height: '80vh',
                                backgroundColor: '#f8f9fa',
                                borderRadius: 8,
                                border: '1px solid #dee2e6'
                            }}>
                                {pdfUrl ? (
                                    <CustomPDFViewer 
                                        pdfUrl={pdfUrl} 
                                        displayFilename={`${documentId}.pdf`}
                                    />
                                ) : (
                                    <div style={{ 
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#6b7280'
                                    }}>
                                        Document preview not available
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </Space>
            </Content>
        </Layout>
    );
}
