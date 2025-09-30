import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Collapse, notification, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faAngleUp,
    faCamera,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { GET, POST } from "../../../providers/useAxiosQuery";
import { apiUrl, defaultProfile, userData } from "../../../providers/appConfig";
import FloatInput from "../../../providers/FloatInput";
import FloatSelect from "../../../providers/FloatSelect";
import FloatDatePicker from "../../../providers/FloatDatePicker";
import FloatInputNumber from "../../../providers/FloatInputNumber";
import validateRules from "../../../providers/validateRules";
import notificationErrors from "../../../providers/notificationErrors";
import optionGender from "../../../providers/optionGender";
import optionNameExtension from "../../../providers/optionNameExtension";
import optionCitizenship from "../../../providers/optionCitizenship";
import optionReligion from "../../../providers/optionReligion";
import optionCivilStatus from "../../../providers/optionCivilStatus";
import ModalFormEmail from "./components/ModalFormEmail";
import ModalFormPassword from "./components/ModalFormPassword";
import ModalUploadProfilePicture from "./components/ModalUploadProfilePicture";
import SignaturePad from "./components/SignaturePad";

export default function PageEditProfile() {
    const [form] = Form.useForm();

    const [toggleModalFormEmail, setToggleModalFormEmail] = useState({
        open: false,
        data: null,
    });

    const [toggleModalFormPassword, setToggleModalFormPassword] = useState({
        open: false,
        data: null,
    });

    const [
        toggleModalUploadProfilePicture,
        setToggleModalUploadProfilePicture,
    ] = useState({
        open: false,
        file: null,
        src: null,
        is_camera: null,
        fileName: null,
    });

    const [fileSignature, setFileSignature] = useState({
        file: null,
        src: null,
        filePath: null,
        fileName: null,
    });

    // Use profile endpoint with user's profile_id from userData
    const userDataInfo = userData();
    
    // Use profile_id from userDataInfo for the profile API endpoint
    const profileId = userDataInfo?.profile_id;
    const apiEndpoint = profileId ? `api/profile/${profileId}` : null;
    
    const { data: userProfileData, isLoading, error } = GET(
        apiEndpoint,
        profileId ? ["profile_info", profileId] : null,
        {
            enabled: !!profileId,
        }
    );

    useEffect(() => {
        const res = userProfileData;
        if (res?.data) {
            let data = res.data;

            // Since we're getting profile data directly, user info comes from the nested 'user' object
            let username = data.user?.username || data.username;
            let email = data.user?.email || data.email;
            let firstname = data.firstname;
            let middlename = data.middlename;
            let lastname = data.lastname;
            let name_ext = data.name_ext;
            let gender = data.gender;
            let birthdate = data.birthdate;
            let age = data.age;
            let birthplace = data.birthplace;
            let citizenship = data.citizenship;
            let religion = data.religion;
            let civil_status = data.civil_status;
            let course = data.course;
            let address = data.address;
            
            // Mother information
            let mother_name = data.mother_name;
            
            // Father information
            let father_name = data.father_name;
            
            // Spouse information
            let spouse_name = data.spouse_name;
            
            // Educational background
            let elem_school = data.elem_school;
            let elem_lastyearattened = data.elem_lastyearattened;
            let junior_high_school = data.junior_high_school;
            let junior_high_school_lastyearattened = data.junior_high_school_lastyearattened;
            let senior_high_school = data.senior_high_school;
            let senior_high_school_lastyearattened = data.senior_high_school_lastyearattened;

            let profilePicture = data.attachments?.filter(
                (f) => f.file_description === "Profile Picture"
            ) || [];
            let signature = data.attachments?.filter(
                (f) => f.file_description === "Signature"
            ) || [];

            if (profilePicture.length > 0) {
                setToggleModalUploadProfilePicture({
                    open: false,
                    file: null,
                    src: apiUrl(
                        profilePicture[profilePicture.length - 1].file_path
                    ),
                    is_camera: null,
                    fileName: null,
                });
            }

            if (signature.length > 0) {
                setFileSignature({
                    file: null,
                    src: null,
                    filePath: apiUrl(signature[signature.length - 1].file_path),
                    fileName: null,
                });
            }

            form.setFieldsValue({
                username,
                email,
                firstname,
                middlename,
                lastname,
                name_ext,
                gender,
                birthdate: birthdate ? dayjs(birthdate) : null,
                age: birthdate ? calculateAge(birthdate) : age,
                birthplace,
                citizenship,
                religion,
                civil_status,
                course,
                address,
                mother_name,
                father_name,
                spouse_name,
                elem_school,
                elem_lastyearattened,
                junior_high_school,
                junior_high_school_lastyearattened,
                senior_high_school,
                senior_high_school_lastyearattened,
            });
        }
    }, [userProfileData]);

    const { mutate: mutateUpdateInfo, isLoading: isLoadingUpdateInfo } = POST(
        `api/user_profile_info_update`,
        "user_profile_info_update"
    );

    const calculateAge = (birthdate) => {
        if (!birthdate) return null;
        const today = dayjs();
        const birth = dayjs(birthdate);
        return today.diff(birth, "year");
    };

    // Helper function to validate year fields
    const validateYear = (_, value) => {
        if (!value) return Promise.resolve();
        
        const currentYear = dayjs().year();
        const year = parseInt(value);
        
        // Check if it's a valid 4-digit year
        if (!/^\d{4}$/.test(value)) {
            return Promise.reject('Please enter a valid 4-digit year');
        }
        
        // Check for realistic year range (not before 1950, not after current year)
        if (year < 1950) {
            return Promise.reject('Please enter a realistic year (1950 or later)');
        }
        
        if (year > currentYear) {
            return Promise.reject(`Year cannot be greater than ${currentYear}`);
        }
        
        return Promise.resolve();
    };

    // Helper function to validate educational timeline
    const validateEducationalTimeline = (field) => (_, value) => {
        if (!value) return Promise.resolve();
        
        const formValues = form.getFieldsValue();
        const currentYear = dayjs().year();
        const year = parseInt(value);
        
        // Check if it's a valid 4-digit year first
        if (!/^\d{4}$/.test(value)) {
            return Promise.reject('Please enter a valid 4-digit year');
        }
        
        // Check for realistic year range
        if (year < 1950 || year > currentYear) {
            return Promise.reject(`Please enter a year between 1950 and ${currentYear}`);
        }
        
        // Educational timeline validation
        const elemYear = parseInt(formValues.elem_lastyearattened) || 0;
        const juniorYear = parseInt(formValues.junior_high_school_lastyearattened) || 0;
        const seniorYear = parseInt(formValues.senior_high_school_lastyearattened) || 0;
        
        switch (field) {
            case 'junior':
                if (elemYear && year <= elemYear) {
                    return Promise.reject('Junior High School year should be after Elementary School year');
                }
                break;
            case 'senior':
                if (juniorYear && year <= juniorYear) {
                    return Promise.reject('Senior High School year should be after Junior High School year');
                }
                if (elemYear && year <= elemYear) {
                    return Promise.reject('Senior High School year should be after Elementary School year');
                }
                break;
        }
        
        return Promise.resolve();
    };

    const handleBirthdateChange = (date) => {
        if (date) {
            const age = calculateAge(date);
            form.setFieldsValue({ age });
        } else {
            form.setFieldsValue({ age: null });
        }
    };

    const onFinish = (values) => {
        let data = {
            ...values,
            gender: values.gender ? values.gender : "",
            birthdate: values.birthdate ? values.birthdate.format('YYYY-MM-DD') : null,
            age: values.age,
            birthplace: values.birthplace || "",
            citizenship: values.citizenship || "",
            religion: values.religion || "",
            civil_status: values.civil_status || "",
            course: values.course || "",
            address: values.address || "",
            mother_name: values.mother_name || "",
            father_name: values.father_name || "",
            spouse_name: values.spouse_name || "",
            elem_school: values.elem_school || "",
            elem_lastyearattened: values.elem_lastyearattened || "",
            junior_high_school: values.junior_high_school || "",
            junior_high_school_lastyearattened: values.junior_high_school_lastyearattened || "",
            senior_high_school: values.senior_high_school || "",
            senior_high_school_lastyearattened: values.senior_high_school_lastyearattened || "",
        };

        mutateUpdateInfo(data, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Profile Update",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Profile Update",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    return (
        <Form form={form} onFinish={onFinish}>
            <Row gutter={[12, 12]}>
                <Col
                    sm={24}
                    md={24}
                    lg={16}
                    xl={16}
                    xxl={16}
                    className="collapse-wrapper-info"
                >
                    <Collapse
                        className="collapse-main-primary"
                        defaultActiveKey={["0", "1", "2", "3"]}
                        size="large"
                        expandIcon={({ isActive }) => (
                            <FontAwesomeIcon
                                icon={isActive ? faAngleUp : faAngleDown}
                            />
                        )}
                        items={[
                            {
                                key: "0",
                                label: "ACCOUNT INFORMATION",
                                children: (
                                    <Row gutter={[20, 0]}>
                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="username">
                                                <FloatInput
                                                    label="Username"
                                                    placeholder="Username"
                                                    disabled
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="email">
                                                <FloatInput
                                                    label="Email"
                                                    placeholder="Email"
                                                    disabled
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={24}
                                            lg={24}
                                            xl={24}
                                        >
                                            <Button
                                                type="link"
                                                className="p-0"
                                                onClick={() =>
                                                    setToggleModalFormEmail({
                                                        open: true,
                                                        data: {
                                                            id: userData().id,
                                                        },
                                                    })
                                                }
                                            >
                                                Change Email
                                            </Button>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={24}
                                            lg={24}
                                            xl={24}
                                        >
                                            <Button
                                                type="link"
                                                className="p-0"
                                                onClick={() =>
                                                    setToggleModalFormPassword({
                                                        open: true,
                                                        data: {
                                                            id: userData().id,
                                                        },
                                                    })
                                                }
                                            >
                                                Change Password
                                            </Button>
                                        </Col>
                                    </Row>
                                ),
                            },
                            {
                                key: "1",
                                label: "PERSONAL INFORMATION",
                                children: (
                                    <Row gutter={[20, 0]}>
                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item
                                                name="firstname"
                                                rules={[
                                                    validateRules.required(),
                                                ]}
                                            >
                                                <FloatInput
                                                    label="First Name"
                                                    placeholder="First Name"
                                                    required
                                                    style={{ textTransform: 'uppercase' }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="middlename">
                                                <FloatInput
                                                    label="Middle Name"
                                                    placeholder="Middle Name"
                                                    style={{ textTransform: 'uppercase' }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item
                                                name="lastname"
                                                rules={[
                                                    validateRules.required(),
                                                ]}
                                            >
                                                <FloatInput
                                                    label="Last Name"
                                                    placeholder="Last Name"
                                                    required
                                                    style={{ textTransform: 'uppercase' }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="name_ext">
                                                <FloatSelect
                                                    label="Name Extension"
                                                    placeholder="Name Extension"
                                                    options={optionNameExtension.map(option => ({
                                                        ...option,
                                                        label: option.label.toUpperCase(),
                                                        value: option.value
                                                    }))}
                                                    allowClear
                                                    style={{ textTransform: 'uppercase' }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={24}
                                            lg={12}
                                            xl={12}
                                            xxl={12}
                                        >
                                            <Form.Item name="gender">
                                                <FloatSelect
                                                    label="Gender"
                                                    placeholder="Gender"
                                                    options={optionGender.map(option => ({
                                                        ...option,
                                                        label: option.label.toUpperCase(),
                                                        value: option.value
                                                    }))}
                                                    allowClear
                                                    style={{ textTransform: 'uppercase' }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item 
                                                name="birthdate"
                                                rules={[
                                                    {
                                                        validator: (_, value) => {
                                                            if (!value) return Promise.resolve();
                                                            
                                                            const today = dayjs();
                                                            const birthDate = dayjs(value);
                                                            const currentYear = today.year();
                                                            const birthYear = birthDate.year();
                                                            
                                                            // Check if birthdate is in the future
                                                            if (birthDate.isAfter(today)) {
                                                                return Promise.reject('Birth date cannot be in the future');
                                                            }
                                                            
                                                            // Check for realistic birth year (not before 1900, not current/future year)
                                                            if (birthYear < 1900) {
                                                                return Promise.reject('Please enter a realistic birth year (1900 or later)');
                                                            }
                                                            
                                                            if (birthYear >= currentYear) {
                                                                return Promise.reject(`Birth year cannot be ${currentYear} or later`);
                                                            }
                                                            
                                                            // Check for realistic age (not older than 120)
                                                            const age = today.diff(birthDate, 'year');
                                                            if (age > 120) {
                                                                return Promise.reject('Please enter a realistic birth date (age cannot exceed 120 years)');
                                                            }
                                                            
                                                            return Promise.resolve();
                                                        }
                                                    }
                                                ]}
                                            >
                                                <FloatDatePicker
                                                    format={{
                                                        format: "MM/DD/YYYY",
                                                        type: "mask",
                                                    }}
                                                    label="Date of Birth"
                                                    placeholder="Date of Birth"
                                                    onChange={handleBirthdateChange}
                                                    disabledDate={(current) => {
                                                        // Disable future dates and dates before 1900
                                                        return current && (current.isAfter(dayjs()) || current.year() < 1900);
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="age">
                                                <FloatInputNumber
                                                    label="Age"
                                                    placeholder="Age"
                                                    disabled
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="birthplace">
                                                <FloatInput
                                                    label="Place of Birth"
                                                    placeholder="Place of Birth"
                                                    style={{ textTransform: 'uppercase' }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="citizenship">
                                                <FloatSelect
                                                    label="Citizenship"
                                                    placeholder="Citizenship"
                                                    options={optionCitizenship.map(option => ({
                                                        value: option.value,
                                                        label: option.label.toUpperCase()
                                                    }))}
                                                    allowClear
                                                    style={{ textTransform: 'uppercase' }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="religion">
                                                <FloatSelect
                                                    label="Religion"
                                                    placeholder="Religion"
                                                    options={optionReligion.map(option => ({
                                                        value: option.value,
                                                        label: option.label.toUpperCase()
                                                    }))}
                                                    allowClear
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={12}
                                            lg={12}
                                            xl={12}
                                        >
                                            <Form.Item name="civil_status">
                                                <FloatSelect
                                                    label="Civil Status"
                                                    placeholder="Civil Status"
                                                    options={optionCivilStatus.map(option => ({
                                                        value: option.value,
                                                        label: option.label.toUpperCase()
                                                    }))}
                                                    allowClear
                                                />
                                            </Form.Item>
                                        </Col>



                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={24}
                                            lg={24}
                                            xl={24}
                                        >
                                            <Form.Item name="address">
                                                <FloatInput
                                                    label="Home Address"
                                                    placeholder="Home Address"
                                                    style={{ textTransform: 'uppercase' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                ),
                            },
                            {
                                key: "2",
                                label: "PARENTS INFORMATION",
                                children: (
                                    <div>
                                        <Typography.Title level={5}>
                                            MOTHER INFORMATION
                                        </Typography.Title>

                                        <Row gutter={[12, 12]}>
                                            <Col
                                                xs={24}
                                                sm={24}
                                                md={24}
                                                lg={24}
                                                xl={24}
                                                xxl={24}
                                            >
                                                <Form.Item name="mother_name">
                                                    <FloatInput
                                                        label="Mother Name"
                                                        placeholder="Mother Name"
                                                        style={{ textTransform: 'uppercase' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Typography.Title level={5}>
                                            FATHER INFORMATION
                                        </Typography.Title>

                                        <Row gutter={[12, 12]}>
                                            <Col
                                                xs={24}
                                                sm={24}
                                                md={24}
                                                lg={24}
                                                xl={24}
                                                xxl={24}
                                            >
                                                <Form.Item name="father_name">
                                                    <FloatInput
                                                        label="Father Name"
                                                        placeholder="Father Name"
                                                        style={{ textTransform: 'uppercase' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Typography.Title level={5}>
                                            SPOUSE INFORMATION
                                        </Typography.Title>

                                        <Row gutter={[12, 12]}>
                                            <Col
                                                xs={24}
                                                sm={24}
                                                md={24}
                                                lg={24}
                                                xl={24}
                                                xxl={24}
                                            >
                                                <Form.Item name="spouse_name">
                                                    <FloatInput
                                                        label="Spouse Name"
                                                        placeholder="Spouse Name"
                                                        style={{ textTransform: 'uppercase' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </div>
                                ),
                            },
                            {
                                key: "3",
                                label: "ACADEMIC BACKGROUND",
                                children: (
                                    <div>
                                        <Typography.Title level={5}>
                                            ELEMENTARY SCHOOL
                                        </Typography.Title>

                                        <Row gutter={[12, 12]}>
                                            <Col
                                                xs={24}
                                                sm={24}
                                                md={24}
                                                lg={12}
                                                xl={12}
                                                xxl={12}
                                            >
                                                <Form.Item name="elem_school">
                                                    <FloatInput
                                                        label="School Name"
                                                        placeholder="School Name"
                                                        style={{ textTransform: 'uppercase' }}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col
                                                xs={24}
                                                sm={24}
                                                md={24}
                                                lg={12}
                                                xl={12}
                                                xxl={12}
                                            >
                                                <Form.Item 
                                                    name="elem_lastyearattened"
                                                    rules={[
                                                        { validator: validateYear }
                                                    ]}
                                                >
                                                    <FloatInput
                                                        label="Last Year Attended"
                                                        placeholder="Last Year Attended"
                                                        maxLength={4}
                                                        onKeyPress={(e) => {
                                                            const char = String.fromCharCode(e.which);
                                                            if (!/[0-9]/.test(char)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        onPaste={(e) => {
                                                            const paste = (e.clipboardData || window.clipboardData).getData('text');
                                                            if (!/^[0-9]*$/.test(paste)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Typography.Title level={5}>
                                            JUNIOR HIGH SCHOOL
                                        </Typography.Title>

                                        <Row gutter={[12, 12]}>
                                            <Col
                                                xs={24}
                                                sm={24}
                                                md={24}
                                                lg={12}
                                                xl={12}
                                                xxl={12}
                                            >
                                                <Form.Item name="junior_high_school">
                                                    <FloatInput
                                                        label="School Name"
                                                        placeholder="School Name"
                                                        style={{ textTransform: 'uppercase' }}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col
                                                xs={24}
                                                sm={24}
                                                md={24}
                                                lg={12}
                                                xl={12}
                                                xxl={12}
                                            >
                                                <Form.Item 
                                                    name="junior_high_school_lastyearattened"
                                                    rules={[
                                                        { validator: validateEducationalTimeline('junior') }
                                                    ]}
                                                >
                                                    <FloatInput
                                                        label="Last Year Attended"
                                                        placeholder="Last Year Attended"
                                                        maxLength={4}
                                                        onKeyPress={(e) => {
                                                            const char = String.fromCharCode(e.which);
                                                            if (!/[0-9]/.test(char)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        onPaste={(e) => {
                                                            const paste = (e.clipboardData || window.clipboardData).getData('text');
                                                            if (!/^[0-9]*$/.test(paste)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Typography.Title level={5}>
                                            SENIOR HIGH SCHOOL
                                        </Typography.Title>

                                        <Row gutter={[12, 12]}>
                                            <Col
                                                xs={24}
                                                sm={24}
                                                md={24}
                                                lg={12}
                                                xl={12}
                                                xxl={12}
                                            >
                                                <Form.Item name="senior_high_school">
                                                    <FloatInput
                                                        label="School Name (Optional)"
                                                        placeholder="School Name (Optional)"
                                                        style={{ textTransform: 'uppercase' }}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col
                                                xs={24}
                                                sm={24}
                                                md={24}
                                                lg={12}
                                                xl={12}
                                                xxl={12}
                                            >
                                                <Form.Item 
                                                    name="senior_high_school_lastyearattened"
                                                    rules={[
                                                        { validator: validateEducationalTimeline('senior') }
                                                    ]}
                                                >
                                                    <FloatInput
                                                        label="Last Year Attended"
                                                        placeholder="Last Year Attended"
                                                        maxLength={4}
                                                        onKeyPress={(e) => {
                                                            const char = String.fromCharCode(e.which);
                                                            if (!/[0-9]/.test(char)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        onPaste={(e) => {
                                                            const paste = (e.clipboardData || window.clipboardData).getData('text');
                                                            if (!/^[0-9]*$/.test(paste)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </div>
                                ),
                            },
                        ]}
                    />
                </Col>

                <Col
                    xs={24}
                    sm={24}
                    md={24}
                    lg={8}
                    xl={8}
                    xxl={8}
                    className="collapse-wrapper-photo"
                >
                    <Collapse
                        className="collapse-main-primary"
                        defaultActiveKey={["0", "1"]}
                        size="large"
                        expandIcon={({ isActive }) => (
                            <FontAwesomeIcon
                                icon={isActive ? faAngleUp : faAngleDown}
                            />
                        )}
                        items={[
                            {
                                key: "0",
                                label: "Profile Photo",
                                children: (
                                    <Row gutter={[12, 0]}>
                                        <Col xs={24} sm={24} md={24} lg={24}>
                                            <div className="profile-picture-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <img
                                                    alt=""
                                                    src={
                                                        toggleModalUploadProfilePicture.src
                                                            ? toggleModalUploadProfilePicture.src
                                                            : defaultProfile
                                                    }
                                                    style={{
                                                        width: 360,
                                                        height: 480,
                                                        objectFit: "cover",
                                                        border: "3px solid #e5e7eb",
                                                        borderRadius: 6,
                                                        display: "block",
                                                        background: "#f5f5f5",
                                                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                                                    }}
                                                />

                                                <Button
                                                    type="link"
                                                    icon={
                                                        <FontAwesomeIcon
                                                            icon={faCamera}
                                                        />
                                                    }
                                                    className="btn-upload"
                                                    onClick={() =>
                                                        setToggleModalUploadProfilePicture(
                                                            (ps) => ({
                                                                ...ps,
                                                                open: true,
                                                            })
                                                        )
                                                    }
                                                >
                                                    Update Photo
                                                </Button>
                                            </div>

                                            <ModalUploadProfilePicture
                                                toggleModalUploadProfilePicture={
                                                    toggleModalUploadProfilePicture
                                                }
                                                setToggleModalUploadProfilePicture={
                                                    setToggleModalUploadProfilePicture
                                                }
                                            />
                                        </Col>
                                    </Row>
                                ),
                            },
                            {
                                key: "1",
                                label: "Signature",
                                className: "collapse-signature",
                                children: (
                                    <Row gutter={[12, 0]}>
                                        <Col xs={24} sm={24} md={24} lg={24}>
                                            <SignaturePad
                                                fileSignature={fileSignature}
                                                setFileSignature={
                                                    setFileSignature
                                                }
                                            />
                                        </Col>
                                    </Row>
                                ),
                            },
                        ]}
                    />
                </Col>
            </Row>

            {/* Save button */}
            <Row gutter={[12, 12]} style={{ marginTop: '20px' }}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Button
                        className="btn-main-primary"
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={isLoadingUpdateInfo}
                        style={{
                            width: '200px',
                            height: '45px',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        SAVE CHANGES
                    </Button>
                </Col>
            </Row>

            <ModalFormEmail
                toggleModalFormEmail={toggleModalFormEmail}
                setToggleModalFormEmail={setToggleModalFormEmail}
            />

            <ModalFormPassword
                toggleModalFormPassword={toggleModalFormPassword}
                setToggleModalFormPassword={setToggleModalFormPassword}
            />
        </Form>
    );
}
