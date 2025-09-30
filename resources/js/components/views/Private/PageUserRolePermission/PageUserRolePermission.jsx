import { useEffect, useState } from "react";
import { Row, Col, Tabs } from "antd";
import { GET } from "../../../providers/useAxiosQuery";
import TableUserRolePermission from "./TableUserRolePermission";

export default function PageUserRolePermission() {
    const [tableFilter, setTableFilter] = useState({
        page: 1,
        page_size: 50,
        search: "",
        sort_field: "id",
        sort_order: "asc",
        user_role_id: 1,
    });

    const { data: dataSourceUserRole } = GET(
        `api/user_role?sort_field=id&sort_order=asc`,
        "user_role_tab"
    );

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/user_role_permission?${new URLSearchParams(tableFilter)}`,
        "user_role_permission_list"
    );

    useEffect(() => {
        refetchSource();

        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableFilter]);

    const handleTabChange = (key) => {
        setTableFilter((ps) => ({ ...ps, user_role_id: key }));
    };

    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24}>
                <Tabs
                    onChange={handleTabChange}
                    defaultActiveKey="1"
                    type="card"
                    items={[
                        ...(dataSourceUserRole && dataSourceUserRole.data
                            ? dataSourceUserRole.data.map((item) => ({
                                  key: item.id,
                                  label: item.user_role,
                                  children: (
                                      <TableUserRolePermission
                                          dataSource={dataSource}
                                          tableFilter={tableFilter}
                                          setTableFilter={setTableFilter}
                                      />
                                  ),
                              }))
                            : []),
                    ]}
                />
            </Col>
        </Row>
    );
}
