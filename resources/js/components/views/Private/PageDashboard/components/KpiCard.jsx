import { Card, Typography, Flex } from "antd";

const { Title, Text } = Typography;

export default function KpiCard({ title, value, suffix, subtitle, colorClass = "primary", icon }) {
    return (
        <Card 
            className={`kpi-card kpi-card-${colorClass}`} 
            bodyStyle={{ padding: "1.5rem" }}
        >
            <Flex justify="space-between" align="flex-start" style={{ marginBottom: "1rem" }}>
                <Text className="kpi-title">{title}</Text>
                {icon && (
                    <div className={`kpi-icon kpi-icon-${colorClass}`}>
                        {icon}
                    </div>
                )}
            </Flex>

            <Title level={1} className={`kpi-value ${colorClass}`}>
                {value}
                {suffix && <span className="kpi-suffix">{suffix}</span>}
            </Title>

            {subtitle && (
                <Text className="kpi-subtitle">{subtitle}</Text>
            )}
        </Card>
    );
}


