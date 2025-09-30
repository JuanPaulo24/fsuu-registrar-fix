import React from "react";
import dayjs from "dayjs";
import { Document, Page, Text, View, StyleSheet, Font, PDFViewer, PDFDownloadLink, Image } from "@react-pdf/renderer";
import { Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/pro-regular-svg-icons";

// Register University Cyrillic font from public directory
Font.register({
  family: 'UniversityCyrillic',
  src: '/fonts/university-cyrillic.ttf',
  fontWeight: 'normal',
  fontStyle: 'normal'
});

// Register Arial font with error handling
try { 
  Font.register({
    family: 'Arial',
    src: '/fonts/arial.ttf',
    fontWeight: 'normal',
    fontStyle: 'normal'
  });
} catch (error) {
  console.warn('Arial font could not be loaded, falling back to Helvetica');
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 100,
    paddingHorizontal: 50,
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: '#000000',
    backgroundColor: '#ffffff'
  },
  header: {
    textAlign: 'center',
    marginBottom: 25
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 5,
    position: 'relative'
  },
  logoImage: {
    position: 'absolute',
    left: 0,
    top: 0
  },
  universityInfo: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    marginTop: 18
  },
  universityName: {
    fontSize: 20,
    fontWeight: 'semibold',
    color: '#060270',
    marginBottom: -3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'UniversityCyrillic'
  },
  universityAddress: {
    fontSize: 8,
    color: '#060270',
    marginBottom: 1,
    lineHeight: 1.1,
    textAlign: 'center',
    fontFamily: 'Helvetica' // Using Helvetica as fallback for Arial
  },
  websiteText: {
    fontSize: 9,
    right: 16,
    color: '#060270',
    marginTop: 20,
    marginBottom: 8
  },
  registrarOffice: {
    fontSize: 16,
    color: '#060270',
    fontWeight: 'normal',
    marginTop: 18,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: 'Helvetica'
  },
  bottomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 12,
    position: 'relative'
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 25,
    marginHorizontal: 100
  },
  certificationSection: {
    marginBottom: 20,
    textAlign: 'center',
    marginHorizontal: 57
  },
  certificationText: {
    fontSize: 10,
    lineHeight: 1.8,
    marginBottom: 8,
    textAlign: 'justify',
    textIndent: 40,
    wordSpacing: 2,
  },
  studentName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    marginVertical: 0
  },
  academicInfo: {
    fontSize: 10,
    lineHeight: 1.8,
    textAlign: 'justify',
    marginBottom: 8,
    textIndent: 20
  },
  termsSection: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 12,
    marginTop: 8,
    textAlign: 'left',
    width: '64%'
  },
  termText: {
    fontSize: 10,
    marginBottom: 2,
    lineHeight: 1.6
  },
  completionText: {
    fontSize: 10,
    lineHeight: 1.8,
    textAlign: 'justify',
    marginBottom: 8,
    textIndent: 40,
    wordSpacing: 2
  },
  purposeText: {
    fontSize: 10,
    lineHeight: 1.8,
    textAlign: 'left',
    marginBottom: 15,
    textIndent: 40,
    wordSpacing: 2
  },
  dateLocationText: {
    fontSize: 10,
    lineHeight: 1.8,
    textAlign: 'justify',
    marginBottom: 25,
    textIndent: 40,
    wordSpacing: 2
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingRight: 60,
    marginHorizontal: 20
  },
  signatureBox: {
    width: 138,
    textAlign: 'center'
  },
  signatureLabel: {
    fontSize: 11,
    bottom: 14,
    fontWeight: 'bold',
    marginBottom: 4
  },
  signatureSubLabel: {
    fontSize: 11,
    bottom: 18,
    fontWeight: 500,
    marginBottom: 1
  },
  validityText: {
    position: 'absolute',
    textAlign: 'center',
    bottom: 268,
    left: 108,
    fontSize: 8,
    textTransform: 'uppercase',
    lineHeight: 1.1
  },
  footer: {
    position: 'absolute',
    textAlign: 'justify',
    bottom: 40,
    left: 50,
    right: 50,
    fontSize: 6.7,
    lineHeight: 1.3,
    color: '#060270'
  },
  phoneNumber: {
    marginBottom: 1,
    textAlign: 'left'
  },
  phoneSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: '#060270',
    borderBottomStyle: 'solid',
    marginBottom: 2,
    width: '100%'
  },
  footerText: {
    textAlign: 'justify',
    wordSpacing: 1,
    lineHeight: 0.5
  },
  serialNumber: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 8,
    color: '#666666',
    fontFamily: 'Courier'
  }
});

export function GeneratedCertificateOfUnitsEarned({ documentData = {}, profileData = {}, qrCodeData = null }) {
  const studentName = documentData?.full_name || profileData?.fullname || 
    `${profileData?.firstname || ''} ${profileData?.middlename || ''} ${profileData?.lastname || ''}`.trim() || 'STUDENT NAME';
  let program = documentData?.program || profileData?.course || 'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY (BSIT)';
  
  // Add (BSIT) if the program is BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY and doesn't already have it
  if (program.includes('BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY') && !program.includes('(BSIT)')) {
    program = program.replace('BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY', 'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY (BSIT)');
  }
  
  // Get registrar name from document data, fallback to default
  const registrarName = documentData?.registrar_name || 'Registrar Name, MAEM';
  
  // Get serial number from document data or QR code data
  const serialNumber = documentData?.serial_number || qrCodeData?.serial_number || 'N/A';
  
  const issueDate = dayjs().format('DD');
  const issueMonth = dayjs().format('MMMM YYYY');
  const issueYear = dayjs().format('YYYY');
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* University Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image 
              src="/images/documentlogo.png" 
              style={[{ width: 90, height: 90 }, styles.logoImage]}
            />
            <View style={styles.universityInfo}>
              <Text style={styles.universityName}>FATHER SATURNINO URIOS UNIVERSITY</Text>
              <Text style={styles.universityAddress}>
                San Francisco St., Brgy. Salvacion, Butuan City 8600, Region XIII Caraga, Philippines
              </Text>
            </View>
            
            {/* QR Code Container - Right side */}
            <View style={{ 
              position: 'absolute',
              right: -40,
              top: -20,
              width: 110, 
              height: 110, 
              justifyContent: 'center', 
              alignItems: 'center',
              border: '1pt solid #060270',
            }}>
              {qrCodeData && qrCodeData.qr_code_path ? (
                <Image 
                  src={qrCodeData.qr_code_path} 
                  style={{ width: 100, height: 100 }}
                />
              ) : (
                <Text style={{ fontSize: 8, textAlign: 'center', color: '#666' }}>QR CODE</Text>
              )}
            </View>
          </View>
          
          <View style={styles.bottomHeaderRow}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.websiteText}>www.urios.edu.ph</Text>
            </View>
            <View style={{ flex: 2, alignItems: 'center' }}>
              <Text style={styles.registrarOffice}>OFFICE OF THE REGISTRAR</Text>
            </View>
            <View style={{ flex: 1 }}></View>
          </View>
        </View>

        {/* Document Title */}
        <View style={{ textAlign: 'center' }}>
          <Text style={styles.documentTitle}>CERTIFICATION</Text>
        </View>

        {/* Certification Content */}
        <View style={styles.certificationSection}>
          <Text style={styles.certificationText}>
            This is to certify that <Text style={styles.studentName}>{studentName.toUpperCase()}</Text> has attended Father Saturnino Urios University (FSUU) under the degree of {program} during the following terms:
          </Text>
          
          <View style={styles.termsSection}>
            <Text style={styles.termText}>First and Second Semesters, Summer AY 2023-2024</Text>
            <Text style={styles.termText}>First Semester AY 2024-2025</Text>
          </View>
          
          <Text style={styles.completionText}>
            This is to certify further that she has completed all academic requirements and has earned a total number of 36 units of the said degree.
          </Text>
          
          <Text style={styles.purposeText}>
            This certification is issued for any legal purpose.
          </Text>
          
          <Text style={styles.dateLocationText}>
            Done and sealed this {issueDate}<Text style={{ fontSize: 8, verticalAlign: 'super' }}>th</Text> day of {issueMonth} at FSUU, Butuan City, Philippines.
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>{registrarName}</Text>
            <Text style={styles.signatureSubLabel}>University Registrar</Text>
          </View>
        </View>

        {/* Validity Text */}
        <View style={styles.validityText}>
          <Text>NOT VALID WITHOUT{'\n'}UNIVERSITY SEAL</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.phoneNumber}><Text style={{ fontWeight: 'bold' }}>Phone:</Text> (085) 342-1830</Text>
          <View style={styles.phoneSeparator}></View>
          <Text style={styles.footerText}>
            <Text style={{ fontWeight: 'bold' }}>Accredited:</Text> Philippine Accrediting Association of Schools, Colleges and Universities | Philippine Association of Colleges and Universities Commission on Accreditation Member: Academic Libraries Books Acquisition Systems Association • Catholic Educational Association of the Philippines • Center Educational Measurement • Counseling Council of the Philippines Educational Association • Agusan Catholic Educational Association • Fund for Assistance to Private Education • Philippine Association of Collegiate Schools of Business • Philippine Association of Graduate Education • Philippine Historical Association • Private Education Retirement Annuity Association • Philippine School Accrediting Association • National Trainers Training and Research Institutes • Philippine Network, Inc. • Caraga Consortium for Agriculture, Forestry and Resource Research and Development • Association of Deans of Philippine Colleges of Nursing, Inc. • Caraga Higher Educational Institution Association • Association of Schools of Public Administration in the Philippines, Incorporated • Asian Association of Schools Human Resource Management and Development Practitioners, Inc. • Philippine Society of Information Technology Education • Mindanao Studies Consortium Foundation, Inc.
          </Text>
        </View>

        {/* Serial Number - Bottom Right Corner */}
        <View style={styles.serialNumber}>
          <Text>S/N: {serialNumber}</Text>
        </View>

      </Page>
    </Document>
  );
}

// Component for just the PDF viewer without header
export function CertificateOfUnitsEarnedPDFViewer({ documentData, profileData, qrCodeData }) {
  return (
    <PDFViewer style={{ width: '100%', height: '100%', border: 'none', borderRadius: 4 }} showToolbar={true}>
      <GeneratedCertificateOfUnitsEarned documentData={documentData} profileData={profileData} qrCodeData={qrCodeData} />
    </PDFViewer>
  );
}

// Component for just the download button
export function CertificateOfUnitsEarnedPDFDownload({ documentData, profileData, qrCodeData }) {
  const today = dayjs().format('YYYY-MM-DD');
  const filename = `Certification_${(documentData?.full_name || profileData?.fullname || 'Student').replace(/\s+/g, '_')}_${today}.pdf`;

  return (
    <PDFDownloadLink 
      document={<GeneratedCertificateOfUnitsEarned documentData={documentData} profileData={profileData} qrCodeData={qrCodeData} />} 
      fileName={filename}
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => (
        <Button 
          type="primary"
          className="btn-main-primary"
          loading={loading}
          icon={<FontAwesomeIcon icon={faDownload} />}
          size="large"
        >
          Download Certification
        </Button>
      )}
    </PDFDownloadLink>
  );
}

export default function CertificateOfUnitsEarnedPDF({ documentData, profileData, qrCodeData }) {
  const today = dayjs().format('YYYY-MM-DD');
  const filename = `Certification_${(documentData?.full_name || profileData?.fullname || 'Student').replace(/\s+/g, '_')}_${today}.pdf`;

  return (
    <div style={{ height: 600, borderRadius: 4, background: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ 
        padding: '8px 12px', 
        backgroundColor: '#f0f9f0', 
        borderRadius: 4, 
        border: '1px solid #0a3d27',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: 12, color: '#0a3d27', fontWeight: 'bold' }}>
          📋 Certification - {documentData?.full_name || profileData?.fullname || 'Student'}
          {qrCodeData?.serial_number && (
            <span style={{ marginLeft: 8, fontSize: 10, backgroundColor: '#e6f7ff', padding: '2px 6px', borderRadius: 2 }}>
              S/N: {qrCodeData.serial_number}
            </span>
          )}
        </span>
        <PDFDownloadLink 
          document={<GeneratedCertificateOfUnitsEarned documentData={documentData} profileData={profileData} qrCodeData={qrCodeData} />} 
          fileName={filename}
          style={{
            textDecoration: 'none',
            padding: '4px 12px',
            backgroundColor: '#0a3d27',
            color: 'white',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 'bold'
          }}
        >
          {({ loading }) => (loading ? '⏳ Preparing...' : '📥 Download Certification')}
        </PDFDownloadLink>
      </div>
      <PDFViewer style={{ width: '100%', height: 540, border: 'none', borderRadius: 4 }} showToolbar={true}>
        <GeneratedCertificateOfUnitsEarned documentData={documentData} profileData={profileData} qrCodeData={qrCodeData} />
      </PDFViewer>
    </div>
  );
}



