import { useContext, useState, useEffect, useMemo } from "react";
import { Table, Button, Flex, Col } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faBook } from "@fortawesome/pro-regular-svg-icons";
import PagePayrollContext from "./PagePayrollContext";
import {
    TableGlobalSearchAnimated,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../../providers/CustomTableFilter";
import PayslipModal from "./payslip/PayrollPayslipModal";
const PayrollData = [
    {
        id: 1,
        full_name: "Juan Dela Cruz",
        monthly_pay: 30000,
        basic: 15000,
        holiday: 200,
        total_gross_pay: 32000,
        cash_loan: 2500,
        sss: 1200,
        insurance: 900,
        mpl: 500,
        others: 1000,
        total_deduction: 6900,
        net_pay: "Not paid",
    },
    {
        id: 2,
        full_name: "Maria Santos",
        monthly_pay: 25000,
        basic: 12000,
        holiday: 1500,
        total_gross_pay: 26500,
        cash_loan: 2000,
        sss: 1000,
        insurance: 750,
        mpl: 900,
        others: 700,
        total_deduction: 5800,
        net_pay: "Paid",
    },
    {
        id: 3,
        full_name: "Mark Reyes",
        monthly_pay: 35000,
        basic: 17500,
        holiday: 2500,
        total_gross_pay: 37500,
        cash_loan: 3000,
        sss: 1400,
        insurance: 1050,
        mpl: 550,
        others: 1200,
        total_deduction: 8100,
        net_pay: "Not Paid",
    },
    {
        id: 4,
        full_name: "Ana Mendoza",
        monthly_pay: 28000,
        basic: 14500,
        holiday: 1800,
        total_gross_pay: 29000,
        cash_loan: 2000,
        sss: 1120,
        insurance: 840,
        mpl: 480,
        others: 950,
        total_deduction: 6340,
        net_pay: "Not Paid",
    },
    {
        id: 5,
        full_name: "Ana Mendoza",
        monthly_pay: 28000,
        basic: 14500,
        holiday: 1800,
        total_gross_pay: 29000,
        cash_loan: 2000,
        sss: 1120,
        insurance: 840,
        mpl: 480,
        others: 950,
        total_deduction: 6340,
        net_pay: "Not Paid",
    },
    {
        id: 6,
        full_name: "Ana Mendoza",
        monthly_pay: 28000,
        basic: 14500,
        holiday: 1800,
        total_gross_pay: 29000,
        cash_loan: 2000,
        sss: 1120,
        insurance: 840,
        mpl: 480,
        others: 950,
        total_deduction: 6340,
        net_pay: "Not Paid",
    },
    {
        id: 7,
        full_name: "Ana Mendoza",
        monthly_pay: 28000,
        basic: 14500,
        holiday: 1800,
        total_gross_pay: 29000,
        cash_loan: 2000,
        sss: 1120,
        insurance: 840,
        mpl: 480,
        others: 950,
        total_deduction: 6340,
        net_pay: "Not Paid",
    },
    {
        id: 8,
        full_name: "Ana Mendoza",
        monthly_pay: 28000,
        basic: 14500,
        holiday: 1800,
        total_gross_pay: 29000,
        cash_loan: 2000,
        sss: 1120,
        insurance: 840,
        mpl: 480,
        others: 950,
        total_deduction: 6340,
        net_pay: "Not Paid",
    },
    {
        id: 9,
        full_name: "Ana Mendoza",
        monthly_pay: 28000,
        basic: 14500,
        holiday: 1800,
        total_gross_pay: 29000,
        cash_loan: 2000,
        sss: 1120,
        insurance: 840,
        mpl: 480,
        others: 950,
        total_deduction: 6340,
        net_pay: "Not Paid",
    },
    {
        id: 10,
        full_name: "Ana Mendoza",
        monthly_pay: 28000,
        basic: 14500,
        holiday: 1800,
        total_gross_pay: 29000,
        cash_loan: 2000,
        sss: 1120,
        insurance: 840,
        mpl: 480,
        others: 950,
        total_deduction: 6340,
        net_pay: "Not Paid",
    },
    // {
    //     id: 11,
    //     full_name: "Ana Mendoza",
    //     monthly_pay: 28000,
    //     basic: 14500,
    //     holiday: 1800,
    //     total_gross_pay: 29000,
    //     cash_loan: 2000,
    //     sss: 1120,
    //     insurance: 840,
    //     mpl: 480,
    //     others: 950,
    //     total_deduction: 6340,
    //     net_pay: "Not Paid",
    // },
];

export default function TablePayroll({ tableFilter, setTableFilter }) {
    const { viewMode } = useContext(PagePayrollContext);
    const [currentPageData, setCurrentPageData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false); 
    const [selectedPayroll, setSelectedPayroll] = useState(null);

    // Memoize filteredData to prevent recalculation on every render
    const filteredData = useMemo(() => {
        return viewMode === "archive"
            ? []
            : PayrollData.filter((item) =>
                  item.full_name.toLowerCase().includes(tableFilter.search.toLowerCase())
              );
    }, [viewMode, tableFilter.search]);

    useEffect(() => {
        const start = (tableFilter.page - 1) * tableFilter.page_size;
        const end = start + tableFilter.page_size;
        setCurrentPageData(filteredData.slice(start, end));
    }, [tableFilter.page, tableFilter.page_size, filteredData]);

    const onChangeTable = (pagination) => {
        setTableFilter((prev) => ({
            ...prev,
            page: pagination.current,
            page_size: pagination.pageSize,
        }));
    };

    const handlePreview = (payroll) => {
        setSelectedPayroll(payroll);
        setIsModalVisible(true);
    };

    const handleClose = () => {
        setIsModalVisible(false);
        setSelectedPayroll(null);
    };




    return (
        <>
            <Col xs={24} sm={24} md={24} lg={24}>
                <Flex justify="space-between" align="center" className="tbl-bottom-filter">
                    <div className="flex space-x-4">
                        <TableGlobalSearchAnimated />
                    </div>
                    <div className="flex space-x-4 !mb-5">
                        <TableShowingEntriesV2 total={filteredData.length} />
                        <TablePagination
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            total={filteredData.length}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper="tbl_wrapper"
                        />
                    </div>
                </Flex>
            </Col>

            <Table
                id="tbl_payroll"
                className="ant-table-default ant-table-striped"
                dataSource={currentPageData}
                rowKey={(record) => record.id}
                pagination={false}
                bordered={false}
                onChange={onChangeTable}
                scroll={{ x: "max-content" }}
                sticky
            >
                <Table.Column
                    title="Action"
                    key="action"
                    dataIndex="action"
                    align="center"
                    render={(text, record) => (
                        <Flex gap={10} justify="center">
                           <Button
                            type="link"
                            className="w-auto h-auto p-0"
                            name="btn_payslip"
                            icon={<FontAwesomeIcon icon={faBook} />}
                            onClick={() => handlePreview(record)}
                        />
                        </Flex>
                    )}
                    width={150}
                />
                <Table.Column 
                    title="Full Name" 
                    key="full_name" 
                    dataIndex="full_name" 
                    width={220} />
                <Table.Column
                    title="Monthly Pay"
                    key="monthly_pay"
                    dataIndex="monthly_pay"
                    width={150}
                    render={(text) =>
                        new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                        }).format(text)
                    }
                />
                <Table.Column
                    title="Basic (bi-monthly)"
                    key="basic"
                    dataIndex="basic"
                    width={150}
                    render={(text) =>
                        new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                        }).format(text)
                    }
                />
                <Table.Column
                    title="Holiday"
                    key="holiday"
                    dataIndex="holiday"
                    width={150}
                    render={(text) =>
                        new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                        }).format(text)
                    }
                />
                <Table.Column
                    title="Total Gross Pay"
                    key="total_gross_pay"
                    dataIndex="total_gross_pay"
                    width={150}
                    render={(text) =>
                        new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                        }).format(text)
                    }
                />
                <Table.Column
                    title="Cash Loan"
                    key="cash_loan"
                    dataIndex="cash_loan"
                    width={150}
                    render={(text) =>
                        new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                        }).format(text)
                    }
                />
                <Table.Column
                    title="SSS"
                    key="sss"
                    dataIndex="sss"
                    width={150}
                    render={(text) =>
                        new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                        }).format(text)
                    }
                />
                <Table.Column
                    title="Insurance"
                    key="insurance"
                    dataIndex="insurance"
                    width={150}
                    render={(text) =>
                        new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                        }).format(text)
                    }
                />
                <Table.Column
                    title="MPL"
                    key="mpl"
                    dataIndex="mpl"
                    width={150}
                    render={(text) =>
                        new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                        }).format(text)
                    }
                />
                <Table.Column
                    title="Others"
                    key="others"
                    dataIndex="others"
                    width={150}
                    render={(text) =>
                        new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                        }).format(text)
                    }
                />
                <Table.Column
                    title="Total Deduction"
                    key="total_deduction"
                    dataIndex="total_deduction"
                    width={150}
                    render={(text) =>
                        new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                        }).format(text)
                    }
                />
                <Table.Column
                    title="Net Pay"
                    key="net_pay"
                    dataIndex="net_pay"
                    width={150}
                />
            </Table>
            <PayslipModal
                visible={isModalVisible}
                onClose={handleClose}
                payrollData={selectedPayroll}
            />
        </>
    );
}