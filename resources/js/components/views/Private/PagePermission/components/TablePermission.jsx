import { useEffect, useState } from "react";
import { Button, Col, Flex, notification, Row, Switch, Table, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faXmark } from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../../providers/useAxiosQuery";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../providers/CustomTableFilter";
import FloatSelect from "../../../../providers/FloatSelect";
import ModalFormModule from "./ModalFormModule";
import notificationErrors from "../../../../providers/notificationErrors";

export default function TablePermission(props) {
    const { tabParentActive, systemId, userRoleId } = props;

    const [toggleModalModule, setToggleModalModule] = useState({
        open: false,
        data: null,
    });

    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "module_code",
        sort_order: "asc",
        tab_parent_active: tabParentActive ?? "",
        system_id: systemId ?? "",
        user_role_id: userRoleId ?? "",
        user_id: "",
    });

    () => {
        setTableFilter((ps) => ({
            ...ps,
            tab_parent_active: tabParentActive ?? "",
            system_id: systemId ?? "",
            user_role_id: userRoleId ?? "",
            user_id: "",
        }));

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },
        [tabParentActive, systemId, userRoleId];

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/module?${new URLSearchParams(tableFilter)}`,
        `module_list_${tableFilter.system_id}`
    );

    useEffect(() => {
        refetchSource();

        return () => {};
    }, [tableFilter]);

    const { data: dataUsers } = GET(
        "api/users?user_role_ids=1,2,3,4,5",
        "users_select",
        (res) => {},
        false
    );

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((ps) => ({
            ...ps,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    const { mutate: mutateChangeStatus, isLoading: isLoadingChangeStatus } =
        POST(
            `api/module_update_permission_status`,
            `module_list_${tableFilter.system_id}`
        );

    const handleChangeStatus = (e, values) => {
        let error = false;

        let title = "User Role";

        if (tableFilter.tab_parent_active === "Users") {
            title = "User";

            if (!tableFilter.user_id) {
                error = true;
                notification.error({
                    message: "User Permission",
                    description: "Please select user",
                });
            }
        }

        let data = {
            ...tableFilter,
            mod_button_id: values.id,
            status: e ? "1" : "0",
        };

        if (!error) {
            mutateChangeStatus(data, {
                onSuccess: (res) => {
                    if (res.success) {
                        notification.success({
                            message: `${title} Permission`,
                            description: res.message,
                        });
                    } else {
                        notification.error({
                            message: `${title} Permission`,
                            description: res.message,
                        });
                    }
                },
                onError: (err) => {
                    notificationErrors(err);
                },
            });
        }
    };

    const {
        mutate: mutateMultiChangeStatus,
        isLoading: isLoadingMultiChangeStatus,
    } = POST(
        `api/module_multi_update_permission_status`,
        `module_list_${tableFilter.system_id}`
    );

    const handleMultiChangeStatus = (e, values) => {
        let error = false;

        let title = "User Role";

        if (tableFilter.tab_parent_active === "Users") {
            title = "User";

            if (!tableFilter.user_id) {
                error = true;
                notification.error({
                    message: "User Permission",
                    description: "Please select user",
                });
            }
        }

        let data = {
            ...tableFilter,
            module_buttons: values,
            status: e ? "1" : "0",
        };

        if (!error) {
            mutateMultiChangeStatus(data, {
                onSuccess: (res) => {
                    if (res.success) {
                        notification.success({
                            message: `${title} Permission`,
                            description: res.message,
                        });
                    } else {
                        notification.error({
                            message: `${title} Permission`,
                            description: res.message,
                        });
                    }
                },
                onError: (err) => {
                    notificationErrors(err);
                },
            });
        }
    };

    return (
        <Row gutter={[20, 20]} id={`tbl_wrapper_permission_${systemId}`}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <div className="tbl-top-filter">
                    <div style={{ width: 250 }}>
                        {tabParentActive === "Module" && (
                            <Button
                                icon={<FontAwesomeIcon icon={faPlus} />}
                                type="primary"
                                onClick={() =>
                                    setToggleModalModule({
                                        open: true,
                                        data: null,
                                    })
                                }
                            >
                                Module
                            </Button>
                        )}

                        {tabParentActive === "Users" && (
                            <FloatSelect
                                label="User"
                                placeholder="User"
                                value={tableFilter.user_id ?? null}
                                options={
                                    dataUsers && dataUsers.data
                                        ? dataUsers.data.map((item) => ({
                                              value: item.id,
                                              label: item.fullname,
                                          }))
                                        : []
                                }
                                onChange={(value) => {
                                    setTableFilter((ps) => ({
                                        ...ps,
                                        user_id: value ?? "",
                                    }));
                                }}
                            />
                        )}
                    </div>

                    <TablePageSize
                        tableFilter={tableFilter}
                        setTableFilter={setTableFilter}
                    />
                </div>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
                            total={dataSource?.data?.total}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper={`tbl_wrapper_user_role_permission_${tableFilter.user_role_id}`}
                        />
                    </Flex>
                </div>
            </Col>

            <Col xs={24} sm={24} md={24}>
                <Table
                    className="ant-table-default ant-table-striped"
                    dataSource={
                        dataSource && dataSource.data && dataSource.data.data
                    }
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
                                <Flex
                                    vertical={
                                        tabParentActive === "Module"
                                            ? false
                                            : true
                                    }
                                    gap={10}
                                >
                                    {record.module_buttons.length > 0 && (
                                        <>
                                            {tabParentActive !== "Module" && (
                                                <Flex gap={10} key={0}>
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
                                                        checked={
                                                            record.module_buttons.filter(
                                                                (x) => x.status
                                                            ).length ===
                                                            record
                                                                .module_buttons
                                                                .length
                                                                ? true
                                                                : false
                                                        }
                                                        onChange={(e) =>
                                                            handleMultiChangeStatus(
                                                                e,
                                                                record.module_buttons
                                                            )
                                                        }
                                                        loading={
                                                            isLoadingChangeStatus ||
                                                            isLoadingMultiChangeStatus
                                                        }
                                                    />
                                                    <span>ALL</span>
                                                </Flex>
                                            )}

                                            {record.module_buttons.map(
                                                (item, index) => {
                                                    if (
                                                        tabParentActive ===
                                                        "Module"
                                                    ) {
                                                        return (
                                                            <Tag>
                                                                {
                                                                    item.mod_button_name
                                                                }
                                                            </Tag>
                                                        );
                                                    } else {
                                                        return (
                                                            <Flex
                                                                gap={10}
                                                                key={index}
                                                            >
                                                                <Switch
                                                                    checkedChildren={
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                faCheck
                                                                            }
                                                                        />
                                                                    }
                                                                    unCheckedChildren={
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                faXmark
                                                                            }
                                                                        />
                                                                    }
                                                                    checked={
                                                                        item.status
                                                                            ? true
                                                                            : false
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleChangeStatus(
                                                                            e,
                                                                            item
                                                                        )
                                                                    }
                                                                    loading={
                                                                        isLoadingChangeStatus ||
                                                                        isLoadingMultiChangeStatus
                                                                    }
                                                                />
                                                                <span>
                                                                    {
                                                                        item.mod_button_name
                                                                    }
                                                                </span>
                                                            </Flex>
                                                        );
                                                    }
                                                }
                                            )}
                                        </>
                                    )}
                                </Flex>
                            );
                        }}
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
                            total={dataSource?.data?.total}
                            showLessItems={true}
                            showSizeChanger={false}
                            tblIdWrapper={`tbl_wrapper_user_role_permission_${tableFilter.user_role_id}`}
                        />
                    </Flex>
                </div>
            </Col>

            <ModalFormModule
                toggleModalModule={toggleModalModule}
                setToggleModalModule={setToggleModalModule}
                systemId={tableFilter.system_id}
            />
        </Row>
    );
}
