import { Row, Col, Tabs } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrochip } from "@fortawesome/pro-regular-svg-icons";

import { GET } from "../../../providers/useAxiosQuery";
import { useState } from "react";
import TabSystem from "./components/TabSystem";

export default function PagePermission() {
    const [tabParentActive, setTabParentActive] = useState("Module");
    const [selectedUserRoleId, setSelectedUserRoleId] = useState("1");

    const { data: dataRole } = GET(
        "api/user_role?sort_field=id&sort_order=asc",
        "user_role_select",
        (res) => {},
        false
    );

    return (
        <Row gutter={[20, 20]}>
            <Col xs={24} sm={24} md={24}>
                <Tabs
                    defaultActiveKey="0"
                    size="small"
                    indicator={{
                        size: (origin) => origin - 26,
                        align: "end",
                    }}
                    onTabClick={(key) => {
                        setTabParentActive(key);
                    }}
                    items={[
                        {
                            key: "Module",
                            label: "Module",
                            icon: <FontAwesomeIcon icon={faMicrochip} />,
                            children: (
                                <TabSystem
                                    tabParentActive={tabParentActive}
                                    userRoleId={selectedUserRoleId}
                                />
                            ),
                        },
                        {
                            key: "UserRole",
                            label: "User Role",
                            icon: <FontAwesomeIcon icon={faMicrochip} />,
                            children: (
                                <Tabs
                                    defaultActiveKey="1"
                                    size="small"
                                    onTabClick={(key) =>
                                        setSelectedUserRoleId(key)
                                    }
                                    items={
                                        dataRole && dataRole.data
                                            ? dataRole.data.map((item) => ({
                                                  key: item.id.toString(),
                                                  label: item.role,
                                                  children: (
                                                      <TabSystem
                                                          tabParentActive={
                                                              tabParentActive
                                                          }
                                                          userRoleId={
                                                              selectedUserRoleId
                                                          }
                                                      />
                                                  ),
                                              }))
                                            : []
                                    }
                                />
                            ),
                        },
                        {
                            key: "Users",
                            label: "Users",
                            icon: <FontAwesomeIcon icon={faMicrochip} />,
                            children: (
                                <TabSystem
                                    tabParentActive={tabParentActive}
                                    userRoleId={selectedUserRoleId}
                                />
                            ),
                        },
                    ]}
                />
            </Col>
        </Row>
    );
}
