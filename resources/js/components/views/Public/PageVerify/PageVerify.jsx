import { useState, useEffect } from 'react';
import { Layout, message } from 'antd';
import { POST_PUBLIC } from '../../../providers/useAxiosQuery';

// Import modular components
import Header from './components/Header';
import QRVerification from './components/QRVerification';
import VerificationModal from './components/VerificationModal';
import VerificationProgressModal from './components/VerificationProgressModal';
import Footer from './components/Footer';

const { Content } = Layout;

export default function PageVerify() {
    const [verificationModalOpen, setVerificationModalOpen] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [documentData, setDocumentData] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [validationProgress, setValidationProgress] = useState(0);
    const [validationError, setValidationError] = useState(null);

    // Initialize the mutation for QR validation
    const validateQRMutation = POST_PUBLIC(
        'api/public/document-verification/validate-qr',
        null,
        false, // Don't show global loading
        (data) => {
            // Success callback - complete progress and show next modal
            setValidationProgress(100);
            
            setTimeout(() => {
                if (data.success) {
                    const validatedData = data.data;
                    setDocumentData(validatedData);
                    setShowProgressModal(false);
                    setVerificationModalOpen(true);
                    
                    // Don't show success message here - let the modal handle user feedback
                } else {
                    message.error(data.message || 'Invalid QR code. The QR code is not recognized or has an invalid format.');
                    setShowProgressModal(false);
                }
                setIsValidating(false);
            }, 1000); // Wait 1 second to show 100% completion
        }
    );

    // Handle mutation error
    useEffect(() => {
        if (validateQRMutation.isError && isValidating && !validationError) {
            const error = validateQRMutation.error;
            let errorMessage = 'Unable to validate QR code. Please check your internet connection and try again.';
            
            // Handle different types of errors with generic messages for security
            if (error.response?.status === 404) {
                errorMessage = 'Document verification failed. The QR code is not valid or recognized.';
            } else if (error.response?.status === 400) {
                errorMessage = 'Document verification failed. The QR code appears to be invalid or corrupted.';
            } else if (error.response?.status === 403) {
                errorMessage = 'Document verification failed. Access denied.';
            }
            
            setValidationError(errorMessage);
            setIsValidating(false); // Stop the validation process
            
            // Don't close the progress modal immediately - let user see the error in the progress modal
            // The progress modal will handle showing the error state
        }
    }, [validateQRMutation.isError, isValidating, validationError]);

    // Progress simulation during QR validation
    useEffect(() => {
        if (isValidating && showProgressModal && !validationError) {
            const progressInterval = setInterval(() => {
                setValidationProgress(prev => {
                    if (prev >= 80) {
                        clearInterval(progressInterval);
                        return prev; // Let the API response complete it to 100%
                    }
                    return Math.min(prev + Math.floor(Math.random() * 8) + 1, 80); // Increment by random amount, rounded
                });
            }, 300);

            return () => clearInterval(progressInterval);
        }
    }, [isValidating, showProgressModal, validationError]);

    const handleQRScanned = (data) => {
        // Reset state and show progress modal
        setValidationProgress(5); // Start with small progress
        setValidationError(null);
        setIsValidating(true);
        setShowProgressModal(true);
        
        // Use the raw scanned data for validation
        const qrDataToValidate = data.rawData || data.documentId || data;
        
        // Store QR data for later use
        setQrData(qrDataToValidate);
        
        // Call the mutation
        validateQRMutation.mutate({
            qr_data: qrDataToValidate
        });
    };

    const handleVerificationComplete = (result) => {
        // Handle verification result
        setVerificationModalOpen(false);
        setQrData(null);
        setDocumentData(null);
    };

    const handleVerificationCancel = () => {
        setVerificationModalOpen(false);
        setQrData(null);
        setDocumentData(null);
    };

    const handleProgressModalComplete = () => {
        // This will be handled by the mutation success/error callbacks
        // The progress modal will close automatically
    };

    const handleProgressModalError = () => {
        // Handle error from progress modal - close it and reset state
        setShowProgressModal(false);
        setIsValidating(false);
        setValidationError(null);
        setValidationProgress(0);
        setQrData(null);
    };

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Header />
            
            <Content style={{ 
                padding: '24px', 
                maxWidth: '1200px', 
                margin: '0 auto', 
                width: '100%',
                flex: 1
            }}>
                <QRVerification 
                    onQRScanned={handleQRScanned} 
                    isValidating={isValidating}
                />
            </Content>
            
            <Footer />

            {/* Initial QR Validation Progress Modal */}
            <VerificationProgressModal
                open={showProgressModal}
                progress={validationProgress}
                error={validationError}
                mode="qr"
                onComplete={handleProgressModalComplete}
                onError={handleProgressModalError}
            />

            {/* Document Verification Modal (for additional details) */}
            <VerificationModal
                open={verificationModalOpen}
                qrData={qrData}
                documentData={documentData}
                onComplete={handleVerificationComplete}
                onCancel={handleVerificationCancel}
            />
        </Layout>
    );
}
