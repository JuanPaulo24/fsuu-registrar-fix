export default function highchartsSetOptions(Highcharts) {
    Highcharts.setOptions({
        boost: {
            useGPUTranslations: true,
        },
        lang: {
            thousandsSep: ",",
        },
        title: {
            style: {
                color: "#00000",
                font: "1rem PoppinsBold, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif",
            },
        },
        subtitle: {
            style: {
                color: "#666666",
                font: "0.625rem PoppinsRegular, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif",
            },
        },
        xAxis: {
            // gridLineWidth: 1,
            // lineColor: "#C0D0E0",
            // tickColor: "#C0D0E0",
            labels: {
                style: {
                    color: "#333333",
                    fontFamily: "PoppinsBold",
                    fontSize: "0.625rem"
                },
            },
            title: {
                style: {
                    color: "#6D869F",
                    font: "bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif",
                },
            },
        },
        yAxis: {
            // alternateGridColor: null,
            // minorTickInterval: "auto",
            lineColor: "#000",
            lineWidth: 0,
            tickWidth: 0,
            tickColor: "#000",
            labels: {
                style: {
                    color: "#333333",
                    fontFamily: "PoppinsBold",
                    fontSize: "0.625rem"
                },
            },
            title: {
                style: {
                    color: "#666666",
                    font: "0.625rem PoppinsBold, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif",
                },
            },
        },
        legend: {
            itemStyle: {
                color: "#333333",
                font: "0.75rem PoppinsRegular"
            },
            itemHoverStyle: {
                color: "black",
            },
            itemHiddenStyle: {
                color: "silver",
            },
        },
        credits: false,
        accessibility: {
            enabled: false,
        },
        labels: {
            style: {
                color: "#3E576F",
            },
        },
    });
    return "";
}
