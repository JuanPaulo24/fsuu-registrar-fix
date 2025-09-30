import { Row, Col } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faClipboardCheck, 
    faCheckCircle, 
    faTimesCircle, 
    faExclamationTriangle
} from "@fortawesome/pro-solid-svg-icons";
import { GET } from "../../../providers/useAxiosQuery";
import KpiCard from "./components/KpiCard";
import DocumentUsageChart from "./components/DocumentUsageChart";
import GoogleMap from "./components/GoogleMap";
import DocumentGenerationDonut from "./components/DocumentGenerationDonut";
import RecentEmails from "./components/RecentEmails";
import RecentAnnouncements from "./components/RecentAnnouncements";

export default function PageDashboard() {
    // Fetch scan history statistics for KPIs
    const { data: scanStats, isLoading: scanStatsLoading } = GET(
        'api/scan-history/stats',
        'dashboard-scan-stats',
        true
    );

    // Fetch issued documents statistics
    const { data: documentsData, isLoading: documentsLoading } = GET(
        'api/issued_documents',
        'dashboard-documents',
        true
    );

    // Calculate KPI values from API data
    const getKpiValues = () => {
        if (!scanStats) {
            return {
                total: 0,
                successful: 0,
                failed: 0,
                revoked: 0
            };
        }

        return {
            total: scanStats.total || 0,
            successful: scanStats.successful || 0,
            failed: scanStats.failed || 0,
            revoked: scanStats.revoked || 0
        };
    };

    const kpiValues = getKpiValues();

    return (
        <section className="dashboard-container">
            <Row gutter={[24, 24]}>
                {/* KPI Cards Row */}
                <Col xs={24} sm={12} lg={6}>
                    <KpiCard
                        title="Total Verifications"
                        value={kpiValues.total}
                        subtitle="All document verification requests"
                        colorClass="primary"
                        icon={<FontAwesomeIcon icon={faClipboardCheck} />}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KpiCard
                        title="Successful"
                        value={kpiValues.successful}
                        subtitle="Documents successfully authenticated"
                        colorClass="success"
                        icon={<FontAwesomeIcon icon={faCheckCircle} />}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KpiCard
                        title="Failed"
                        value={kpiValues.failed}
                        subtitle="Documents that failed validation"
                        colorClass="danger"
                        icon={<FontAwesomeIcon icon={faTimesCircle} />}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KpiCard
                        title="Exception Cases"
                        value={kpiValues.revoked}
                        subtitle="Cases requiring manual review"
                        colorClass="warning"
                        icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
                    />
                </Col>

                {/* Three Equal-Sized Components Row */}
                <Col xs={24} sm={24} md={8}>
                    <div className="dashboard-equal-container">
                        <DocumentUsageChart />
                    </div>
                </Col>
                <Col xs={24} sm={24} md={8}>
                    <div className="dashboard-equal-container">
                        <DocumentGenerationDonut />
                    </div>
                </Col>
                <Col xs={24} sm={24} md={8}>
                    <div className="dashboard-equal-container">
                        <RecentEmails />
                    </div>
                </Col>

                {/* System Announcements - Full Width */}
                <Col xs={24}>
                    <RecentAnnouncements />
                </Col>

                {/* Map Section - Full Width */}
                <Col xs={24}>
                    <GoogleMap />
                </Col>
            </Row>
        </section>
    );
}
