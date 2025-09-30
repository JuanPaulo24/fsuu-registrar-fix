import React from "react";

// Import all PDF components from PageDocumentManagement
import TranscriptOfRecordsPDF, { 
  TranscriptOfRecordsPDFViewer as TranscriptPDFViewer, 
  TranscriptOfRecordsPDFDownload as TranscriptPDFDownload 
} from "../../PageDocumentManagement/components/TabDocumentTranscriptOfRecords/components/TranscriptOfRecordsPDF";

import DiplomaPDF, { 
  DiplomaPDFViewer, 
  DiplomaPDFDownload 
} from "../../PageDocumentManagement/components/TabDocumentCertifications/components/DiplomaPDF";

import CertificateOfUnitsEarnedPDF, { 
  CertificateOfUnitsEarnedPDFViewer, 
  CertificateOfUnitsEarnedPDFDownload 
} from "../../PageDocumentManagement/components/TabDocumentCertifications/components/CertificateOfUnitsEarnedPDF";

/**
 * Router function to determine which PDF component to use based on document data
 * @param {Object} documentData - The document data containing doc_category and cert_type
 * @returns {Object} - Object containing the appropriate PDF components
 */
export function getDocumentPDFComponents(documentData = {}) {
  const docCategory = documentData?.doc_category || 'Transcript of Records';
  const certType = documentData?.cert_type || '';

  // If it's a Transcript of Records
  if (docCategory === 'Transcript of Records') {
    return {
      PDFComponent: TranscriptOfRecordsPDF,
      PDFViewer: TranscriptPDFViewer,
      PDFDownload: TranscriptPDFDownload,
      documentType: 'Transcript of Records'
    };
  }

  // If it's a Certification, check the certification type
  if (docCategory === 'Certification') {
    if (certType === 'Diploma') {
      return {
        PDFComponent: DiplomaPDF,
        PDFViewer: DiplomaPDFViewer,
        PDFDownload: DiplomaPDFDownload,
        documentType: 'Diploma'
      };
    }

    if (certType === 'Certificate of Units Earned') {
      return {
        PDFComponent: CertificateOfUnitsEarnedPDF,
        PDFViewer: CertificateOfUnitsEarnedPDFViewer,
        PDFDownload: CertificateOfUnitsEarnedPDFDownload,
        documentType: 'Certificate of Units Earned'
      };
    }

    // Default to Diploma if certification type is not specified
    return {
      PDFComponent: DiplomaPDF,
      PDFViewer: DiplomaPDFViewer,
      PDFDownload: DiplomaPDFDownload,
      documentType: 'Diploma'
    };
  }

  // Default fallback to Transcript of Records
  return {
    PDFComponent: TranscriptOfRecordsPDF,
    PDFViewer: TranscriptPDFViewer,
    PDFDownload: TranscriptPDFDownload,
    documentType: 'Transcript of Records'
  };
}

/**
 * Universal PDF Viewer Component
 * Routes to the appropriate PDF viewer based on document type
 */
export function DocumentPDFViewer({ documentData, profileData }) {

  
  const { PDFViewer, documentType } = getDocumentPDFComponents(documentData);

  return <PDFViewer documentData={documentData} profileData={profileData} />;
}

/**
 * Universal PDF Download Component
 * Routes to the appropriate PDF download button based on document type
 */
export function DocumentPDFDownload({ documentData, profileData }) {
  const { PDFDownload } = getDocumentPDFComponents(documentData);
  return <PDFDownload documentData={documentData} profileData={profileData} />;
}

/**
 * Universal PDF Component
 * Routes to the appropriate PDF component with preview based on document type
 */
export default function DocumentPDFRouter({ documentData, profileData }) {
  const { PDFComponent } = getDocumentPDFComponents(documentData);
  return <PDFComponent documentData={documentData} profileData={profileData} />;
}