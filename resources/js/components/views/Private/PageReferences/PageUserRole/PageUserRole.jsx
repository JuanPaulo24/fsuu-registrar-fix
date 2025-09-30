import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Row, Button, Col, Table, notification, Popconfirm, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus, faTrash } from "@fortawesome/pro-regular-svg-icons";

import { DELETE, GET } from "../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
    useTableScrollOnTop,
} from "../../../../providers/CustomTableFilter";
import ModalForm from "./components/ModalForm";
import notificationErrors from "../../../../providers/notificationErrors";

export default function PageUserRole(props) {
    const { activeTab } = props;

    const location = useLocation();

    const [toggleModalForm, setToggleModalForm] = useState({
        open: false,
        data: null,
    });

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "role",
        sort_order: "asc",
        status: "Active",
    });

    useEffect(() => {
        return () => {};
    }, [activeTab]);

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/user_role?${new URLSearchParams(tableFilter)}`,
        "user_role_list"
    );

    const onChangeTable = (pagination, filter, sorter) => {
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

    const { mutate: mutateDeleteUserRole, isLoading: isLoadingDeleteUserRole } =
        DELETE(`api/user_role`, "user_role_list");

    const handleDelete = (record) => {
        mutateDeleteUserRole(record, {
            onSuccess: (res) => {
                console.log("res", res);
                if (res.success) {
                    notification.success({
                        message: "User Role",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "User Role",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useTableScrollOnTop("tbl_user_role", location);

    return (
        <Row id="tbl_wrapper_user_role">
            <Col xs={24} sm={24} md={24} lg={14} xl={12}>
                <Row gutter={[20, 20]}>
                    <Col xs={24} sm={24} md={24}>
                        <div className="tbl-top-filter">
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
                                Add User Role
                            </Button>

                            <TablePageSize
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        </div>
                    </Col>

                    <Col xs={24} sm={24} md={24}>
                        <div className="tbl-top-filter">
                            <TableGlobalSearchAnimated
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />

                            <Flex>
                                <TableShowingEntriesV2 />
                                <TablePagination
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    total={dataSource?.data.total}
                                    showLessItems={true}
                                    showSizeChanger={false}
                                    tblIdWrapper="tbl_wrapper_user_role"
                                />
                            </Flex>
                        </div>
                    </Col>

                    <Col xs={24} sm={24} md={24}>
                        <Table
                            id="tbl_user_role"
                            className="ant-table-default ant-table-striped"
                            dataSource={dataSource && dataSource.data.data}
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
                                width={100}
                                render={(text, record) => {
                                    return (
                                        <Flex gap={10} justify="center">
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
                                            <Popconfirm
                                                title="Are you sure to delete this data?"
                                                onConfirm={() => {
                                                    handleDelete(record);
                                                }}
                                                onCancel={() => {
                                                    notification.error({
                                                        message: "User Role",
                                                        description:
                                                            "Data not deleted",
                                                    });
                                                }}
                                                okText="Yes"
                                                cancelText="No"
                                                disabled={
                                                    isLoadingDeleteUserRole
                                                }
                                            >
                                                <Button
                                                    type="link"
                                                    className="text-danger"
                                                    loading={
                                                        isLoadingDeleteUserRole
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faTrash}
                                                    />
                                                </Button>
                                            </Popconfirm>
                                        </Flex>
                                    );
                                }}
                            />
                            <Table.Column
                                title="Type"
                                key="type"
                                dataIndex="type"
                                sorter={true}
                                defaultSortOrder="ascend"
                            />
                            <Table.Column
                                title="Role"
                                key="role"
                                dataIndex="role"
                                sorter={true}
                                defaultSortOrder="ascend"
                            />
                        </Table>
                    </Col>

                    <Col xs={24} sm={24} md={24}>
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
                                    tblIdWrapper="tbl_wrapper_user_role"
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
