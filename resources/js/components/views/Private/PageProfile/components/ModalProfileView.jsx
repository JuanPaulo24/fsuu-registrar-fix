import { useContext, useEffect } from "react";
import { Col, Form, Modal, Row, Collapse, Typography } from "antd";
import dayjs from "dayjs";

import { GET } from "../../../../providers/useAxiosQuery";
// @ts-ignore
import PageProfileContext from "./PageProfileContext";
import FloatInput from "../../../../providers/FloatInput";
import FloatDatePicker from "../../../../providers/FloatDatePicker";
import FloatSelect from "../../../../providers/FloatSelect";
import optionNameExtension from "../../../../providers/optionNameExtension";
import optionGender from "../../../../providers/optionGender";
import optionCitizenship from "../../../../providers/optionCitizenship";
import optionReligion from "../../../../providers/optionReligion";
import optionCivilStatus from "../../../../providers/optionCivilStatus";

const { Title } = Typography;

export default function ModalProfileView() {
    const { toggleModalViewProfile, setToggleModalViewProfile } = useContext(PageProfileContext);

    const [form] = Form.useForm();

    const { data: profileData, refetch: refetchProfile } = GET(
        toggleModalViewProfile.data?.id ? `api/profile/${toggleModalViewProfile.data.id}` : null,
        ["profile_view", toggleModalViewProfile.data?.id],
        {
            enabled: !!toggleModalViewProfile.data?.id,
        }
    );

    useEffect(() => {
        if (toggleModalViewProfile.open && profileData?.data) {
            const data = profileData.data;
            form.setFieldsValue({
                firstname: data.firstname,
                middlename: data.middlename,
                lastname: data.lastname,
                name_ext: data.name_ext,
                id_number: data.id_number,
                // Pull user_role_id from the related user like TableUser accesses related fields
                user_role_id: data.user?.user_role_id,
                gender: data.gender,
                birthdate: data.birthdate ? dayjs(data.birthdate) : null,
                birthplace: data.birthplace,
                citizenship: data.citizenship,
                religion: data.religion,
                civil_status: data.civil_status,
                address: data.address,
                father_name: data.father_name,
                mother_name: data.mother_name,
                spouse_name: data.spouse_name,
                course: data.course,
                elem_school: data.elem_school,
                elem_lastyearattened: data.elem_lastyearattened,
                junior_high_school: data.junior_high_school,
                junior_high_school_lastyearattened: data.junior_high_school_lastyearattened,
                senior_high_school: data.senior_high_school,
                senior_high_school_lastyearattened: data.senior_high_school_lastyearattened,
            });
        }
    }, [toggleModalViewProfile.open, profileData, form]);

    const handleCancel = () => {
        setToggleModalViewProfile({ open: false, data: null });
        form.resetFields();
    };

    return (
        <Modal
            title="View Profile"
            open={toggleModalViewProfile.open}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                disabled={true}
            >
                <Collapse
                    defaultActiveKey={["1", "2", "3", "4"]}
                    items={[
                        {
                            key: "1",
                            label: <Title level={5}>Basic Information</Title>,
                            children: (
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12} md={6}>
                                        <FloatInput
                                            label="ID Number"
                                            placeholder="ID Number"
                                            name="id_number"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <FloatInput
                                            label="User Role ID"
                                            placeholder="User Role ID"
                                            name="user_role_id"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <FloatInput
                                            label="First Name"
                                            placeholder="First Name"
                                            name="firstname"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <FloatInput
                                            label="Middle Name"
                                            placeholder="Middle Name"
                                            name="middlename"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <FloatInput
                                            label="Last Name"
                                            placeholder="Last Name"
                                            name="lastname"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <FloatSelect
                                            label="Name Extension"
                                            placeholder="Name Extension"
                                            name="name_ext"
                                            options={optionNameExtension}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <FloatSelect
                                            label="Gender"
                                            placeholder="Gender"
                                            name="gender"
                                            options={optionGender}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <FloatDatePicker
                                            label="Birth Date"
                                            placeholder="Birth Date"
                                            name="birthdate"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={6}>
                                        <FloatInput
                                            label="Birth Place"
                                            placeholder="Birth Place"
                                            name="birthplace"
                                        />
                                    </Col>
                                </Row>
                            ),
                        },
                        {
                            key: "2",
                            label: <Title level={5}>Personal Information</Title>,
                            children: (
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12} md={8}>
                                        <FloatSelect
                                            label="Citizenship"
                                            placeholder="Citizenship"
                                            name="citizenship"
                                            options={optionCitizenship}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <FloatSelect
                                            label="Religion"
                                            placeholder="Religion"
                                            name="religion"
                                            options={optionReligion}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <FloatSelect
                                            label="Civil Status"
                                            placeholder="Civil Status"
                                            name="civil_status"
                                            options={optionCivilStatus}
                                        />
                                    </Col>
                                    <Col xs={24}>
                                        <FloatInput
                                            label="Address"
                                            placeholder="Address"
                                            name="address"
                                        />
                                    </Col>
                                </Row>
                            ),
                        },
                        {
                            key: "3",
                            label: <Title level={5}>Family Information</Title>,
                            children: (
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12}>
                                        <FloatInput
                                            label="Father's Name"
                                            placeholder="Father's Name"
                                            name="father_name"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <FloatInput
                                            label="Mother's Name"
                                            placeholder="Mother's Name"
                                            name="mother_name"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <FloatInput
                                            label="Spouse's Name"
                                            placeholder="Spouse's Name"
                                            name="spouse_name"
                                        />
                                    </Col>
                                </Row>
                            ),
                        },
                        {
                            key: "4",
                            label: <Title level={5}>Educational Information</Title>,
                            children: (
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12}>
                                        <FloatInput
                                            label="Course"
                                            placeholder="Course"
                                            name="course"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <FloatInput
                                            label="Elementary School"
                                            placeholder="Elementary School"
                                            name="elem_school"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <FloatInput
                                            label="Elementary Last Year Attended"
                                            placeholder="Elementary Last Year Attended"
                                            name="elem_lastyearattened"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <FloatInput
                                            label="Junior High School"
                                            placeholder="Junior High School"
                                            name="junior_high_school"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <FloatInput
                                            label="Junior High School Last Year Attended"
                                            placeholder="Junior High School Last Year Attended"
                                            name="junior_high_school_lastyearattened"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <FloatInput
                                            label="Senior High School"
                                            placeholder="Senior High School"
                                            name="senior_high_school"
                                        />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <FloatInput
                                            label="Senior High School Last Year Attended"
                                            placeholder="Senior High School Last Year Attended"
                                            name="senior_high_school_lastyearattened"
                                        />
                                    </Col>
                                </Row>
                            ),
                        },
                    ]}
                />
            </Form>
        </Modal>
    );
}
