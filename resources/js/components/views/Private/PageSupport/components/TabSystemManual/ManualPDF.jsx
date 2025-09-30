import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
    family: 'Montserrat',
    src: '/fonts/Montserrat/Montserrat-Regular.ttf'
});

Font.register({
    family: 'MontserratBold',
    src: '/fonts/Montserrat/Montserrat-Bold.ttf'
});

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 30,
        fontFamily: 'Montserrat',
        fontSize: 10,
        lineHeight: 1.4
    },
    coverPage: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#0027ae',
        color: 'white',
        padding: 40
    },
    coverTitle: {
        fontSize: 28,
        fontFamily: 'MontserratBold',
        textAlign: 'center',
        marginBottom: 20,
        color: 'white'
    },
    coverSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: 'rgba(255,255,255,0.9)'
    },
    coverInfo: {
        fontSize: 12,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.8)',
        marginTop: 40
    },
    section: {
        marginBottom: 20,
        pageBreak: 'auto'
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'MontserratBold',
        color: '#0027ae',
        marginBottom: 15,
        borderBottom: '2px solid #0027ae',
        paddingBottom: 5
    },
    subsectionTitle: {
        fontSize: 14,
        fontFamily: 'MontserratBold',
        color: '#0027ae',
        marginBottom: 10,
        marginTop: 15
    },
    paragraph: {
        marginBottom: 10,
        textAlign: 'justify'
    },
    listItem: {
        marginBottom: 5,
        paddingLeft: 10
    },
    bulletPoint: {
        fontSize: 12,
        color: '#0027ae',
        marginRight: 5
    },
    tableOfContents: {
        marginBottom: 30
    },
    tocItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingVertical: 3
    },
    tocText: {
        fontSize: 11,
        color: '#0027ae'
    },
    tocPage: {
        fontSize: 11,
        color: '#666666'
    },
    card: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        marginBottom: 15,
        borderRadius: 5,
        border: '1px solid #e9ecef'
    },
    alert: {
        backgroundColor: '#e6f7ff',
        border: '1px solid #91d5ff',
        padding: 10,
        marginBottom: 10,
        borderRadius: 4
    },
    alertWarning: {
        backgroundColor: '#fff7e6',
        border: '1px solid #ffd591',
        padding: 10,
        marginBottom: 10,
        borderRadius: 4
    },
    codeBlock: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        fontFamily: 'Courier',
        fontSize: 9,
        marginBottom: 10,
        borderRadius: 3
    },
    header: {
        fontSize: 8,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 20,
        borderBottom: '1px solid #e9ecef',
        paddingBottom: 10
    },
    footer: {
        fontSize: 8,
        color: '#666666',
        textAlign: 'center',
        marginTop: 20,
        borderTop: '1px solid #e9ecef',
        paddingTop: 10
    }
});

const ManualPDF = ({ systemInfo, navigationSections, commonTasks, troubleshooting }) => {
    return (
        <Document>
            {/* Cover Page */}
            <Page size="A4" style={styles.coverPage}>
                <Text style={styles.coverTitle}>
                    FSUU Registrar Validation System Manual
                </Text>
                <Text style={styles.coverSubtitle}>
                    Comprehensive Guide to System Navigation and Usage
                </Text>
                <Text style={styles.coverInfo}>
                    Version: {systemInfo.version} | Last Updated: {systemInfo.lastUpdated}
                </Text>
                <Text style={styles.coverInfo}>
                    FSUU Registrar Office
                </Text>
            </Page>

            {/* Table of Contents */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.sectionTitle}>Table of Contents</Text>
                
                <View style={styles.tableOfContents}>
                    <Text style={styles.subsectionTitle}>System Modules</Text>
                    {navigationSections.map((section, index) => (
                        <View key={section.key} style={styles.tocItem}>
                            <Text style={styles.tocText}>{index + 1}. {section.label}</Text>
                            <Text style={styles.tocPage}>{index + 3}</Text>
                        </View>
                    ))}
                    
                    <Text style={styles.subsectionTitle}>Quick Reference</Text>
                    <View style={styles.tocItem}>
                        <Text style={styles.tocText}>Common Tasks</Text>
                        <Text style={styles.tocPage}>{navigationSections.length + 3}</Text>
                    </View>
                    <View style={styles.tocItem}>
                        <Text style={styles.tocText}>Troubleshooting Guide</Text>
                        <Text style={styles.tocPage}>{navigationSections.length + 4}</Text>
                    </View>
                    <View style={styles.tocItem}>
                        <Text style={styles.tocText}>Contact Information</Text>
                        <Text style={styles.tocPage}>{navigationSections.length + 5}</Text>
                    </View>
                </View>
            </Page>

            {/* System Information */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>FSUU Registrar Validation System Manual - System Information</Text>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System Information</Text>
                    
                    <View style={styles.card}>
                        <Text style={styles.subsectionTitle}>System Details</Text>
                        <Text style={styles.paragraph}>
                            <Text style={{ fontFamily: 'MontserratBold' }}>Version: </Text>
                            {systemInfo.version}
                        </Text>
                        <Text style={styles.paragraph}>
                            <Text style={{ fontFamily: 'MontserratBold' }}>Last Updated: </Text>
                            {systemInfo.lastUpdated}
                        </Text>
                        <Text style={styles.paragraph}>
                            <Text style={{ fontFamily: 'MontserratBold' }}>Support Email: </Text>
                            {systemInfo.supportEmail}
                        </Text>
                    </View>

                    <Text style={styles.subsectionTitle}>System Requirements</Text>
                    <Text style={styles.paragraph}>
                        • Modern web browser (Chrome, Firefox, Safari, Edge)
                    </Text>
                    <Text style={styles.paragraph}>
                        • Stable internet connection
                    </Text>
                    <Text style={styles.paragraph}>
                        • JavaScript enabled
                    </Text>
                    <Text style={styles.paragraph}>
                        • Screen resolution: 1024x768 or higher
                    </Text>
                </View>
            </Page>

            {/* Navigation Guide */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>FSUU Registrar Validation System Manual - Navigation Guide</Text>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System Navigation Guide</Text>
                    
                    {navigationSections.map((section, index) => (
                        <View key={section.key} style={styles.section}>
                            <Text style={styles.subsectionTitle}>
                                {index + 1}. {section.label}
                            </Text>
                            <Text style={styles.paragraph}>
                                {section.description}
                            </Text>
                            <Text style={styles.paragraph}>
                                <Text style={{ fontFamily: 'MontserratBold' }}>Key Features:</Text>
                            </Text>
                            {section.features.map((feature, featureIndex) => (
                                <Text key={featureIndex} style={styles.listItem}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    {feature}
                                </Text>
                            ))}
                        </View>
                    ))}
                </View>
            </Page>

            {/* Common Tasks */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>FSUU Registrar Validation System Manual - Common Tasks</Text>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Common Tasks</Text>
                    
                    {commonTasks.map((task, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={styles.subsectionTitle}>
                                {index + 1}. {task.title}
                            </Text>
                            <Text style={styles.paragraph}>
                                {task.description}
                            </Text>
                            <Text style={styles.paragraph}>
                                <Text style={{ fontFamily: 'MontserratBold' }}>Steps:</Text>
                            </Text>
                            {task.steps.map((step, stepIndex) => (
                                <Text key={stepIndex} style={styles.listItem}>
                                    <Text style={styles.bulletPoint}>•</Text>
                                    {step}
                                </Text>
                            ))}
                        </View>
                    ))}
                </View>
            </Page>

            {/* Troubleshooting */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>FSUU Registrar Validation System Manual - Troubleshooting</Text>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Troubleshooting Guide</Text>
                    
                    {troubleshooting.map((item, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={styles.subsectionTitle}>
                                {index + 1}. {item.issue}
                            </Text>
                            <Text style={styles.paragraph}>
                                {item.solution}
                            </Text>
                        </View>
                    ))}
                </View>
            </Page>

            {/* Contact Information */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>FSUU Registrar Validation System Manual - Contact Information</Text>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    
                    <View style={styles.card}>
                        <Text style={styles.subsectionTitle}>Technical Support</Text>
                        <Text style={styles.paragraph}>
                            <Text style={{ fontFamily: 'MontserratBold' }}>Email: </Text>
                            {systemInfo.supportEmail}
                        </Text>
                        <Text style={styles.paragraph}>
                            <Text style={{ fontFamily: 'MontserratBold' }}>Response Time: </Text>
                            Within 24 hours during business days
                        </Text>
                    </View>

                    <View style={styles.alert}>
                        <Text style={styles.paragraph}>
                            <Text style={{ fontFamily: 'MontserratBold' }}>Important: </Text>
                            For urgent issues, please contact the IT department directly or visit the Registrar's office.
                        </Text>
                    </View>

                    <View style={styles.alertWarning}>
                        <Text style={styles.paragraph}>
                            <Text style={{ fontFamily: 'MontserratBold' }}>Note: </Text>
                            This manual is updated regularly. Please check for the latest version online.
                        </Text>
                    </View>
                </View>

                <Text style={styles.footer}>
                    FSUU Registrar Validation System Manual | Generated on {new Date().toLocaleDateString()}
                </Text>
            </Page>
        </Document>
    );
};

export default ManualPDF;
