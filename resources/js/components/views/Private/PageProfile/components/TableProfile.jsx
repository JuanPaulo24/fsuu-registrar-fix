import { useContext, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Table, Flex, Popconfirm, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faEye } from "@fortawesome/pro-regular-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";
import PageProfileContext from "./PageProfileContext";
import { hasButtonPermission } from "@/hooks/useButtonPermissions";

export default function TableProfile(props) {
    const {
        dataSource,
        onChangeTable,
        tableFilter,
        setTableFilter,
        selectedRowKeys,
        setSelectedRowKeys,
        setToggleModalForm,
    } = useContext(PageProfileContext);

    const navigate = useNavigate();
    const location = useLocation();

    const { mutate: mutateDeactivateProfile, isLoading: loadingDeactivateProfile } =
        POST(`api/profile_deactivate`, "profiles_active_list");

    const handleDeactivate = (record) => {
        mutateDeactivateProfile(record, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Profile",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Profile",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    // Check if user has view permission
    const hasViewPermission = useMemo(() => {
        return hasButtonPermission('M-02-VIEW');
    }, []);

    return (
        <Table
            id="tbl_profile"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource && dataSource.data && dataSource.data.data}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            sticky
        >
            {hasViewPermission && (
                <Table.Column
                    title="Action"
                    key="action"
                    dataIndex="action"
                    align="center"
                    render={(text, record) => {
                        return (
                            <Flex gap={10} justify="center">
                                <Button
                                    type="link"
                                    className="w-auto h-auto p-0"
                                    onClick={() => {
                                        navigate(`/student-profile/view/${record.user?.uuid || record.id}`);
                                    }}
                                    name="btn_view"
                                    icon={<FontAwesomeIcon icon={faEye} />}
                                />
                            </Flex>
                        );
                    }}
                    width={100}
                />
            )}

            <Table.Column
                title="School ID"
                key="id_number"
                dataIndex="id_number"
                sorter={true}
                width={150}
            />
            <Table.Column
                title="Full Name"
                key="fullname"
                dataIndex="fullname"
                sorter={true}
                width={250}
            />
            <Table.Column
                title="Gender"
                key="gender"
                dataIndex="gender"
                sorter={true}
                align="center"
                width={120}
            />
            <Table.Column
                title="Course"
                key="course"
                dataIndex="course"
                sorter={true}
                width={150}
            />
            <Table.Column
                title="Citizenship"
                key="citizenship"
                dataIndex="citizenship"
                sorter={true}
                width={150}
            />
        </Table>
    );
}
