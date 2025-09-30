import { useEffect, useState } from "react";
import { Row, Button, Col, Table, notification, Popconfirm, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus, faTrash } from "@fortawesome/pro-regular-svg-icons";

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
import PageCourseContext from "./components/PageCourseContext";

export default function PageCourse(props) {
    const { activeTab } = props;

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [toggleModalForm, setToggleModalForm] = useState({
        open: false,
        data: null,
    });

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "course_name",
        sort_order: "asc",
        isTrash: 0,
    });

    useEffect(() => {
        return () => {};
    }, [activeTab]);

    const { data: dataDepartment } = GET(
        `api/department`,
        "department_dropdown",
        (res) => {},
        false
    );

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/course?${new URLSearchParams(tableFilter)}`,
        "course_list"
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

    const { mutate: mutateDeleteCourse, isLoading: isLoadingDeleteCourse } =
        POST(`api/course_archived`, "course_list");

    const handleSelectedArchived = () => {
        let data = {
            isTrash: tableFilter.isTrash,
            ids: selectedRowKeys,
        };

        mutateDeleteCourse(data, {
            onSuccess: (res) => {
                if (res.success) {
                                notification.success({
                                    message: "Program",
                                    description: res.message,
                                });
                            } else {
                                notification.error({
                                    message: "Program",
                                    description: res.message,
                                });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useTableScrollOnTop("tbl_course", location);

    return (
        <PageCourseContext.Provider
            value={{
                dataSource,
                toggleModalForm,
                setToggleModalForm,
                tableFilter,
                setTableFilter,
                dataDepartment:
                    dataDepartment && dataDepartment.data
                        ? dataDepartment.data
                        : [],
            }}
        >
            <Row id="tbl_wrapper_course">
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
                                Add Program
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
                                        onClick={() => {
                                            setTableFilter((ps) => ({
                                                ...ps,
                                                isTrash: 0,
                                            }));
                                            setSelectedRowKeys([]);
                                        }}
                                        type={
                                            tableFilter.isTrash === 0
                                                ? "primary"
                                                : ""
                                        }
                                    >
                                        Active
                                    </Button>

                                    <Button
                                        className={`min-w-150 ${
                                            tableFilter.isTrash === 1
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            setTableFilter((ps) => ({
                                                ...ps,
                                                isTrash: 1,
                                            }));
                                            setSelectedRowKeys([]);
                                        }}
                                        type={
                                            tableFilter.isTrash == 1
                                                ? "primary"
                                                : ""
                                        }
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
                                                        ? "programs"
                                                        : "Program"}
                                                    ?
                                                </>
                                            }
                                            okText="Yes"
                                            cancelText="No"
                                            onConfirm={() => {
                                                handleSelectedArchived();
                                            }}
                                            disabled={isLoadingDeleteCourse}
                                        >
                                            <Button
                                                name="btn_active_archive"
                                                loading={isLoadingDeleteCourse}
                                                danger={
                                                    tableFilter.isTrash === 0
                                                }
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
                                        tblIdWrapper="tbl_wrapper_course"
                                    />
                                </Flex>
                            </div>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                            <Table
                                id="tbl_course"
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
                                    width={150}
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
                                    title="Program Code"
                                    key="course_code"
                                    dataIndex="course_code"
                                    sorter={true}
                                    width={150}
                                    defaultSortOrder="ascend"
                                />
                                <Table.Column
                                    title="Program Name"
                                    key="course_name"
                                    dataIndex="course_name"
                                    sorter={true}
                                    width={150}
                                />
                                <Table.Column
                                    title="Department"
                                    key="department"
                                    dataIndex="department"
                                    sorter={true}
                                    width={150}
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
                                        tblIdWrapper="tbl_wrapper_course"
                                    />
                                </Flex>
                            </div>
                        </Col>
                    </Row>
                </Col>

                <ModalForm />
            </Row>
        </PageCourseContext.Provider>
    );
}
