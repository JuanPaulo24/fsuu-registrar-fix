import { useNavigate } from "react-router-dom";
import { Table, Button, notification, Popconfirm, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
    faNewspaper,
    faRotateLeft,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { POST } from "../../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../../providers/notificationErrors";

import PageDonationsData from "./PageDonationsData.json";
import PageDonationsContext from "./PageDonationsContext";

export default function TableDonations(props) {
    const {
        dataSource,
        tableFilter,
        setTableFilter,
        selectedRowKeys,
        setSelectedRowKeys,
        status, // Get status prop
    } = props;

    const navigate = useNavigate();

    const { mutate: mutateDeactivateUser, loading: loadingDeactivateUser } =
        POST(`api/user_deactivate`, "users_active_list");

    const { mutate: mutateRestoreUser, loading: loadingRestoreUser } =
        POST(`api/user_restore`, "users_archive_list");

    const handleDeactivate = (record) => {
        mutateDeactivateUser(record, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Donation",
                        description: "Donation moved to Archive",
                    });
                } else {
                    notification.error({
                        message: "Donation",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const handleRestore = (record) => {
        mutateRestoreUser(record, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Donation",
                        description: "Donation restored successfully",
                    });
                } else {
                    notification.error({
                        message: "Donation",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((ps) => ({
            ...ps,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    return (
        <Table
            id="tbl_user"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            sticky
        >
            <Table.Column
                title="Actions"
                key="actions"
                dataIndex="actions"
                align="center"
                render={(text, record) => {
                    return (
                        <Flex gap={10} justify="center">
                            {status === "Active" ? (
                                <Popconfirm
                                    title="Are you sure to archive this donation?"
                                    onConfirm={() => handleDeactivate(record)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        type="link"
                                        className="w-auto h-auto p-0 text-danger"
                                        loading={loadingDeactivateUser}
                                        name="btn_delete"
                                        icon={<FontAwesomeIcon icon={faNewspaper} />}
                                    />
                                </Popconfirm>
                            ) : (
                                <Popconfirm
                                    title="Are you sure to restore this donation?"
                                    onConfirm={() => handleRestore(record)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        type="link"
                                        className="w-auto h-auto p-0 text-success"
                                        loading={loadingRestoreUser}
                                        name="btn_restore"
                                        icon={<FontAwesomeIcon icon={faRotateLeft} />}
                                    />
                                </Popconfirm>
                            )}
                        </Flex>
                    );
                }}
                width={150}
            />
            <Table.Column title="Name" key="referenceNo" dataIndex="referenceNo" align="center" sorter={true} width={150} />
            <Table.Column title="Date" key="created_at" dataIndex="created_at" align="center" render={(text) => text ? dayjs(text).format("MM/DD/YYYY") : ""} sorter width={150} />
            <Table.Column title="Type of Donation" key="typeOfDonation" dataIndex="typeOfDonation" sorter align="center" width={220} />
            <Table.Column title="Amount" key="amount" dataIndex="amount" sorter align="center" width={220} />
        </Table>
    );
}
