import { useEffect } from "react";
import Highcharts from "highcharts";
import "highcharts/modules/exporting";
import "highcharts/modules/export-data";
import highchartsSetOptions from "../../../../providers/highchartsSetOptions";

export default function RecordsChart() {
    useEffect(() => {
        highchartsSetOptions(Highcharts);
        Highcharts.chart("records-chart", {
            chart: { type: "bar", backgroundColor: "transparent" },
            title: { text: "Records by Category", align: "left" },
            xAxis: {
                categories: ["Requests", "Verified", "Failed"],
                title: { text: null },
            },
            yAxis: {
                min: 0,
                title: { text: "Count", align: "high" },
                labels: { overflow: "justify" },
                allowDecimals: false,
            },
            colors: ["#0027ae", "#2a28a7", "#dc3545"],
            plotOptions: {
                series: { borderRadius: 6 },
            },
            series: [
                { name: "2023", data: [320, 290, 30] },
                { name: "2024", data: [450, 410, 40] },
                { name: "2025", data: [280, 240, 40] },
            ],
            tooltip: { shared: true },
            credits: { enabled: false },
        });
    }, []);

    return (
        <section id="records-chart" className="chart-container bar-chart w-full" />
    );
}
