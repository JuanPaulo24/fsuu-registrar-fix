import { useEffect, useRef, useState, useMemo } from "react";
import { Card, Row, Col, Button, Alert, Typography, Space, Select, Upload, message, Table, Tag, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode, faUpload, faHistory, faUser, faCalendar, faFileText, faEye } from "@fortawesome/pro-regular-svg-icons";
import QrScanner from "qr-scanner";
import axios from "axios";
import { token, apiUrl } from "../../../providers/appConfig";
import { GET } from "../../../providers/useAxiosQuery";
import ModalVerificationLoading from "./components/ModalVerificationLoading";
import ModalDocumentVerification from "./components/ModalDocumentVerification";

const { Title, Text } = Typography;

export default function PageQRScanner() {
    const videoRef = useRef(null);
    const qrScannerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState("");
    const [error, setError] = useState("");
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState("");
    const [errorHint, setErrorHint] = useState("");
    const [showVerificationLoading, setShowVerificationLoading] = useState(false);
    const [showVerificationResult, setShowVerificationResult] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [verificationError, setVerificationError] = useState("");
    const [verificationStep, setVerificationStep] = useState(0);
    // History details modal state
    const [showHistoryVerification, setShowHistoryVerification] = useState(false);
    const [historyVerificationResult, setHistoryVerificationResult] = useState(null);
    const [historyVerificationError, setHistoryVerificationError] = useState("");
    const [historyIsValid, setHistoryIsValid] = useState(false);
    const [scanHistoryFilter, setScanHistoryFilter] = useState({
        page: 1,
        per_page: 10,
        status: '',
        search: ''
    });

    // Fetch scan history
    const { data: scanHistoryData, refetch: refetchScanHistory } = GET(
        `api/document-verification/scan-history?${new URLSearchParams(scanHistoryFilter)}`,
        "scan_history"
    );

    const startScanning = async (preferredCameraId) => {
        try {
            setError("");
            setErrorHint("");
            
            if (videoRef.current) {
                qrScannerRef.current = new QrScanner(
                    videoRef.current,
                    (result) => {
                        setScannedData(result.data);
                        handleQRCodeDetected(result.data);
                    },
                    {
                        returnDetailedScanResult: true,
                        highlightScanRegion: true,
                        highlightCodeOutline: true,
                    }
                );

                if (preferredCameraId) {
                    await qrScannerRef.current.setCamera(preferredCameraId);
                }

                await qrScannerRef.current.start();
                setIsScanning(true);
            }
        } catch (err) {
            let hint = "";
            const msg = `${err?.name || ""} ${err?.message || ""}`.toLowerCase();
            if (msg.includes("notfounderror") || msg.includes("no cameras")) {
                hint = "No camera devices found. Please connect a camera or try a different device.";
            } else if (msg.includes("notallowederror") || msg.includes("permission")) {
                hint = "Camera permission denied. Please allow camera access in your browser settings and reload the page.";
            } else if (msg.includes("notreadableerror") || msg.includes("track start error") || msg.includes("busy")) {
                hint = "Camera might be in use by another application. Close other apps using the camera or switch to another camera.";
            } else if (msg.includes("overconstrained")) {
                hint = "Selected camera is unavailable. Try selecting another camera from the list.";
            }

            setError("Failed to start camera: " + (err?.message || "Unknown error"));
            setErrorHint(hint);
        }
    };

    const stopScanning = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop();
            qrScannerRef.current.destroy();
            qrScannerRef.current = null;
        }
        setIsScanning(false);
    };

    const handleQRCodeDetected = async (qrData) => {
        try {
            // Stop scanning temporarily to prevent multiple scans
            if (qrScannerRef.current) {
                qrScannerRef.current.stop();
                setIsScanning(false);
            }

            // Show verification loading modal
            setShowVerificationLoading(true);
            setVerificationStep(0);

            // Try to verify the document
            await verifyQRCodeDocument(qrData);
            
        } catch (error) {
            setVerificationError("Failed to verify QR code");
            setShowVerificationResult(true);
        } finally {
            setShowVerificationLoading(false);
        }
    };

    const verifyQRCodeDocument = async (qrData) => {
        try {
            console.log('Starting verification for QR data:', qrData);
            const authToken = token();
            if (!authToken) {
                throw new Error('Authentication required');
            }

            // Step 1: Scanning QR Code (already done)
            setVerificationStep(1);
            await new Promise(resolve => setTimeout(resolve, 500));

            // Step 2: Check if QR data is a hash and verify it
            setVerificationStep(2);
            console.log('Checking if QR data is a hash:', qrData);
            
            // Check if QR data looks like a hash (64 hex characters for SHA256)
            const isHash = /^[a-fA-F0-9]{64}$/.test(qrData);
            let actualQrData = qrData;
            
            if (isHash) {
                console.log('QR data appears to be a hash, verifying against system...');
                try {
                    const hashResponse = await axios.post(apiUrl('api/document-verification/verify-hash'), {
                        hash: qrData
                    }, {
                        headers: {
                            'Authorization': authToken,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (hashResponse.data.success) {
                        console.log('Hash verified, using base45 data from system:', hashResponse.data.data.base45_data);
                        actualQrData = hashResponse.data.data.base45_data;
                    } else {
                        throw new Error(hashResponse.data.message || 'Hash verification failed');
                    }
                } catch (hashError) {
                    console.error('Hash verification failed:', hashError);
                    throw new Error(hashError.response?.data?.message || 'Invalid hash - document not found in system');
                }
            }

            // Step 3: Decoding BASE45
            setVerificationStep(3);
            console.log('Sending BASE45 data for decoding:', actualQrData);
            const decodeResponse = await axios.post(apiUrl('api/document-verification/decode-qr'), {
                qr_data: actualQrData
            }, {
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Decode response:', decodeResponse.data);

            if (!decodeResponse.data.success) {
                console.error('Decode failed:', decodeResponse.data.message);
                throw new Error(decodeResponse.data.message || 'Invalid QR code format');
            }

            const responseData = decodeResponse.data.data;
            
            // Step 4: Verifying Document
            setVerificationStep(4);
            await new Promise(resolve => setTimeout(resolve, 500));

            // The backend now handles everything in one call
            if (responseData.verification_status === 'valid' || responseData.scan_status === 'success') {
                // Document is valid and hash verified
                setVerificationResult(decodeResponse.data);
                setVerificationError("");
                setShowVerificationResult(true);
            } else if (responseData.scan_status === 'revoked') {
                // Document is revoked but exists in system
                setVerificationResult(decodeResponse.data);
                const revocationReason = responseData.document?.revocation_reason;
                setVerificationError(`Document has been revoked${revocationReason && revocationReason !== 'No reason provided' ? `: ${revocationReason}` : ''}`);
                setShowVerificationResult(true);
            } else {
                // Unknown status or other error
                throw new Error('Unknown verification status');
            }

        } catch (error) {
            let errorMsg = "Document verification failed";
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = error.message;
            }
            
            setVerificationError(errorMsg);
            setVerificationResult(null);
            setShowVerificationResult(true);
        }
    };

    const handleVerificationComplete = () => {
        setShowVerificationResult(false);
        setVerificationResult(null);
        setVerificationError("");
        setVerificationStep(0);
        
        // Refresh scan history to show the latest scan
        refetchScanHistory();
        
        // Resume scanning after closing verification modal
        if (selectedCameraId) {
            setTimeout(() => {
                startScanning(selectedCameraId);
            }, 500);
        }
    };

    const handleUploadQR = async (file) => {
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

            // Create image element to scan QR code
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            img.onload = async () => {
                try {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // Use QrScanner to scan the image
                    const result = await QrScanner.scanImage(img, { returnDetailedScanResult: true });
                    
                    if (result && result.data) {
                        console.log('Raw QR data detected:', result.data);
                        setScannedData(result.data);
                        message.success('QR code detected in uploaded image!');
                        
                        // Process the QR code (BASE45 encoded data)
                        await handleQRCodeDetected(result.data);
                    } else {
                        message.error('No QR code found in the uploaded image.');
                    }
                } catch (error) {
                    console.error('QR scanning error:', error);
                    message.error('Failed to scan QR code from image. Please try a clearer image.');
                }
            };

            img.onerror = () => {
                message.error('Failed to load the uploaded image.');
            };

            // Convert file to data URL
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);

            return false; // Prevent default upload
        } catch (error) {
            console.error('Upload error:', error);
            message.error('Failed to process uploaded image.');
            return false;
        }
    };

    // Scan history table columns
    const scanHistoryColumns = [
        {
            title: 'Date & Time',
            dataIndex: 'scanned_at',
            key: 'scanned_at',
            width: 150,
            render: (date) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: '12px' }}>
                        {new Date(date).toLocaleDateString()}
                    </Text>
                    <Text style={{ fontSize: '11px', color: '#666' }}>
                        {new Date(date).toLocaleTimeString()}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Document',
            key: 'document',
            render: (record) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: '12px' }}>
                        {record.document_id_number || 'Unknown'}
                    </Text>
                    <Tag color="blue" style={{ fontSize: '10px' }}>
                        {record.document_type || 'N/A'}
                    </Tag>
                </Space>
            )
        },
        {
            title: 'Student',
            key: 'student',
            render: (record) => (
                record.profile ? (
                    <Space direction="vertical" size={0}>
                        <Text style={{ fontSize: '12px' }}>
                            {record.profile.fullname}
                        </Text>
                        <Text style={{ fontSize: '11px', color: '#666' }}>
                            {record.profile.id_number}
                        </Text>
                    </Space>
                ) : <Text style={{ fontSize: '12px', color: '#999' }}>Unknown</Text>
            )
        },
        {
            title: 'Status',
            dataIndex: 'scan_status',
            key: 'scan_status',
            width: 100,
            render: (status, record) => (
                <Tag color={record.status_color} style={{ fontSize: '10px' }}>
                    {status === 'error' || status === 'hash_mismatch' ? 'Invalid' : record.status_label}
                </Tag>
            )
        },
        {
            title: 'Details',
            key: 'actions',
            width: 80,
            render: (record) => (
                <Tooltip title="View Details">
                    <Button 
                        type="text" 
                        size="small"
                        icon={<FontAwesomeIcon icon={faEye} />}
                        onClick={() => openHistoryDetails(record)}
                    />
                </Tooltip>
            )
        }
    ];

    const openHistoryDetails = async (record) => {
        try {
            const status = record?.scan_status;
            const isValid = status === 'success';
            setHistoryIsValid(isValid);

            // Prefer document from stored scan_result
            let documentData = record?.scan_result?.document || null;

            // Fallback: fetch live document details by document_id_number
            if (!documentData && record?.document_id_number) {
                try {
                    const authToken = token();
                    const res = await axios.get(
                        apiUrl(`api/document-verification/details/${record.document_id_number}`),
                        { headers: { Authorization: authToken, Accept: 'application/json' } }
                    );
                    if (res?.data?.success) {
                        documentData = res.data.data.document;
                    }
                } catch (_) {
                    // ignore; we'll still open modal with limited info
                }
            }

            const verificationDetails = record?.scan_result?.verification_details || {};
            const qrData = record?.scan_result?.qr_data || {};
            const verificationStatus = isValid ? 'valid' : status;

            const composedResult = {
                success: isValid,
                data: {
                    document: documentData,
                    qr_data: qrData,
                    verification_status: verificationStatus,
                    verification_details: verificationDetails,
                    scan_status: status
                }
            };

            // Build error message for non-success statuses
            let err = '';
            if (!isValid) {
                if (status === 'revoked') {
                    const reason = record?.scan_result?.revocation_reason || documentData?.revocation_reason;
                    err = `Document has been revoked${reason && reason !== 'No reason provided' ? `: ${reason}` : ''}`;
                } else if (status === 'hash_mismatch') {
                    err = 'Document verification failed: Document has been tampered with or is forged';
                } else {
                    err = record?.scan_result?.error || 'Document verification failed';
                }
            }

            setHistoryVerificationResult(composedResult);
            setHistoryVerificationError(err);
            setShowHistoryVerification(true);
        } catch (e) {
            setHistoryIsValid(false);
            setHistoryVerificationResult(null);
            setHistoryVerificationError('Unable to load details for this scan');
            setShowHistoryVerification(true);
        }
    };

    // Compute table data with client-side status grouping (Error + Tampered => Invalid)
    const scanHistoryTableData = useMemo(() => {
        const rows = scanHistoryData?.data?.data || [];
        const status = scanHistoryFilter.status;
        if (!status) return rows;
        if (status === 'invalid') {
            return rows.filter((r) => r.scan_status === 'error' || r.scan_status === 'hash_mismatch');
        }
        return rows.filter((r) => r.scan_status === status);
    }, [scanHistoryData, scanHistoryFilter]);

    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            try {
                const cameraList = await QrScanner.listCameras(true);
                if (!isMounted) return;
                setCameras(cameraList);

                // Prefer back/rear camera if available
                const backCamera = cameraList.find((c) =>
                    /back|rear|environment/i.test(`${c.label}`)
                );
                const defaultCamera = backCamera?.id || cameraList[0]?.id || "";
                setSelectedCameraId(defaultCamera);

                await startScanning(defaultCamera);
            } catch (err) {
                let hint = "";
                const msg = `${err?.name || ""} ${err?.message || ""}`.toLowerCase();
                if (msg.includes("notallowed") || msg.includes("permission")) {
                    hint = "Please allow camera permissions in your browser and reload.";
                } else if (msg.includes("notfound")) {
                    hint = "No cameras detected. Connect a camera or try another device.";
                }
                setError("Unable to access cameras: " + (err?.message || "Unknown error"));
                setErrorHint(hint);
            }
        };

        initialize();

        return () => {
            isMounted = false;
            stopScanning();
        };
    }, []);

    // Refetch scan history when filters change
    useEffect(() => {
        refetchScanHistory();
    }, [scanHistoryFilter]);

    const handleChangeCamera = async (cameraId) => {
        setSelectedCameraId(cameraId);
        if (qrScannerRef.current) {
            try {
                await qrScannerRef.current.setCamera(cameraId);
                if (!isScanning) {
                    await qrScannerRef.current.start();
                    setIsScanning(true);
                }
            } catch (err) {
                setError("Failed to switch camera: " + (err?.message || "Unknown error"));
                setErrorHint("Selected camera might be busy or unavailable. Try another camera.");
            }
        } else {
            await startScanning(cameraId);
        }
    };

    return (
            <Card>
            <Row gutter={[20, 20]}>
                <Col xs={24}>
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        <div className="module-header">
                            <Title level={3} className="module-title">
                                QR Code Scanner
                            </Title>
                            <Text type="secondary" className="module-description">
                                Scan QR codes using your device camera
                            </Text>
                        </div>

                        {cameras.length > 0 && (
                            <div>
                                <Text strong>Select Camera</Text>
                                <div style={{ marginTop: 8 }}>
                                    <Select
                                        style={{ width: 320 }}
                                        value={selectedCameraId || undefined}
                                        placeholder="Select camera"
                                        onChange={handleChangeCamera}
                                        options={cameras.map((c, idx) => ({
                                            value: c.id,
                                            label: c.label || `Camera ${idx + 1}`,
                                        }))}
                                    />
                                    </div>
                            </div>
                        )}

                            {error && (
                                <Alert
                                message="Camera Error"
                                description={
                                    <Space direction="vertical">
                                        <div>{error}</div>
                                        {errorHint ? (
                                            <Text type="secondary">{errorHint}</Text>
                                        ) : null}
                                        {cameras.length > 1 ? (
                            <div>
                                                <Text>Try switching to another camera:</Text>
                                                <div style={{ marginTop: 8 }}>
                                                    <Select
                                                        style={{ width: 320 }}
                                                        value={selectedCameraId || undefined}
                                                        placeholder="Select camera"
                                                        onChange={handleChangeCamera}
                                                        options={cameras.map((c, idx) => ({
                                                            value: c.id,
                                                            label: c.label || `Camera ${idx + 1}`,
                                                        }))}
                                                    />
                                        <Button 
                                                        style={{ marginLeft: 8 }}
                                                        onClick={() => startScanning(selectedCameraId)}
                                        >
                                                        Retry
                                        </Button>
                                </div>
                            </div>
                        ) : (
                                            <Button onClick={() => startScanning(selectedCameraId)}>Retry</Button>
                                        )}
                                    </Space>
                                }
                                type="error"
                                showIcon
                                closable
                                onClose={() => { setError(""); setErrorHint(""); }}
                            />
                        )}

                        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                            <video
                                ref={videoRef}
                                style={{
                                    width: "100%",
                                    maxWidth: "500px",
                                    height: "300px",
                                    border: "2px solid #d9d9d9",
                                    borderRadius: "8px",
                                    backgroundColor: "#f5f5f5",
                                }}
                                playsInline
                            />
                        </div>

                        <div style={{ textAlign: "center", marginTop: 16 }}>
                            <Upload
                                beforeUpload={handleUploadQR}
                                accept="image/*"
                                showUploadList={false}
                                multiple={false}
                            >
                                <Button
                                    type="default"
                                    size="large"
                                    icon={<FontAwesomeIcon icon={faUpload} />}
                                    style={{ minWidth: 200 }}
                                >
                                    Upload QR Code Image
                                </Button>
                            </Upload>
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Upload an image containing a QR code (JPG, PNG, etc.)
                            </Text>
                            </div>
                        </div>

                        {/* Scan History */}
                        <Card
                            title={
                                <Space>
                                    <FontAwesomeIcon icon={faHistory} style={{ color: 'white' }} />
                                    <span style={{ color: 'white' }}>Scan History</span>
                                </Space>
                            }
                            style={{ marginTop: 20 }}
                            styles={{
                                header: {
                                    backgroundColor: '#1890ff',
                                    color: 'white'
                                }
                            }}
                        >
                            <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <Button
                                    type={!scanHistoryFilter.status ? 'primary' : 'default'}
                                    size="small"
                                    onClick={() => setScanHistoryFilter(prev => ({ ...prev, status: '', page: 1 }))}
                                >
                                    All
                                </Button>
                                <Button
                                    type={scanHistoryFilter.status === 'success' ? 'primary' : 'default'}
                                    size="small"
                                    onClick={() => setScanHistoryFilter(prev => ({ ...prev, status: 'success', page: 1 }))}
                                >
                                    Verified
                                </Button>
                                <Button
                                    type={scanHistoryFilter.status === 'revoked' ? 'primary' : 'default'}
                                    size="small"
                                    onClick={() => setScanHistoryFilter(prev => ({ ...prev, status: 'revoked', page: 1 }))}
                                >
                                    Revoked
                                </Button>
                                <Button
                                    type={scanHistoryFilter.status === 'invalid' ? 'primary' : 'default'}
                                    size="small"
                                    onClick={() => setScanHistoryFilter(prev => ({ ...prev, status: 'invalid', page: 1 }))}
                                >
                                    Invalid
                                </Button>
                            </div>
                            <Table
                                columns={scanHistoryColumns}
                                dataSource={scanHistoryTableData}
                                rowKey="id"
                                size="small"
                                pagination={{
                                    current: scanHistoryData?.data?.current_page || 1,
                                    total: scanHistoryData?.data?.total || 0,
                                    pageSize: scanHistoryFilter.per_page,
                                    showSizeChanger: false,
                                    showQuickJumper: false,
                                    onChange: (page) => setScanHistoryFilter(prev => ({ ...prev, page })),
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} scans`
                                }}
                                locale={{
                                    emptyText: "No scan history yet. Start scanning QR codes to see results here."
                                }}
                            />
                </Card>
                    </Space>
                </Col>
            </Row>

            {/* Verification Loading Modal */}
            <ModalVerificationLoading
                open={showVerificationLoading}
                onComplete={() => setShowVerificationLoading(false)}
                currentStep={verificationStep}
                error={verificationError && showVerificationLoading ? verificationError : null}
            />

            {/* Verification Result Modal */}
            <ModalDocumentVerification
                open={showVerificationResult}
                onClose={handleVerificationComplete}
                verificationResult={verificationResult}
                isValid={!!verificationResult && !verificationError}
                errorMessage={verificationError}
            />

            {/* Scan History Details Modal */}
            <ModalDocumentVerification
                open={showHistoryVerification}
                onClose={() => setShowHistoryVerification(false)}
                verificationResult={historyVerificationResult}
                isValid={historyIsValid}
                errorMessage={historyVerificationError}
            />
            </Card>
    );
}
