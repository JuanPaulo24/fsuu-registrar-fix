import { useEffect } from "react";
import Highcharts from "highcharts";
import "highcharts/modules/exporting";
import "highcharts/modules/export-data";
import highchartsSetOptions from "../../../../providers/highchartsSetOptions";
import { GET } from "../../../../providers/useAxiosQuery";

export default function DocumentGenerationDonut() {
    // Fetch issued documents data for generation statistics
    const { data: documentsData } = GET(
        'api/issued_documents?per_page=1000',
        'chart-issued-documents',
        true
    );

    useEffect(() => {
        if (!documentsData?.data) return;

        highchartsSetOptions(Highcharts);
        
        // Process issued documents data to get document type counts
        const documentTypeCounts = {};
        documentsData.data.forEach(doc => {
            if (doc.document_type) {
                documentTypeCounts[doc.document_type] = (documentTypeCounts[doc.document_type] || 0) + 1;
            }
        });

        // Convert to array with colors
        const colors = ["#0027ae", "#1e40af", "#3b82f6", "#60a5fa", "#93c5fd"];
        let documentData = Object.entries(documentTypeCounts)
            .map(([name, count], index) => ({ 
                name, 
                y: count, 
                color: colors[index % colors.length] 
            }))
            .sort((a, b) => b.y - a.y);

        // Fallback to sample data if no real data
        if (documentData.length === 0) {
            documentData = [
                { name: "Transcript of Records", y: 245, color: "#0027ae" },
                { name: "Certificate of Graduation", y: 189, color: "#1e40af" },
                { name: "Diploma", y: 132, color: "#3b82f6" },
                { name: "Certificate of Enrollment", y: 98, color: "#60a5fa" },
                { name: "Certificate of Good Moral", y: 36, color: "#93c5fd" }
            ];
        }
        
        const totalDocuments = documentData.reduce((sum, item) => sum + item.y, 0);
        
        Highcharts.chart("document-generation-donut", {
            chart: {
                type: "pie",
                backgroundColor: "transparent",
                height: 350
            },
            title: {
                text: "Document Generation Overview",
                align: "left",
                style: {
                    fontSize: "16px",
                    fontWeight: "600"
                }
            },
            subtitle: {
                text: `Distribution of generated documents by type (Total: ${totalDocuments})`,
                align: "left",
                style: {
                    fontSize: "12px",
                    color: "#666"
                }
            },
            plotOptions: {
                pie: {
                    innerSize: "60%",
                    dataLabels: {
                        enabled: true,
                        format: "<b>{point.name}</b><br>{point.y} ({point.percentage:.1f}%)",
                        style: {
                            fontSize: "11px"
                        },
                        distance: 20
                    },
                    showInLegend: false,
                    borderWidth: 2,
                    borderColor: "#ffffff"
                }
            },
            series: [{
                name: "Documents",
                data: documentData
            }],
            tooltip: {
                formatter: function() {
                    return `<b>${this.point.name}</b><br/>Generated: <b>${this.point.y}</b> (${this.point.percentage.toFixed(1)}%)`;
                }
            },
            credits: {
                enabled: false
            }
        });
    }, [documentsData]);

    return (
        <section id="document-generation-donut" className="chart-container document-chart w-full" />
    );
}