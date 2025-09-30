import { useState, useRef } from 'react';
import { Card, Row, Col, Button, Upload, Typography, Space, Alert, Divider, message, Spin } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faQrcode, 
    faUpload, 
    faCamera, 
    faShieldCheck,
    faFileImage
} from '@fortawesome/pro-regular-svg-icons';
import QRScanner from './QRScanner';
import QrScanner from 'qr-scanner';

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;

export default function QRVerification({ onQRScanned, isValidating }) {
    const [scanMode, setScanMode] = useState('upload'); // 'scan' or 'upload'
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (file) => {
        try {
            // Validate file type
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Please upload an image file!');
                return false;
            }

            // Validate file size (max 5MB)
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Image must be smaller than 5MB!');
                return false;
            }

            setUploading(true);

            // Create image element to scan QR code
            const img = new Image();
            
            img.onload = async () => {
                try {
                    // Use QrScanner to scan the image (same approach as PageQRScanner)
                    const result = await QrScanner.scanImage(img, { returnDetailedScanResult: true });
                    
                    if (result && result.data) {
                        let actualQrData = result.data;
                        
                        // Check if QR data is a hash (64 hex characters for SHA256)
                        const isHash = /^[a-fA-F0-9]{64}$/.test(result.data);
                        
                        if (isHash) {
                            try {
                                // Verify hash and get base45 data from system
                                const response = await fetch('/api/public/document-verification/verify-hash', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        hash: result.data
                                    })
                                });
                                
                                const hashResult = await response.json();
                                
                                if (hashResult.success) {
                                    actualQrData = hashResult.data.base45_data;
                                    // Don't show message here - will show one success message at the end
                                } else {
                                    message.error(hashResult.message || 'Hash verification failed');
                                    setUploading(false);
                                    return;
                                }
                            } catch (hashError) {
                                console.error('Hash verification failed:', hashError);
                                message.error('Invalid hash - document not found in system');
                                setUploading(false);
                                return;
                            }
                        }
                        
                        // Parse the QR code data (now actualQrData, which could be original or from hash lookup)
                        let qrData;
                        try {
                            // Try to parse as JSON first (for structured QR codes)
                            qrData = JSON.parse(actualQrData);
                        } catch {
                            // If not JSON, treat as plain text
                            qrData = {
                                documentId: actualQrData,
                                type: 'document',
                                issuedDate: new Date().toISOString(),
                                valid: true,
                                rawData: actualQrData
                            };
                        }


                        onQRScanned(qrData);
                    } else {
                        message.error('No QR code found in the uploaded image.');
                    }
                } catch (error) {
                    message.error('No QR code found in the image. Please make sure the image contains a clear, visible QR code.');
                } finally {
                    setUploading(false);
                }
            };
            
            img.onerror = () => {
                setUploading(false);
                message.error('Failed to load image file.');
            };
            
            // Load the image
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            
        } catch (error) {
            message.error('Failed to process the uploaded file.');
            setUploading(false);
        }
        
        return false; // Prevent default upload
    };

    const uploadProps = {
        name: 'qr-image',
        multiple: false,
        accept: 'image/*',
        beforeUpload: handleFileUpload,
        showUploadList: false,
        disabled: uploading,
    };

    return (
        <div style={{ padding: '24px 0', position: 'relative' }}>
            {/* Loading overlay during validation */}
            {isValidating && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    borderRadius: '12px'
                }}>
                    <Spin size="large" style={{ marginBottom: '16px' }} />
                    <Text style={{ fontSize: '16px', color: '#6b7280' }}>
                        Validating QR code...
                    </Text>
                </div>
            )}
            
            {/* Hero Section */}
            <div style={{ 
                textAlign: 'center', 
                marginBottom: '48px',
                padding: '40px 24px',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                borderRadius: '12px',
                color: 'white'
            }}>
                <FontAwesomeIcon 
                    icon={faShieldCheck} 
                    style={{ fontSize: '64px', marginBottom: '24px' }} 
                />
                <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
                    Verify Your Document
                </Title>
                <Paragraph style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '1.125rem',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    Upload an image of your QR code or use your camera to scan it directly. 
                    We'll verify the authenticity of your document instantly.
                </Paragraph>
            </div>

            {/* Method Selection */}
            <Row justify="center" style={{ marginBottom: '32px' }}>
                <Col>
                    <Space size="large">
                        <Button 
                            type={scanMode === 'upload' ? 'primary' : 'default'}
                            size="large"
                            icon={<FontAwesomeIcon icon={faUpload} />}
                            onClick={() => setScanMode('upload')}
                            style={{
                                height: '48px',
                                padding: '0 24px',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}
                        >
                            Upload Image
                        </Button>
                        <Button 
                            type={scanMode === 'scan' ? 'primary' : 'default'}
                            size="large"
                            icon={<FontAwesomeIcon icon={faCamera} />}
                            onClick={() => setScanMode('scan')}
                            style={{
                                height: '48px',
                                padding: '0 24px',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}
                        >
                            Scan with Camera
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Content Area */}
            <Row justify="center">
                <Col xs={24} sm={20} md={16} lg={12}>
                    <Card 
                        style={{ 
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e5e7eb'
                        }}
                        bodyStyle={{ padding: '32px' }}
                    >
                        {scanMode === 'upload' ? (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    <FontAwesomeIcon 
                                        icon={faFileImage} 
                                        style={{ fontSize: '48px', color: '#3b82f6', marginBottom: '16px' }} 
                                    />
                                    <Title level={3} style={{ marginBottom: '8px' }}>
                                        Upload QR Code Image
                                    </Title>
                                    <Text type="secondary">
                                        Select an image file containing the QR code from your device
                                    </Text>
                                </div>
                                
                                <Dragger {...uploadProps} style={{ marginBottom: '16px' }}>
                                    <p className="ant-upload-drag-icon">
                                        <FontAwesomeIcon 
                                            icon={faUpload} 
                                            style={{ 
                                                fontSize: '48px', 
                                                color: uploading ? '#9ca3af' : '#3b82f6' 
                                            }} 
                                        />
                                    </p>
                                    <p className="ant-upload-text" style={{ 
                                        fontSize: '16px', 
                                        fontWeight: '500',
                                        color: uploading ? '#6b7280' : 'inherit'
                                    }}>
                                        {uploading ? 'Scanning QR code...' : 'Click or drag file to this area to upload'}
                                    </p>
                                    <p className="ant-upload-hint" style={{ color: '#6b7280' }}>
                                        {uploading ? 'Please wait while we process your image' : 'Support for PNG, JPG, JPEG files. Make sure the QR code is clearly visible.'}
                                    </p>
                                </Dragger>
                                
                                <Alert
                                    message="Tips for better results"
                                    description="Ensure the QR code is well-lit, in focus, and takes up a good portion of the image for best scanning results."
                                    type="info"
                                    showIcon
                                />
                            </div>
                        ) : (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    <FontAwesomeIcon 
                                        icon={faQrcode} 
                                        style={{ fontSize: '48px', color: '#3b82f6', marginBottom: '16px' }} 
                                    />
                                    <Title level={3} style={{ marginBottom: '8px' }}>
                                        Scan QR Code
                                    </Title>
                                    <Text type="secondary">
                                        Position the QR code within the camera frame
                                    </Text>
                                </div>
                                
                                <QRScanner onScan={onQRScanned} />
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Instructions */}
            <Row justify="center" style={{ marginTop: '48px' }}>
                <Col xs={24} md={20} lg={16}>
                    <Card 
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FontAwesomeIcon icon={faShieldCheck} style={{ color: '#3b82f6' }} />
                                <span>How Document Verification Works</span>
                            </div>
                        }
                        style={{ borderRadius: '12px' }}
                    >
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#dbeafe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}>
                                    <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>1</Text>
                                </div>
                                <Title level={5} style={{ marginBottom: '8px' }}>Upload or Scan</Title>
                                <Text type="secondary">
                                    Upload an image of the QR code or scan it directly with your camera
                                </Text>
                            </Col>
                            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#dbeafe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}>
                                    <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>2</Text>
                                </div>
                                <Title level={5} style={{ marginBottom: '8px' }}>Enter Details</Title>
                                <Text type="secondary">
                                    Provide your email address and the document serial number for verification
                                </Text>
                            </Col>
                            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#dbeafe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}>
                                    <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>3</Text>
                                </div>
                                <Title level={5} style={{ marginBottom: '8px' }}>Get Results</Title>
                                <Text type="secondary">
                                    Receive instant verification results and document authenticity confirmation
                                </Text>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}