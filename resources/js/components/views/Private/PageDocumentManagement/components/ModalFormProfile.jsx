import {useContext, useEffect, useState} from "react";
import {Col, Form, Modal, Row, Collapse, Button, Select, Typography, notification} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/pro-regular-svg-icons";
import {GetCity, GetCountries, GetState} from "react-country-state-city";
import dayjs from "dayjs";

import {GET, POST} from "../../../../providers/useAxiosQuery";
import PageProfileContext from "./PageProfileContext";
import FloatInput from "../../../../providers/FloatInput";
import validateRules from "../../../../providers/validateRules";
import FloatDatePicker from "../../../../providers/FloatDatePicker";
import FloatSelect from "../../../../providers/FloatSelect";
import optionNameExtension from "../../../../providers/optionNameExtension";
import FloatInputNumber from "../../../../providers/FloatInputNumber";
import Gender from "../../../../providers/optionGender";
import optionCitizenship from "../../../../providers/optionCitizenship";
import optionReligion from "../../../../providers/optionReligion";
import optionCivilStatus from "../../../../providers/optionCivilStatus";
import { handleCancel } from "../../../../providers/formCancelConfirm";
import provinces from "../../../../providers/provinces.json";
import cities from "../../../../providers/city-mun.json";
import barangays from "../../../../providers/barangays.json";
import { apiUrl, defaultProfile, userData } from "../../../../providers/appConfig";
import ModalUploadProfilePicture from "../../PageEditProfile/components/ModalUploadProfilePicture";

export default function ModalFormProfile() {
    // Alphabet options for middle initial
    const alphabetOptions = Array.from({ length: 26 }, (_, i) => ({
        label: String.fromCharCode(65 + i),
        value: String.fromCharCode(65 + i)
    }));
    const {toggleModalForm, setToggleModalForm, refetch} =
        useContext(PageProfileContext);


    const [form] = Form.useForm();

    // Profile photo upload modal state (same shape as PageEditProfile)
    const [toggleModalUploadProfilePicture, setToggleModalUploadProfilePicture] = useState({
        open: false,
        file: null,
        src: null,
        is_camera: null,
        fileName: null,
    });
    const [stagedProfilePicture, setStagedProfilePicture] = useState(null);

    // State for location data
    const [countryList, setCountryList] = useState([]);
    const [stateList, setStateList] = useState([]);

    // Reset form when modal opens
    useEffect(() => {
        if (toggleModalForm.open) {
            if (toggleModalForm.data) {
                // Editing existing profile - populate form with data
                const profileData = toggleModalForm.data;
                
                form.setFieldsValue({
                    username: profileData.user?.username || profileData.username || '',
                    email: profileData.user?.email || profileData.email || '',
                    firstname: profileData.firstname || '',
                    middlename: profileData.middlename || '',
                    lastname: profileData.lastname || '',
                    name_ext: profileData.name_ext || '',
                    id_number: profileData.id_number || '',
                    birthdate: profileData.birthdate ? dayjs(profileData.birthdate) : null,
                    birthplace: profileData.birthplace || '',
                    gender: profileData.gender || '',
                    citizenship: profileData.citizenship || '',
                    religion: profileData.religion || '',
                    civil_status: profileData.civil_status || '',
                    address: profileData.address || '',
                    father_name: profileData.father_name || '',
                    mother_name: profileData.mother_name || '',
                    spouse_name: profileData.spouse_name || '',
                    course: profileData.course || '',
                    elem_school: profileData.elem_school || '',
                    elem_lastyearattened: profileData.elem_lastyearattened || '',
                    junior_high_school: profileData.junior_high_school || '',
                    junior_high_school_lastyearattened: profileData.junior_high_school_lastyearattened || '',
                    senior_high_school: profileData.senior_high_school || '',
                    senior_high_school_lastyearattened: profileData.senior_high_school_lastyearattened || '',
                });

                // Load selected profile picture or fallback to default (handled by renderer)
                let nextSrc = null;
                if (profileData.attachments && profileData.attachments.length > 0) {
                    // Get the most recent profile picture attachment
                    const profilePictures = profileData.attachments.filter(
                        (att) => att.file_description === "Profile Picture"
                    );
                    // Sort by id descending to get the most recent
                    profilePictures.sort((a, b) => b.id - a.id);
                    if (profilePictures.length > 0 && profilePictures[0].file_path) {
                        nextSrc = apiUrl(profilePictures[0].file_path);
                    }
                }
                setToggleModalUploadProfilePicture((ps) => ({
                    ...ps,
                    file: null,
                    src: nextSrc,
                    is_camera: null,
                    fileName: null,
                }));
                setStagedProfilePicture(null);
            } else {
                // Adding new profile - reset form and profile picture
                form.resetFields();
                setToggleModalUploadProfilePicture((ps) => ({
                    ...ps,
                    file: null,
                    src: null,
                    is_camera: null,
                    fileName: null,
                }));
                setStagedProfilePicture(null);
            }
        }
    }, [toggleModalForm.open, toggleModalForm.data, form]);

    useEffect(() => {
        const extractCountryState = async () => {
            const countries = await GetCountries();
            const states = await GetState(174);

            setCountryList(
                countries.map((country) => ({
                    ...country,
                    label: country.name,
                    value: country.name,
                }))
            );
            setStateList(
                states.map((state) => ({
                    ...state,
                    label: state.name,
                    value: state.name,
                }))
            );

            form.setFieldValue("country", "Philippines");
        };

        extractCountryState();

        return () => {
        };
    }, []);

    // Removed fetching of authenticated user's profile picture to avoid overriding selected profile image

    const {data: dataCivilStatus} = GET(
        "api/civil_status",
        "civil_status_dropdown",
        () => {
        },
        false
    );
    const {data: dataCitizenship} = GET(
        "api/citizenship",
        "citizenships_dropdown",
        () => {
        },
        false
    );
    const {data: dataReligion} = GET(
        "api/religion",
        "religion_dropdown",
        () => {
        },
        false
    );

      const {mutate: mutateProfile, isLoading: isLoadingProfile} = POST(
          "api/profile",
          "profile_list",
          false // Disable global loading for profile updates in document generation modal
      );

    const calculateAge = (birthdate) => {
        if (!birthdate) return null;
        const today = dayjs();
        const birthDate = dayjs(birthdate);
        return today.diff(birthDate, 'year');
    };

    const handleBirthdateChange = (date) => {
        const age = calculateAge(date);
        form.setFieldValue('age', age);
    };

    // Handler for father's birthdate
    const handleFatherBirthdateChange = (date) => {
        const age = calculateAge(date);
        form.setFieldValue('father_age', age);
    };

    // Handler for mother's birthdate
    const handleMotherBirthdateChange = (date) => {
        const age = calculateAge(date);
        form.setFieldValue('mother_age', age);
    };

    const onFinish = (data) => {
        // Validate at least one parent/spouse information is provided
        const hasAnyParentInfo = [data.mother_name, data.father_name, data.spouse_name]
            .some((v) => v && String(v).trim() !== "");

        if (!hasAnyParentInfo) {
            notification.error({
                message: 'Validation Error',
                description: 'Please provide at least one parent or spouse full name.',
            });
            return;
        }

        // Validate profile picture is provided (not default)
        const hasProfilePicture = stagedProfilePicture?.file || toggleModalUploadProfilePicture.file;
        const isEditingExistingProfile = toggleModalForm.data && toggleModalForm.data.id;
        
        if (!isEditingExistingProfile && !hasProfilePicture) {
            notification.error({
                message: 'Profile Picture Required',
                description: 'Please upload a formal or graduation picture. Default profile pictures are not allowed.',
            });
            return;
        }

        console.log("Original data:", data);

        // Helper function to convert string to uppercase, excluding username and email
        const toUpperCaseExceptExcluded = (value, fieldName) => {
            const excludedFields = ['username', 'email'];
            if (excludedFields.includes(fieldName) || !value || typeof value !== 'string') {
                return value;
            }
            return value.toUpperCase();
        };

        // Helper function to concatenate name fields
        const concatenateName = (firstname, middlename, lastname, name_ext) => {
            const parts = [];

            if (firstname) parts.push(firstname.toUpperCase());
            if (middlename) parts.push(`${middlename.toUpperCase()}.`);
            if (lastname) parts.push(lastname.toUpperCase());
            if (name_ext) parts.push(name_ext.toUpperCase());

            return parts.join(' ').trim();
        };

        // Transform the data for API submission with uppercase conversion
        const transformedData = {};

        // Convert all fields to uppercase except username and email
        Object.keys(data).forEach(key => {
            transformedData[key] = toUpperCaseExceptExcluded(data[key], key);
        });

        // Add concatenated names ONLY if split fields were provided; otherwise keep single-field values
        const hasMotherPieces = (
            data.mother_firstname || data.mother_middlename || data.mother_lastname || data.mother_name_ext
        );
        if (hasMotherPieces) {
            transformedData.mother_name = concatenateName(
                data.mother_firstname,
                data.mother_middlename,
                data.mother_lastname,
                data.mother_name_ext
            );
        }

        const hasFatherPieces = (
            data.father_firstname || data.father_middlename || data.father_lastname || data.father_name_ext
        );
        if (hasFatherPieces) {
            transformedData.father_name = concatenateName(
                data.father_firstname,
                data.father_middlename,
                data.father_lastname,
                data.father_name_ext
            );
        }

        const hasSpousePieces = (
            data.spouse_firstname || data.spouse_middlename || data.spouse_lastname || data.spouse_name_ext
        );
        if (hasSpousePieces) {
            transformedData.spouse_name = concatenateName(
                data.spouse_firstname,
                data.spouse_middlename,
                data.spouse_lastname,
                data.spouse_name_ext
            );
        }

        // Remove the individual name fields and age as they're not needed for the API
        delete transformedData.mother_firstname;
        delete transformedData.mother_middlename;
        delete transformedData.mother_lastname;
        delete transformedData.mother_name_ext;
        delete transformedData.father_firstname;
        delete transformedData.father_middlename;
        delete transformedData.father_lastname;
        delete transformedData.father_name_ext;
        delete transformedData.spouse_firstname;
        delete transformedData.spouse_middlename;
        delete transformedData.spouse_lastname;
        delete transformedData.spouse_name_ext;
        // Ensure we preserve existing single-field values if no pieces supplied
        if (!transformedData.mother_name && data.mother_name) transformedData.mother_name = toUpperCaseExceptExcluded(data.mother_name);
        if (!transformedData.father_name && data.father_name) transformedData.father_name = toUpperCaseExceptExcluded(data.father_name);
        if (!transformedData.spouse_name && data.spouse_name) transformedData.spouse_name = toUpperCaseExceptExcluded(data.spouse_name);
        delete transformedData.age;

        console.log("Transformed data:", transformedData);

        // Add profile ID if editing existing profile
        if (toggleModalForm.data && toggleModalForm.data.id) {
            transformedData.id = toggleModalForm.data.id;
        }

        // If a staged profile picture exists, send as multipart FormData; otherwise JSON
        const hasImage = stagedProfilePicture?.file || toggleModalUploadProfilePicture.file;
        let payload = transformedData;

        if (hasImage) {
            const fd = new FormData();
            Object.entries(transformedData).forEach(([key, value]) => {
                fd.append(key, value ?? "");
            });
            const file = stagedProfilePicture?.file || toggleModalUploadProfilePicture.file;
            const fileName = stagedProfilePicture?.fileName || toggleModalUploadProfilePicture.fileName || "profile.jpg";
            fd.append("profile_picture", file, fileName);
            payload = fd;
        }

        // Submit the data using the existing POST hook
        mutateProfile(payload, {
            onSuccess: async (response) => {
                try {
                    const isEditing = toggleModalForm.data && toggleModalForm.data.id;
                    
                    // Only show notification if not editing (for new profiles)
                    if (!isEditing) {
                        notification.success({
                            message: 'Profile Added Successfully',
                            description: 'The profile has been added to the system.',
                        });
                    }
                    
                    form.resetFields();
                    setStagedProfilePicture(null);
                    
                    // If we uploaded a new profile picture, wait a moment for the server to process it
                    if (hasImage) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    
                    // Refetch table data if refetch function is available
                    if (refetch) {
                        try {
                            // Pass the updated form data to the parent
                            // Include a flag to indicate that we need to refresh attachments
                            await refetch({
                                ...transformedData,
                                _refreshAttachments: true,
                                _hasNewProfilePicture: hasImage
                            });
                        } catch (refetchError) {
                            console.error('Refetch error:', refetchError);
                            // Continue execution even if refetch fails
                        }
                    }
                } catch (error) {
                    console.error('Error in onSuccess handler:', error);
                } finally {
                    // Always close modal regardless of what happens
                    setToggleModalForm({ open: false, data: null });
                }
            },
            onError: (error) => {
                const isEditing = toggleModalForm.data && toggleModalForm.data.id;
                notification.error({
                    message: isEditing ? 'Error Updating Profile' : 'Error Adding Profile',
                    description: error?.response?.data?.message || `An error occurred while ${isEditing ? 'updating' : 'adding'} the profile.`,
                });
            }
        });
    };

    return (
        <Modal
            title={(toggleModalForm.data ? "Edit " : "Add ") + "Profile"}
            open={toggleModalForm.open}
            onCancel={() => handleCancel(form, setToggleModalForm)}
            onOk={() => form.submit()}
            confirmLoading={isLoadingProfile}
            wrapClassName="modal-form-profile-wrap"
            centered
            okText="Submit"
            width={{
                xs: "100%",
                sm: "100%",
                md: "70%",
                lg: "60%",
                xl: "60%",
                xxl: "60%",
            }}
            forceRender
        >
            <Form form={form} onFinish={onFinish}>
                <Collapse
                    defaultActiveKey={["1"]}
                    items={[
                        {
                            label: "Account Information",
                            key: "1",
                            children: (
                                <Row gutter={[20, 0]}>
                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="username"
                                        >
                                            <FloatInput
                                                label="Username"
                                                disabled
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="email"
                                        >
                                            <FloatInput
                                                label="Email"
                                                disabled
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                        ),
                    },
                ]}
            />


            <Collapse
                defaultActiveKey={["2"]}
                items={[
                    {
                        label: "Personal Information",
                        key: "2",
                        children: (
                            <>
                                <Row gutter={[20, 0]}>
                                    {/* Left: Profile Picture */}
                                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                                        <div className="profile-picture-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <img
                                                alt=""
                                                src={
                                                    stagedProfilePicture?.src || 
                                                    toggleModalUploadProfilePicture.src ||
                                                    defaultProfile
                                                }
                                                style={{
                                                    width: 280,
                                                    height: 360,
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
                                                icon={<FontAwesomeIcon icon={faCamera} />}
                                                className="btn-upload"
                                                onClick={() =>
                                                    setToggleModalUploadProfilePicture((ps) => ({
                                                        ...ps,
                                                        open: true,
                                                    }))
                                                }
                                            >
                                                {toggleModalUploadProfilePicture.src ? 'Update Photo' : 'Upload Photo'}
                                            </Button>
                                        </div>

                                        <ModalUploadProfilePicture
                                            toggleModalUploadProfilePicture={toggleModalUploadProfilePicture}
                                            setToggleModalUploadProfilePicture={setToggleModalUploadProfilePicture}
                                            params={{ id: userData().id }}
                                            setStagedProfilePicture={setStagedProfilePicture}
                                            stagedProfilePicture={stagedProfilePicture}
                                        />
                                    </Col>

                                    {/* Right: Personal Info Fields */}
                                    <Col xs={24} sm={24} md={16} lg={16} xl={16}>
                                        <Row gutter={[20, 0]}>
                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item
                                                    name="firstname"
                                                    rules={[validateRules.required()]}
                                                >
                                                    <FloatInput
                                                        label="First Name"
                                                        required
                                                        style={{ textTransform: 'uppercase' }}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item name="middlename">
                                                    <FloatInput
                                                        label="Middle Name"
                                                        style={{ textTransform: 'uppercase' }}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item
                                                    name="lastname"
                                                    rules={[validateRules.required()]}
                                                >
                                                    <FloatInput
                                                        label="Last Name"
                                                        required
                                                        style={{ textTransform: 'uppercase' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item name="name_ext">
                                                    <FloatSelect
                                                        label="Name Extension"
                                                        options={optionNameExtension.map(option => ({
                                                            ...option,
                                                            label: option.label.toUpperCase()
                                                        }))}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item name="gender" rules={[validateRules.required()] }>
                                                    <FloatSelect
                                                        label="Select Gender"
                                                        required
                                                        options={Gender.map(option => ({
                                                            ...option,
                                                            label: option.label.toUpperCase()
                                                        }))}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item name="birthdate" rules={[validateRules.required()] }>
                                                    <FloatDatePicker
                                                        format={{
                                                            format: "MM/DD/YYYY",
                                                            type: "mask",
                                                        }}
                                                        label="Date of Birth"
                                                        required
                                                        onChange={handleBirthdateChange}
                                                    />
                                                </Form.Item>
                                            </Col>


                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item name="birthplace" rules={[validateRules.required()] }>
                                                    <FloatInput
                                                        label="Place of Birth"
                                                        required
                                                        style={{ textTransform: 'uppercase' }}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item name="citizenship" rules={[validateRules.required()] }>
                                                    <FloatSelect
                                                        label="Citizenship"
                                                        required
                                                        options={optionCitizenship.map(option => ({
                                                            ...option,
                                                            label: option.label.toUpperCase()
                                                        }))}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item name="religion">
                                                    <FloatSelect
                                                        label="Religion"
                                                        options={optionReligion.map(option => ({
                                                            ...option,
                                                            label: option.label.toUpperCase()
                                                        }))}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item name="civil_status" rules={[validateRules.required()] }>
                                                    <FloatSelect
                                                        label="Civil Status"
                                                        required
                                                        options={optionCivilStatus.map(option => ({
                                                            ...option,
                                                            label: option.label.toUpperCase()
                                                        }))}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                                <Form.Item name="course" rules={[validateRules.required()] }>
                                                    <FloatSelect
                                                        label="Course"
                                                        required
                                                        options={[{
                                                            label: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY",
                                                            value: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY"
                                                        }]}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                                <Form.Item name="address" rules={[validateRules.required()] }>
                                                    <FloatInput
                                                        label="Home Address"
                                                        required
                                                        style={{ textTransform: 'uppercase' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </>
                        ),
                    },
                ]}
            />

           <Collapse
                defaultActiveKey={["3"]}
                items={[
                    {
                        label: "Parents Information (Firstname M. Lastname)",
                        key: "3",
                        children: (
                            <div>
                                <Typography.Title level={5} >
                                    MOTHER INFORMATION
                                </Typography.Title>

                                <Row gutter={[20, 0]}>
                                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                        <Form.Item
                                            name="mother_name"
                                        >
                                            <FloatInput
                                                label="Mother's Full Name"
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>

                                </Row>

                                <Typography.Title level={5} >
                                    FATHER INFORMATION
                                </Typography.Title>

                                <Row gutter={[20, 0]}>
                                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                        <Form.Item
                                            name="father_name"
                                        >
                                            <FloatInput
                                                label="Father's Full Name"
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>

                                

                                </Row>

                                     <Typography.Title level={5} >
                                    SPOUSE INFORMATION
                                </Typography.Title>

                                <Row gutter={[20, 0]}>
                                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                        <Form.Item
                                            name="spouse_name"
                                        >
                                            <FloatInput
                                                label="Spouse's Full Name"
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        ),
                    },
                ]}
            />


               <Collapse
                defaultActiveKey={["4"]}
                items={[
                    {
                        label: "EDUCATIONAL BACKGROUND",
                        key: "4",
                        children: (
                            <div>
                                <Typography.Title level={5} >
                                    ELEMENTARY SCHOOL
                                </Typography.Title>

                                <Row gutter={[20, 0]}>
                                    <Col xs={24} sm={24} md={12} lg={18} xl={18}>
                                        <Form.Item
                                            name="elem_school"
                                            rules={[validateRules.required()]}
                                        >
                                            <FloatInput
                                                label="School Name"
                                                required
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="elem_lastyearattened"
                                            rules={[validateRules.required()]}
                                        >
                                            <FloatInput
                                                label="Last Year Attended"
                                                maxLength={4}
                                                required
                                                onKeyPress={(e) => {
                                                    if (!/[0-9]/.test(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onPaste={(e) => {
                                                    const paste = (e.clipboardData || window.clipboardData).getData('text');
                                                    if (!/^\d+$/.test(paste)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>


                                </Row>

                                <Typography.Title level={5} >
                                    JUNIOR HIGH SCHOOL
                                </Typography.Title>

                                <Row gutter={[20, 0]}>
                                                                     <Col xs={24} sm={24} md={18} lg={18} xl={18}>
                                        <Form.Item
                                            name="junior_high_school"
                                            rules={[validateRules.required()]}
                                        >
                                            <FloatInput
                                                label="School Name"
                                                required
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="junior_high_school_lastyearattened"
                                            rules={[validateRules.required()]}
                                        >
                                            <FloatInput
                                                label="Last Year Attended"
                                                maxLength={4}
                                                required
                                                onKeyPress={(e) => {
                                                    if (!/[0-9]/.test(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onPaste={(e) => {
                                                    const paste = (e.clipboardData || window.clipboardData).getData('text');
                                                    if (!/^\d+$/.test(paste)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>

                                </Row>

                                     <Typography.Title level={5} >
                                    SENIOR HIGH SCHOOL
                                </Typography.Title>

                                <Row gutter={[20, 0]}>
                                                                       <Col xs={24} sm={24} md={18} lg={18} xl={18}>
                                        <Form.Item
                                            name="senior_high_school"
                                            rules={[validateRules.required()]}
                                        >
                                            <FloatInput
                                                label="School Name"
                                                required
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="senior_high_school_lastyearattened"
                                            rules={[validateRules.required()]}
                                        >
                                            <FloatInput
                                                label="Last Year Attended"
                                                maxLength={4}
                                                required
                                                onKeyPress={(e) => {
                                                    if (!/[0-9]/.test(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onPaste={(e) => {
                                                    const paste = (e.clipboardData || window.clipboardData).getData('text');
                                                    if (!/^\d+$/.test(paste)) {
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
            </Form>
        </Modal>
    );
}