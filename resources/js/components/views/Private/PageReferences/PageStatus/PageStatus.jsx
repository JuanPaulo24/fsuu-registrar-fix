import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Row, Button, Col, Table, notification, Popconfirm, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
    useTableScrollOnTop,
} from "../../../../providers/CustomTableFilter";
import ModalForm from "./components/ModalForm";
import notificationErrors from "../../../../providers/notificationErrors";

export default function PageStatus(props) {
    const { activeTab } = props;

    const location = useLocation();

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [toggleModalForm, setToggleModalForm] = useState({
        open: false,
        data: null,
    });

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        isTrash: 0,
    });

    useEffect(() => {
        return () => {};
    }, [activeTab]);

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/status?${new URLSearchParams(tableFilter)}`,
        "status_list"
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
        if (dataSource) {
            refetchSource();
        }

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    const { mutate: mutateDeleteStatus, isLoading: isLoadingDeleteStatus } =
        POST(`api/status_archived`, "status_list");

    const handleSelectedArchived = () => {
        let data = {
            isTrash: tableFilter.isTrash,
            ids: selectedRowKeys,
        };

        mutateDeleteStatus(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Status",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Status",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useTableScrollOnTop("tbl_status", location);

    return (
        <Row id="tbl_wrapper_status">
            <Col xs={24} sm={24} md={24} lg={14} xl={12}>
                <Row gutter={[20, 20]}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Button
                            type="primary"
                            icon={<FontAwesomeIcon icon={faPlus} />}
                            onClick={() =>
                                setToggleModalForm({
                                    open: true,
                                    data: null,
                                })
                            }
                        >
                            Add Status
                        </Button>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <div className="tbl-top-filter">
                            <Flex gap={15}>
                                <Button
                                    className={`min-w-150 ${
                                        tableFilter.isTrash === 0
                                            ? "active"
                                            : ""
                                    }`}
                                    type={
                                        tableFilter.isTrash === 0
                                            ? "primary"
                                            : ""
                                    }
                                    onClick={() => {
                                        setTableFilter((ps) => ({
                                            ...ps,
                                            isTrash: 0,
                                        }));
                                        setSelectedRowKeys([]);
                                    }}
                                >
                                    Active
                                </Button>

                                <Button
                                    className={`min-w-150 ${
                                        tableFilter.isTrash === 1
                                            ? "active"
                                            : ""
                                    }`}
                                    type={
                                        tableFilter.isTrash === 1
                                            ? "primary"
                                            : ""
                                    }
                                    onClick={() => {
                                        setTableFilter((ps) => ({
                                            ...ps,
                                            isTrash: 1,
                                        }));
                                        setSelectedRowKeys([]);
                                    }}
                                >
                                    Archived
                                </Button>
                            </Flex>

                            <TablePageSize
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        </div>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <div className="tbl-top-filter">
                            <Flex gap={15}>
                                <TableGlobalSearchAnimated
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                />
                                {selectedRowKeys.length > 0 && (
                                    <Popconfirm
                                        title={
                                            <>
                                                Are you sure you want to
                                                <br />
                                                {tableFilter.isTrash === 0
                                                    ? "archive"
                                                    : "restore"}{" "}
                                                the selected{" "}
                                                {selectedRowKeys.length > 1
                                                    ? "statuses"
                                                    : "status"}
                                                ?
                                            </>
                                        }
                                        okText="Yes"
                                        cancelText="No"
                                        onConfirm={() => {
                                            handleSelectedArchived();
                                        }}
                                        disabled={isLoadingDeleteStatus}
                                    >
                                        <Button
                                            name="btn_active_archive"
                                            loading={isLoadingDeleteStatus}
                                            danger={tableFilter.isTrash === 0}
                                            type="primary"
                                            className={
                                                tableFilter.isTrash === 1
                                                    ? "btn-success"
                                                    : ""
                                            }
                                        >
                                            {tableFilter.isTrash === 0
                                                ? "ARCHIVE"
                                                : "RESTORE"}{" "}
                                            SELECTED
                                        </Button>
                                    </Popconfirm>
                                )}
                            </Flex>

                            <Flex>
                                <TableShowingEntriesV2 />
                                <TablePagination
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    total={dataSource?.data.total}
                                    showLessItems={true}
                                    showSizeChanger={false}
                                    tblIdWrapper="tbl_wrapper_status"
                                />
                            </Flex>
                        </div>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Table
                            id="tbl_status"
                            className="ant-table-default ant-table-striped"
                            dataSource={dataSource && dataSource.data.data}
                            rowKey={(record) => record.id}
                            pagination={false}
                            bordered={false}
                            onChange={onChangeTable}
                            scroll={{ x: "max-content" }}
                            sticky
                            rowSelection={{
                                selectedRowKeys,
                                onChange: (selectedRowKeys) => {
                                    setSelectedRowKeys(selectedRowKeys);
                                },
                            }}
                        >
                            <Table.Column
                                title="Action"
                                key="action"
                                dataIndex="action"
                                align="center"
                                width={100}
                                render={(text, record) => {
                                    return (
                                        <Flex justify="center">
                                            <Button
                                                type="link"
                                                className="color-1"
                                                onClick={() =>
                                                    setToggleModalForm({
                                                        open: true,
                                                        data: record,
                                                    })
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faPencil}
                                                />
                                            </Button>
                                        </Flex>
                                    );
                                }}
                            />

                            <Table.Column
                                title="Status"
                                key="status"
                                dataIndex="status"
                                sorter={true}
                            />
                            <Table.Column
                                title="Status Category"
                                key="status_category"
                                dataIndex="status_category"
                                sorter={true}
                            />
                            <Table.Column
                                title="Code"
                                key="code"
                                dataIndex="code"
                                sorter={true}
                            />
                        </Table>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <div className="tbl-bottom-filter">
                            <div />

                            <Flex>
                                <TableShowingEntriesV2 />
                                <TablePagination
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    total={dataSource?.data.total}
                                    showLessItems={true}
                                    showSizeChanger={false}
                                    tblIdWrapper="tbl_wrapper_status"
                                />
                            </Flex>
                        </div>
                    </Col>
                </Row>
            </Col>

            <ModalForm
                toggleModalForm={toggleModalForm}
                setToggleModalForm={setToggleModalForm}
            />
        </Row>
    );
}
