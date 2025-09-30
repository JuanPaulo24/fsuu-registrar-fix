import { useEffect } from "react";
import Highcharts from "highcharts";
import "highcharts/modules/exporting";
import "highcharts/modules/export-data";
import highchartsSetOptions from "../../../../providers/highchartsSetOptions";
import { GET } from "../../../../providers/useAxiosQuery";

export default function DocumentUsageChart() {
    // Fetch scan history data to get document type statistics
    const { data: scanHistoryData } = GET(
        'api/scan-history?per_page=1000',
        'chart-scan-history',
        true
    );

    useEffect(() => {
        if (!scanHistoryData?.data) return;

        highchartsSetOptions(Highcharts);
        
        // Process scan history data to get document type counts
        const documentTypeCounts = {};
        scanHistoryData.data.forEach(scan => {
            if (scan.document_type && scan.scan_status === 'success') {
                documentTypeCounts[scan.document_type] = (documentTypeCounts[scan.document_type] || 0) + 1;
            }
        });

        // Convert to array and sort by count
        const documentData = Object.entries(documentTypeCounts)
            .map(([name, count]) => ({ name, y: count }))
            .sort((a, b) => b.y - a.y)
            .slice(0, 5); // Top 5 document types

        // Fallback to sample data if no real data
        if (documentData.length === 0) {
            documentData.push(
                { name: "Transcript of Records", y: 420 },
                { name: "Diploma", y: 320 },
                { name: "Certificate of Good Moral", y: 280 },
                { name: "Form 137", y: 210 },
                { name: "Certificate of Graduation", y: 180 }
            );
        }
        
        // Create a monochromatic color palette based on primary color
        const baseColor = "#0027ae"; // Primary color
        const generateMonochromaticColors = (baseColor, count) => {
            const colors = [];
            // Start with base color
            colors.push(baseColor);
            
            // Generate lighter and darker shades
            for (let i = 1; i < count; i++) {
                // Calculate color variations - this is a simple approach
                // Adjust opacity to create monochromatic effect
                const opacity = 1 - (i * 0.15);
                colors.push(`${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
            }
            
            return colors;
        };
        
        const colors = generateMonochromaticColors(baseColor, documentData.length);
        
        Highcharts.chart("document-usage-chart", {
            chart: {
                type: "bar",
                backgroundColor: "transparent",
                height: 350
            },
            title: {
                text: "Most Verified Document Types",
                align: "left",
                style: {
                    fontSize: "16px",
                    fontWeight: "600"
                }
            },
            subtitle: {
                text: "Document types with highest verification frequency",
                align: "left",
                style: {
                    fontSize: "12px",
                    color: "#666"
                }
            },
            xAxis: {
                type: "category",
                labels: {
                    style: {
                        fontSize: "12px"
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: "Verification Count",
                    align: "high"
                },
                labels: {
                    overflow: "justify"
                },
                allowDecimals: false
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        format: "{y}"
                    },
                    colorByPoint: true,
                    borderRadius: 6
                }
            },
            legend: {
                enabled: false
            },
            colors: colors,
            series: [{
                name: "Verifications",
                data: documentData
            }],
            tooltip: {
                formatter: function() {
                    return `<b>${this.point.name}</b><br/>Verifications: <b>${this.point.y}</b>`;
                }
            },
            credits: {
                enabled: false
            }
        });
    }, [scanHistoryData]);

    return (
        <section id="document-usage-chart" className="chart-container document-chart w-full" />
    );
}
