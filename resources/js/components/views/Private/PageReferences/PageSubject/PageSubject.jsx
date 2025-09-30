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

export default function PageSubject(props) {
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
        sort_field: "name",
        sort_order: "asc",
        isTrash: 0,
    });

    useEffect(() => {
        return () => {};
    }, [activeTab]);

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/subject?${new URLSearchParams(tableFilter)}`,
        "subject_list"
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

    const { mutate: mutateDeleteSubject, isLoading: isLoadingDeleteSubject } =
        POST(`api/subject_archived`, "subject_list");

    const handleSelectedArchived = () => {
        let data = {
            isTrash: tableFilter.isTrash,
            ids: selectedRowKeys,
        };

        mutateDeleteSubject(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Subject",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Subject",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useTableScrollOnTop("tbl_subject", location);

    return (
        <Row id="tbl_wrapper_subject">
            <Col xs={24} sm={24} md={24} lg={14} xl={12}>
                <Row gutter={[20, 20]}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Button
                            icon={<FontAwesomeIcon icon={faPlus} />}
                            onClick={() =>
                                setToggleModalForm({
                                    open: true,
                                    data: null,
                                })
                            }
                            type="primary"
                        >
                            Add Subject
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
                                                    ? "subjects"
                                                    : "subject"}
                                                ?
                                            </>
                                        }
                                        okText="Yes"
                                        cancelText="No"
                                        onConfirm={() => {
                                            handleSelectedArchived();
                                        }}
                                        disabled={isLoadingDeleteSubject}
                                    >
                                        <Button
                                            name="btn_active_archive"
                                            loading={isLoadingDeleteSubject}
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
                                    tblIdWrapper="tbl_wrapper_subject"
                                />
                            </Flex>
                        </div>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Table
                            id="tbl_subject"
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
                                title="Subject"
                                key="code"
                                dataIndex="code"
                                sorter={true}
                                defaultSortOrder="ascend"
                                width={150}
                            />

                            <Table.Column
                                title="Subject Name"
                                key="name"
                                dataIndex="name"
                                sorter={true}
                                defaultSortOrder="ascend"
                            />

                            <Table.Column
                                title="Subject Description"
                                key="description"
                                dataIndex="description"
                                sorter={true}
                                defaultSortOrder="ascend"
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
                                    tblIdWrapper="tbl_wrapper_subject"
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
