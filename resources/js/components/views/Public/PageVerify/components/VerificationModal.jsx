import { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, Typography, Space, Alert, Spin, Result, Divider, Progress, Steps } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faShieldCheck, 
    faEnvelope, 
    faHashtag,
    faCheckCircle,
    faTimesCircle,
    faExclamationTriangle,
    faFileText
} from '@fortawesome/pro-regular-svg-icons';
import { POST_PUBLIC } from '../../../../providers/useAxiosQuery';
import { cloudflareSiteKey } from '../../../../providers/appConfig';

const { Title, Text, Paragraph } = Typography;

export default function VerificationModal({ open, qrData, documentData, onComplete, onCancel }) {
    const [form] = Form.useForm();
    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [step, setStep] = useState('input'); // 'input', 'verifying', 'result'
    const [verificationProgress, setVerificationProgress] = useState(0);
    const [verificationError, setVerificationError] = useState(null);
    const [turnstileToken, setTurnstileToken] = useState(null);
    const [turnstileLoaded, setTurnstileLoaded] = useState(false);
    const [turnstileError, setTurnstileError] = useState(null);
    const [turnstileWidgetId, setTurnstileWidgetId] = useState(null);
    const turnstileRef = useRef(null);
    const [refReady, setRefReady] = useState(false);

    // Callback ref to ensure we know when the DOM element is available
    const turnstileCallbackRef = (element) => {
        turnstileRef.current = element;
        setRefReady(!!element);
    };

    // Initialize the mutation for final verification
    const verifyDetailsMutation = POST_PUBLIC(
        'api/public/document-verification/verify-with-details',
        null,
        false, // Don't show global loading
        (data) => {
            // Success callback - simulate progress completion
            setVerificationProgress(100);
            
            setTimeout(() => {
                if (data.success) {
                    setVerificationResult({
                        success: true,
                        data: data.data,
                        message: data.message
                    });
                } else {
                    setVerificationResult({
                        success: false,
                        error: data.message || 'Verification failed'
                    });
                }
                setStep('result');
                setVerifying(false);
                // Reset Turnstile after successful verification
                resetTurnstile();
            }, 1000); // Wait 1 second to show 100% completion
        }
    );


    // Handle mutation error
    useEffect(() => {
        if (verifyDetailsMutation.isError && verifying && !verificationError) {
            const error = verifyDetailsMutation.error;
            let errorMessage = 'Verification service is currently unavailable. Please try again later.';
            
            if (error.response?.status === 400) {
                errorMessage = 'Document verification failed. The QR code appears to be invalid or corrupted.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Document verification failed. The QR code is not valid or recognized.';
            } else if (error.response?.status === 403) {
                errorMessage = error.response.data.message || 'Document verification failed. Please check your details and try again.';
            }
            
            setVerificationError(errorMessage);
            setTimeout(() => {
                setVerificationResult({
                    success: false,
                    error: errorMessage
                });
                setStep('result');
                setVerifying(false);
                // Reset Turnstile on error
                resetTurnstile();
            }, 1000);
        }
    }, [verifyDetailsMutation.isError, verifying, verificationError]);

    // Load Cloudflare Turnstile script
    useEffect(() => {
        const loadTurnstileScript = () => {
            if (window.turnstile) {
                setTurnstileLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            script.onload = () => setTurnstileLoaded(true);
            script.onerror = () => {
                setTurnstileLoaded(false);
                setTurnstileError('Failed to load security verification');
            };
            document.head.appendChild(script);
        };

        if (cloudflareSiteKey) {
            loadTurnstileScript();
        }
    }, []);

    // Render Turnstile widget when script is loaded and modal is open
    useEffect(() => {
        if (turnstileLoaded && window.turnstile && cloudflareSiteKey && open && step === 'input' && !turnstileWidgetId && refReady) {
            const timer = setTimeout(() => {
                if (!turnstileRef.current) {
                    setTimeout(() => {
                        if (turnstileRef.current) {
                            renderTurnstileWidget();
                        } else {
                            setTurnstileError('Failed to initialize security verification');
                        }
                    }, 200);
                    return;
                }
                
                renderTurnstileWidget();
            }, 200);
            
            return () => clearTimeout(timer);
        }

        function renderTurnstileWidget() {
            try {
                if (turnstileRef.current) {
                    turnstileRef.current.innerHTML = '';
                }
                
                const widgetId = window.turnstile.render(turnstileRef.current, {
                    sitekey: cloudflareSiteKey,
                    callback: (token) => {
                        setTurnstileToken(token);
                        setTurnstileError(null);
                    },
                    'error-callback': () => {
                        setTurnstileToken(null);
                        setTurnstileError('Captcha verification failed. Please try again.');
                    },
                    'expired-callback': () => {
                        setTurnstileToken(null);
                        setTurnstileError('Captcha expired. Please verify again.');
                    },
                    theme: 'light',
                    size: 'normal'
                });
                
                setTurnstileWidgetId(widgetId);
            } catch (error) {
                setTurnstileError('Failed to load security verification');
            }
        }
    }, [turnstileLoaded, cloudflareSiteKey, open, step, turnstileWidgetId, refReady]);

    // Reset Turnstile widget
    const resetTurnstile = () => {
        if (window.turnstile && turnstileWidgetId) {
            try {
                window.turnstile.reset(turnstileWidgetId);
            } catch (error) {
                // Silent error handling for widget reset
            }
        }
        // Clear the container to remove any lingering widgets
        if (turnstileRef.current) {
            turnstileRef.current.innerHTML = '';
        }
        setTurnstileToken(null);
        setTurnstileError(null);
        setTurnstileWidgetId(null);
    };

    // Reset form and state when modal opens/closes
    useEffect(() => {
        if (open) {
            setStep('input');
            setVerificationResult(null);
            setVerificationProgress(0);
            setVerificationError(null);
            setTurnstileToken(null);
            setTurnstileError(null);
            setTurnstileWidgetId(null);
            form.resetFields();
        } else {
            // Reset Turnstile when modal closes
            resetTurnstile();
        }
    }, [open, form]);

    // Cleanup Turnstile widget on component unmount
    useEffect(() => {
        return () => {
            resetTurnstile();
        };
    }, []);

    // Simulate progress during verification
    useEffect(() => {
        if (verifying && step === 'verifying') {
            const progressInterval = setInterval(() => {
                setVerificationProgress(prev => {
                    if (prev >= 95) {
                        clearInterval(progressInterval);
                        return prev; // Let the API response complete it to 100%
                    }
                    return prev + Math.random() * 5; // Increment by random amount
                });
            }, 200);

            return () => clearInterval(progressInterval);
        }
    }, [verifying, step]);

    // Determine document type and serial number format
    const getDocumentInfo = () => {
        if (!documentData?.document) return { type: 'Document', format: '000000' };
        
        const docType = documentData.document.document_type;
        const shortType = documentData.qr_data?.type || 'DOC';
        
        // Determine serial number format based on document type
        let format = '000000'; // Default for certificates
        if (shortType === 'TOR' || docType === 'Transcript of Records') {
            format = '000000-000000';
        }
        
        return {
            type: docType || 'Document',
            shortType: shortType,
            format: format
        };
    };

    const documentInfo = getDocumentInfo();

    // Auto-format serial number for TOR (add hyphen automatically)
    const formatSerialNumber = (value, documentType) => {
        if (!value) return value;
        
        // Remove all non-digit characters
        const digitsOnly = value.replace(/\D/g, '');
        
        if (documentType === 'TOR') {
            // For TOR: format as 000000-000000 (6 digits, hyphen, 6 digits)
            if (digitsOnly.length <= 6) {
                return digitsOnly;
            } else if (digitsOnly.length <= 12) {
                return digitsOnly.slice(0, 6) + '-' + digitsOnly.slice(6);
            } else {
                // Limit to 12 digits total
                return digitsOnly.slice(0, 6) + '-' + digitsOnly.slice(6, 12);
            }
        } else {
            // For certificates: limit to 6 digits
            return digitsOnly.slice(0, 6);
        }
    };

    // Handle serial number input change with auto-formatting
    const handleSerialNumberChange = (e) => {
        const { value } = e.target;
        const { shortType } = documentInfo;
        const formattedValue = formatSerialNumber(value, shortType);
        
        // Update form field with formatted value
        form.setFieldValue('serialNumber', formattedValue);
    };

    // Custom validation for serial number format
    const validateSerialNumber = (_, value) => {
        if (!value) {
            return Promise.reject(new Error('Serial number is required'));
        }

        const { format, shortType } = documentInfo;
        let pattern;
        let errorMessage;

        if (shortType === 'TOR') {
            // TOR format: 000000-000000 (6 digits, hyphen, 6 digits)
            pattern = /^\d{6}-\d{6}$/;
            errorMessage = 'TOR serial number must be in format: 000000-000000 (6 digits, hyphen, 6 digits)';
        } else {
            // Certificate format: 000000 (6 digits)
            pattern = /^\d{6}$/;
            errorMessage = 'Certificate serial number must be 6 digits (000000)';
        }

        if (!pattern.test(value)) {
            return Promise.reject(new Error(errorMessage));
        }

        return Promise.resolve();
    };

    const handleSubmit = (values) => {
        // Check if Turnstile token is available (only if Cloudflare is configured)
        if (cloudflareSiteKey && !turnstileToken) {
            setTurnstileError('Please complete the captcha verification.');
            return;
        }

        setStep('verifying');
        setVerifying(true);
        setVerificationProgress(5); // Start with small progress
        setVerificationError(null);

        // Include Turnstile token in the request if available
        const verificationData = {
            qr_data: qrData,
            serial_number: values.serialNumber,
            email: values.email,
            ...(turnstileToken && { 'cf-turnstile-response': turnstileToken })
        };

        // Call the mutation for final verification
        verifyDetailsMutation.mutate(verificationData);
    };

    const handleClose = () => {
        if (verificationResult) {
            onComplete(verificationResult);
        } else {
            onCancel();
        }
    };

    const renderInputStep = () => (
        <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <FontAwesomeIcon 
                    icon={faShieldCheck} 
                    style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} 
                />
                <Title level={3} style={{ marginBottom: '8px' }}>
                    Document Verification
                </Title>
                <Text type="secondary">
                    Please provide additional verification details
                </Text>
            </div>

            <div style={{ 
                backgroundColor: '#f8fafc', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '24px',
                border: '1px solid #e2e8f0'
            }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                        <FontAwesomeIcon icon={faFileText} style={{ marginRight: '8px', color: '#6b7280' }} />
                        <Text strong>Document Type:</Text> {documentInfo.type}
                    </div>
                </Space>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                size="large"
            >
                <Form.Item
                    name="serialNumber"
                    label={
                        <span>
                            <FontAwesomeIcon icon={faHashtag} style={{ marginRight: '8px' }} />
                            Serial Number
                        </span>
                    }
                    rules={[
                        { validator: validateSerialNumber }
                    ]}
                    help={
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Format: {documentInfo.format} 
                            {documentInfo.shortType === 'TOR' ? ' (hyphen will be added automatically)' : ' (for Certificates)'}
                        </Text>
                    }
                >
                    <Input
                        placeholder={documentInfo.format}
                        prefix={<FontAwesomeIcon icon={faHashtag} style={{ color: '#9ca3af' }} />}
                        maxLength={documentInfo.shortType === 'TOR' ? 13 : 6}
                        onChange={handleSerialNumberChange}
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    label={
                        <span>
                            <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '8px' }} />
                            Email Address
                        </span>
                    }
                    rules={[
                        { required: true, message: 'Email address is required' },
                        { type: 'email', message: 'Please enter a valid email address' }
                    ]}
                    help={
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Enter the email address associated with this document
                        </Text>
                    }
                >
                    <Input
                        type="email"
                        placeholder="your.email@example.com"
                        prefix={<FontAwesomeIcon icon={faEnvelope} style={{ color: '#9ca3af' }} />}
                    />
                </Form.Item>

                {/* Cloudflare Turnstile Captcha */}
                {cloudflareSiteKey && (
                    <Form.Item
                        label={
                            <span>
                                <FontAwesomeIcon icon={faShieldCheck} style={{ marginRight: '8px' }} />
                                Security Verification
                            </span>
                        }
                        help={
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                Please complete the security verification to proceed
                            </Text>
                        }
                        validateStatus={turnstileError ? 'error' : ''}
                        style={{ marginBottom: '24px' }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div 
                                ref={turnstileCallbackRef}
                                style={{ 
                                    display: 'inline-block',
                                    minHeight: '65px',
                                    width: '100%',
                                    maxWidth: '300px'
                                }}
                            />
                            
                            {!turnstileLoaded && !turnstileError && cloudflareSiteKey && (
                                <div style={{ 
                                    padding: '20px', 
                                    textAlign: 'center', 
                                    color: '#666',
                                    fontSize: '14px'
                                }}>
                                    Loading security verification...
                                </div>
                            )}
                            {turnstileLoaded && cloudflareSiteKey && turnstileWidgetId && !turnstileToken && !turnstileError && (
                                <div style={{ 
                                    padding: '10px', 
                                    textAlign: 'center', 
                                    color: '#888',
                                    fontSize: '12px'
                                }}>
                                    Please complete the verification above
                                </div>
                            )}
                            {turnstileError && (
                                <Alert
                                    message={turnstileError}
                                    type="error"
                                    showIcon
                                    style={{ marginTop: '8px', textAlign: 'left' }}
                                />
                            )}
                        </div>
                    </Form.Item>
                )}

                <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={onCancel} size="large">
                            Cancel
                        </Button>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            size="large"
                            icon={<FontAwesomeIcon icon={faShieldCheck} />}
                            disabled={cloudflareSiteKey && !turnstileToken}
                        >
                            Verify Document
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );


    const renderResultStep = () => {
        const isSuccess = verificationResult?.success;
        const resultData = verificationResult?.data;
        
        return (
            <div>
                <Result
                    icon={
                        <FontAwesomeIcon 
                            icon={isSuccess ? faCheckCircle : faTimesCircle}
                            style={{ 
                                fontSize: '64px', 
                                color: isSuccess ? '#52c41a' : '#ff4d4f' 
                            }} 
                        />
                    }
                    title={isSuccess ? 'Verification Complete' : 'Verification Failed'}
                    subTitle={
                        isSuccess 
                            ? 'The document verification has been completed successfully. Detailed results have been sent to your email address.'
                            : (verificationResult?.error || 'The provided details do not match our records.')
                    }
                    extra={
                        <div>
                            {isSuccess && resultData && (
                                <div style={{ 
                                    backgroundColor: '#f6ffed', 
                                    border: '1px solid #b7eb8f',
                                    borderRadius: '8px', 
                                    padding: '16px', 
                                    marginBottom: '24px',
                                    textAlign: 'center'
                                }}>
                                    <Title level={5} style={{ color: '#389e0d', marginBottom: '12px' }}>
                                        Email Sent Successfully
                                    </Title>
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        {resultData.document?.document_type && (
                                            <Text><strong>Document Type:</strong> {resultData.document.document_type}</Text>
                                        )}
                                        <Text style={{ color: '#666', fontSize: '14px' }}>
                                            Please check your email for detailed verification results and document information.
                                        </Text>
                                    </Space>
                                </div>
                            )}
                            
                            <Button 
                                type="primary" 
                                size="large" 
                                onClick={handleClose}
                                style={{ minWidth: '120px' }}
                            >
                                Close
                            </Button>
                        </div>
                    }
                />
            </div>
        );
    };

    const renderVerifyingStep = () => {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ marginBottom: '32px' }}>
                    <FontAwesomeIcon 
                        icon={faFileText} 
                        style={{ 
                            fontSize: '48px', 
                            color: '#1890ff',
                            marginBottom: '16px'
                        }} 
                    />
                    <Title level={3} style={{ margin: '16px 0 8px 0', color: '#1890ff' }}>
                        Verifying Document
                    </Title>
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                        Please wait while we verify your document details...
                    </Text>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <Progress
                        type="circle"
                        percent={Math.round(verificationProgress)}
                        status={verificationError ? 'exception' : 'active'}
                        strokeColor={verificationError ? '#ff4d4f' : '#1890ff'}
                        size={120}
                    />
                </div>

                {verificationError && (
                    <Alert
                        message="Verification Failed"
                        description={verificationError}
                        type="error"
                        showIcon
                        style={{ textAlign: 'left', marginTop: '16px' }}
                    />
                )}

                <div style={{ marginTop: '24px' }}>
                    <Steps
                        current={verificationError ? -1 : Math.min(Math.floor(verificationProgress / 25), 3)}
                        status={verificationError ? 'error' : 'process'}
                        size="small"
                        items={[
                            { title: 'Validating' },
                            { title: 'Processing' },
                            { title: 'Verifying' },
                            { title: 'Complete' }
                        ]}
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            <Modal
                title={null}
                open={open}
                onCancel={handleClose}
                footer={null}
                width={600}
                centered
                destroyOnClose
                maskClosable={step !== 'verifying'}
                closable={step !== 'verifying'}
            >
                {step === 'input' && renderInputStep()}
                {step === 'verifying' && renderVerifyingStep()}
                {step === 'result' && renderResultStep()}
            </Modal>

        </>
    );
}