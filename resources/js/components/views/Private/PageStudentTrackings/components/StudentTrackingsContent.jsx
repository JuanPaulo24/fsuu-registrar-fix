import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Flex, Card, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../../providers/useAxiosQuery";
import PageStudentTrackingsContext from "./PageStudentTrackingsContext";
import TableStudentTrackings from "./TableStudentTrackings";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
    useTableScrollOnTop,
} from "../../../../providers/CustomTableFilter";

export default function StudentTrackingsContent() {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        status: "Active",
        from: location.pathname,
    });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/profile?${new URLSearchParams(tableFilter)}`,
        "student_trackings_list"
    );

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((prevState) => ({
            ...prevState,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    useTableScrollOnTop("tbl_student_trackings", location);

    return (
        <PageStudentTrackingsContext.Provider
            value={{
                dataSource,
                onChangeTable,
                tableFilter,
                setTableFilter,
                selectedRowKeys,
                setSelectedRowKeys,
                refetch: refetchSource,
            }}
        >
            <Card>
                <Row gutter={[20, 20]} id="tbl_wrapper">
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Flex
                            gap={16}
                            wrap="wrap"
                            align="center"
                            className="tbl-top-controls"
                            style={{ marginBottom: 16 }}
                        >
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <TableGlobalSearchAnimated
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                />
                            </div>
                            
                            <Button
                                type="default"
                                size="middle"
                                icon={<FontAwesomeIcon icon={faRefresh} />}
                                onClick={() => refetchSource()}
                                title="Refresh table data"
                                className="table-refresh-btn"
                            />
                            
                            <TablePageSize
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        </Flex>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24}>
                        <TableStudentTrackings />
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Flex
                            justify="space-between"
                            align="center"
                            className="tbl-bottom-filter"
                        >
                            <div />

                            <Flex align="center">
                                <TableShowingEntriesV2 />
                                <TablePagination
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    total={dataSource?.data?.total || 0}
                                    showLessItems={true}
                                    showSizeChanger={false}
                                    tblIdWrapper="tbl_wrapper"
                                />
                            </Flex>
                        </Flex>
                    </Col>
                </Row>
            </Card>
        </PageStudentTrackingsContext.Provider>
    );
}
