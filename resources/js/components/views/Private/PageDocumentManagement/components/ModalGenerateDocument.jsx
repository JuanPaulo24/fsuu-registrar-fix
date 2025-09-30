import { useMemo, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, Row, Col, Divider } from "antd";
import { GET } from "../../../providers/useAxiosQuery";

export default function ModalGenerateDocument(props) {
    const { open, onCancel, onSubmit, documentType = "", record = {} } = props;

    const [form] = Form.useForm();

    // Fetch users with user role 'UNIVERSITY REGISTRAR'
    const { data: registrarUsers } = GET(
        "api/users?user_role=UNIVERSITY%20REGISTRAR&status=Active",
        "registrar_users_select"
    );

    // Debug: Log the registrar users data
    useEffect(() => {
        console.log('ModalGenerateDocument - registrarUsers:', registrarUsers);
    }, [registrarUsers]);

    const initialDocCategory = useMemo(() => {
        if (documentType?.toLowerCase().includes("transcript")) return "Transcript of Records";
        if (documentType?.toLowerCase().includes("cert")) return "Certification";
        if (record?.document_type?.toLowerCase().includes("transcript")) return "Transcript of Records";
        if (record?.document_type?.toLowerCase().includes("cert")) return "Certification";
        return "Transcript of Records";
    }, [documentType, record]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (onSubmit) onSubmit(values);
        } catch (_) {
            // noop: keep modal open on validation error
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Generate"
            title="Generate Document"
            destroyOnClose
            centered
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    doc_category: initialDocCategory,
                    cert_type: "Diploma",
                    full_name: record?.profile?.fullname || "",
                    student_id: record?.profile_id || "",
                }}
            >
                <Row gutter={[12, 12]}>
                    <Col xs={24} md={12}>
                        <Form.Item name="doc_category" label="Document Category" rules={[{ required: true, message: "Required" }]}>
                            <Select
                                options={[
                                    { value: "Transcript of Records", label: "Transcript of Records" },
                                    { value: "Certification", label: "Certification" },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.doc_category !== cur.doc_category}>
                            {({ getFieldValue }) =>
                                getFieldValue("doc_category") === "Certification" ? (
                                    <Form.Item name="cert_type" label="Certification Type" rulzes={[{ required: true, message: "Required" }]}> 
                                        <Select
                                            options={[
                                                { value: "Diploma", label: "Diploma" },
                                                { value: "Certificate of Units Earned", label: "Certificate of Units Earned" },
                                            ]}
                                        />
                                    </Form.Item>
                                ) : (
                                    <Form.Item name="registrar_id" label="University Registrar" rules={[{ required: true, message: "Please select a registrar" }]}> 
                                        <Select
                                            placeholder="Select University Registrar"
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            options={(Array.isArray(registrarUsers?.data?.data) ? registrarUsers?.data?.data : registrarUsers?.data || []).map(user => ({
                                                value: user.id,
                                                label: `${user.fullname || `${user.profile?.firstname || ''} ${user.profile?.lastname || ''}`.trim() || user.username} (${user.user_role?.user_role || 'Unknown Role'})`,
                                            })) || []}
                                        />
                                    </Form.Item>
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>

                <Divider className="my-2" />

                <Row gutter={[12, 12]}>
                    <Col xs={24} md={12}>
                        <Form.Item name="full_name" label="Full Name" rules={[{ required: true, message: "Required" }]}>
                            <Input placeholder="Enter full name" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="student_id" label="Student ID / Profile ID" rules={[{ required: true, message: "Required" }]}>
                            <Input placeholder="Enter student ID" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="program" label="Program / Course">
                            <Input placeholder="e.g. BS Computer Science" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="year_level" label="Year Level">
                            <Input placeholder="e.g. 4th Year" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="purpose" label="Purpose">
                            <Input placeholder="e.g. Scholarship Application" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="request_date" label="Request Date">
                            <DatePicker className="w-100" format="MM/DD/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}


