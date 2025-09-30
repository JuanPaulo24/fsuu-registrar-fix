import { useState, useEffect } from 'react';
import { Modal, Progress, Typography, Space, Card, Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSpinner,
    faQrcode,
    faLock, 
    faFileSignature, 
    faCheckCircle,
    faExclamationTriangle,
    faShieldCheck,
    faHashtag
} from '@fortawesome/pro-regular-svg-icons';

const { Title, Text } = Typography;

export default function VerificationProgressModal({ 
    open, 
    currentStep = 0, 
    progress = 0, 
    error = null,
    onComplete,
    onError,
    mode = 'full' // 'full' for detailed verification, 'qr' for QR validation only
}) {
    const [displayProgress, setDisplayProgress] = useState(0);

    // Smooth progress animation
    useEffect(() => {
        if (progress > displayProgress) {
            const timer = setTimeout(() => {
                setDisplayProgress(prev => Math.min(prev + 2, progress));
            }, 50);
            return () => clearTimeout(timer);
        } else {
            setDisplayProgress(progress);
        }
    }, [progress, displayProgress]);

    const fullSteps = [
        { 
            title: "Scanning QR Code", 
            icon: faQrcode, 
            description: "Reading QR code data",
            progressRange: [0, 20]
        },
        { 
            title: "Decoding & Decrypting", 
            icon: faLock, 
            description: "Decrypting document information",
            progressRange: [20, 40]
        },
        { 
            title: "Verifying Serial Number", 
            icon: faHashtag, 
            description: "Checking serial number authenticity",
            progressRange: [40, 60]
        },
        { 
            title: "Validating Document Hash", 
            icon: faFileSignature, 
            description: "Verifying document integrity",
            progressRange: [60, 80]
        },
        { 
            title: "Checking Digital Signature", 
            icon: faShieldCheck, 
            description: "Validating digital signatures",
            progressRange: [80, 95]
        },
        { 
            title: "Verification Complete", 
            icon: faCheckCircle, 
            description: "Document verification finished",
            progressRange: [95, 100]
        },
    ];

    const qrSteps = [
        { 
            title: "Reading QR Code", 
            icon: faQrcode, 
            description: "Scanning QR code data",
            progressRange: [0, 30]
        },
        { 
            title: "Decoding Data", 
            icon: faLock, 
            description: "Decrypting QR information",
            progressRange: [30, 70]
        },
        { 
            title: "Validating Document", 
            icon: faShieldCheck, 
            description: "Checking document existence",
            progressRange: [70, 100]
        },
    ];

    const steps = mode === 'qr' ? qrSteps : fullSteps;

    const getCurrentStepFromProgress = (prog) => {
        for (let i = 0; i < steps.length; i++) {
            const [start, end] = steps[i].progressRange;
            if (prog >= start && prog < end) {
                return i;
            }
        }
        return steps.length - 1;
    };

    const activeStep = getCurrentStepFromProgress(displayProgress);

    const getProgressStatus = () => {
        if (error) return 'exception';
        if (displayProgress === 100) return 'success';
        return 'active';
    };

    const getProgressColor = () => {
        if (error) return '#ff4d4f';
        if (displayProgress === 100) return '#52c41a';
        return '#1890ff';
    };

    const handleClose = () => {
        if (onError && error) {
            onError();
        } else if (onComplete && displayProgress === 100) {
            onComplete();
        }
    };

    return (
        <Modal
            open={open}
            closable={error || displayProgress === 100}
            maskClosable={error || displayProgress === 100}
            footer={error ? (
                <div style={{ textAlign: 'center' }}>
                    <Button type="primary" danger onClick={handleClose}>
                        Close
                    </Button>
                </div>
            ) : null}
            width={600}
            centered
            onCancel={handleClose}
            title={
                <Space align="center">
                    <FontAwesomeIcon 
                        icon={error ? faExclamationTriangle : displayProgress === 100 ? faCheckCircle : faSpinner} 
                        spin={!error && displayProgress < 100}
                        style={{ 
                            color: error ? '#ff4d4f' : displayProgress === 100 ? '#52c41a' : '#1890ff'
                        }}
                    />
                    <span>
                        {error ? "Verification Failed" : displayProgress === 100 ? "Verification Complete" : "Verifying Document"}
                    </span>
                </Space>
            }
        >
            <div style={{ padding: "20px 0" }}>
                {/* Progress Bar */}
                <div style={{ marginBottom: '32px' }}>
                    <Progress
                        percent={Math.round(displayProgress)}
                        status={getProgressStatus()}
                        strokeColor={getProgressColor()}
                        strokeWidth={8}
                        format={(percent) => `${Math.round(percent)}%`}
                        style={{ fontSize: '16px', fontWeight: 'bold' }}
                    />
                </div>

                {/* Current Step Info */}
                <Card 
                    style={{ 
                        marginBottom: '24px',
                        backgroundColor: error ? '#fff2f0' : displayProgress === 100 ? '#f6ffed' : '#f0f9ff',
                        border: `1px solid ${error ? '#ffccc7' : displayProgress === 100 ? '#b7eb8f' : '#91d5ff'}`
                    }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FontAwesomeIcon 
                                icon={error ? faExclamationTriangle : steps[activeStep]?.icon || faSpinner}
                                style={{ 
                                    fontSize: '24px',
                                    color: error ? '#ff4d4f' : displayProgress === 100 ? '#52c41a' : '#1890ff'
                                }}
                                spin={!error && displayProgress < 100 && activeStep < steps.length - 1}
                            />
                            <div>
                                <Title level={4} style={{ margin: 0, color: error ? '#ff4d4f' : '#262626' }}>
                                    {error ? 'Verification Error' : steps[activeStep]?.title || 'Processing...'}
                                </Title>
                                <Text type="secondary">
                                    {error ? 'An error occurred during verification' : steps[activeStep]?.description || 'Please wait...'}
                                </Text>
                            </div>
                        </div>
                    </Space>
                </Card>

                {/* Steps Overview */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: '12px' 
                }}>
                    {steps.map((step, index) => {
                        const [start, end] = step.progressRange;
                        const stepProgress = displayProgress >= end ? 100 : displayProgress >= start ? ((displayProgress - start) / (end - start)) * 100 : 0;
                        const isCompleted = displayProgress >= end;
                        const isActive = displayProgress >= start && displayProgress < end;
                        const isError = error && index === activeStep;

                        return (
                            <div
                                key={index}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    backgroundColor: isError ? '#fff2f0' : isCompleted ? '#f6ffed' : isActive ? '#f0f9ff' : '#fafafa',
                                    border: `1px solid ${isError ? '#ffccc7' : isCompleted ? '#b7eb8f' : isActive ? '#91d5ff' : '#d9d9d9'}`,
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={isError ? faExclamationTriangle : isCompleted ? faCheckCircle : step.icon}
                                    style={{
                                        fontSize: '20px',
                                        color: isError ? '#ff4d4f' : isCompleted ? '#52c41a' : isActive ? '#1890ff' : '#d9d9d9',
                                        marginBottom: '8px'
                                    }}
                                    spin={isActive && !isCompleted && !error}
                                />
                                <div>
                                    <Text 
                                        strong 
                                        style={{ 
                                            fontSize: '12px',
                                            color: isError ? '#ff4d4f' : isCompleted ? '#52c41a' : isActive ? '#1890ff' : '#8c8c8c',
                                            display: 'block'
                                        }}
                                    >
                                        {step.title}
                                    </Text>
                                    {isActive && !isCompleted && (
                                        <div style={{ marginTop: '4px' }}>
                                            <Progress
                                                percent={Math.round(stepProgress)}
                                                size="small"
                                                showInfo={false}
                                                strokeColor="#1890ff"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Status Message */}
                <div style={{ 
                    textAlign: 'center', 
                    padding: '16px', 
                    backgroundColor: error ? '#fff2f0' : displayProgress === 100 ? '#f6ffed' : '#f0f9ff', 
                    borderRadius: '8px', 
                    marginTop: '24px',
                    border: `1px solid ${error ? '#ffccc7' : displayProgress === 100 ? '#b7eb8f' : '#91d5ff'}`
                }}>
                    {error ? (
                        <div>
                            <Text 
                                strong
                                style={{ 
                                    fontSize: '16px',
                                    color: '#ff4d4f',
                                    display: 'block',
                                    marginBottom: '8px'
                                }}
                            >
                                {error}
                            </Text>
                            <Text 
                                style={{ 
                                    fontSize: '14px',
                                    color: '#8c8c8c'
                                }}
                            >
                                Please try scanning a different QR code or contact support if this issue persists.
                            </Text>
                        </div>
                    ) : (
                        <Text 
                            style={{ 
                                fontSize: '14px',
                                color: displayProgress === 100 ? '#52c41a' : '#1890ff'
                            }}
                        >
                            {displayProgress === 100
                                ? "Document verification completed successfully! You can now proceed with additional verification."
                                : mode === 'qr' 
                                ? "Validating QR code authenticity and checking database records..."
                                : "Verifying document authenticity and checking digital signatures..."
                            }
                        </Text>
                    )}
                </div>
            </div>
        </Modal>
    );
}