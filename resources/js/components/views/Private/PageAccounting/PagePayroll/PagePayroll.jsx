import { useState } from "react";
import { Card, Col, Row } from "antd";
import PagePayrollContent from "./components/PagePayrollContent";
import PagePayrollContext from "./components/PagePayrollContext";
import CustomTabs from "@/components/providers/CustomTabs.jsx";

export default function PagePayroll() {
    const [viewMode, setViewMode] = useState("active");
    const [toggleModalForm, setToggleModalForm] = useState({
        open: false,
        data: null,
    });
    const [tabActive, setTabActive] = useState("Pay Roll");

    return (
        <PagePayrollContext.Provider
            value={{
                viewMode,
                setViewMode,
                toggleModalForm,
                setToggleModalForm,
            }}
        >
            <Row>
                <Col xs={24} md={24} lg={24} xl={24}>
                    <Card>
                        <PagePayrollContent />
                    </Card>
                </Col>
            </Row>
        </PagePayrollContext.Provider>
    );
}
