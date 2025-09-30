import { useState } from "react";
import { Card, Button, Table, Space, Popconfirm, Select, DatePicker } from "antd";
import { PrinterOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PageReportContext from "./PageReportContext";

const { RangePicker } = DatePicker;
const { Option } = Select;

const REPORT_DATA = [
    { id: 1,
        totalPopulation: "25,000",
        catholic: "18,500",
        nonCatholic: "3,500",
        otherReligions: "1,200",
        otherGroups: "1,800",
        indigenousPeople: "2,000"
    },
    { id: 2, totalPopulation: "18,750", catholic: "14,200", nonCatholic: "2,800", otherReligions: "900", otherGroups: "1,200", indigenousPeople: "1,650" },
    { id: 3, totalPopulation: "30,200", catholic: "22,500", nonCatholic: "4,000", otherReligions: "1,500", otherGroups: "2,000", indigenousPeople: "2,200" },
    { id: 4, totalPopulation: "21,600", catholic: "16,800", nonCatholic: "3,000", otherReligions: "1,100", otherGroups: "1,600", indigenousPeople: "2,100" },
    { id: 5, totalPopulation: "28,500", catholic: "21,000", nonCatholic: "3,700", otherReligions: "1,300", otherGroups: "1,800", indigenousPeople: "2,600" },
    { id: 6, totalPopulation: "22,800", catholic: "17,200", nonCatholic: "3,100", otherReligions: "1,200", otherGroups: "1,700", indigenousPeople: "2,300" },
    { id: 7, totalPopulation: "27,400", catholic: "20,500", nonCatholic: "3,600", otherReligions: "1,400", otherGroups: "1,800", indigenousPeople: "2,500" },
    { id: 8, totalPopulation: "19,800", catholic: "15,000", nonCatholic: "2,900", otherReligions: "1,000", otherGroups: "1,500", indigenousPeople: "2,000" },
    { id: 9, totalPopulation: "24,700", catholic: "18,600", nonCatholic: "3,300", otherReligions: "1,200", otherGroups: "1,800", indigenousPeople: "2,300" },
    { id: 10, totalPopulation: "28,439", catholic: "21,319", nonCatholic: "3,823", otherReligions: "1,470", otherGroups: "1,857", indigenousPeople: "30" },
    { id: 11, totalPopulation: "30,947", catholic: "22,497", nonCatholic: "3,682", otherReligions: "1,640", otherGroups: "2,022", indigenousPeople: "1,106" },
    { id: 12, totalPopulation: "30,823", catholic: "20,427", nonCatholic: "3,540", otherReligions: "1,458", otherGroups: "2,729", indigenousPeople: "2,671" }
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
                        placeholder="Total Population"
                        style={{ width: 250, marginRight: 20 }}
                    >
                        <Option value="1">Total Population</Option>
                        <Option value="2">Catholics</Option>
                        <Option value="3">Non-Catholic Christian Denominations</Option>
                        <Option value="4">Other Religions</Option>
                        <Option value="5">Other groups or sects</Option>
                        <Option value="6">Indigenous People</Option>
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
                        title="Total Population"
                        key="totalPopulation"
                        dataIndex="totalPopulation"
                        sorter
                        width={150}
                    />
                    <Table.Column
                        title="Catholic"
                        key="catholic"
                        dataIndex="catholic"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        // title={<span style={{ display: "block", textAlign: "center" }}>Non-Catholic Christian Denominations</span>}
                        title="Non-Catholic Christian Dominations"
                        key="nonCatholic"
                        dataIndex="nonCatholic"
                        sorter
                        width={220}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Other Religions"
                        key="otherReligions"
                        dataIndex="otherReligions"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Other groups or sects"
                        key="otherGroups"
                        dataIndex="otherGroups"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Family Groupings"
                        key="familyGroupings"
                        dataIndex="familyGroupings"
                        sorter
                        width={180}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />
                    <Table.Column
                        title="Indigenous People"
                        key="indigenousPeople"
                        dataIndex="indigenousPeople"
                        sorter
                        width={150}
                        render={(text, record) => (record.isHeader ? null : text)}
                    />

                </Table>
            </Card>
        </PageReportContext.Provider>
    );
}
