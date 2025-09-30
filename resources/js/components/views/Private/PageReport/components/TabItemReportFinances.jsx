import { useState } from "react";
import { Card, Button, Table, Space, Popconfirm, Select, DatePicker } from "antd";
import { PrinterOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PageReportContext from "./PageReportContext";

const { RangePicker } = DatePicker;
const { Option } = Select;

const REPORT_DATA = [
    { id: 1, blank: "St. Michael", totalCollections: "₱2,500,000", totalExpenses: "₱2,100,000", totalSurplus: "₱400,000", outstandingParishLiability: "₱1,200,000", outstandingParishFund: "₱600,000" },
    { id: 2, blank: "Our Lady", totalCollections: "₱2,200,000", totalExpenses: "₱1,900,000", totalSurplus: "₱300,000", outstandingParishLiability: "₱1,100,000", outstandingParishFund: "₱500,000" },
    { id: 3, blank: "St. Paul", totalCollections: "₱2,800,000", totalExpenses: "₱2,300,000", totalSurplus: "₱500,000", outstandingParishLiability: "₱1,400,000", outstandingParishFund: "₱700,000" },
    { id: 4, blank: "Divine Mercy", totalCollections: "₱2,300,000", totalExpenses: "₱1,850,000", totalSurplus: "₱450,000", outstandingParishLiability: "₱1,250,000", outstandingParishFund: "₱550,000" },
    { id: 5, blank: "San Lorenzo", totalCollections: "₱1,900,000", totalExpenses: "₱1,600,000", totalSurplus: "₱300,000", outstandingParishLiability: "₱950,000", outstandingParishFund: "₱400,000" },
    { id: 6, blank: "Christ the King", totalCollections: "₱3,000,000", totalExpenses: "₱2,500,000", totalSurplus: "₱500,000", outstandingParishLiability: "₱1,500,000", outstandingParishFund: "₱800,000" },
    { id: 7, blank: "Immaculate Conception", totalCollections: "₱2,400,000", totalExpenses: "₱2,000,000", totalSurplus: "₱400,000", outstandingParishLiability: "₱1,300,000", outstandingParishFund: "₱600,000" },
    { id: 8, blank: "San Pedro", totalCollections: "₱1,800,000", totalExpenses: "₱1,500,000", totalSurplus: "₱300,000", outstandingParishLiability: "₱900,000", outstandingParishFund: "₱350,000" },
    { id: 9, blank: "Our Lady of Fatima", totalCollections: "₱2,600,000", totalExpenses: "₱2,200,000", totalSurplus: "₱400,000", outstandingParishLiability: "₱1,350,000", outstandingParishFund: "₱650,000" }
];

export default function TabItemReportFinances() {
    const [toggleModalForm, setToggleModalForm] = useState({ open: false, data: null });

    const handlePrint = () => {
        window.print();
    };

    return (
        <PageReportContext.Provider value={{ toggleModalForm, setToggleModalForm }}>
            <Card>
                <div className="float-wrapper">

                    <RangePicker style={{width: 400, marginRight: 20}}/>

                    <Select
                        placeholder="Total Collections"
                        style={{ width: 250, marginRight: 20 }}
                    >
                        <Option value="1">Total Collections</Option>
                        <Option value="2">Total Expenses</Option>
                        <Option value="3">Total Surplus (Deficit)</Option>
                        <Option value="4">Outstanding Parish Liability</Option>
                        <Option value="5">Outstanding Parish Fund</Option>
                    </Select>

                    <Button
                        type="primary"
                        onClick={handlePrint}
                        icon={<PrinterOutlined />}
                    >
                        Print
                    </Button>
                </div>
                <Table
                    className="ant-table-default ant-table-striped"
                    dataSource={REPORT_DATA}
                    rowKey={(record) => record.id}
                    pagination={false}
                    bordered={false}
                    scroll={{ x: "max-content" }}
                    sticky
                >
                    {/* <Table.Column
                        title="Action"
                        key="action"
                        dataIndex="action"
                        align="center"
                        render={(text, record) =>
                            !record.isHeader ? (
                                <Space size="middle">
                                    <Button
                                        type="link"
                                        onClick={() => alert(`Edit ${record.item}`)}
                                        icon={<EditOutlined />}
                                    />
                                    <Popconfirm
                                        title="Are you sure to delete this data?"
                                        onConfirm={() => alert(`Deleted ${record.item}`)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button type="link" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                </Space>
                            ) : null
                        }
                        width={150}
                    /> */}
                    <Table.Column
                        title=" "
                        key="blank"
                        dataIndex="blank"
                        sorter
                        width={220}
                    />
                    <Table.Column
                        title="Total Collections"
                        key="totalCollections"
                        dataIndex="totalCollections"
                        sorter
                        width={220}
                    />
                    <Table.Column
                        title="Total Expenses"
                        key="totalExpenses"
                        dataIndex="totalExpenses"
                        sorter
                        width={220}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Total Surplus (Deficit)"
                        key="totalSurplus"
                        dataIndex="totalSurplus"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Outstanding Parish Liability"
                        key="outstandingParishLiability"
                        dataIndex="outstandingParishLiability"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Outstanding Parish Fund"
                        key="outstandingParishFund"
                        dataIndex="outstandingParishFund"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />


                </Table>
            </Card>
        </PageReportContext.Provider>
    );
}
