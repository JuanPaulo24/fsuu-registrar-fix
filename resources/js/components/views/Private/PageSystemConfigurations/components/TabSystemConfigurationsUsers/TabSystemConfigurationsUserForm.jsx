import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Button, Form, Collapse, notification, Typography, Modal } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faAngleUp,
    faArrowLeft,
    faCamera,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { GET, POST } from "../../../../../providers/useAxiosQuery";
import { apiUrl, defaultProfile } from "../../../../../providers/appConfig";
import FloatInput from "../../../../../providers/FloatInput";
import FloatSelect from "../../../../../providers/FloatSelect";
import FloatDatePicker from "../../../../../providers/FloatDatePicker";
import FloatInputPassword from "../../../../../providers/FloatInputPassword";
import FloatInputNumber from "../../../../../providers/FloatInputNumber";
import ModalFormEmail from "./components/ModalFormEmail";
import ModalFormPassword from "./components/ModalFormPassword";
import validateRules from "../../../../../providers/validateRules";
import notificationErrors from "../../../../../providers/notificationErrors";
import optionGender from "../../../../../providers/optionGender";
import optionNameExtension from "../../../../../providers/optionNameExtension";
import optionCitizenship from "../../../../../providers/optionCitizenship";
import optionReligion from "../../../../../providers/optionReligion";
import optionCivilStatus from "../../../../../providers/optionCivilStatus";
import ModalUploadProfilePicture from "./components/ModalUploadProfilePicture";


// import Webcam from "react-webcam";

export default function PageUserForm() {
    // Alphabet options for middle initial
    const alphabetOptions = Array.from({ length: 26 }, (_, i) => ({
        label: String.fromCharCode(65 + i),
        value: String.fromCharCode(65 + i)
    }));
    
    const navigate = useNavigate();
    const params = useParams();

    const [form] = Form.useForm();
    const [formDisabled, setFormDisabled] = useState(true);
    const [userData, setUserData] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [stagedProfilePicture, setStagedProfilePicture] = useState(null);
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

    // State to track if selected role is restricted
    const [selectedRestrictedRole, setSelectedRestrictedRole] = useState(null);
    
    // Define restricted roles (executive positions limited to one user)
    const restrictedRoles = {
        4: 'University Registrar',
        5: 'Dean',
        6: 'University President', 
        7: 'Vice President for Academic Affairs and Research'
    };

    const { refetch: refetchUserData } = GET(
        params.id ? `api/users/${params.id}` : null,
        params.id ? ["users_info", "check_user_permission"] : null,
        (res) => {
            if (res.data) {
                let data = res.data;

                let user_role_id = data.user_role_id;
                let username = data.username;
                let email = data.email;
                let firstname = data.profile?.firstname;
                let lastname = data.profile?.lastname;
                let middlename = data.profile?.middlename;
                let name_ext = data.profile?.name_ext;
                let gender = data.profile?.gender;
                let birthdate = data.profile?.birthdate;
                let age = data.profile?.age;
                let birthplace = data.profile?.birthplace;
                let citizenship = data.profile?.citizenship;
                let religion = data.profile?.religion;
                let civil_status = data.profile?.civil_status;
                let course = data.profile?.course;
                let course_id = data.profile?.course_id;
                let address = data.profile?.address;
                
                // Mother information
                let mother_name = data.profile?.mother_name;

                
                // Father information
                let father_name = data.profile?.father_name;

                
                // Spouse information
                let spouse_name = data.profile?.spouse_name;

                
                // Educational background
                let elem_school = data.profile?.elem_school;
                let elem_lastyearattened = data.profile?.elem_lastyearattened;
                let junior_high_school = data.profile?.junior_high_school;
                let junior_high_school_lastyearattened = data.profile?.junior_high_school_lastyearattened;
                let senior_high_school = data.profile?.senior_high_school;
                let senior_high_school_lastyearattened = data.profile?.senior_high_school_lastyearattened;

                if (
                    data.profile &&
                    data.profile.attachments &&
                    data.profile.attachments.length > 0
                ) {
                    let profileAttachments = data.profile.attachments.filter(
                        (f) => f.file_description === "Profile Picture"
                    );

                    if (profileAttachments.length > 0) {
                        setToggleModalUploadProfilePicture({
                            open: false,
                            file: null,
                            src: apiUrl(profileAttachments[profileAttachments.length - 1].file_path),
                            is_camera: null,
                            fileName: null,
                        });
                    }
                }

                form.setFieldsValue({
                    user_role_id,
                    username,
                    email,
                    firstname,
                    lastname,
                    middlename,
                    name_ext,
                    gender,
                    birthdate: birthdate ? dayjs(birthdate) : null,
                    age: birthdate ? calculateAge(birthdate) : age,
                    birthplace,
                    citizenship,
                    religion,
                    civil_status,
                    course_id,
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

                setUserData({
                    user_role_id,
                    username,
                    email,
                    firstname,
                    lastname,
                    middlename,
                    name_ext,
                    gender,
                    birthdate,
                    age,
                    birthplace,
                    citizenship,
                    religion,
                    civil_status,
                    course_id,
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

                // Reset change tracking when data is loaded
                setHasChanges(false);
                setStagedProfilePicture(null);
            }
        }
    );

    const { data: dataUserRole } = GET(
        "api/user_roles",
        "user_roles_select",
        (res) => {},
        false
    );

    const { data: dataCourse } = GET(
        "api/courses",
        "courses_select",
        (res) => {},
        false
    );

    const dataCivilStatus = optionCivilStatus;
    const dataCitizenship = optionCitizenship;
    const dataReligion = optionReligion;

    const { mutate: mutateUser, isLoading: isLoadingUser } = POST(
        `api/users`,
        "users_active_list"
    );

    const { mutate: mutateProfilePicture } = POST(
        `api/update_profile_photo`,
        "update_profile_photo"
    );

    const calculateAge = (birthdate) => {
        if (!birthdate) return null;
        const today = dayjs();
        const birthDate = dayjs(birthdate);
        return today.diff(birthDate, 'year');
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

    // Handle role change to check for restrictions
    const handleRoleChange = (roleId) => {
        if (restrictedRoles[roleId]) {
            // Check if this role is already assigned to another user
            checkRoleAssignment(roleId);
        } else {
            setSelectedRestrictedRole(null);
        }
    };

    // Function to check if a role is already assigned
    const checkRoleAssignment = async (roleId) => {
        try {
            const queryParams = new URLSearchParams({
                user_role_id: roleId,
                status: 'Active',
                page_size: 1
            });
            
            if (params.id) {
                queryParams.append('exclude_id', params.id);
            }
            
            const response = await fetch(`/api/users?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const existingUsers = data.data?.data || data.data || [];
                
                if (existingUsers.length > 0) {
                    const existingUser = existingUsers[0];
                    const userName = existingUser.fullname || 
                                   `${existingUser.profile?.firstname || ''} ${existingUser.profile?.lastname || ''}`.trim() || 
                                   existingUser.username;
                    
                    setSelectedRestrictedRole({
                        roleName: restrictedRoles[roleId],
                        existingUser: userName
                    });
                } else {
                    setSelectedRestrictedRole(null);
                }
            } else {
                setSelectedRestrictedRole(null);
            }
        } catch (error) {
            console.error('Error checking role assignment:', error);
            setSelectedRestrictedRole(null);
        }
    };

    const onFinish = (values) => {
        let data = new FormData();
        data.append("id", params.id ? params.id : "");
                data.append("user_role_id", values.user_role_id);
        data.append("username", values.username);
        data.append("email", values.email);
        if (!params.id) {
            data.append("password", values.password);
        }
        data.append("firstname", values.firstname ? values.firstname.toUpperCase() : "");
        data.append("lastname", values.lastname ? values.lastname.toUpperCase() : "");
        data.append("middlename", values.middlename ? values.middlename.toUpperCase() : "");
        data.append("name_ext", values.name_ext ? values.name_ext.toUpperCase() : "");
        data.append("gender", values.gender ? values.gender.toUpperCase() : "");
        data.append("birthdate", values.birthdate ? values.birthdate.format('YYYY-MM-DD') : "");
        data.append("age", values.age || "");
        data.append("birthplace", values.birthplace ? values.birthplace.toUpperCase() : "");
        data.append("citizenship", values.citizenship ? values.citizenship.toUpperCase() : "");
        data.append("religion", values.religion ? values.religion.toUpperCase() : "");
        data.append("civil_status", values.civil_status ? values.civil_status.toUpperCase() : "");
        data.append("course_id", values.course_id || "");
        data.append("address", values.address ? values.address.toUpperCase() : "");
        
        // Mother information
        data.append("mother_name", values.mother_name ? values.mother_name.toUpperCase() : "");

        
        // Father information
        data.append("father_name", values.father_name ? values.father_name.toUpperCase() : "");

        
        // Spouse information
        data.append("spouse_name", values.spouse_name ? values.spouse_name.toUpperCase() : "");

        
        // Educational background
        data.append("elem_school", values.elem_school ? values.elem_school.toUpperCase() : "");
        data.append("elem_lastyearattened", values.elem_lastyearattened || "");
        data.append("junior_high_school", values.junior_high_school ? values.junior_high_school.toUpperCase() : "");
        data.append("junior_high_school_lastyearattened", values.junior_high_school_lastyearattened || "");
        data.append("senior_high_school", values.senior_high_school ? values.senior_high_school.toUpperCase() : "");
        data.append("senior_high_school_lastyearattened", values.senior_high_school_lastyearattened || "");

        // Handle profile picture for both create and edit modes
        if (stagedProfilePicture) {
            data.append(
                "profile_picture",
                stagedProfilePicture.file,
                stagedProfilePicture.fileName
            );
        } else if (params && !params.id && toggleModalUploadProfilePicture.file) {
            data.append(
                "profile_picture",
                toggleModalUploadProfilePicture.file,
                toggleModalUploadProfilePicture.fileName
            );
        }

        mutateUser(data, {
            onSuccess: (res) => {
                if (res.success) {
                    // Handle profile picture update for edit mode
                    if (params.id && stagedProfilePicture) {
                        const profileData = new FormData();
                        profileData.append("user_id", params.id);
                        profileData.append("profile_picture", stagedProfilePicture.file, stagedProfilePicture.fileName);
                        
                        mutateProfilePicture(profileData, {
                            onSuccess: (profileRes) => {
                                // Reset change tracking
                                setHasChanges(false);
                                setStagedProfilePicture(null);
                                
                                // Refetch data to update UI with saved data
                                refetchUserData();
                                
                                notification.success({
                                    message: "User",
                                    description: "User and profile picture updated successfully.",
                                });
                            },
                            onError: (profileErr) => {
                                // Still reset changes since user data was saved
                                setHasChanges(false);
                                setStagedProfilePicture(null);
                                refetchUserData();
                                
                                notification.warning({
                                    message: "User",
                                    description: "User updated successfully, but profile picture update failed.",
                                });
                            }
                        });
                    } else {
                        // Reset change tracking
                        setHasChanges(false);
                        setStagedProfilePicture(null);
                        
                        if (params.id) {
                            // Refetch data to update UI with saved data
                            refetchUserData();
                            notification.success({
                                message: "User",
                                description: res.message,
                            });
                        } else {
                            notification.success({
                                message: "User",
                                description: res.message,
                            });
                            navigate("/system-configurations", { state: { tab: "Users" } });
                        }
                    }
                } else {
                    notification.error({
                        message: "User",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                // Use the main error message from backend instead of field-specific errors
                if (err.response?.data?.message) {
                    notification.error({
                        message: "User Assignment Error",
                        description: err.response.data.message,
                    });
                } else {
                    notificationErrors(err);
                }
            },
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setFormDisabled(false);
        }, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    // Form change detection
    const handleFormChange = () => {
        setHasChanges(true);
    };

    // Navigation protection
    const handleNavigation = (path) => {
        if (hasChanges || stagedProfilePicture) {
            Modal.confirm({
                title: "Confirm Cancel",
                content: "Are you sure you want to cancel? All entered data will be lost.",
                okText: "Yes",
                cancelText: "No",
                maskClosable: true,
                centered: true,
                className: "text-center",
                okButtonProps: {
                    className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                },
                cancelButtonProps: {
                    className: "border border-green-500 text-green-500 hover:border-green-600 hover:text-green-600 px-4 py-2 rounded-lg"
                },
                onOk: () => {
                    form.resetFields();
                    setHasChanges(false);
                    setStagedProfilePicture(null);
                    navigate(path);
                },
            });
        } else {
            navigate(path);
        }
    };

    return (
        <Row gutter={[20, 20]}>
            <Col sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Button
                    icon={<FontAwesomeIcon icon={faArrowLeft} />}
                    onClick={() => handleNavigation("/system-configurations")}
                >
                    Back to list
                </Button>
            </Col>

            <Col sm={24} md={24} lg={24} xl={24} xxl={24}>
                <Form 
                    form={form} 
                    onFinish={onFinish}
                    onValuesChange={handleFormChange}
                >
                    <Row gutter={[20, 20]}>
                        <Col sm={24} md={24} lg={14} xl={14} xxl={14}>
                            <Collapse
                                className="collapse-main-primary"
                                defaultActiveKey={["0", "1", "2", "3"]}
                                size="middle"
                                expandIcon={({ isActive }) => (
                                    <FontAwesomeIcon
                                        icon={
                                            isActive ? faAngleUp : faAngleDown
                                        }
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
                                                    md={24}
                                                    lg={12}
                                                    xl={12}
                                                    xxl={12}
                                                >
                                                    <Form.Item
                                                        name="user_role_id"
                                                        rules={[
                                                            validateRules.required(),
                                                        ]}
                                                    >
                                                        <FloatSelect
                                                            label="User Role"
                                                            placeholder="User Role"
                                                            required={true}
                                                            options={
                                                                (
                                                                    Array.isArray(dataUserRole?.data?.data)
                                                                        ? dataUserRole.data.data
                                                                        : Array.isArray(dataUserRole?.data)
                                                                            ? dataUserRole.data
                                                                            : []
                                                                )
                                                                    .filter((item) => item.user_role !== 'STUDENT') // Exclude student role from system configurations
                                                                    .map((item) => ({
                                                                        value: item.id,
                                                                        label: item.user_role,
                                                                    }))
                                                            }
                                                            disabled={
                                                                formDisabled
                                                            }
                                                            onChange={handleRoleChange}
                                                        />
                                                    </Form.Item>
                                                    
                                                    {/* Warning message for restricted roles */}
                                                    {selectedRestrictedRole && (
                                                        <div style={{ 
                                                            marginTop: '-15px', 
                                                            marginBottom: '15px',
                                                            padding: '10px',
                                                            backgroundColor: '#fff7e6',
                                                            border: '1px solid #ffd666',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            color: '#ad4e00'
                                                        }}>
                                                            <strong>⚠️ Notice:</strong> This position can only be held by one person at a time. 
                                                            Currently assigned to: {selectedRestrictedRole.existingUser}. 
                                                            Contact your administrator to proceed with reassignment.
                                                        </div>
                                                    )}
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
                                                        name="username"
                                                        rules={[
                                                            validateRules.required(),
                                                        ]}
                                                    >
                                                        <FloatInput
                                                            label="Username"
                                                            placeholder="Username"
                                                            required
                                                            disabled={
                                                                params.id
                                                                    ? true
                                                                    : formDisabled
                                                            }
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
                                                        name="email"
                                                        rules={[
                                                            validateRules.required(),
                                                            validateRules.email,
                                                        ]}
                                                    >
                                                        <FloatInput
                                                            label="Email"
                                                            placeholder="Email"
                                                            required={true}
                                                            disabled={
                                                                params.id
                                                                    ? true
                                                                    : formDisabled
                                                            }
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                {params.id ? null : (
                                                    <Col
                                                        xs={24}
                                                        sm={24}
                                                        md={24}
                                                        lg={12}
                                                        xl={12}
                                                        xxl={12}
                                                    >
                                                        <Form.Item
                                                            name="password"
                                                            rules={[
                                                                validateRules.required(),
                                                                validateRules.password,
                                                            ]}
                                                        >
                                                            <FloatInputPassword
                                                                label="Password"
                                                                placeholder="Password"
                                                                required={true}
                                                                autoComplete="new-password"
                                                                disabled={
                                                                    formDisabled
                                                                }
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                )}

                                                {params.id ? (
                                                    <Col
                                                        xs={24}
                                                        sm={24}
                                                        md={24}
                                                        lg={24}
                                                    >
                                                        <a
                                                            type="link"
                                                            className="color-1"
                                                            onClick={() =>
                                                                setToggleModalFormEmail(
                                                                    {
                                                                        open: true,
                                                                        data: {
                                                                            id: params.id,
                                                                        },
                                                                    }
                                                                )
                                                            }
                                                        >
                                                            Change Email
                                                        </a>
                                                    </Col>
                                                ) : null}

                                                {params.id ? (
                                                    <Col
                                                        xs={24}
                                                        sm={24}
                                                        md={24}
                                                        lg={12}
                                                        xl={12}
                                                        xxl={12}
                                                    >
                                                        <a
                                                            type="link"
                                                            className="color-1"
                                                            onClick={() =>
                                                                setToggleModalFormPassword(
                                                                    {
                                                                        open: true,
                                                                        data: {
                                                                            id: params.id,
                                                                        },
                                                                    }
                                                                )
                                                            }
                                                        >
                                                            Change Password
                                                        </a>
                                                    </Col>
                                                ) : null}
                                            </Row>
                                        ),
                                    },
                                    {
                                        key: "1",
                                        label: "PERSONAL INFORMATION",
                                        children: (
                                            <Row gutter={[12, 12]}>
                                                <Col
                                                    xs={24}
                                                    sm={24}
                                                    md={24}
                                                    lg={12}
                                                    xl={12}
                                                    xxl={12}
                                                >
                                                    <Form.Item
                                                        name="firstname"
                                                        rules={[
                                                            validateRules.required(),
                                                        ]}
                                                    >
                                                        <FloatInput
                                                            
                                                            label="First Name"
                                                            style={{ textTransform: 'uppercase' }}
                                                            placeholder="First Name"
                                                            required={true}
                                                            disabled={
                                                                formDisabled
                                                            }
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
                                                        name="middlename"

                                                    >
                                                        <FloatInput
                                                            style={{ textTransform: 'uppercase' }}
                                                            label="Middle Name"
                                                            placeholder="Middle Name"
                                                            disabled={
                                                                formDisabled
                                                            }
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
                                                        name="lastname"
                                                        rules={[
                                                            validateRules.required(),
                                                        ]}
                                                    >
                                                        <FloatInput
                                                            label="Last Name"
                                                            placeholder="Last Name"
                                                            required={true}
                                                            disabled={
                                                                formDisabled
                                                            }
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
                                                        name="name_ext"
                                                    >
                                                        <FloatSelect
                                                            style={{ textTransform: 'uppercase' }}
                                                            label="Name Extension"
                                                            placeholder="Name Extension"
                                                            options={optionNameExtension.map(option => ({
                                                                ...option,
                                                                label: option.label.toUpperCase(),
                                                                value: option.value // ensure value is not uppercased
                                                            }))}
                                                            disabled={
                                                                formDisabled
                                                            }
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
                                                            style={{ textTransform: 'uppercase' }}
                                                            label="Gender"
                                                            placeholder="Gender"
                                                            disabled={
                                                                formDisabled
                                                            }
                                                            options={optionGender.map(option => ({
                                                                ...option,
                                                                label: option.label.toUpperCase(),
                                                                value: option.value // ensure value is not uppercased
                                                            }))}
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
                                                            disabled={formDisabled}
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
                                                    md={24}
                                                    lg={12}
                                                    xl={12}
                                                    xxl={12}
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
                                                    md={24}
                                                    lg={12}
                                                    xl={12}
                                                    xxl={12}
                                                >
                                                    <Form.Item name="birthplace">
                                                        <FloatInput
                                                            label="Place of Birth"
                                                            placeholder="Place of Birth"
                                                            disabled={formDisabled}
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
                                                    <Form.Item name="citizenship">
                                                        <FloatSelect
                                                            label="Citizenship"
                                                            placeholder="Citizenship"
                                                            disabled={formDisabled}
                                                            style={{ textTransform: 'uppercase' }}
                                                            options={dataCitizenship.map(option => ({
                                                                value: option.value,
                                                                label: option.label.toUpperCase()
                                                            }))}
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
                                                    <Form.Item name="religion">
                                                        <FloatSelect
                                                            label="Religion"
                                                            placeholder="Religion"
                                                            disabled={formDisabled}
                                                            options={dataReligion.map(option => ({
                                                                value: option.value,
                                                                label: option.label.toUpperCase()
                                                            }))}
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
                                                    <Form.Item name="civil_status">
                                                        <FloatSelect
                                                            label="Civil Status"
                                                            placeholder="Civil Status"
                                                            disabled={formDisabled}
                                                            options={dataCivilStatus.map(option => ({
                                                                value: option.value,
                                                                label: option.label.toUpperCase()
                                                            }))}
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
                                        <Form.Item name="course_id">
                                            <FloatSelect
                                                label="Program"
                                                placeholder="Select Program"
                                                options={
                                                    (
                                                        Array.isArray(dataCourse?.data?.data)
                                                            ? dataCourse.data.data
                                                            : Array.isArray(dataCourse?.data)
                                                                ? dataCourse.data
                                                                : []
                                                    ).map((item) => ({
                                                        value: item.id,
                                                        label: item.course_name,
                                                    }))
                                                }
                                                disabled={formDisabled}
                                            />
                                        </Form.Item>
                                                </Col>

                                                <Col
                                                    xs={24}
                                                    sm={24}
                                                    md={24}
                                                    lg={24}
                                                    xl={24}
                                                    xxl={24}
                                                >
                                                    <Form.Item name="address">
                                                        <FloatInput
                                                            label="Home Address"
                                                            placeholder="Home Address"
                                                            disabled={formDisabled}
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
                                                                disabled={formDisabled}
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
                                                                disabled={formDisabled}
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
                                                                disabled={formDisabled}
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
                                        label: "EDUCATIONAL BACKGROUND",
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
                                                                disabled={formDisabled}
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
                                                                disabled={formDisabled}
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
                                                                disabled={formDisabled}
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
                                                                disabled={formDisabled}
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
                                                                label="School Name"
                                                                placeholder="School Name"
                                                                disabled={formDisabled}
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
                                                                disabled={formDisabled}
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

                        <Col sm={24} md={24} lg={10} xl={10} xxl={10}>
                            <Collapse
                                className="collapse-main-primary"
                                defaultActiveKey={["0"]}
                                size="middle"
                                expandIcon={({ isActive }) => (
                                    <FontAwesomeIcon
                                        icon={
                                            isActive ? faAngleUp : faAngleDown
                                        }
                                    />
                                )}
                                items={[
                                    {
                                        key: "0",
                                        label: "TAKE PHOTO",
                                        className: "collapse-profile-picture",
                                        children: (
                                            <Row gutter={[12, 0]}>
                                                <Col
                                                    xs={24}
                                                    sm={24}
                                                    md={24}
                                                    lg={24}
                                                >
                                                    <div className="profile-picture-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <img
                                                            alt="profile-picture"
                                                            src={
                                                                stagedProfilePicture?.src ||
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
                                                                    icon={
                                                                        faCamera
                                                                    }
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
                                                            {params.id ? 'Update Photo' : 'Upload Photo'}
                                                        </Button>
                                                    </div>

                                                    <ModalUploadProfilePicture
                                                        toggleModalUploadProfilePicture={
                                                            toggleModalUploadProfilePicture
                                                        }
                                                        setToggleModalUploadProfilePicture={
                                                            setToggleModalUploadProfilePicture
                                                        }
                                                        params={params}
                                                        refetchUserData={refetchUserData}
                                                        setStagedProfilePicture={setStagedProfilePicture}
                                                        stagedProfilePicture={stagedProfilePicture}
                                                    />
                                                </Col>
                                            </Row>
                                        ),
                                    },
                                ]}
                            />
                        </Col>

                        {/* Save button for both create and edit modes */}
                        <Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={24}
                            xl={24}
                            xxl={24}
                        >
                            <Button
                                className="btn-main-primary"
                                type="primary"
                                size="large"
                                htmlType="submit"
                                loading={isLoadingUser}
                            >
                                SAVE
                            </Button>
                        </Col>
                    </Row>
                </Form>

                <ModalFormEmail
                    toggleModalFormEmail={toggleModalFormEmail}
                    setToggleModalFormEmail={setToggleModalFormEmail}
                />

                <ModalFormPassword
                    toggleModalFormPassword={toggleModalFormPassword}
                    setToggleModalFormPassword={setToggleModalFormPassword}
                />
            </Col>
        </Row>
    );
}
