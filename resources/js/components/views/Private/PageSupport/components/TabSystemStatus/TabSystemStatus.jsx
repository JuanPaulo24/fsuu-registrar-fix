import { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Tag, Progress, Timeline, Statistic, Space, Alert } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faServer, 
    faDatabase, 
    faCloud, 
    faNetworkWired,
    faShieldAlt,
    faChartLine,
    faExclamationTriangle,
    faCheckCircle,
    faClock,
    faWifi
} from "@fortawesome/pro-solid-svg-icons";

const { Title, Text, Paragraph } = Typography;

export default function TabSystemStatus() {
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Update timestamp every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdated(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const systemComponents = [
        {
            name: "Web Application",
            status: "operational",
            uptime: 99.98,
            lastIncident: null,
            icon: faServer,
            color: "#52c41a"
        },
        {
            name: "Database Server",
            status: "operational",
            uptime: 99.95,
            lastIncident: null,
            icon: faDatabase,
            color: "#52c41a"
        },
        {
            name: "Authentication Service",
            status: "operational",
            uptime: 99.99,
            lastIncident: null,
            icon: faShieldAlt,
            color: "#52c41a"
        },
        {
            name: "File Storage",
            status: "degraded",
            uptime: 97.85,
            lastIncident: "2025-01-10 14:30",
            icon: faCloud,
            color: "#fa8c16"
        },
        {
            name: "Network Infrastructure",
            status: "operational",
            uptime: 99.92,
            lastIncident: null,
            icon: faNetworkWired,
            color: "#52c41a"
        },
        {
            name: "API Gateway",
            status: "operational",
            uptime: 99.87,
            lastIncident: null,
            icon: faWifi,
            color: "#52c41a"
        }
    ];

    const performanceMetrics = [
        {
            label: "Response Time",
            value: 245,
            unit: "ms",
            status: "good",
            icon: faChartLine
        },
        {
            label: "Server Load",
            value: 45,
            unit: "%",
            status: "good",
            icon: faServer
        },
        {
            label: "Memory Usage",
            value: 68,
            unit: "%",
            status: "warning",
            icon: faDatabase
        },
        {
            label: "Disk Usage",
            value: 72,
            unit: "%",
            status: "warning",
            icon: faCloud
        }
    ];

    const recentIncidents = [
        {
            id: 1,
            title: "File Storage Performance Degradation",
            status: "investigating",
            startTime: "2025-01-10 14:30",
            description: "Users may experience slower file upload/download speeds. Our team is investigating the issue.",
            severity: "minor",
            color: "orange"
        },
        {
            id: 2,
            title: "Scheduled Database Maintenance",
            status: "scheduled",
            startTime: "2025-01-12 02:00",
            description: "Planned maintenance window for database optimization. Expected duration: 2 hours.",
            severity: "maintenance",
            color: "blue"
        }
    ];

    const maintenanceSchedule = [
        {
            date: "2025-01-12",
            time: "02:00 - 04:00",
            component: "Database Server",
            description: "Database optimization and index rebuilding",
            impact: "Minimal - Read-only access during maintenance"
        },
        {
            date: "2025-01-15",
            time: "01:00 - 03:00",
            component: "Web Application",
            description: "Security patches and performance updates",
            impact: "Brief service interruption (< 5 minutes)"
        },
        {
            date: "2025-01-20",
            time: "00:00 - 06:00",
            component: "Network Infrastructure",
            description: "Network equipment upgrade",
            impact: "Possible intermittent connectivity issues"
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case "operational": return "success";
            case "degraded": return "warning";
            case "outage": return "error";
            case "maintenance": return "processing";
            default: return "default";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "operational": return faCheckCircle;
            case "degraded": return faExclamationTriangle;
            case "outage": return faExclamationTriangle;
            case "maintenance": return faClock;
            default: return faCheckCircle;
        }
    };

    const getPerformanceColor = (status) => {
        switch (status) {
            case "good": return "#52c41a";
            case "warning": return "#fa8c16";
            case "critical": return "#ff4d4f";
            default: return "#1890ff";
        }
    };

    const overallStatus = systemComponents.some(comp => comp.status === "outage") 
        ? "outage" 
        : systemComponents.some(comp => comp.status === "degraded") 
        ? "degraded" 
        : "operational";

    return (
        <Row gutter={[20, 20]}>
            {/* Overall Status */}
            <Col span={24}>
                <Alert
                    message={
                        <Space>
                            <FontAwesomeIcon 
                                icon={getStatusIcon(overallStatus)} 
                                className={`text-${overallStatus === 'operational' ? 'green' : overallStatus === 'degraded' ? 'yellow' : 'red'}-500`}
                            />
                            <Text strong>
                                {overallStatus === 'operational' 
                                    ? 'All Systems Operational' 
                                    : overallStatus === 'degraded'
                                    ? 'Some Systems Experiencing Issues'
                                    : 'System Outage Detected'
                                }
                            </Text>
                        </Space>
                    }
                    description={`Last updated: ${lastUpdated.toLocaleString()}`}
                    type={overallStatus === 'operational' ? 'success' : overallStatus === 'degraded' ? 'warning' : 'error'}
                    showIcon
                />
            </Col>

            {/* System Components Status */}
            <Col span={24}>
                <Title level={4}>System Components</Title>
            </Col>

            {systemComponents.map((component, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                    <Card size="small" className="h-full">
                        <Space direction="vertical" size="small" className="w-full">
                            <div className="flex items-center justify-between">
                                <Space>
                                    <FontAwesomeIcon 
                                        icon={component.icon} 
                                        style={{ color: component.color }}
                                    />
                                    <Text strong>{component.name}</Text>
                                </Space>
                                <Tag color={getStatusColor(component.status)}>
                                    {component.status.toUpperCase()}
                                </Tag>
                            </div>
                            
                            <div>
                                <Text type="secondary" className="text-sm">Uptime</Text>
                                <Progress 
                                    percent={component.uptime} 
                                    size="small" 
                                    status={component.uptime > 99 ? "success" : component.uptime > 95 ? "normal" : "exception"}
                                    format={(percent) => `${percent}%`}
                                />
                            </div>
                            
                            {component.lastIncident && (
                                <Text type="secondary" className="text-xs">
                                    Last incident: {component.lastIncident}
                                </Text>
                            )}
                        </Space>
                    </Card>
                </Col>
            ))}

            {/* Performance Metrics */}
            <Col span={24}>
                <Title level={4}>Performance Metrics</Title>
            </Col>

            {performanceMetrics.map((metric, index) => (
                <Col xs={12} sm={6} key={index}>
                    <Card size="small">
                        <Statistic
                            title={
                                <Space>
                                    <FontAwesomeIcon 
                                        icon={metric.icon} 
                                        style={{ color: getPerformanceColor(metric.status) }}
                                    />
                                    <span>{metric.label}</span>
                                </Space>
                            }
                            value={metric.value}
                            suffix={metric.unit}
                            valueStyle={{ 
                                color: getPerformanceColor(metric.status),
                                fontSize: '1.2rem'
                            }}
                        />
                    </Card>
                </Col>
            ))}

            {/* Current Incidents */}
            <Col xs={24} lg={12}>
                <Card title="Current Incidents" size="small">
                    {recentIncidents.length > 0 ? (
                        <Timeline
                            items={recentIncidents.map(incident => ({
                                color: incident.color,
                                children: (
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <Text strong>{incident.title}</Text>
                                            <Tag color={incident.color} size="small">
                                                {incident.status.toUpperCase()}
                                            </Tag>
                                        </div>
                                        <Text type="secondary" className="text-sm">
                                            {incident.startTime}
                                        </Text>
                                        <Paragraph className="text-sm mt-1 mb-0">
                                            {incident.description}
                                        </Paragraph>
                                    </div>
                                )
                            }))}
                        />
                    ) : (
                        <div className="text-center py-4">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl mb-2" />
                            <Text type="secondary" className="block">No current incidents</Text>
                        </div>
                    )}
                </Card>
            </Col>

            {/* Scheduled Maintenance */}
            <Col xs={24} lg={12}>
                <Card title="Scheduled Maintenance" size="small">
                    <div className="space-y-3">
                        {maintenanceSchedule.map((maintenance, index) => (
                            <div key={index} className="border-l-4 border-l-blue-500 pl-3 py-2">
                                <div className="flex items-center justify-between mb-1">
                                    <Text strong>{maintenance.component}</Text>
                                    <Text type="secondary" className="text-sm">
                                        {maintenance.date}
                                    </Text>
                                </div>
                                <Text className="text-sm block mb-1">
                                    {maintenance.time}
                                </Text>
                                <Text type="secondary" className="text-sm block mb-1">
                                    {maintenance.description}
                                </Text>
                                <Text type="secondary" className="text-xs">
                                    Impact: {maintenance.impact}
                                </Text>
                            </div>
                        ))}
                    </div>
                </Card>
            </Col>

            {/* Status Page Information */}
            <Col span={24}>
                <Card title="About System Status" size="small">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size="small">
                                <Text strong>Status Definitions:</Text>
                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <Tag color="success" size="small">OPERATIONAL</Tag>
                                        <Text className="ml-2 text-sm">System functioning normally</Text>
                                    </div>
                                    <div className="flex items-center">
                                        <Tag color="warning" size="small">DEGRADED</Tag>
                                        <Text className="ml-2 text-sm">System experiencing performance issues</Text>
                                    </div>
                                    <div className="flex items-center">
                                        <Tag color="error" size="small">OUTAGE</Tag>
                                        <Text className="ml-2 text-sm">System unavailable or not functioning</Text>
                                    </div>
                                </div>
                            </Space>
                        </Col>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size="small">
                                <Text strong>Update Frequency:</Text>
                                <Text className="text-sm">• Status checks every 30 seconds</Text>
                                <Text className="text-sm">• Performance metrics updated every minute</Text>
                                <Text className="text-sm">• Incident reports updated in real-time</Text>
                                <Text className="text-sm">• Page auto-refreshes every 5 minutes</Text>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
}
