import { useContext, useState, useEffect } from "react";
import { Button, Col, Row, Input, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import { TablePageSize } from "../../../../../providers/CustomTableFilter";

import PagePayrollContext from "./PagePayrollContext";
import TablePayroll from "./TablePayroll";
import ModalFormPayroll from "./ModalFormPayroll";

export default function PagePayrollContent() {
    const { viewMode, setViewMode, toggleModalForm, setToggleModalForm } =
        useContext(PagePayrollContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 10,
        search: "",
    });

    useEffect(() => {
        if (tableFilter.search !== searchTerm) {
            setTableFilter((prev) => ({
                ...prev,
                search: searchTerm,
                page: 1, 
            }));
        }
    }, [searchTerm, tableFilter.search]);

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} md={24} lg={24} xl={24}>
                <Button
                    type="primary"
                    onClick={() => setToggleModalForm({ open: true, data: null })}
                    icon={<FontAwesomeIcon icon={faPlus} />}
                >
                    Add Payroll
                </Button>
                <Flex
                    justify="space-between"
                    align="center"
                    style={{ marginTop: 10 }}
                >
                    <div>
                        <Button
                            type={viewMode === "active" ? "secondary" : "default"}
                            onClick={() => setViewMode("active")}
                            style={{ marginRight: 8 }}
                        >
                            Active
                        </Button>
                        <Button
                            type={viewMode === "archive" ? "secondary" : "default"}
                            onClick={() => setViewMode("archive")}
                        >
                            Archive
                        </Button>
                    </div>
                    <TablePageSize
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                </Flex>

            </Col>

            <Col xs={24} md={24} lg={24} xl={24}>
                <TablePayroll tableFilter={tableFilter} setTableFilter={setTableFilter} />
            </Col>

            <ModalFormPayroll />
        </Row>
    );
}