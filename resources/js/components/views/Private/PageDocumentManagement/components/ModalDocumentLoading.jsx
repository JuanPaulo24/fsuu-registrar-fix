import { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Steps, Typography, Flex, Card, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faLock, 
    faFileSignature, 
    faQrcode, 
    faFilePdf,
    faCheckCircle,
    faSpinner,
    faExclamationTriangle
} from "@fortawesome/pro-regular-svg-icons";
import axios from "axios";
import { token, apiUrl } from "../../../../providers/appConfig";
import { pdf } from "@react-pdf/renderer";
import { GeneratedDocument } from "./TabDocumentTranscriptOfRecords/components/TranscriptOfRecordsPDF";
import { GeneratedCertificateOfUnitsEarned } from "./TabDocumentCertifications/components/CertificateOfUnitsEarnedPDF";
import { GeneratedDiploma } from "./TabDocumentCertifications/components/DiplomaPDF";

const { Text, Title } = Typography;

export default function ModalDocumentLoading({ open, onComplete, documentData = null }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [generatedData, setGeneratedData] = useState(null);
    const isMountedRef = useRef(true);
    const processingRef = useRef(false);
    
    const steps = [
        {
            title: "Creating Serial Number",
            icon: faFileSignature,
            description: "Calculating sequential document numbers"
        },
        {
            title: "Generating Document",
            icon: faFilePdf,
            description: "Creating Document with profile data"
        },
        {
            title: "Creating Digital Signature",
            icon: faFileSignature,
            description: "Adding ES256 digital signature for authenticity"
        },
        {
            title: "Encrypting with AES-256-GCM",
            icon: faLock,
            description: "Securing document content with encryption"
        },
        {
            title: "Generating Verification QR Code",
            icon: faQrcode,
            description: "Creating secure verification QR code with hash-based encoding"
        },
        {
            title: "Finalizing Document Files",
            icon: faFilePdf,
            description: "Saving to attachments table and storage folder"
        }
    ];

    // Helper function to generate PDF in background (frontend only)
    const generatePDFInBackground = async (profileData, serialInfo, backendData = null) => {
        try {
            const docCategory = documentData?.doc_category || 'Transcript of Records';
            const certType = documentData?.cert_type || '';
            
            // Prepare document data with proper structure
            const pdfDocumentData = {
                serial_number: serialInfo?.serialNumber || 'N/A',
                doc_category: docCategory,
                full_name: profileData.fullname || `${profileData.firstname || ''} ${profileData.middlename || ''} ${profileData.lastname || ''}`.trim(),
                student_id: profileData.id_number,
                program: profileData.course || 'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY',
                registrar_name: backendData?.registrar_name || 'Registrar Name',
                staff_name: backendData?.staff_name || 'Staff Name',
                // Include user role data from documentData (passed from ModalEnhancedDocumentGeneration)
                vice_president_name: documentData?.vice_president_name || backendData?.vice_president_name,
                university_president_name: documentData?.university_president_name || backendData?.university_president_name,
                dean_name: documentData?.dean_name || backendData?.dean_name
            };

            let pdfComponent;
            
            // Route to the correct PDF component based on document type
            if (docCategory === 'Certification') {
                if (certType === 'Certificate of Units Earned') {
                    pdfComponent = <GeneratedCertificateOfUnitsEarned 
                        documentData={pdfDocumentData} 
                        profileData={profileData} 
                        qrCodeData={null}
                    />;
                } else if (certType === 'Diploma') {
                    pdfComponent = <GeneratedDiploma 
                        documentData={pdfDocumentData} 
                        profileData={profileData}
                        qrCodeData={null}
                    />;
                } else {
                    // Default to Diploma for Certification
                    pdfComponent = <GeneratedDiploma 
                        documentData={pdfDocumentData} 
                        profileData={profileData}
                        qrCodeData={null}
                    />;
                }
            } else {
                // Default to TOR
                pdfComponent = <GeneratedDocument 
                    documentData={pdfDocumentData} 
                    profileData={profileData} 
                    documentType="Transcript of Records"
                    qrCodeData={null}
                />;
            }

            // Generate PDF blob using the appropriate component
            const pdfBlob = await pdf(pdfComponent).toBlob();

            // Convert blob to base64 for backend processing
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
                    resolve(base64data);
                };
                reader.readAsDataURL(pdfBlob);
            });
        } catch (error) {
            console.warn('Background PDF generation error:', error);
            return null; // Don't fail the process, backend can create placeholder
        }
    };

    const generateTORDocument = useCallback(async () => {
        if (!documentData || processingRef.current) {
            return;
        }

        processingRef.current = true;

        if (!isMountedRef.current) return;
        setIsProcessing(true);
        setError(null);
        setCurrentStep(1);

        // Check if this is a Certificate of Units Earned - handle with full backend processing
        const docCategory = documentData?.doc_category || 'Transcript of Records';
        const certType = documentData?.cert_type || '';
        
        if (docCategory === 'Certification' && certType === 'Certificate of Units Earned') {
            try {
                const authToken = token();
                if (!authToken) {
                    throw new Error('Authentication token not found. Please login again.');
                }

                // Start loading steps and backend process simultaneously
                let completeProfileData = null; // Store profile data for later use
                const processPromise = (async () => {
                    // Step 1: Creating Serial Number - Get real serial number first
                    setCurrentStep(1);
                    
                    // Get serial number from backend first
                    const serialResponse = await axios.post(apiUrl('api/issued_documents/generate_certificate_serial'), {
                        profile_id: documentData.profile_id
                    }, {
                        headers: {
                            'Authorization': authToken
                        }
                    });
                    
                    if (!serialResponse.data.success) {
                        throw new Error('Failed to generate certificate serial number');
                    }
                    
                    const serialInfo = serialResponse.data.data;
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                    if (!isMountedRef.current) return null;
                    setCurrentStep(2);
                    
                    // Step 2: Fetch complete profile data, then generate PDF with real serial number
                    const profileResponse = await axios.get(apiUrl(`api/profile/${documentData.profile_id}?include=grades,attachments`), {
                        headers: {
                            'Authorization': authToken
                        }
                    });
                    
                    // Handle different response formats (sometimes direct data, sometimes wrapped)
                    completeProfileData = profileResponse.data.data || profileResponse.data;
                    
                    // Generate PDF with complete profile data and REAL serial number
                    const pdfPromise = generatePDFInBackground(completeProfileData, serialInfo);
                    
                    await new Promise(resolve => setTimeout(resolve, 800));
                    if (!isMountedRef.current) return null;
                    setCurrentStep(3);

                    // Get the generated PDF (if ready)
                    const pdfData = await pdfPromise;
                    
                    // Step 3-6: Backend processes everything
                    const backendData = {
                        ...documentData,
                        pdf_data: pdfData, // Pass the frontend-generated PDF as base64
                        serialNumber: serialInfo.serialNumber,
                        documentId: serialInfo.documentId,
                        currentVersion: serialInfo.currentVersion
                    };

                    const response = await axios.post(apiUrl('api/issued_documents/generate_certificate'), backendData, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': authToken
                        }
                    });

                    return { response, profileData: completeProfileData };
                })();

                // Simulate remaining loading steps while backend processes
                await new Promise(resolve => setTimeout(resolve, 800));
                if (!isMountedRef.current) return;
                setCurrentStep(4);

                await new Promise(resolve => setTimeout(resolve, 1000));
                if (!isMountedRef.current) return;
                setCurrentStep(5);

                await new Promise(resolve => setTimeout(resolve, 800));
                if (!isMountedRef.current) return;
                setCurrentStep(6);

                // Wait for backend to complete
                const result = await processPromise;
                if (!result || !isMountedRef.current) return;

                const { response, profileData } = result;
                completeProfileData = profileData; // Update the outer scope variable

                if (response.data && response.data.success) {
                    // Generate final document with QR code embedded
                    const qrCodeData = response.data.data.qr_code_data;
                    let finalDocumentData = response.data.data;
                    
                    if (qrCodeData && qrCodeData.qr_code_path) {
                        try {
                            // Prepare document data for final PDF generation
                            const docCategory = documentData?.doc_category || 'Certification';
                            const certType = documentData?.cert_type || 'Certificate of Units Earned';
                            
                            const finalPdfDocumentData = {
                                serial_number: qrCodeData.serial_number,
                                doc_category: docCategory,
                                full_name: completeProfileData.fullname || `${completeProfileData.firstname || ''} ${completeProfileData.middlename || ''} ${completeProfileData.lastname || ''}`.trim(),
                                student_id: completeProfileData.id_number,
                                program: completeProfileData.course || 'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY',
                                registrar_name: response.data.data.registrar_name, // Include backend-provided registrar name
                                staff_name: response.data.data.staff_name // Include backend-provided staff name
                            };

                            // Generate final PDF with QR code embedded for Certificate of Units Earned
                            const finalPdfComponent = <GeneratedCertificateOfUnitsEarned 
                                documentData={finalPdfDocumentData} 
                                profileData={completeProfileData} 
                                qrCodeData={qrCodeData}
                            />;

                            // Generate final PDF with QR code embedded
                            const finalPdfBlob = await pdf(finalPdfComponent).toBlob();

                            // Convert blob to base64 for backend storage
                            const finalPdfBase64 = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    const base64data = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
                                    resolve(base64data);
                                };
                                reader.readAsDataURL(finalPdfBlob);
                            });

                            // Send final PDF to backend to replace the placeholder
                            const finalPdfResponse = await axios.post(apiUrl('api/issued_documents/save_final_pdf'), {
                                issued_document_id: response.data.data.issued_document.id,
                                pdf_data: finalPdfBase64,
                                profile_id: documentData.profile_id
                            }, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Authorization': authToken
                                }
                            });

                            if (finalPdfResponse.data.success) {
                                
                                // Update the response data with the final document info
                                finalDocumentData = {
                                    ...response.data.data,
                                    final_document_generated: true,
                                    final_document_size: finalPdfBlob.size,
                                    final_document_path: finalPdfResponse.data.data.final_document_path
                                };
                            } else {
                                console.warn('Failed to save final Certificate PDF to backend');
                            }
                        } catch (error) {
                            console.warn('Final Certificate PDF generation error:', error);
                            // Continue without final PDF if it fails
                        }
                    }
                    
                    setGeneratedData(finalDocumentData);
                    
                    setTimeout(() => {
                        if (!isMountedRef.current) return;
                        setIsProcessing(false);
                        processingRef.current = false;
                        if (onComplete) {
                            onComplete(finalDocumentData);
                        }
                    }, 500);
                    
                } else {
                    throw new Error(response.data?.message || 'Certificate generation failed');
                }

                return;
            } catch (error) {
                console.error('Certificate generation error:', error);
                if (!isMountedRef.current) return;
                
                const errorMessage = error.response?.data?.message || error.message || 'Failed to generate Certificate of Units Earned';
                setError(errorMessage);
                setIsProcessing(false);
                processingRef.current = false;
                
                notification.error({
                    message: 'Certificate Generation Failed',
                    description: errorMessage,
                    placement: 'topRight',
                });
                return;
            }
        }
        
        // Check if this is a Diploma - handle with full backend processing
        if (docCategory === 'Certification' && certType === 'Diploma') {
            try {
                const authToken = token();
                if (!authToken) {
                    throw new Error('Authentication token not found. Please login again.');
                }

                // Start loading steps and backend process simultaneously
                let completeProfileData = null; // Store profile data for later use
                const processPromise = (async () => {
                    // Step 1: Creating Serial Number - Get real serial number first
                    setCurrentStep(1);
                    
                    // Get serial number from backend first
                    const serialResponse = await axios.post(apiUrl('api/issued-documents/generate-diploma-serial'), {
                        profile_id: documentData.profile_id
                    }, {
                        headers: {
                            'Authorization': authToken
                        }
                    });
                    
                    if (!serialResponse.data.success) {
                        throw new Error('Failed to generate diploma serial number');
                    }
                    
                    const serialInfo = serialResponse.data.data;
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                    if (!isMountedRef.current) return null;
                    setCurrentStep(2);
                    
                    // Step 2: Fetch complete profile data, then generate PDF with real serial number
                    const profileResponse = await axios.get(apiUrl(`api/profile/${documentData.profile_id}?include=grades,attachments`), {
                        headers: {
                            'Authorization': authToken
                        }
                    });
                    
                    // Handle different response formats (sometimes direct data, sometimes wrapped)
                    completeProfileData = profileResponse.data.data || profileResponse.data;
                    
                    // Generate PDF with complete profile data and REAL serial number
                    const pdfPromise = generatePDFInBackground(completeProfileData, serialInfo);
                    
                    await new Promise(resolve => setTimeout(resolve, 800));
                    if (!isMountedRef.current) return null;
                    setCurrentStep(3);

                    // Get the generated PDF (if ready)
                    const pdfData = await pdfPromise;
                    
                    // Step 3-6: Backend processes everything
                    const backendData = {
                        ...documentData,
                        pdf_data: pdfData, // Pass the frontend-generated PDF as base64
                        serialNumber: serialInfo.serialNumber,
                        documentId: serialInfo.documentId,
                        currentVersion: serialInfo.currentVersion
                    };

                    const response = await axios.post(apiUrl('api/issued_documents/generate_diploma'), backendData, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': authToken
                        }
                    });

                    return { response, profileData: completeProfileData };
                })();

                // Simulate remaining loading steps while backend processes
                await new Promise(resolve => setTimeout(resolve, 800));
                if (!isMountedRef.current) return;
                setCurrentStep(4);

                await new Promise(resolve => setTimeout(resolve, 1000));
                if (!isMountedRef.current) return;
                setCurrentStep(5);

                await new Promise(resolve => setTimeout(resolve, 800));
                if (!isMountedRef.current) return;
                setCurrentStep(6);

                // Wait for backend to complete
                const result = await processPromise;
                if (!result || !isMountedRef.current) return;

                const { response, profileData } = result;
                completeProfileData = profileData; // Update the outer scope variable

                if (response.data.success) {
                    let finalDocumentData = response.data.data;
                    
                    // If QR code data is available, generate final PDF with QR code embedded
                    if (response.data.data?.qr_code_data) {
                        try {
                            const qrCodeData = {
                                ...response.data.data.qr_code_data,
                                registrar_name: response.data.data.registrar_name,
                                staff_name: response.data.data.staff_name
                            };

                            const finalPdfDocumentData = {
                                serial_number: response.data.data.serial_number,
                                doc_category: documentData.doc_category,
                                cert_type: documentData.cert_type,
                                full_name: completeProfileData.fullname || `${completeProfileData.firstname || ''} ${completeProfileData.middlename || ''} ${completeProfileData.lastname || ''}`.trim(),
                                student_id: completeProfileData.id_number,
                                program: completeProfileData.course || 'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY',
                                registrar_name: response.data.data.registrar_name,
                                staff_name: response.data.data.staff_name,
                                // Include user role data for diploma signatures
                                vice_president_name: response.data.data.vice_president_name,
                                university_president_name: response.data.data.university_president_name,
                                dean_name: response.data.data.dean_name
                            };

                            // Generate final PDF with QR code embedded for Diploma
                            const finalPdfComponent = <GeneratedDiploma 
                                documentData={finalPdfDocumentData} 
                                profileData={completeProfileData} 
                                qrCodeData={qrCodeData}
                            />;

                            // Generate final PDF with QR code embedded
                            const finalPdfBlob = await pdf(finalPdfComponent).toBlob();

                            // Convert blob to base64 for backend storage
                            const finalPdfBase64 = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    const base64data = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
                                    resolve(base64data);
                                };
                                reader.readAsDataURL(finalPdfBlob);
                            });

                            // Send final PDF to backend to replace the placeholder
                            const finalPdfResponse = await axios.post(apiUrl('api/issued_documents/save_final_pdf'), {
                                issued_document_id: response.data.data.issued_document.id,
                                pdf_data: finalPdfBase64,
                                profile_id: documentData.profile_id
                            }, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Authorization': authToken
                                }
                            });

                            if (finalPdfResponse.data.success) {
                                // Update the response data with the final document info
                                finalDocumentData = {
                                    ...response.data.data,
                                    final_document_generated: true,
                                    final_document_size: finalPdfBlob.size,
                                    final_document_path: finalPdfResponse.data.data.final_document_path
                                };
                            } else {
                                console.warn('Failed to save final Diploma PDF to backend');
                            }
                        } catch (error) {
                            console.warn('Final Diploma PDF generation error:', error);
                            // Continue without final PDF if it fails
                        }
                    }
                    
                    setGeneratedData(finalDocumentData);
                    
                    setTimeout(() => {
                        if (!isMountedRef.current) return;
                        setIsProcessing(false);
                        processingRef.current = false;
                        if (onComplete) {
                            onComplete(finalDocumentData);
                        }
                    }, 500);
                    
                } else {
                    throw new Error(response.data?.message || 'Diploma generation failed');
                }

                return;
            } catch (error) {
                console.error('Diploma generation error:', error);
                if (!isMountedRef.current) return;
                
                const errorMessage = error.response?.data?.message || error.message || 'Failed to generate Diploma';
                setError(errorMessage);
                setIsProcessing(false);
                processingRef.current = false;
                
                notification.error({
                    message: 'Diploma Generation Failed',
                    description: errorMessage,
                    placement: 'topRight',
                });
                return;
            }
        }

        // For other certification types (excluding Certificate of Units Earned and Diploma), keep the simplified approach for now
        if (docCategory === 'Certification' && certType !== 'Certificate of Units Earned' && certType !== 'Diploma') {
            try {
                // For other certification documents, just generate the PDF and show it (no backend processing)
                setCurrentStep(2);
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Fetch profile data
                const authToken = token();
                const profileResponse = await axios.get(apiUrl(`api/profile/${documentData.profile_id}?include=grades,attachments`), {
                    headers: {
                        'Authorization': authToken
                    }
                });
                
                const profileData = profileResponse.data.data || profileResponse.data;
                
                setCurrentStep(6); // Jump to final step
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Create mock document data for display
                const mockDocumentData = {
                    ...documentData,
                    serial_number: 'CERT-000001',
                    document_id: 'CERT-000001',
                    current_version: '1.0',
                    profile: profileData,
                    final_document_generated: false, // No backend file generated
                    qr_code_data: null // No QR code for now
                };
                
                setGeneratedData(mockDocumentData);
                
                setTimeout(() => {
                    if (!isMountedRef.current) return;
                    setIsProcessing(false);
                    processingRef.current = false;
                    if (onComplete) {
                        onComplete(mockDocumentData);
                    }
                }, 500);
                
                return;
            } catch (error) {
                console.error('Certification generation error:', error);
                if (!isMountedRef.current) return;
                
                const errorMessage = error.response?.data?.message || error.message || 'Failed to generate certification document';
                setError(errorMessage);
                setIsProcessing(false);
                processingRef.current = false;
                return;
            }
        }

        try {
            const authToken = token();
            if (!authToken) {
                throw new Error('Authentication token not found. Please login again.');
            }

            // Start loading steps and backend process simultaneously
            let completeProfileData = null; // Store profile data for later use
            const processPromise = (async () => {
                // Step 1: Creating Serial Number - Get real serial number first
                setCurrentStep(1);
                
                // Get serial number from backend first
                const serialResponse = await axios.post(apiUrl('api/issued_documents/generate_serial'), {
                    profile_id: documentData.profile_id
                }, {
                    headers: {
                        'Authorization': authToken
                    }
                });
                
                if (!serialResponse.data.success) {
                    throw new Error('Failed to generate serial number');
                }
                
                const serialInfo = serialResponse.data.data;
                
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!isMountedRef.current) return null;
                setCurrentStep(2);
                
                // Step 2: Fetch complete profile data, then generate PDF with real serial number
                const profileResponse = await axios.get(apiUrl(`api/profile/${documentData.profile_id}?include=grades,attachments`), {
                    headers: {
                        'Authorization': authToken
                    }
                });
                
                // Handle different response formats (sometimes direct data, sometimes wrapped)
                completeProfileData = profileResponse.data.data || profileResponse.data;
                
                // Generate PDF with complete profile data and REAL serial number
                const pdfPromise = generatePDFInBackground(completeProfileData, serialInfo);
                
                await new Promise(resolve => setTimeout(resolve, 800));
                if (!isMountedRef.current) return null;
                setCurrentStep(3);

                // Get the generated PDF (if ready)
                const pdfData = await pdfPromise;
                
                // Step 3-6: Backend processes everything
                const backendData = {
                    ...documentData,
                    pdf_data: pdfData, // Pass the frontend-generated PDF as base64
                    serialNumber: serialInfo.serialNumber,
                    documentId: serialInfo.documentId,
                    estimatedPages: serialInfo.estimatedPages
                };

                const response = await axios.post(apiUrl('api/issued_documents/generate_tor'), backendData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': authToken
                    }
                });

                return { response, profileData: completeProfileData };
            })();

            // Simulate remaining loading steps while backend processes
            await new Promise(resolve => setTimeout(resolve, 800));
            if (!isMountedRef.current) return;
            setCurrentStep(4);

            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!isMountedRef.current) return;
            setCurrentStep(5);

            await new Promise(resolve => setTimeout(resolve, 800));
            if (!isMountedRef.current) return;
            setCurrentStep(6);

            // Wait for backend to complete
            const result = await processPromise;
            if (!result || !isMountedRef.current) return;

            const { response, profileData } = result;
            completeProfileData = profileData; // Update the outer scope variable

            if (response.data && response.data.success) {
                // Generate final document with QR code embedded
                const qrCodeData = response.data.data.qr_code_data;
                let finalDocumentData = response.data.data;
                
                if (qrCodeData && qrCodeData.qr_code_path) {
                    try {
                        // Prepare document data for final PDF generation
                        const docCategory = documentData?.doc_category || 'Transcript of Records';
                        const certType = documentData?.cert_type || '';
                        
                        const finalPdfDocumentData = {
                            serial_number: qrCodeData.serial_number,
                            doc_category: docCategory,
                            full_name: completeProfileData.fullname || `${completeProfileData.firstname || ''} ${completeProfileData.middlename || ''} ${completeProfileData.lastname || ''}`.trim(),
                            student_id: completeProfileData.id_number,
                            program: completeProfileData.course || 'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY',
                            registrar_name: response.data.data.registrar_name, // Include backend-provided registrar name
                            staff_name: response.data.data.staff_name, // Include backend-provided staff name
                            // Include user role data for diploma signatures
                            vice_president_name: response.data.data.vice_president_name,
                            university_president_name: response.data.data.university_president_name,
                            dean_name: response.data.data.dean_name
                        };

                        let finalPdfComponent;
                        
                        // Route to the correct PDF component based on document type
                        if (docCategory === 'Certification') {
                            if (certType === 'Certificate of Units Earned') {
                                finalPdfComponent = <GeneratedCertificateOfUnitsEarned 
                                    documentData={finalPdfDocumentData} 
                                    profileData={completeProfileData} 
                                    qrCodeData={qrCodeData}
                                />;
                            } else if (certType === 'Diploma') {
                                finalPdfComponent = <GeneratedDiploma 
                                    documentData={finalPdfDocumentData} 
                                    profileData={completeProfileData}
                                    qrCodeData={qrCodeData}
                                />;
                            } else {
                                // Default to Diploma for Certification
                                finalPdfComponent = <GeneratedDiploma 
                                    documentData={finalPdfDocumentData} 
                                    profileData={completeProfileData}
                                    qrCodeData={qrCodeData}
                                />;
                            }
                        } else {
                            // Default to TOR
                            finalPdfComponent = <GeneratedDocument 
                                documentData={finalPdfDocumentData} 
                                profileData={completeProfileData} 
                                documentType="Transcript of Records"
                                qrCodeData={qrCodeData}
                            />;
                        }

                        // Generate final PDF with QR code embedded
                        const finalPdfBlob = await pdf(finalPdfComponent).toBlob();

                        // Convert blob to base64 for backend storage
                        const finalPdfBase64 = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const base64data = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
                                resolve(base64data);
                            };
                            reader.readAsDataURL(finalPdfBlob);
                        });

                        // Send final PDF to backend to replace the placeholder
                        const finalPdfResponse = await axios.post(apiUrl('api/issued_documents/save_final_pdf'), {
                            issued_document_id: response.data.data.issued_document.id,
                            pdf_data: finalPdfBase64,
                            profile_id: documentData.profile_id
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Authorization': authToken
                            }
                        });

                        if (finalPdfResponse.data.success) {
                            
                            // Update the response data with the final document info
                            finalDocumentData = {
                                ...response.data.data,
                                final_document_generated: true,
                                final_document_size: finalPdfBlob.size,
                                final_document_path: finalPdfResponse.data.data.final_document_path
                            };
                        } else {
                            console.warn('Failed to save final PDF to backend');
                        }
                    } catch (error) {
                        console.warn('Final PDF generation error:', error);
                        // Continue without final PDF if it fails
                    }
                }
                
                setGeneratedData(finalDocumentData);
                
                setTimeout(() => {
                    if (!isMountedRef.current) return;
                    setIsProcessing(false);
                    processingRef.current = false;
                    if (onComplete) {
                        onComplete(finalDocumentData);
                    }
                }, 500);
                
            } else {
                throw new Error(response.data?.message || 'Document generation failed');
            }

        } catch (error) {
            console.error('TOR generation error:', error);
            if (!isMountedRef.current) return;
            
            const errorMessage = error.response?.data?.message || error.message || 'Failed to generate TOR document';
            setError(errorMessage);
            setIsProcessing(false);
            processingRef.current = false;
            
            notification.error({
                message: 'Document Generation Failed',
                description: errorMessage,
                placement: 'topRight',
            });
        }
    }, [documentData, onComplete]);

    // Cleanup effect to track component mounting
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!open) {
            setCurrentStep(0);
            setIsProcessing(false);
            setError(null);
            setGeneratedData(null);
            processingRef.current = false;
            return;
        }

        // Start the real document generation process
        if (documentData && !processingRef.current) {
            generateTORDocument();
        }
    }, [open, generateTORDocument]);

    const renderStepIcon = (index) => {
        if (error && index === currentStep - 1) {
            return <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: 'var(--color-error)' }} />;
        } else if (index < currentStep) {
            return <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--color-success)' }} />;
        } else if (index === currentStep - 1 && isProcessing) {
            return <FontAwesomeIcon icon={faSpinner} spin style={{ color: 'var(--color-primary)' }} />;
        } else {
            return <FontAwesomeIcon icon={steps[index].icon} style={{ color: 'var(--color-gray)' }} />;
        }
    };

    return (
        <Modal
            open={open}
            closable={false}
            maskClosable={false}
            footer={null}
            width={600}
            centered
            title={
                <Flex align="center" gap={8}>
                    <FontAwesomeIcon icon={error ? faExclamationTriangle : faSpinner} spin={!error} />
                    {error ? 'Generation Failed' : 'Generating TOR Document'}
                </Flex>
            }
            styles={{
                header: {
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-white)'
                }
            }}
        >
            <div style={{ padding: '20px 0' }}>
                <Title level={4} style={{ textAlign: 'center', marginBottom: 24, color: error ? 'var(--color-error)' : 'var(--color-primary)' }}>
                    {error ? 'Document generation encountered an error...' : 'Please wait while we generate your TOR document...'}
                </Title>
                
                {error && (
                    <Card style={{ marginBottom: 20, borderColor: 'var(--color-error)', backgroundColor: '#fff2f0' }}>
                        <Text type="danger" style={{ fontSize: 14 }}>
                            <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: 8 }} />
                            {error}
                        </Text>
                    </Card>
                )}
                
                <Card style={{ marginBottom: 20 }}>
                    {steps.map((step, index) => (
                        <div key={index} style={{ marginBottom: index < steps.length - 1 ? 16 : 0 }}>
                            <Flex align="center" gap={12}>
                                <div style={{ 
                                    width: 32, 
                                    height: 32, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    backgroundColor: index < currentStep ? 'var(--color-success-light)' : 
                                                   index === currentStep - 1 ? 'var(--color-primary-light)' : 
                                                   'var(--color-gray-light)'
                                }}>
                                    {renderStepIcon(index)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Text 
                                        strong 
                                        style={{ 
                                            color: index < currentStep ? 'var(--color-success)' : 
                                                   index === currentStep - 1 ? 'var(--color-primary)' : 
                                                   'var(--color-gray)',
                                            display: 'block'
                                        }}
                                    >
                                        {step.title}
                                    </Text>
                                    <Text 
                                        type="secondary" 
                                        style={{ 
                                            fontSize: 12,
                                            color: index < currentStep ? 'var(--color-success)' : 
                                                   index === currentStep - 1 ? 'var(--color-primary)' : 
                                                   'var(--color-gray)'
                                        }}
                                    >
                                        {step.description}
                                    </Text>
                                </div>
                                {index < currentStep && (
                                    <Text style={{ color: 'var(--color-success)', fontSize: 12 }}>
                                        ✓ Complete
                                    </Text>
                                )}
                                {index === currentStep - 1 && (
                                    <Text style={{ color: 'var(--color-primary)', fontSize: 12 }}>
                                        Processing...
                                    </Text>
                                )}
                            </Flex>
                        </div>
                    ))}
                </Card>

                <div style={{ 
                    textAlign: 'center', 
                    padding: 16, 
                    backgroundColor: error ? '#fff2f0' : 'var(--color-highlight)', 
                    borderRadius: 8 
                }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {error 
                            ? 'Please try again or contact system administrator if the problem persists.' 
                            : 'Generating TOR with QR code and digital signature. This process typically takes 30-60 seconds. Please do not close this window.'
                        }
                    </Text>
                </div>
            </div>
        </Modal>
    );
}
