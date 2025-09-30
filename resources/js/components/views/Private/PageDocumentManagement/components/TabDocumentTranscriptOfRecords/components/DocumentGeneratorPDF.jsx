import React from "react";
import dayjs from "dayjs";
import { Document, Page, Text, View, StyleSheet, Font, PDFViewer, PDFDownloadLink, Image } from "@react-pdf/renderer";
import { Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/pro-regular-svg-icons";
import { apiUrl } from "../../../../../../providers/appConfig";

// Register University Cyrillic font from public directory
Font.register({
  family: 'UniversityCyrillic',
  src: '/fonts/university-cyrillic.ttf',
  fontWeight: 'normal',
  fontStyle: 'normal'
});
// Disable hyphenation globally to prevent premature word breaks
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 120, // 1.67in to make room for header
    paddingBottom: 72,
    paddingHorizontal: 72,
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: '#333333',
    backgroundColor: '#ffffff'
  },
    // Used for page 2 and onward where we render a fixed table header and footer
    pageWithRepeatingHeader: {
      paddingTop: 150, // start body after repeated header
      paddingRight: 50,
      paddingBottom: 180 // end body before repeated footer
    },
  header: {
    textAlign: 'center',
    marginBottom: 32,
    borderBottom: '3px solid #0a3d27',
    paddingBottom: 16
  },
  universityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a3d27',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  universityLocation: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 16
  },
  documentTitle: {
    fontSize: 18,
    color: '#722ed1',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  sectionTitle: {
    fontSize: 16,
    color: '#0a3d27',
    fontWeight: 'bold',
    marginBottom: 16,
    borderBottom: '2px solid #0a3d27',
    paddingBottom: 8,
    textTransform: 'uppercase'
  },
  section: {
    marginBottom: 24
  },
  row: { 
    flexDirection: 'row', 
    marginBottom: 12,
    gap: 16
  },
  col: { 
    flex: 1
  },
  label: { 
    fontSize: 10, 
    color: '#0a3d27', 
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  value: { 
    fontSize: 12, 
    color: '#333333',
    fontWeight: 'normal',
    minHeight: 14
  },
  valueStrong: {
    fontSize: 12,
    color: '#333333',
    fontWeight: 'bold'
  },
  footer: {
    marginTop: 48,
    paddingTop: 24,
    borderTop: '2px solid #0a3d27'
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32
  },
  signatureBox: {
    width: '40%',
    textAlign: 'center'
  },
  signatureLine: {
    borderBottom: '2px solid #333333',
    height: 60,
    marginBottom: 8,
    position: 'relative'
  },
  signatureLabel: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  signatureSubLabel: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2
  },
  footerInfo: {
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.6
  },
  documentId: {
    position: 'absolute',
    bottom: 36,
    right: 72,
    fontSize: 8,
    color: '#cccccc',
    fontFamily: 'Courier'
  },
  securityFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f0f9f0',
    padding: 16,
    borderRadius: 4,
    border: '1px solid #0a3d27',
    marginBottom: 24
  },
  securityItem: {
    textAlign: 'center',
    flex: 1
  },
  securityIcon: {
    fontSize: 16,
    marginBottom: 4
  },
  securityTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0a3d27'
  },
  securityDesc: {
    fontSize: 8,
    color: '#666666'
  }
});

export function GeneratedDocument({ documentData = {}, profileData = {}, documentType = "Transcript of Records" }) {
  // Extract profile data with fallbacks
  const studentName = documentData?.full_name || profileData?.fullname || 
    `${profileData?.firstname || ''} ${profileData?.middlename || ''} ${profileData?.lastname || ''}`.trim() || 'N/A';
  const studentId = documentData?.student_id || profileData?.id_number || profileData?.id || 'N/A';
  const birthdate = profileData?.birthdate ? dayjs(profileData.birthdate).format('MMMM DD, YYYY') : 'N/A';
  const birthplace = profileData?.birthplace || 'N/A';
  const gender = profileData?.gender || 'N/A';
  const religion = profileData?.religion || 'N/A';
  const citizenship = profileData?.citizenship || 'N/A';
  const homeAddress = profileData?.address || profileData?.home_address || 'N/A';
  const fatherName = profileData?.father_name || profileData?.father_fullname || 'N/A';
  const motherName = profileData?.mother_name || profileData?.mother_fullname || 'N/A';
  const spouseName = profileData?.spouse_name || profileData?.spouse_fullname || 'N/A';
  const course = documentData?.program || profileData?.course || 'N/A';
  
  // Education Information
  const elementary = profileData?.elem_school || 'N/A';
  const elementaryYear = profileData?.elem_lastyearattened || 'N/A';
  const secondary = profileData?.junior_high_school || profileData?.high_school || 'N/A';
  const secondaryYear = profileData?.junior_high_school_lastyearattened || profileData?.high_school_lastyearattend || 'N/A';
  const tertiary = profileData?.college || 'FATHER URIOS ACADEMY OF MAGALLANES INCORPORATED INCORPORATED FUAMI';
  const tertiaryYear = profileData?.college_lastyearattend || dayjs().format('YYYY');
  // Derived fields for page 2 header prioritizing the earliest year level, 1st semester
  const gradesData = Array.isArray(profileData?.grades) ? profileData.grades : [];
  const yearLevels = gradesData
    .map((g) => Number(g?.subject?.year_level))
    .filter((n) => Number.isFinite(n));
  const earliestYearLevel = yearLevels.length > 0 ? Math.min(...yearLevels) : undefined;
  const hasFirstSemAtEarliest = gradesData.some(
    (g) => Number(g?.subject?.year_level) === earliestYearLevel && g?.subject?.semester === '1'
  );

  const yearLevelToSchoolYear = { 1: '2022-2023', 2: '2023-2024', 3: '2024-2025', 4: '2025-2026' };

  const semesterLabel = profileData?.semester
    || (earliestYearLevel && hasFirstSemAtEarliest ? 'First Semester' : undefined)
    || profileData?.grades?.[0]?.school_year?.semester
    || 'N/A';
  const schoolYearLabel = profileData?.school_year
    || (earliestYearLevel ? yearLevelToSchoolYear[earliestYearLevel] : undefined)
    || profileData?.grades?.[0]?.school_year?.school_year
    || 'N/A';

  // Normalize labels to subject fields for filtering
  const labelToSemesterCode = (label) => {
    if (label === 'First Semester') return '1';
    if (label === 'Second Semester') return '2';
    if (label === 'Summer') return 'summer';
    return undefined;
  };
  const labelToYearLevel = (label) => ({
    '2022-2023': 1,
    '2023-2024': 2,
    '2024-2025': 3,
    '2025-2026': 4,
  }[label]);
  const expectedSemesterCode = labelToSemesterCode(semesterLabel);
  const expectedYearLevel = labelToYearLevel(schoolYearLabel);

  // Fixed column widths to perfectly align separators (":")
  const COLON_W = 6;
  const CODE_W = 85;
  const DESC_W = 300; // description column
  const GRADE_W = 40;
  const UNITS_W = 40;

  // Format helper: render numeric values with one decimal place (e.g., 2 -> 2.0)
  const formatOneDecimal = (value) => {
    const num = Number(value);
    if (Number.isFinite(num)) {
      return num.toFixed(1);
    }
    return value ?? '';
  };

  // Predefined scope for second semester of 2022-2023 (no campus label)
  const SECOND_SEM_CODE = '2';
  const YEAR_LEVEL_2022_2023 = labelToYearLevel('2022-2023');

  // Build ordered list of unique semester/year-level combos from grades
  const semesterCodeToLabel = (code) => {
    if (String(code) === '1') return 'First Semester';
    if (String(code) === '2') return 'Second Semester';
    return 'Summer';
  };
  const semesterOrder = ['1', '2', 'summer'];
  const combosMap = new Map();
  gradesData.forEach((g) => {
    const yl = Number(g?.subject?.year_level);
    const sem = String(g?.subject?.semester);
    if (Number.isFinite(yl) && semesterOrder.includes(sem)) {
      const key = `${yl}-${sem}`;
      if (!combosMap.has(key)) combosMap.set(key, { yearLevel: yl, semester: sem });
    }
  });
  const sortedCombos = Array.from(combosMap.values()).sort((a, b) => {
    if (a.yearLevel !== b.yearLevel) return a.yearLevel - b.yearLevel;
    return semesterOrder.indexOf(a.semester) - semesterOrder.indexOf(b.semester);
  });
  // Choose the first page-2 combo based on earlier derived labels when possible
  const firstCombo = sortedCombos.find((c) => c.yearLevel === expectedYearLevel && String(c.semester) === String(expectedSemesterCode))
    || sortedCombos[0];
  const firstSemesterLabel = firstCombo ? semesterCodeToLabel(firstCombo.semester) : semesterLabel;
  const firstSchoolYearLabel = firstCombo ? (yearLevelToSchoolYear[firstCombo.yearLevel] || schoolYearLabel) : schoolYearLabel;
  const remainingCombos = firstCombo
    ? sortedCombos.filter((c) => !(c.yearLevel === firstCombo.yearLevel && String(c.semester) === String(firstCombo.semester)))
    : [];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>

        {/* University Header Section - Fixed at top margin */}
        <View fixed style={{ 
          position: 'absolute', 
          top: 5, 
          left: 5, 
          right: 72, 
          paddingBottom: 8
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Image 
              src="/images/logo.png" 
              style={{ width: 70, height: 70, marginRight: 15, bottom: 20}}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', right: 10,  marginBottom: 1, fontFamily: 'UniversityCyrillic', textAlign: 'left' }}>FATHER SATURNINO URIOS UNIVERSITY</Text>
              <Text style={{ fontSize: 7, marginBottom: 4, right: 10, bottom: 5, textAlign: 'left' }}>(FORMERLY URIOS COLLEGE)</Text>
              <Text style={{ fontSize: 10, marginBottom: 4, right: 10, bottom: 1, textAlign: 'left' }}>OFFICE OF THE REGISTRAR</Text>
              <Text style={{ fontSize: 6, marginBottom: 1, right: 10, bottom: 5, textAlign: 'left', lineHeight: 1.1 }}>
                San Francisco Street, Brgy. Sikatuna.{'\n'}
                Butuan City, Caraga, Philippines 8600 {'\n'}
                Tel. Nos. 342-1830 Local 3512 Local 3512 {'\n'}
                Email: registrar@urios.edu.ph {'\n'}
                Website: www.urios.edu.ph
              </Text>

              <Text style={{ fontSize: 6, marginBottom: 1, right: 10, left: 200, bottom: 38, textAlign: 'left', lineHeight: 1.1 }}>
                Accredited by the Philippine Accrediting Association of Schools,{'\n'}
                Colleges and Universities (PAASCU) {'\n'}
                CHED Code: 10096 FAC Code: R10
              </Text>
            </View>
          </View>
          
          {/* Document Title as part of header */}
          <View style={{ position: 'absolute', left: 0, right: -67, textAlign: 'center', backgroundColor: '#0a3d27', padding: 3, border: '1pt solid black', bottom: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'black' }}>OFFICIAL TRANSCRIPT OF RECORDS</Text>
          </View>
        </View>

        {/* Page Number for first page (dynamic) */}
        <View fixed style={{ position: 'absolute', top: 130, right: 72 }}>
          <Text
            style={{ fontSize: 9 }}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>

       {/* Personal Data Section */}
       <View style={{ marginBottom: 10, right: 40  }}>
          <View style={{ paddingVertical: 3, marginBottom: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8 }}>PERSONAL DATA:</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <View style={{ flex: 1}}>
              <View style={{ fontSize: 10 }}>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10,}}>Student Name</Text>
                  <Text style={{ width: 6, fontSize: 10,}}>:</Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2, fontWeight: 'bold'}}>{studentName}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10 }}>Id Number</Text>
                  <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{studentId}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10 }}>Birthdate</Text>
                  <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{birthdate}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10 }}>Birthplace</Text>
                  <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{birthplace}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10 }}>Gender</Text>
                  <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{gender}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10 }}>Religion</Text>
                  <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{religion}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10 }}>Citizenship</Text>
                  <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{citizenship}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10 }}>Home Address</Text>
                  <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{homeAddress}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10 }}>Name of Father</Text>
                  <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{fatherName}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10 }}>Name of Mother</Text>
                  <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{motherName}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10 }}>Name of Spouse</Text>
                  <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{spouseName}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10 }}>(if applicable)</Text>
                  <Text style={{ width: 6, fontSize: 10 }}></Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0 }}></Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 88, fontSize: 10 }}>Course</Text>
                  <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                  <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{course}</Text>
                </View>
              </View>
            </View>
            <View style={{ width: 70, textAlign: 'center', left: 70 }}>
              <View style={{ 
                width: 85, 
                height: 110, 
                marginLeft: -18,

                backgroundColor: '#f9f9f9',
                textAlign: 'center',
                padding: 2,
                marginBottom: 4
              }}>
                {(() => {
                  // Resolve profile picture from multiple sources
                  const resolveProfilePicture = (data) => {
                    try {
                      // Check direct properties first
                      if (data?.profile_picture) return data.profile_picture;
                      if (data?.photo) return data.photo;
                      
                      // Check attachments
                      const attachments = data?.attachments || data?.profile?.attachments || [];
                      const pics = Array.isArray(attachments) 
                        ? attachments.filter((f) => f?.file_description === "Profile Picture")
                        : [];
                      
                      if (pics.length > 0 && pics[pics.length - 1]?.file_path) {
                        const filePath = pics[pics.length - 1].file_path;
                        return apiUrl(filePath);
                      }
                    } catch (error) {
                      console.log('Error resolving profile picture for PDF:', error);
                    }
                    return null;
                  };

                  const profilePictureSrc = resolveProfilePicture(profileData);
                  
                  return profilePictureSrc ? (
                    <Image 
                      src={profilePictureSrc} 
                      style={{ width: 81, height: 106, alignSelf: 'center' }}
                    />
                  ) : (
                    <Text style={{ fontSize: 8, alignSelf: 'center', marginTop: 45 }}>Student Photo</Text>
                  );
                })()}
              </View>
              
            </View>
          </View>
        </View>


        {/* Education and Year Attended */}
        <View style={{ marginBottom: 10, right: 40,}}>
          {/* Section Headers */}
          <View style={{ flexDirection: 'row', borderTop: '1pt solid black', width: '115%', paddingVertical: 2, marginBottom: 4 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', textAlign: 'left' }}>PRELIMINARY EDUCATION INFORMATION</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', left: 112 }}>LAST YEAR ATTENDED</Text>
            </View>
          </View>
          
          {/* Content: each row contains left text and fixed-width right year to keep horizontal alignment */}
          <View style={{ fontSize: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Text style={{ width: 88, fontSize: 10 }}>Elementary</Text>
                <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{elementary}</Text>
              </View>
              <View style={{ width: 140 }}>
                <Text style={{ fontSize: 8, textAlign: 'right' }}>{elementaryYear}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Text style={{ width: 88, fontSize: 10 }}>Secondary</Text>
                <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{secondary}</Text>
              </View>
              <View style={{ width: 140 }}>
                <Text style={{ fontSize: 8, textAlign: 'right' }}>{secondaryYear}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Text style={{ width: 88, fontSize: 10 }}>Tertiary</Text>
                <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2}}>{tertiary}</Text>
              </View>
              <View style={{ width: 140 }}>
                <Text style={{ fontSize: 8, textAlign: 'right' }}>{tertiaryYear}</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Grading System */}
        <View style={{ marginBottom: 10, right: 20 }}>
          {/* Section Header */}
          <View style={{ borderTop: '1pt solid black', width: '115%', right: 20, paddingVertical: 2, marginBottom: 4, fontSize: 9 }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 8 }}>GRADING SYSTEM:</Text>
          </View>
          
          {/* Grading Table */}
          <View style={{ flexDirection: 'row', fontSize: 6 }}>

          <View style={{bottom: -40 }}>
          </View>
            {/* Left Column */}
            <View style={{ flex: 1, marginRight: 20, right: 20 }}>
              <View style={{ flexDirection: 'row', marginBottom: 1 }}>
                <Text style={{ width: 40, fontSize: 9, }}>GRADE</Text>
                <Text style={{ width: 60, fontSize: 9, left: 55 }}>EQUIVALENT</Text>
                <Text style={{ flex: 1, fontSize: 9, right: -75, marginRight: 20}}>INDICATION</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40, fontSize: 9 }}>1.0</Text>
                <Text style={{ width: 60, fontSize: 9, left: 75 }}>100-95%</Text>
                <Text style={{ flex: 1, fontSize: 9,right: -75 }}>Excellent</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40, fontSize: 9 }}>1.1-1.2</Text>
                <Text style={{ width: 60, fontSize: 9, left: 80 }}>94-93%</Text>
                <Text style={{ flex: 1, fontSize: 9,right: -75 }}>Very Superior</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40, fontSize: 9 }}>1.3-1.4</Text>
                <Text style={{ width: 60, fontSize: 9, left: 80 }}>92-91%</Text>
                <Text style={{ flex: 1, fontSize: 9,right: -75 }}>Superior</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40, fontSize: 9 }}>1.5-1.6-1.7</Text>
                <Text style={{ width: 60, fontSize: 9, left: 80 }}>90-88%</Text>
                <Text style={{ flex: 1, fontSize: 9,right: -75 }}>Very Good</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40, fontSize: 9 }}>1.8-1.9-2.0</Text>
                <Text style={{ width: 60, fontSize: 9, left: 80 }}>87-85%</Text>
                <Text style={{ flex: 1, fontSize: 9,right: -75 }}>Good</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40, fontSize: 9 }}>2.1-2.2-2.3</Text>
                <Text style={{ width: 60, fontSize: 9, left: 80 }}>84-82%</Text>
                <Text style={{ flex: 1, fontSize: 9,right: -75 }}>Thoroughly Satisfactory</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40, fontSize: 9 }}>2.4-2.5-2.6</Text>
                <Text style={{ width: 60, fontSize: 9, left: 80 }}>81-79%</Text>
                <Text style={{ flex: 1, fontSize: 9,right: -75 }}>Satisfactory</Text>
              </View>
            </View>
            <View style={{marginRight: 40, right: 20 }}>
            </View>
            {/* Right Column */}
            <View style={{ flex: 1, marginRight: 20, right: 20 }}>
              <View style={{ flexDirection: 'row', marginBottom: 1 }}>
                <Text style={{ width: 40, fontSize: 9, }}>GRADE</Text>
                <Text style={{ width: 60, fontSize: 9, left: 55 }}>EQUIVALENT</Text>
                <Text style={{ flex: 1, fontSize: 9, right: -75 }}>INDICATION</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40 }}>2.7-2.8</Text>
                <Text style={{ width: 60, left: 80 }}>78-77%</Text>
                <Text style={{ flex: 1, right: -75 }}>Fair</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40 }}>2.9-3.0</Text>
                <Text style={{ width: 60, left: 80 }}>76-75%</Text>
                <Text style={{ flex: 1, right: -75 }}>Passed</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40 }}>4.0</Text>
                <Text style={{ width: 60, left: 80 }}>74-71%</Text>
                <Text style={{ flex: 1, right: -75 }}>Conditional</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40 }}>5.0-Below</Text>
                <Text style={{ width: 60, left: 93 }}>70%</Text>
                <Text style={{ flex: 1, right: -75 }}>Failed</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40 }}></Text>
                <Text style={{ width: 60, left: 103 }}>W</Text>
                <Text style={{ flex: 1, right: -75 }}>Withdrawn</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40 }}></Text>
                <Text style={{ width: 60, left: 97 }}>INC</Text>
                <Text style={{ flex: 1, right: -75 }}>Incomplete</Text>   
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40 }}></Text>
                <Text style={{ width: 60, left: 93 }}>DRP</Text>
                <Text style={{ flex: 1, right: -75 }}>Dropped</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1, fontSize: 9 }}>
                <Text style={{ width: 40 }}></Text>
                <Text style={{ width: 60, left: 99 }}>NG</Text>
                <Text style={{ flex: 1, right: -75 }}>No Grade</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Credit System Note */}
        <View style={{ marginBottom: 8, right: 20 }}>
          
          <Text style={{ fontSize: 10, textAlign: 'left', right: 20, bottom: 5, width: '115%' }}>One Unit of Credit is one hour lecture or recitation and three hours of drafting laboratory or shop work is equivalent to one hour recitation or lecture.</Text>
        </View>
        {/* Footer with QR Code and Signature Areas (hidden on last page) */}
        <View
          style={{ position: 'absolute', bottom: 51, left: 51, right: 30 }}
          render={({ pageNumber, totalPages }) => (
            pageNumber === totalPages ? null : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <View style={{ fontSize: 8, textAlign: 'center', top: 14 }}>
                  <Text>Not valid without</Text>
                </View>
                <View style={{ fontSize: 8, textAlign: 'center', bottom: -28, right: 182 }}>
                  <Text>FSUU Seal</Text>
                </View>
                <View style={{ alignItems: 'center', marginRight: 28 }}>
                  <View style={{ width: 140, borderBottom: '0.4pt solid black', marginBottom: 4, paddingBottom: 4, height: 80, justifyContent: 'flex-end', alignItems: 'center' }} />
                  <Text style={{ fontSize: 8 }}>University Registrar</Text>
                </View>
              </View>
            )
          )}
        />

        {/* Document Number (all pages) */}
        <View style={{ position: 'absolute', bottom: 8, right: -16, fontSize: 8, color: 'red', marginRight: 40, marginBottom: 10 }}>
          <Text style={{ letterSpacing: 0.5, fontSize: 12 }}>NO. 000000</Text>
        </View>
      </Page>

      {/* Other Pages */}
      <Page size="LETTER" style={[styles.page, styles.pageWithRepeatingHeader]}>
        {/* Repeating header for page 2 and onward */}
        <View fixed style={{ position: 'absolute', top: 145, left: 40, right: 40 }}>
          <View style={{ flexDirection: 'row', marginBottom: 2 }}>
            <Text style={{ width: 88, fontSize: 10}}>Student Name</Text>
            <Text style={{ width: 6, fontSize: 10}}>:</Text>
            <Text style={{ flex: 1, fontSize: 8, minWidth: 0, top: 2, fontWeight: 'bold'}}>{studentName}</Text>
          </View>
          <View style={{ marginBottom: 4 }}>
            <View style={{ width: '100%', borderBottom: '1pt solid black' }} />
            <View style={{ height: 2 }} />
            <View style={{ width: '100%', borderBottom: '1pt solid black' }} />
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 2, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, marginRight: 30 }}>:</Text>
            <Text style={{ fontSize: 10 }}>Course</Text>
            <Text style={{ fontSize: 10, marginLeft: 30 }}>:</Text>
            <Text style={{ fontSize: 10, marginLeft: 100 }}>D e s c r i p t i o n</Text>
            <Text style={{ fontSize: 10, marginLeft: 80}}>:</Text>
            <Text style={{ fontSize: 10, marginLeft: 30 }}>Grade</Text>
            <Text style={{ fontSize: 10, marginLeft: 30}}>:</Text>
            <Text style={{ fontSize: 10, marginLeft: 30 }}>Unit/s</Text>
            <Text style={{ fontSize: 10, marginLeft: 30}}>:</Text>
          </View>
          <View>
            <View style={{ width: '100%', borderBottom: '1pt solid black' }} />
            <View style={{ height: 2 }} />
            <View style={{ width: '100%', borderBottom: '1pt solid black' }} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 2, bottom: -36, width: '115%', right: 32,alignItems: 'center' }}>
          <Text style={{ fontSize: 10, marginRight: 30, fontWeight: 'bold' }}>{firstSemesterLabel} {firstSchoolYearLabel}</Text>
          <Text style={{ fontSize: 10, marginRight: 30, fontWeight: 'bold' }}>FSUU - BUTUAN CITY - BSIT</Text>
        </View>

          {Array.isArray(profileData?.grades) && firstCombo && profileData.grades
            .filter((g) => String(g?.subject?.semester) === String(firstCombo.semester) && Number(g?.subject?.year_level) === Number(firstCombo.yearLevel))
            .map((g, idx) => (
              <View key={`code-row-${idx}`} style={{ flexDirection: 'row', marginBottom: 2, bottom: -36, width: '115%', right: 33, alignItems: 'center' }}>
                <Text style={{ width: 6, fontSize: 10 }}>: </Text>
                <Text style={{ width: 85, fontSize: 10, }}>{g?.subject?.subject_code || 'N/A'}</Text>
                <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                <Text style={{ width: 240, fontSize: 10, marginLeft: 5 }}>{g?.subject?.subject_name || 'N/A'}</Text>
                <Text style={{ width: 6, fontSize: 10, marginLeft: 11}}>:</Text>
                <Text style={{ width: 30, fontSize: 10, textAlign: 'center', marginLeft: 36 }}>{formatOneDecimal(g?.grade) || 'N/A'}</Text>
                <Text style={{ width: 6, fontSize: 10, marginLeft: 18 }}>:</Text>
                <Text style={{ width: 30, fontSize: 10, textAlign: 'center', marginLeft: 35 }}>{formatOneDecimal(g?.subject?.units ?? g?.subject?.unit) || ''}</Text>
                <Text style={{ width: 6, fontSize: 10, marginLeft: 16 }}>:</Text>
              </View>
            ))}

          {/* Render remaining semester/year combos sequentially so they share the same page if space allows */}
          {remainingCombos.map((combo, comboIdx) => (
            <View key={`combo-section-${comboIdx}`} wrap>
              <View style={{ flexDirection: 'row', marginBottom: 2, bottom: -36, width: '115%', right: 32,alignItems: 'center' }}>
                <Text style={{ fontSize: 10, marginRight: 30, fontWeight: 'bold' }}>
                  {semesterCodeToLabel(combo.semester)} {yearLevelToSchoolYear[combo.yearLevel] || ''}
                </Text>
              </View>
              {Array.isArray(profileData?.grades) && profileData.grades
                .filter((g) => String(g?.subject?.semester) === String(combo.semester) && Number(g?.subject?.year_level) === Number(combo.yearLevel))
                .map((g, idx) => (
                  <View key={`combo-${comboIdx}-row-${idx}`} style={{ flexDirection: 'row', marginBottom: 2, bottom: -36, width: '115%', right: 33, alignItems: 'center' }}>
                    <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                    <Text style={{ width: 85, fontSize: 10 }}>{g?.subject?.subject_code || 'N/A'}</Text>
                    <Text style={{ width: 6, fontSize: 10 }}>:</Text>
                    <Text style={{ width: 240, fontSize: 10, marginLeft: 5 }}>{g?.subject?.subject_name || 'N/A'}</Text>
                    <Text style={{ width: 6, fontSize: 10, marginLeft: 11}}>:</Text>
                    <Text style={{ width: 30, fontSize: 10, textAlign: 'center', marginLeft: 36 }}>{formatOneDecimal(g?.grade) || 'N/A'}</Text>
                    <Text style={{ width: 6, fontSize: 10, marginLeft: 18 }}>:</Text>
                    <Text style={{ width: 30, fontSize: 10, textAlign: 'center', marginLeft: 35 }}>{formatOneDecimal(g?.subject?.units ?? g?.subject?.unit) || ''}</Text>
                    <Text style={{ width: 6, fontSize: 10, marginLeft: 16 }}>:</Text>
                  </View>
                ))}
            </View>
            
          ))}

          {/* Double line separator at the end of the last section */}
          <View style={{ marginBottom: 4, bottom: -36, right: 32 }}>
            <View style={{ width: '108.5%', borderBottom: '1pt solid black' }} />
            <View style={{ height: 2 }} />
            <View style={{ width: '108.5%', borderBottom: '1pt solid black' }} />
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 2, bottom: -50, width: '115%', right: 32,alignItems: 'center' }}>
            <Text style={{ fontSize: 9, marginRight: 30 }}>
              Graduated: Bachelor of Sciecne in Information Technology (BSIT) on May 30, 2025 per CHED Special Order (50) (R-XIII) No. 541601-0015, s. 
              2022 issued on July 24, 2026. **NSTP Serial Number: C-16-005750-19**
              
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', bottom: -50, width: '110%',  right: 40 }}>
            <View style={{ flex: 1, borderBottom: '1pt dashed black' }} />
            <Text style={{ fontSize: 9, marginHorizontal: 8 }}>Nothing follows</Text>
            <View style={{ flex: 1, borderBottom: '1pt dashed black' }} />
          </View>

          


        {/* University Header Section - Fixed at top margin */}
        <View fixed style={{ 
          position: 'absolute', 
          top: 5, 
          left: 5, 
          right: 72, 
          paddingBottom: 8
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Image 
              src="/images/logo.png" 
              style={{ width: 70, height: 70, marginRight: 15, bottom: 20}}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', right: 10,  marginBottom: 1, fontFamily: 'UniversityCyrillic', textAlign: 'left' }}>FATHER SATURNINO URIOS UNIVERSITY</Text>
              <Text style={{ fontSize: 7, marginBottom: 4, right: 10, bottom: 5, textAlign: 'left' }}>(FORMERLY URIOS COLLEGE)</Text>
              <Text style={{ fontSize: 10, marginBottom: 4, right: 10, bottom: 1, textAlign: 'left' }}>OFFICE OF THE REGISTRAR</Text>
              <Text style={{ fontSize: 6, marginBottom: 1, right: 10, bottom: 5, textAlign: 'left', lineHeight: 1.1 }}>
                San Francisco Street, Brgy. Sikatuna.{'\n'}
                Butuan City, Caraga, Philippines 8600 {'\n'}
                Tel. Nos. 342-1830 Local 3512 Local 3512 {'\n'}
                Email: registrar@urios.edu.ph {'\n'}
                Website: www.urios.edu.ph
              </Text>

              <Text style={{ fontSize: 6, marginBottom: 1, right: 10, left: 200, bottom: 38, textAlign: 'left', lineHeight: 1.1 }}>
                Accredited by the Philippine Accrediting Association of Schools,{'\n'}
                Colleges and Universities (PAASCU) {'\n'}
                CHED Code: 10096 FAC Code: R10
              </Text>
            </View>
          </View>
          
          {/* Document Title as part of header */}
          <View style={{ position: 'absolute', left: 0, right: -67, textAlign: 'center', backgroundColor: '#0a3d27', padding: 3, border: '1pt solid black', bottom: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'black' }}>OFFICIAL TRANSCRIPT OF RECORDS</Text>
          </View>
        </View>

        {/* Page Number for second page and onward (dynamic) */}
        <View fixed style={{ position: 'absolute', top: 130, right: 72 }}>
          <Text
            style={{ fontSize: 9 }}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>

        {/* Footer with QR Code and Signature Areas (now repeats on overflow pages) */}

          {/* Nothing follows marker for second page and onward (hidden on last page) */}
        <View
          fixed
          style={{ position: 'absolute', left: 40, right: 40, bottom: 140 }}
          render={({ pageNumber, totalPages }) => (
            pageNumber === totalPages ? null : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1, borderBottom: '1pt dashed black' }} />
                <Text style={{ fontSize: 9, marginHorizontal: 8 }}>Nothing follows</Text>
                <View style={{ flex: 1, borderBottom: '1pt dashed black' }} />
              </View>
            )
          )}
        />
        <View
          fixed
          style={{ position: 'absolute', bottom: 51, left: 51, right: 30 }}
          render={({ pageNumber, totalPages }) => (
            pageNumber === totalPages ? null : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <View style={{ fontSize: 8, textAlign: 'center', top: 14 }}>
                  <Text>Not valid without</Text>
                </View>
                <View style={{ fontSize: 8, textAlign: 'center', bottom: -28, right: 182 }}>
                  <Text>FSUU Seal</Text>
                </View>
                <View style={{ alignItems: 'center', marginRight: 28 }}>
                  <View style={{ width: 140, borderBottom: '0.4pt solid black', marginBottom: 4, paddingBottom: 4, height: 80, justifyContent: 'flex-end', alignItems: 'center' }} />
                  <Text style={{ fontSize: 8 }}>University Registrar</Text>
                </View>
              </View>
            )
          )}
        />

        {/* Document Number (all pages) */}
        <View fixed style={{ position: 'absolute', bottom: 8, right: -16, fontSize: 8, color: 'red', marginRight: 40, marginBottom: 10 }}>
          <Text style={{ letterSpacing: 0.5, fontSize: 12 }}>NO. 000000</Text>
        </View>

      </Page>
    </Document>
  );
}

// Component for just the PDF viewer without header
export function DocumentGeneratorPDFViewer({ documentData, profileData }) {
  const docType = documentData?.doc_category || 'Transcript of Records';
  
  return (
    <PDFViewer style={{ width: '100%', height: '100%', border: 'none', borderRadius: 4 }} showToolbar={true}>
      <GeneratedDocument documentData={documentData} profileData={profileData} documentType={docType} />
    </PDFViewer>
  );
}

// Component for just the download button
export function DocumentGeneratorPDFDownload({ documentData, profileData }) {
  const docType = documentData?.doc_category || 'Transcript of Records';
  const today = dayjs().format('YYYY-MM-DD');
  const filename = `${docType.replace(/\s+/g, '_')}_${(documentData?.full_name || profileData?.fullname || 'Student').replace(/\s+/g, '_')}_${today}.pdf`;

  return (
    <PDFDownloadLink 
      document={<GeneratedDocument documentData={documentData} profileData={profileData} documentType={docType} />} 
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
          Download PDF
        </Button>
      )}
    </PDFDownloadLink>
  );
}

export default function TranscriptOfRecordsPDF({ documentData, profileData }) {
  const docType = documentData?.doc_category || 'Transcript of Records';
  const today = dayjs().format('YYYY-MM-DD');
  const filename = `${docType.replace(/\s+/g, '_')}_${(documentData?.full_name || profileData?.fullname || 'Student').replace(/\s+/g, '_')}_${today}.pdf`;

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
          📄 {docType} - {documentData?.full_name || profileData?.fullname || 'Student'}
        </span>
        <PDFDownloadLink 
          document={<GeneratedDocument documentData={documentData} profileData={profileData} documentType={docType} />} 
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
          {({ loading }) => (loading ? '⏳ Preparing...' : '📥 Download PDF')}
        </PDFDownloadLink>
      </div>
      <PDFViewer style={{ width: '100%', height: 540, border: 'none', borderRadius: 4 }} showToolbar={true}>
        <GeneratedDocument documentData={documentData} profileData={profileData} documentType={docType} />
      </PDFViewer>
    </div>
  );
}



