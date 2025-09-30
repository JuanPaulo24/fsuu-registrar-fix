import { useState, useRef, useEffect } from 'react';
import { Button, Alert, Typography, Space } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faStop } from '@fortawesome/pro-regular-svg-icons';
import QrScanner from 'qr-scanner';

const { Text } = Typography;

export default function QRScanner({ onScan }) {
    const videoRef = useRef(null);
    const qrScannerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (qrScannerRef.current) {
                qrScannerRef.current.stop();
                qrScannerRef.current.destroy();
            }
        };
    }, []);

    const handleScan = async (result) => {
        if (result && result.data) {
            try {
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
                        } else {
                            setError(hashResult.message || 'Hash verification failed');
                            return;
                        }
                    } catch (hashError) {
                        console.error('Hash verification failed:', hashError);
                        setError('Invalid hash - document not found in system');
                        return;
                    }
                }
                
                // Try to parse as JSON first (for structured QR codes)
                let qrData;
                try {
                    qrData = JSON.parse(actualQrData);
                } catch {
                    // If not JSON, treat as plain text (document ID or URL)
                    qrData = {
                        documentId: actualQrData,
                        type: 'document',
                        issuedDate: new Date().toISOString(),
                        valid: true,
                        rawData: actualQrData
                    };
                }

                setError(null);
                onScan(qrData);
                stopScanning();
            } catch (err) {
                setError('Failed to process QR code data');
            }
        }
    };

    const handleError = (error) => {
        setError('Camera access failed. Please make sure you have granted camera permissions and your device supports camera access.');
    };

    const startScanning = async () => {
        try {
            setError(null);
            setIsScanning(true);

            if (videoRef.current) {
                // Create QR scanner instance
                qrScannerRef.current = new QrScanner(
                    videoRef.current,
                    (result) => handleScan(result),
                    {
                        returnDetailedScanResult: true,
                        highlightScanRegion: true,
                        highlightCodeOutline: true,
                        onDecodeError: (err) => {
                            // Ignore decode errors - they happen when no QR code is visible
                            // console.log('Decode error (normal):', err);
                        }
                    }
                );

                // Start scanning
                await qrScannerRef.current.start();
            }
        } catch (err) {
            handleError(err);
        }
    };

    const stopScanning = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop();
        }
        setIsScanning(false);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {error && (
                <Alert
                    message="Scanner Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: '16px' }}
                    closable
                    onClose={() => setError(null)}
                />
            )}


            <div style={{ 
                position: 'relative',
                display: 'inline-block',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#f3f4f6',
                minHeight: '300px',
                width: '100%',
                maxWidth: '400px'
            }}>
                <video
                    ref={videoRef}
                    style={{
                        width: '100%',
                        height: '300px',
                        objectFit: 'cover',
                        display: isScanning ? 'block' : 'none'
                    }}
                    playsInline
                    muted
                />
                
                {!isScanning && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '300px',
                        padding: '24px'
                    }}>
                        <FontAwesomeIcon 
                            icon={faCamera} 
                            style={{ 
                                fontSize: '64px', 
                                color: '#9ca3af', 
                                marginBottom: '16px' 
                            }} 
                        />
                        <Text style={{ 
                            color: '#6b7280', 
                            marginBottom: '8px',
                            textAlign: 'center',
                            fontSize: '16px'
                        }}>
                            Click the button below to start scanning
                        </Text>
                        <Text style={{ 
                            color: '#9ca3af', 
                            textAlign: 'center',
                            fontSize: '12px'
                        }}>
                            Make sure to allow camera permissions when prompted
                        </Text>
                    </div>
                )}

                {isScanning && (
                    <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        Position QR code within the frame
                    </div>
                )}
            </div>

            <div style={{ marginTop: '24px' }}>
                <Space size="middle">
                    {!isScanning ? (
                        <Button 
                            type="primary" 
                            size="large"
                            icon={<FontAwesomeIcon icon={faCamera} />}
                            onClick={startScanning}
                            style={{
                                height: '48px',
                                padding: '0 24px',
                                fontSize: '16px'
                            }}
                        >
                            Start Camera
                        </Button>
                    ) : (
                        <Button 
                            danger
                            size="large"
                            icon={<FontAwesomeIcon icon={faStop} />}
                            onClick={stopScanning}
                            style={{
                                height: '48px',
                                padding: '0 24px',
                                fontSize: '16px'
                            }}
                        >
                            Stop Scanning
                        </Button>
                    )}
                </Space>
            </div>

            <div style={{ marginTop: '16px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    Point your camera at a QR code to scan it automatically
                </Text>
            </div>
        </div>
    );
}