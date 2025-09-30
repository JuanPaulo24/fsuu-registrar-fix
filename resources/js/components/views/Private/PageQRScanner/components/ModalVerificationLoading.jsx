import { Modal, Typography, Flex, Card, Steps } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSpinner,
    faQrcode,
    faLock, 
    faFileSignature, 
    faCheckCircle,
    faExclamationTriangle,
    faKey,
} from "@fortawesome/pro-regular-svg-icons";

const { Title, Text } = Typography;

export default function ModalVerificationLoading({ open, onComplete, currentStep = 0, error = null }) {
    const steps = [
        { title: "Scanning QR Code", icon: faQrcode, description: "Reading QR code data" },
        { title: "Hash Verification", icon: faKey, description: "Verifying document hash in system" },
        { title: "Decoding BASE45", icon: faLock, description: "Decrypting document information" },
        { title: "Document Verification", icon: faFileSignature, description: "Checking document authenticity" },
    ];

    const renderStepIcon = (index) => {
        if (error && index === currentStep) return <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: "#ff4d4f" }} />;
        if (index < currentStep) return <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#52c41a" }} />;
        if (index === currentStep) return <FontAwesomeIcon icon={faSpinner} spin style={{ color: "#1890ff" }} />;
        return <FontAwesomeIcon icon={steps[index].icon} style={{ color: "#d9d9d9" }} />;
    };

    return (
        <Modal
            open={open}
            closable={false}
            maskClosable={false}
            footer={null}
            width={500}
            centered
            title={
                <Flex align="center" gap={8}>
                    <FontAwesomeIcon icon={error ? faExclamationTriangle : faSpinner} spin={!error} />
                    {error ? "Verification Failed" : "Verifying Document"}
                </Flex>
            }
        >
            <div style={{ padding: "20px 0" }}>
                <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
                    {error ? "Document verification encountered an error..." : "Please wait while we verify the document..."}
                </Title>
                
                <Card>
                    <Steps
                        direction="vertical"
                        size="small"
                        current={currentStep}
                        items={steps.map((step, index) => ({
                            title: step.title,
                            description: step.description,
                            icon: renderStepIcon(index),
                            status: error && index === currentStep ? "error" : index < currentStep ? "finish" : index === currentStep ? "process" : "wait",
                        }))}
                    />
                </Card>

                <div style={{ textAlign: "center", padding: 16, backgroundColor: error ? "#fff2f0" : "#f0f9ff", borderRadius: 8, marginTop: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {error ? "Please try scanning the QR code again or contact support if the problem persists." : "Verifying document authenticity and checking digital signatures..."}
                    </Text>
                </div>
            </div>
        </Modal>
    );
}

