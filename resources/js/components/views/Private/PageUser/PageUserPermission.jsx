import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Row,
    Col,
    Button,
    Table,
    Space,
    Switch,
    notification,
    Tabs,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faCheck,
    faMicrochip,
    faXmark,
} from "@fortawesome/pro-regular-svg-icons";

import { GET, POST } from "../../../providers/useAxiosQuery";
import notificationErrors from "../../../providers/notificationErrors";

export default function PageUserPermission() {
    const params = useParams();
    const navigate = useNavigate();

    const [tableFilter, setTableFilter] = useState({
        user_id: params.id,
        system_id: 1,
    });

    const { data: dataPermissions, refetch: refetchPermissions } = GET(
        `api/user_permission?${new URLSearchParams(tableFilter)}`,
        `user_permission_list_${params.id}`
    );

    useEffect(() => {
        refetchPermissions();

        return () => {};
    }, [tableFilter]);

    const { mutate: mutateChangeStatus, isLoading: loadingChangeStatus } = POST(
        `api/user_permission_status`,
        `user_permission_list_${params.id}`
    );

    const handleChangeStatus = (e, item) => {
        let data = {
            user_permission_id: item.user_permission_id,
            status: e ? "1" : "0",
            user_id: params.id,
            mod_button_id: item.id,
        };

        mutateChangeStatus(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "User Permission",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "User Permission",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    const RenderTable = () => {
        return (
            <Table
                className="ant-table-default"
                dataSource={dataPermissions && dataPermissions.data}
                rowKey={(record) => record.id}
                bordered={false}
            >
                <Table.Column
                    title="Module Name"
                    key="module_name"
                    dataIndex="module_name"
                    sorter
                />

                <Table.Column
                    title="Buttons"
                    key="buttons"
                    render={(_, record) => {
                        return (
                            <Space direction="vertical">
                                {record.module_buttons.map((item, index) => {
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
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
                                                    item.status ? true : false
                                                }
                                                onChange={(e) =>
                                                    handleChangeStatus(e, item)
                                                }
                                                loading={loadingChangeStatus}
                                            />{" "}
                                            <span>{item.mod_button_name}</span>
                                        </div>
                                    );
                                })}
                            </Space>
                        );
                    }}
                />
            </Table>
        );
    };

    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Button
                    key={1}
                    className=" btn-main-primary btn-main-invert-outline b-r-none"
                    icon={<FontAwesomeIcon icon={faArrowLeft} />}
                    onClick={() => navigate(-1)}
                >
                    Back to list
                </Button>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Tabs
                    defaultActiveKey="0"
                    type="card"
                    onChange={(key) => {
                        console.log("key", key);
                        setTableFilter((ps) => ({ ...ps, system_id: key }));
                    }}
                    items={[
                        {
                            key: "1",
                            label: "OPIS",
                            icon: <FontAwesomeIcon icon={faMicrochip} />,
                            children: <RenderTable />,
                        },
                        {
                            key: "2",
                            label: "Faculty Monitoring",
                            icon: <FontAwesomeIcon icon={faMicrochip} />,
                            children: <RenderTable />,
                        },
                        {
                            key: "3",
                            label: "Guidance",
                            icon: <FontAwesomeIcon icon={faMicrochip} />,
                            children: <RenderTable />,
                        },
                    ]}
                />
            </Col>
        </Row>
    );
}
