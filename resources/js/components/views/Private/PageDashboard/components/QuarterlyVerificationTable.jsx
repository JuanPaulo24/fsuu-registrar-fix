import { Table, Card } from "antd";
import dayjs from "dayjs";

const columns = [
    { title: "Year", dataIndex: "year", key: "year", width: 90 },
    { title: "Q1", dataIndex: "q1", key: "q1", align: "center", width: 80 },
    { title: "Q2", dataIndex: "q2", key: "q2", align: "center", width: 80 },
    { title: "Q3", dataIndex: "q3", key: "q3", align: "center", width: 80 },
    { title: "Q4", dataIndex: "q4", key: "q4", align: "center", width: 80 },
    { title: "Total", dataIndex: "total", key: "total", align: "center", width: 100 },
];

export default function QuarterlyVerificationTable({ data }) {
    const currentYear = dayjs().year();
    const defaultData = [
        { year: currentYear - 2, q1: 12, q2: 15, q3: 11, q4: 18 },
        { year: currentYear - 1, q1: 20, q2: 19, q3: 22, q4: 25 },
        { year: currentYear, q1: 27, q2: 24, q3: 0, q4: 0 },
    ].map((row) => ({ ...row, total: row.q1 + row.q2 + row.q3 + row.q4 }));

    const tableData = (data?.length ? data : defaultData).map((row) => ({
        key: row.year,
        ...row,
    }));

    return (
        <Card className="quarterly-table" bodyStyle={{ padding: 0 }}>
            <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                size="middle"
                className="w-full"
            />
        </Card>
    );
}


