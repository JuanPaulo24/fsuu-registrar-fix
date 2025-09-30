import { useState, useEffect } from "react";
import { Button, Col, Row } from "antd";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { GET } from "../../../../providers/useAxiosQuery";
import PageEmailContext from "../components/PageEmailContext";
import TableEmailTemplate from "../components/TableEmailTemplate";
import TableHistoricalData from "../components/TableHistoricalData"; // New Historical Table
import ModalEmailTemplate from "../components/ModalEmailTemplate";

export default function PageEmailContent({ tabActive }) {
    const [toggleModalForm, setToggleModalForm] = useState({ open: false, data: null });
    const [tableFilter, setTableFilter] = useState({ page: 1, page_size: 50 });

    const { data: dataSource, refetch: refetchSource } = GET(
        `api/users?${new URLSearchParams(tableFilter)}`,
        "users_active_list"
    );

    useEffect(() => { refetchSource(); }, [tableFilter, refetchSource]);

    return (
        <PageEmailContext.Provider value={{ tabActive, toggleModalForm, setToggleModalForm }}>
            <Row gutter={[20, 20]}>
                {tabActive === "Email Template" && (
                    <Col span={24}>
                        <Button type="primary" onClick={() => setToggleModalForm({ open: true })} icon={<FontAwesomeIcon icon={faPlus} />}>
                            Add {tabActive}
                        </Button>
                    </Col>
                )}
                <Col span={24}>
                    {tabActive === "Email Template" ? (
                        <TableEmailTemplate dataSource={dataSource?.data?.data || []} setTableFilter={setTableFilter} />
                    ) : (
                        <TableHistoricalData />
                    )}
                </Col>
            </Row>
            <ModalEmailTemplate />
        </PageEmailContext.Provider>
    );
}
