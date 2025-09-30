import { useEffect } from "react";
import Highcharts from "highcharts";
import "highcharts/modules/exporting";
import "highcharts/modules/export-data";
import highchartsSetOptions from "../../../../providers/highchartsSetOptions";

export default function LineChart() {
    useEffect(() => {
        highchartsSetOptions(Highcharts);
        Highcharts.chart("line-chart", {
            chart: { type: "line", reflow: true, backgroundColor: "transparent" },
            title: { text: "Verification Trend", align: "left" },
            subtitle: { text: "Totals per year", align: "left" },
            xAxis: { categories: ["2023", "2024", "2025", "2026", "2027", "2028"] },
            yAxis: {
                title: { text: "Count" },
                min: 0,
                allowDecimals: false,
            },
            colors: ["#0027ae", "#3c61e7", "#17a2b8"],
            plotOptions: {
                line: { lineWidth: 2 },
                series: { marker: { enabled: true, radius: 3 } },
            },
            series: [
                { name: "Requests", data: [300, 420, 280, 0, 0, 0] },
                { name: "Verified", data: [270, 380, 240, 0, 0, 0] },
                { name: "Failed", data: [30, 40, 40, 0, 0, 0] },
            ],
            tooltip: { shared: true },
            legend: { layout: "horizontal", align: "center", verticalAlign: "bottom" },
            credits: { enabled: false },
        });
    }, []);

    return <section id="line-chart" className="chart-container line-chart w-full" />;
}
