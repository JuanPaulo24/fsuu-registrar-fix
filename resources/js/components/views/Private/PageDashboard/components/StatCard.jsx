import { Card, Select, Typography } from "antd"
import { CaretUpOutlined } from "@ant-design/icons"

const { Title, Text } = Typography

export default function StatCard() {
    return (
        <Card
            style={{
                borderRadius: '0.75rem',
                borderWidth: '1px',
                borderColor: 'rgba(0, 0, 0, 0.36)',
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                <Title level={2} style={{ margin: "0", fontSize: "1.25rem", fontFamily: "PoppinsSemiBold" }}>
                    Baptism
                </Title>
                <Select
                    defaultValue="this_month"
                    dropdownStyle={{ borderRadius: 8 }}
                >
                    <Select.Option value="this_month">This Month</Select.Option>
                    <Select.Option value="last_month">Last Month</Select.Option>
                    <Select.Option value="this_year">This Year</Select.Option>
                </Select>
            </div>

            <Title
                level={1}
                style={{
                    fontSize: '2.5rem',
                    textAlign: "center",
                    margin: "0",
                    paddingTop: "0.875rem",
                    fontFamily: "PoppinsBold",
                }}
            >
                10
            </Title>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "#0D5B10",
                        fontSize: '1.25rem',
                    }}
                >
                    <CaretUpOutlined />
                    <span>150%</span>
                </div>
                <Text
                    style={{
                        fontSize: '0.875rem',
                        margin: "0",
                        paddingTop: "0.875rem",
                    }}
                >
                    vs previous 30 days
                </Text>
            </div>
        </Card>
    )
}

