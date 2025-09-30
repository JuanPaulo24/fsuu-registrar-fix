import React from "react";
import dayjs from "dayjs";
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font, 
  PDFViewer, 
  PDFDownloadLink, 
  Image 
} from "@react-pdf/renderer";
import { Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/pro-regular-svg-icons";

/**
 * DiplomaPDF Component
 * 
 * A comprehensive React component for generating and displaying university diplomas as PDF documents.
 * Features curved university name text, custom fonts, and proper academic formatting.
 * 
 * @version 2.1.0
 * @author University System Development Team
 * @description Generates Father Saturnino Urios University diploma certificates
 */

// ================================================================================================
// CONFIGURATION CONSTANTS
// ================================================================================================

/**
 * Font family constants for consistent typography
 */
const FONTS = {
  UNIVERSITY_CYRILLIC: 'UniversityCyrillic',
  CAROL_GOTHIC: 'CarolGothic',
  FRANCIS_REGULAR: 'FrancisRegular',
  LUXURIOUS_ROMAN: 'LuxuriousRoman',
  HELVETICA: 'Helvetica'
};

/**
 * Color palette for diploma styling
 */
const COLORS = {
  PRIMARY_BLACK: '#000000',
  SECONDARY_GRAY: '#333333',
  LIGHT_GRAY: '#666666',
  WHITE: '#ffffff',
  BORDER_GREEN: '#0a3d27',
  BACKGROUND_GREEN: '#f0f9f0'
};

// Header image configuration (default values)
const DIPLOMA_HEADER_CONFIG = {
  defaultMaxWidth: 1080,
  defaultMaxHeight: 300,
  defaultMarginBottom: 2,
  defaultMarginTop: -2,
};

// ================================================================================================
// FONT REGISTRATION
// ================================================================================================

/**
 * Registers custom fonts for the diploma PDF generation
 */
const registerFonts = () => {
  const fontConfigs = [
    { family: FONTS.UNIVERSITY_CYRILLIC, src: '/fonts/university-cyrillic.ttf' },
    { family: FONTS.CAROL_GOTHIC, src: '/fonts/CarolGothic.ttf' },
    { family: FONTS.FRANCIS_REGULAR, src: '/fonts/FrancisRegular.ttf' },
    { family: FONTS.LUXURIOUS_ROMAN, src: '/fonts/LuxuriousRoman-Regular.ttf' }
  ];

  fontConfigs.forEach(({ family, src }) => {
    Font.register({ family, src, fontWeight: 'normal', fontStyle: 'normal' });
  });
};

registerFonts();

// ================================================================================================
// STYLESHEET DEFINITIONS
// ================================================================================================
const styles = StyleSheet.create({
  page: {
    width: '100%',
    height: '100%',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 30,
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: FONTS.HELVETICA,
    fontSize: 8,
    color: COLORS.SECONDARY_GRAY,
    backgroundColor: COLORS.WHITE,
    overflow: 'hidden'
  },
  decorativeBorder: {
    border: `1px solid ${COLORS.BORDER_GREEN}`,
    margin: 10,
    padding: 15,
    width: '100%',
    height: '100%'
  },
  header: {
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%'
  },
  diplomaHeaderImage: {
    width: '100%',
    height: 'auto',
    alignSelf: 'center',
    objectFit: 'contain'
  },
  universityText: {
    fontSize: 12,
    color: COLORS.PRIMARY_BLACK,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 5,
    fontFamily: FONTS.LUXURIOUS_ROMAN
  },
  diplomaText: {
    textAlign: 'center',
    fontFamily: FONTS.FRANCIS_REGULAR,
    fontSize: 16.80,
    lineHeight: 1.1,
    marginTop: 1,
    marginBottom: 1,
    marginLeft: 30,
    marginRight: 30,
    color: COLORS.PRIMARY_BLACK
  },
  studentName: {
    fontFamily: FONTS.CAROL_GOTHIC,
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_BLACK,
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 1
  },
  programText: {
    fontSize: 28,
    marginTop: 15,
    fontFamily: FONTS.CAROL_GOTHIC,
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.PRIMARY_BLACK
  },
  dateLocation: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 1.1,
    color: COLORS.PRIMARY_BLACK,
    fontFamily: FONTS.FRANCIS_REGULAR,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'flex-start'
  },
  signatureBox: {
    width: '32%',
    textAlign: 'center',
    flexShrink: 0,
    overflow: 'visible'
  },
  signatureBoxPresident: {
    width: '32%',
    textAlign: 'center',
    flexShrink: 0,
    overflow: 'visible',
    position: 'relative',
    zIndex: 5
  },
  signatureBoxVP: {
    width: '32%',
    textAlign: 'center',
    flexShrink: 0,
    overflow: 'visible',
    position: 'relative',
    zIndex: 5
  },
  signatureLine: {
    borderBottom: `2px solid ${COLORS.SECONDARY_GRAY}`,
    height: 40,
    marginBottom: 6
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_BLACK
  },
  signatureSubLabel: {
    fontSize: 8,
    color: COLORS.PRIMARY_BLACK,
    marginTop: 2,
    fontFamily: FONTS.LUXURIOUS_ROMAN
  },
  signatureLabelVP: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_BLACK,
    textAlign: 'center',
    position: 'relative',
    zIndex: 10,
    width: '150%',
    left: '-25%',
    overflow: 'visible'
  },
  signatureSubLabelVP: {
    fontSize: 8,
    color: COLORS.PRIMARY_BLACK,
    marginTop: 2,
    textAlign: 'center',
    position: 'relative',
    zIndex: 10,
    width: '150%',
    left: '-25%',
    fontFamily: FONTS.LUXURIOUS_ROMAN
  },
  signatureSubLabelPresident: {
    fontSize: 8,
    color: COLORS.PRIMARY_BLACK,
    marginTop: 2,
    textAlign: 'center',
    position: 'relative',
    zIndex: 10,
    width: '150%',
    left: '-25%',
    fontFamily: FONTS.LUXURIOUS_ROMAN
  },
  signatureLabelPresident: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_BLACK,
    marginTop: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 1.1,
    position: 'relative',
    zIndex: 10,
    width: '150%',
    left: '-25%',
    overflow: 'visible'
  },
  seal: {
    position: 'absolute',
    bottom: 100,
    left: 100,
    fontSize: 10,
    textAlign: 'center',
    color: COLORS.LIGHT_GRAY
  },
  documentNumber: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 8,
    color: '#666666',
    fontFamily: 'Courier'
  },
  chedSpecialOrder: {
    fontSize: 9,
    textAlign: 'center',
    color: COLORS.SECONDARY_GRAY,
    fontFamily: FONTS.HELVETICA,
    marginTop: 2,
    marginBottom: 28,
  }
});

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

/**
 * Utility function to capitalize first letter of each word, keeping articles and prepositions lowercase
 */
const capitalizeWords = (str) => {
  if (!str) return '';
  
  // Words that should remain lowercase (articles, prepositions, conjunctions)
  const lowercaseWords = ['of', 'in', 'and', 'the', 'a', 'an', 'at', 'by', 'for', 'with', 'to'];
  
  return str.toLowerCase().split(' ').map((word, index) => {
    // Always capitalize the first word, regardless of whether it's an article
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    // Keep articles and prepositions lowercase
    if (lowercaseWords.includes(word)) {
      return word;
    }
    
    // Capitalize other words
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

/**
 * Utility functions for data extraction
 */
const getStudentName = (documentData, profileData) => {
  const name = documentData?.full_name || 
               profileData?.fullname || 
               `${profileData?.firstname || ''} ${profileData?.middlename || ''} ${profileData?.lastname || ''}`.trim() || 
               'Student Name';
  return capitalizeWords(name);
};

const getProgram = (documentData, profileData) => {
  const program = documentData?.program || profileData?.course || 'Program Name';
  return capitalizeWords(program);
};

/**
 * Formats the graduation date in traditional diploma format
 * e.g., "this 15th day of January in the year of our Lord Two Thousand and Twenty Five"
 */
const getGraduationDate = (documentData) => {
  const date = documentData?.graduation_date ? dayjs(documentData.graduation_date) : dayjs();
  
  const day = date.date();
  const month = date.format('MMMM');
  const year = date.year();
  
  // Convert day to ordinal format (1st, 2nd, 3rd, 4th, etc.)
  const getOrdinal = (num) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = num % 100;
    return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  };
  
  // Convert year to written format
  const getWrittenYear = (yearNum) => {
    const thousands = Math.floor(yearNum / 1000);
    const hundreds = Math.floor((yearNum % 1000) / 100);
    const tens = yearNum % 100;
    
    let result = '';
    
    // Handle thousands
    if (thousands === 2) {
      result += 'Two Thousand';
    }
    
    // Handle hundreds
    if (hundreds > 0) {
      const hundredWords = ['', 'One Hundred', 'Two Hundred', 'Three Hundred', 'Four Hundred', 
                           'Five Hundred', 'Six Hundred', 'Seven Hundred', 'Eight Hundred', 'Nine Hundred'];
      result += (result ? ' ' : '') + hundredWords[hundreds];
    }
    
    // Handle tens and ones
    if (tens > 0) {
      const tensWords = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const onesWords = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
                        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
                        'Seventeen', 'Eighteen', 'Nineteen'];
      
      if (tens < 20) {
        result += (result ? ' ' : '') + onesWords[tens];
      } else {
        const tensDigit = Math.floor(tens / 10);
        const onesDigit = tens % 10;
        result += (result ? ' ' : '') + tensWords[tensDigit];
        if (onesDigit > 0) {
          result += ' ' + onesWords[onesDigit];
        }
      }
    }
    
    return result;
  };
  
  return `this ${getOrdinal(day)} day of ${month} in the year of our Lord ${getWrittenYear(year)}`;
};

/**
 * Generates the CHED Special Order reference
 * Format: "CHED Special Order (80) (R-XIII) No. 14048-0001, s. 2025 issued on June 09, 2025"
 */
const getCHEDSpecialOrder = (documentData) => {
  const currentDate = dayjs();
  const year = currentDate.year();
  const issuedDate = currentDate.format('MMMM DD, YYYY');
  
  // Generate a sequential number based on document data or use default
  const sequentialNumber = documentData?.ched_order_number || '14048-0001';
  
  return `CHED Special Order (80) (R-XIII) No. ${sequentialNumber}, s. ${year} issued on ${issuedDate}`;
};

const generateFilename = (documentData, profileData) => {
  const today = dayjs().format('YYYY-MM-DD');
  const name = (documentData?.full_name || profileData?.fullname || 'Student').replace(/\s+/g, '_');
  return `Diploma_${name}_${today}.pdf`;
};

/**
 * Helper functions to get signature names from document data with fallbacks
 */
const getVicePresidentName = (documentData) => {
  return documentData?.vice_president_name || 'NO DATA';
};

const getUniversityPresidentName = (documentData) => {
  return documentData?.university_president_name || 'NO DATA';
};

const getDeanName = (documentData) => {
  return documentData?.dean_name || 'NO DATA';
};

// ================================================================================================
// DIPLOMA HEADER COMPONENT
// ================================================================================================

/**
 * Diploma header image component
 * Displays the university header image containing all university information
 * @param {string} imageSource - Source path for the image
 * @param {number} maxWidth - Maximum width of the image (default: 500)
 * @param {number} maxHeight - Maximum height of the image (default: 150)
 * @param {number} marginBottom - Bottom margin of the image (default: 15)
 */
const DiplomaHeader = ({ 
  imageSource = 'diploma-header.png',
  maxWidth = DIPLOMA_HEADER_CONFIG.defaultMaxWidth,
  maxHeight = DIPLOMA_HEADER_CONFIG.defaultMaxHeight,
  marginBottom = DIPLOMA_HEADER_CONFIG.defaultMarginBottom
}) => {
  const dynamicStyle = {
    ...styles.diplomaHeaderImage,
    maxWidth: maxWidth,
    maxHeight: maxHeight,
    marginBottom: marginBottom
  };

  return (
    <Image 
      src={`${window.location.origin}/images/${imageSource}`}
      style={dynamicStyle}
    />
  );
};

// ================================================================================================
// MAIN DIPLOMA DOCUMENT COMPONENT
// ================================================================================================

/**
 * Main diploma document component
 * @param {Object} documentData - Document-specific data
 * @param {Object} profileData - Profile/student data
 * @param {Object} headerImageConfig - Configuration for header image sizing
 * @param {Object} qrCodeData - QR code data and configuration
 */
export function GeneratedDiploma({ 
  documentData = {}, 
  profileData = {},
  headerImageConfig = {},
  qrCodeData = null
}) {
  const studentName = getStudentName(documentData, profileData);
  const program = getProgram(documentData, profileData);
  const graduationDate = getGraduationDate(documentData);
  const chedSpecialOrder = getCHEDSpecialOrder(documentData);
  
  // Get signature names from document data
  const vicePresidentName = getVicePresidentName(documentData);
  const universityPresidentName = getUniversityPresidentName(documentData);
  const deanName = getDeanName(documentData);
  
  // Get serial number from document data or QR code data
  const serialNumber = documentData?.serial_number || qrCodeData?.serial_number || 'N/A';

  // Extract header image configuration with defaults
  const {
    maxWidth = DIPLOMA_HEADER_CONFIG.defaultMaxWidth,
    maxHeight = DIPLOMA_HEADER_CONFIG.defaultMaxHeight,
    marginBottom = DIPLOMA_HEADER_CONFIG.defaultMarginBottom,
    imageSource = 'diploma-header.png'
  } = headerImageConfig;

  return (
    <Document>
      <Page size="A4" orientation="landscape" wrap={false} style={styles.page}>
        <View style={styles.decorativeBorder}>
          
          <View style={styles.header}>
            <DiplomaHeader 
              imageSource={imageSource}
              maxWidth={maxWidth}
              maxHeight={maxHeight}
              marginBottom={marginBottom}
            />

            {/* QR Code Container - Right side */}
            <View style={{ 
              position: 'absolute',
              right: -4,
              top: -4,
              width: 110, 
              height: 110, 
              justifyContent: 'center', 
              alignItems: 'center',
              border: '1pt solid #0a3d27',
              zIndex: 100
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

            <Text style={styles.diplomaText}>
              To all to whom these presents shall come
            </Text>
            <Text style={styles.universityText}>
              GREETINGS
            </Text>
            <Text style={styles.diplomaText}>
              Be it known that
            </Text>
          </View>

          <Text style={styles.studentName}>
            {studentName}
          </Text>

          <Text style={styles.diplomaText}>
            having satisfactorily completed the prescribed Course of Instruction, in accordance with the recommendation of the Faculty, the approval of the Board of trustees, and by virtue of the authority granted by the Government of the Philippines has this day been conferred the Degree of
          </Text>
         
          <Text style={styles.programText}>
            {program}
          </Text>

          <Text style={styles.diplomaText}>
            with all the rights and privileges there unto appertaining
          </Text>
          <Text style={styles.diplomaText}>
            In testimony whereof are hereunto affixed the corporate seal of the University and the signatures of the President,
          </Text>
          <Text style={styles.diplomaText}>
            the Vice President for Academic Affairs and Research, and Dean.
          </Text>
          <Text style={styles.dateLocation}>
            Given at Butuan City, Philippines this {graduationDate}
          </Text>

          <View style={styles.chedSpecialOrder}>
            <Text>{chedSpecialOrder}</Text>
          </View>

          <View style={styles.signatureSection}>
            <View style={styles.signatureBoxVP}>
              <Text style={styles.signatureLabelVP}>
                {vicePresidentName}
              </Text>
              <Text style={styles.signatureSubLabelVP}>
                VICE PRESIDENT FOR ACADEMIC AFFAIRS AND RESEARCH
              </Text>
            </View>
            <View style={styles.signatureBoxPresident}>
              <Text style={styles.signatureLabelPresident}>
                {universityPresidentName}
              </Text>
              <Text style={styles.signatureSubLabelPresident}>
                UNIVERSITY PRESIDENT
              </Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>
                {deanName}
              </Text>
              <Text style={styles.signatureSubLabel}>
                DEAN
              </Text>
            </View>
          </View>

          <View style={styles.seal}>
            <Text> </Text>
          </View>

          {/* Serial Number - Bottom Right Corner */}
          <View style={styles.documentNumber}>
            <Text>S/N: {serialNumber}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

/**
 * PDF Viewer Component
 */
export function DiplomaPDFViewer({ documentData, profileData, headerImageConfig, qrCodeData }) {
  return (
    <PDFViewer 
      style={{ width: '100%', height: 420, border: 'none', borderRadius: 4 }} 
      showToolbar={true}
    >
      <GeneratedDiploma 
        documentData={documentData} 
        profileData={profileData} 
        headerImageConfig={headerImageConfig}
        qrCodeData={qrCodeData}
      />
    </PDFViewer>
  );
}

/**
 * PDF Download Component
 */
export function DiplomaPDFDownload({ documentData, profileData, headerImageConfig, qrCodeData }) {
  const filename = generateFilename(documentData, profileData);

  return (
    <PDFDownloadLink 
      document={
        <GeneratedDiploma 
          documentData={documentData} 
          profileData={profileData} 
          headerImageConfig={headerImageConfig}
          qrCodeData={qrCodeData}
        />
      } 
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
          Download Diploma
        </Button>
      )}
    </PDFDownloadLink>
  );
}

/**
 * Main component with viewer and download functionality
 * @param {Object} documentData - Document-specific data
 * @param {Object} profileData - Profile/student data
 * @param {Object} headerImageConfig - Configuration for header image sizing
 * @param {Object} qrCodeData - QR code data and configuration
 */
export default function DiplomaPDF({ documentData, profileData, headerImageConfig, qrCodeData }) {
  const filename = generateFilename(documentData, profileData);
  const studentName = getStudentName(documentData, profileData);

  return (
    <div style={{
      height: 600,
      borderRadius: 4,
      background: COLORS.WHITE,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      <div style={{
        padding: '8px 12px',
        backgroundColor: COLORS.BACKGROUND_GREEN,
        borderRadius: 4,
        border: `1px solid ${COLORS.BORDER_GREEN}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          fontSize: 12,
          color: COLORS.BORDER_GREEN,
          fontWeight: 'bold'
        }}>
          📜 Diploma - {studentName}
          {qrCodeData?.serial_number && (
            <span style={{ marginLeft: 8, fontSize: 10, backgroundColor: '#e6f7ff', padding: '2px 6px', borderRadius: 2 }}>
              S/N: {qrCodeData.serial_number}
            </span>
          )}
        </span>
        <PDFDownloadLink 
          document={
            <GeneratedDiploma 
              documentData={documentData} 
              profileData={profileData} 
              headerImageConfig={headerImageConfig}
              qrCodeData={qrCodeData}
            />
          }
          fileName={filename}
          style={{
            textDecoration: 'none',
            padding: '4px 12px',
            backgroundColor: COLORS.BORDER_GREEN,
            color: 'white',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 'bold'
          }}
        >
          {({ loading }) => (
            loading ? '⏳ Preparing...' : '📥 Download Diploma'
          )}
        </PDFDownloadLink>
      </div>

      <PDFViewer style={{
        width: '100%',
        height: 420,
        border: 'none',
        borderRadius: 4
      }}>
        <GeneratedDiploma 
          documentData={documentData} 
          profileData={profileData} 
          headerImageConfig={headerImageConfig}
          qrCodeData={qrCodeData}
        />
      </PDFViewer>
    </div>
  );
}
