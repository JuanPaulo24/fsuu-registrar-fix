import { Row, Col, Table, Space, Switch, notification } from "antd";
import {
    TableGlobalSearch,
    TablePageSize,
    TablePagination,
    TableShowingEntries,
} from "../../../providers/CustomTableFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/pro-regular-svg-icons";
import { POST } from "../../../providers/useAxiosQuery";

export default function TableUserRolePermission(props) {
    const { dataSource, tableFilter, setTableFilter } = props;

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((ps) => ({
            ...ps,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    const { mutate: mutateChangeStatus, loading: loadingChangeStatus } = POST(
        `api/user_role_permission`,
        "user_role_permission_list"
    );

    const handleChangeStatus = (e, values) => {
        if (tableFilter.user_role_id) {
            let data = {
                user_role_id: tableFilter.user_role_id,
                mod_button_id: values.id,
                status: e ? "1" : "0",
            };

            mutateChangeStatus(data, {
                onSuccess: (res) => {
                    if (res.success) {
                        notification.success({
                            message: "User Role Permission",
                            description: res.message,
                        });
                    } else {
                        notification.error({
                            message: "User Role Permission",
                            description: res.message,
                        });
                    }
                },
                onError: (err) => {
                    notification.error({
                        message: "User Role Permission",
                        description: "Something went wrong",
                    });
                },
            });
        } else {
            notification.error({
                message: "User Role Permission",
                description: "Please select Role",
            });
        }
    };

    return (
        <Row
            gutter={[12, 12]}
            id={`tbl_wrapper_user_role_permission_${tableFilter.user_role_id}`}
        >
            <Col xs={24} sm={24} md={24}>
                <div className="tbl-top-filter">
                    <TablePageSize
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                    <TableGlobalSearch
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                </div>
            </Col>
            <Col xs={24} sm={24} md={24}>
                <Table
                    className="ant-table-default ant-table-striped"
                    dataSource={dataSource && dataSource.data.data}
                    rowKey={(record) => record.id}
                    pagination={false}
                    bordered={false}
                    onChange={onChangeTable}
                    scroll={{ x: "max-content" }}
                >
                    <Table.Column
                        title="Module Code"
                        key="module_code"
                        dataIndex="module_code"
                        sorter={true}
                    />

                    <Table.Column
                        title="Module Name"
                        key="module_name"
                        dataIndex="module_name"
                        sorter={true}
                    />

                    <Table.Column
                        title="Description"
                        key="description"
                        dataIndex="description"
                        sorter={true}
                    />

                    <Table.Column
                        title="Buttons"
                        key="buttons"
                        render={(_, record) => {
                            return (
                                <Space direction="vertical">
                                    {record.module_buttons.map(
                                        (item, index) => {
                                            let status = false;
                                            if (
                                                item.user_role_permissions
                                                    .length
                                            ) {
                                                let user_role_permissions =
                                                    item
                                                        .user_role_permissions[0]
                                                        .status;
                                                status =
                                                    parseInt(
                                                        user_role_permissions
                                                    ) === 1
                                                        ? true
                                                        : false;
                                            }
                                            return (
                                                <span key={index}>
                                                    <Switch
                                                        checkedChildren={
                                                            <FontAwesomeIcon
                                                                icon={faCheck}
                                                            />
                                                        }
                                                        unCheckedChildren={
                                                            <FontAwesomeIcon
                                                                icon={faXmark}
                                                            />
                                                        }
                                                        checked={status}
                                                        onChange={(e) =>
                                                            handleChangeStatus(
                                                                e,
                                                                item
                                                            )
                                                        }
                                                        loading={
                                                            loadingChangeStatus
                                                        }
                                                    />{" "}
                                                    {item.mod_button_name}
                                                </span>
                                            );
                                        }
                                    )}
                                </Space>
                            );
                        }}
                    />
                </Table>
            </Col>
            <Col xs={24} sm={24} md={24}>
                <div className="tbl-bottom-filter">
                    <TableShowingEntries />
                    <TablePagination
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                        total={dataSource?.data.total}
                        showLessItems={true}
                        showSizeChanger={false}
                        tblIdWrapper={`tbl_wrapper_user_role_permission_${tableFilter.user_role_id}`}
                    />
                </div>
            </Col>
        </Row>
    );
}
