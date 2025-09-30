import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';

const CustomPDFViewer = ({ pdfUrl, displayFilename }) => {
    const [pdfBlob, setPdfBlob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pdfUrl) {
            setLoading(false);
            return;
        }

        const fetchPDF = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch(pdfUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch PDF');
                }
                
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                setPdfBlob(blobUrl);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching PDF:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPDF();

        // Cleanup function to revoke blob URL
        return () => {
            if (pdfBlob) {
                URL.revokeObjectURL(pdfBlob);
            }
        };
    }, [pdfUrl]);

    if (loading) {
        return (
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa'
            }}>
                <Spin size="large" tip="Loading PDF..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                color: '#ff4d4f'
            }}>
                Error loading PDF: {error}
            </div>
        );
    }

    if (!pdfBlob) {
        return (
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                color: '#666'
            }}>
                No PDF available
            </div>
        );
    }

    return (
        <iframe
            src={pdfBlob}
            style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '0 0 8px 8px'
            }}
            title={displayFilename || 'Document Preview'}
        />
    );
};

export default CustomPDFViewer;