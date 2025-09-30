import {useContext, useEffect, useState} from "react";
import {Col, Form, Modal, Row, Collapse, Button, Select, Typography, notification} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faUpload, faRobot } from "@fortawesome/pro-regular-svg-icons";
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
import regions from "../../../../providers/regions.json";
import provinces from "../../../../providers/provinces.json";
import cities from "../../../../providers/city-mun.json";
import barangays from "../../../../providers/barangays.json";
import { apiUrl, defaultProfile, userData } from "../../../../providers/appConfig";
import ModalUploadProfilePicture from "../../PageUser/components/ModalUploadProfilePicture";
import dualAiService from "../../../../providers/dualAiService";

export default function ModalFormProfile() {
    // Alphabet options for middle initial
    const alphabetOptions = Array.from({ length: 26 }, (_, i) => ({
        label: String.fromCharCode(65 + i),
        value: String.fromCharCode(65 + i)
    }));
    const {toggleModalForm, setToggleModalForm, refetch} =
        useContext(PageProfileContext);



    const [form] = Form.useForm();

    const [countryList, setCountryList] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [barangayList, setBarangayList] = useState([]);

    const [selectedCountry, setSelectedCountry] = useState("Philippines");
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [filteredProvinces, setFilteredProvinces] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [filteredBarangays, setFilteredBarangays] = useState([]);

    // For non-Philippines
    const [selectedNonPHCountry, setSelectedNonPHCountry] = useState(null);
    const [selectedNonPHState, setSelectedNonPHState] = useState(null);
    const [nonPHStates, setNonPHStates] = useState([]);
    const [nonPHCities, setNonPHCities] = useState([]);

    // Profile photo upload modal state (same shape as PageEditProfile)
    const [toggleModalUploadProfilePicture, setToggleModalUploadProfilePicture] = useState({
        open: false,
        file: null,
        src: null,
        is_camera: null,
        fileName: null,
    });
    const [stagedProfilePicture, setStagedProfilePicture] = useState(null);

    // State for import profile functionality
    const [fileInputRef, setFileInputRef] = useState(null);
    const [aiFileInputRef, setAiFileInputRef] = useState(null);
    
    // State for AI loading modal
    const [aiLoadingModal, setAiLoadingModal] = useState({
        open: false,
        analyzing: false
    });

    // State for AI warning modal
    const [aiWarningModal, setAiWarningModal] = useState({
        open: false,
        pendingFile: null
    });

    // Check if form has any existing values
    const hasFormData = () => {
        const formValues = form.getFieldsValue();
        return Object.values(formValues).some(value => {
            if (value === null || value === undefined || value === '') {
                return false;
            }
            // Check for dayjs objects (dates)
            if (value && typeof value === 'object' && value.format) {
                return true;
            }
            return true;
        });
    };

    // Handle file import
    const handleImportProfile = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    
                    // Populate form with imported data
                    form.setFieldsValue({
                        ...jsonData,
                        // Convert date strings back to dayjs objects if needed
                        birthdate: jsonData.birthdate ? dayjs(jsonData.birthdate) : null,
                    });
                    
                    notification.success({
                        message: 'Import Successful',
                        description: 'Profile data has been imported successfully.',
                    });
                } catch (error) {
                    notification.error({
                        message: 'Import Failed',
                        description: 'Invalid file format. Please select a valid JSON file.',
                    });
                }
            };
            reader.readAsText(file);
        }
        // Reset file input
        if (event.target) {
            event.target.value = '';
        }
    };

    // Handle AI image analysis import
    const handleAiImportProfile = async (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check if form has existing data
            if (hasFormData()) {
                // Show warning modal instead of proceeding directly
                setAiWarningModal({
                    open: true,
                    pendingFile: file
                });
                return;
            }

            // If no existing data, proceed directly
            await processAiImport(file);
        }
        
        // Reset file input
        if (event.target) {
            event.target.value = '';
        }
    };

    // Process AI import (extracted from handleAiImportProfile)
    const processAiImport = async (file) => {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            notification.error({
                message: 'Invalid File Type',
                description: 'Please select a valid image file (JPG, JPEG, or PNG).',
            });
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            notification.error({
                message: 'File Too Large',
                description: 'Please select an image file smaller than 10MB.',
            });
            return;
        }

        // Check if any AI service is configured
        if (!dualAiService.isConfigured()) {
            const status = dualAiService.getServiceStatus();
            notification.error({
                message: 'AI Services Not Configured',
                description: `No AI services are properly configured. Gemma: ${status.gemma.available ? 'Available' : 'Missing'}, OpenAI: ${status.openai.available ? 'Available' : 'Missing'}. Please contact your administrator.`,
            });
            return;
        }

        // Show loading modal
        setAiLoadingModal({
            open: true,
            analyzing: true
        });

        try {
            // Analyze image with Dual AI (Gemma priority, OpenAI fallback)
            const extractedData = await dualAiService.analyzeImage(file);
            
            // Convert date string to dayjs object if present and calculate age
            if (extractedData.birthdate) {
                extractedData.birthdate = dayjs(extractedData.birthdate);
                // Calculate age automatically when birthdate is set
                extractedData.age = calculateAge(extractedData.birthdate);
            }

            // Populate form with extracted data (excluding metadata)
            const { _aiService, _serviceUsed, _fallbackUsed, ...profileData } = extractedData;
            form.setFieldsValue(profileData);

            // Close loading modal
            setAiLoadingModal({
                open: false,
                analyzing: false
            });

            // Show success message with service info
            notification.success({
                message: 'AI Analysis Completed',
                description: `Profile data has been extracted using ${_serviceUsed}${_fallbackUsed ? ' (fallback)' : ''}. Please review and verify all information before submitting.`,
                duration: 6
            });

        } catch (error) {
            console.error('AI Import Error:', error);
            
            // Close loading modal
            setAiLoadingModal({
                open: false,
                analyzing: false
            });

            notification.error({
                message: 'AI Analysis Failed',
                description: error.message || 'An error occurred while analyzing the image. Please try again or import manually.',
                duration: 8
            });
        }
    };

    // Handle AI warning modal actions
    const handleAiWarningCancel = () => {
        setAiWarningModal({
            open: false,
            pendingFile: null
        });
    };

    const handleAiWarningProceed = async () => {
        const file = aiWarningModal.pendingFile;
        setAiWarningModal({
            open: false,
            pendingFile: null
        });
        
        if (file) {
            await processAiImport(file);
        }
    };

    // Reset form when modal opens
    useEffect(() => {
        if (toggleModalForm.open) {
            setSelectedCountry("Philippines");
            form.setFieldValue("country", "Philippines");
            setSelectedRegion(null);
            setSelectedProvince(null);
            setSelectedCity(null);

            // If adding a new profile, ensure the profile picture uses the default image
            if (!toggleModalForm.data) {
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
    }, [toggleModalForm.open]);

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

    // Initialize existing profile picture only when editing
    // Note: Skip this API call since userData() doesn't contain UUID and User model now uses UUID-based routing
    const userDataInfo = userData();
    const { data: userProfileData } = GET(
        userDataInfo?.uuid ? `api/users/${userDataInfo.uuid}` : null,
        userDataInfo?.uuid ? ["users_info", userDataInfo.uuid] : null,
        {
            enabled: !!userDataInfo?.uuid,
        }
    );

    useEffect(() => {
        const res = userProfileData;
        if (toggleModalForm.data && res?.data?.profile?.attachments) {
            const pics = res.data.profile.attachments.filter(
                (f) => f.file_description === "Profile Picture"
            );
            if (pics.length > 0) {
                setToggleModalUploadProfilePicture((ps) => ({
                    ...ps,
                    src: apiUrl(pics[pics.length - 1].file_path),
                }));
            }
        }
    }, [userProfileData, toggleModalForm.data]);

    useEffect(() => {
        if (selectedCountry === "Philippines") {
            if (selectedRegion) {
                setFilteredProvinces(provinces.filter(p => p.reg_code === selectedRegion));
            } else {
                setFilteredProvinces([]);
            }
            setSelectedProvince(null);
            setSelectedCity(null);
            setFilteredCities([]);
            setFilteredBarangays([]);
        }
    }, [selectedRegion, selectedCountry]);

    useEffect(() => {
        if (selectedCountry === "Philippines") {
            if (selectedProvince) {
                setFilteredCities(cities.filter(c => c.prov_code === selectedProvince));
            } else {
                setFilteredCities([]);
            }
            setSelectedCity(null);
            setFilteredBarangays([]);
        }
    }, [selectedProvince, selectedCountry]);

    useEffect(() => {
        if (selectedCountry === "Philippines") {
            if (selectedCity) {
                setFilteredBarangays(barangays.filter(b => b.mun_code === selectedCity));
            } else {
                setFilteredBarangays([]);
            }
        }
    }, [selectedCity, selectedCountry]);

    // For non-Philippines: fetch states when country changes
    useEffect(() => {
        if (selectedCountry && selectedCountry !== "Philippines") {
            const countryObj = countryList.find(c => c.value === selectedCountry);
            if (countryObj && countryObj.id) {
                GetState(countryObj.id).then(states => {
                    setNonPHStates(states.map(state => ({label: state.name, value: state.name, id: state.id})));
                });
            } else {
                setNonPHStates([]);
            }
            setSelectedNonPHState(null);
            setNonPHCities([]);
        }
    }, [selectedCountry]);

    // For non-Philippines: fetch cities when state changes
    useEffect(() => {
        if (selectedCountry && selectedCountry !== "Philippines" && selectedNonPHState) {
            const countryObj = countryList.find(c => c.value === selectedCountry);
            const stateObj = nonPHStates.find(s => s.value === selectedNonPHState);
            if (countryObj && stateObj) {
                GetCity(countryObj.id, stateObj.id).then(cities => {
                    setNonPHCities(cities.map(city => ({label: city.name, value: city.name})));
                });
            } else {
                setNonPHCities([]);
            }
        }
    }, [selectedNonPHState, selectedCountry]);

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
        "profile_list"
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
        // Check individual name fields since this form uses separate firstname, middlename, lastname fields
        const hasMotherInfo = (data.mother_firstname && data.mother_firstname.trim()) || 
                             (data.mother_lastname && data.mother_lastname.trim()) ||
                             (data.mother_name && data.mother_name.trim());
        const hasFatherInfo = (data.father_firstname && data.father_firstname.trim()) || 
                             (data.father_lastname && data.father_lastname.trim()) ||
                             (data.father_name && data.father_name.trim());
        const hasSpouseInfo = (data.spouse_firstname && data.spouse_firstname.trim()) || 
                             (data.spouse_lastname && data.spouse_lastname.trim()) ||
                             (data.spouse_name && data.spouse_name.trim());

        if (!hasMotherInfo && !hasFatherInfo && !hasSpouseInfo) {
            notification.error({
                message: 'Validation Error',
                description: 'Please provide at least one parent or spouse information (first name or last name required).',
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

        // Add concatenated names
        transformedData.mother_name = concatenateName(
            data.mother_firstname,
            data.mother_middlename,
            data.mother_lastname,
            data.mother_name_ext
        );
        transformedData.father_name = concatenateName(
            data.father_firstname,
            data.father_middlename,
            data.father_lastname,
            data.father_name_ext
        );
        transformedData.spouse_name = concatenateName(
            data.spouse_firstname,
            data.spouse_middlename,
            data.spouse_lastname,
            data.spouse_name_ext
        );

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
        delete transformedData.age;

        console.log("Transformed data:", transformedData);

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
            onSuccess: (response) => {
                notification.success({
                    message: 'Profile Added Successfully',
                    description: 'The profile has been added to the system.',
                });
                form.resetFields();
                setToggleModalForm({ open: false, data: null });
                setStagedProfilePicture(null);
                // Refetch table data if refetch function is available
                if (refetch) {
                    refetch();
                }
            },
            onError: (error) => {
                notification.error({
                    message: 'Error Adding Profile',
                    description: error?.response?.data?.message || 'An error occurred while adding the profile.',
                });
            }
        });
    };

    return (
        <>
            <Modal
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ color: 'white' }}>{(toggleModalForm.data ? "Edit " : "Add ") + "Profile"}</span>
                        {!toggleModalForm.data && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Button
                                    type="text"
                                    icon={<FontAwesomeIcon icon={faRobot} />}
                                    onClick={() => aiFileInputRef?.click()}
                                    size="small"
                                    style={{ 
                                        fontSize: '15px', 
                                        color: 'white',
                                        marginRight: '40px'
                                    }}
                                >
                                    AI Import
                                </Button>

                            </div>
                        )}
                    </div>
                }
                open={toggleModalForm.open}
                onCancel={() => handleCancel(form, setToggleModalForm)}
                onOk={() => form.submit()}
                confirmLoading={isLoadingProfile}
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
                <input
                    type="file"
                    ref={setFileInputRef}
                    onChange={handleImportProfile}
                    accept=".json"
                    style={{ display: 'none' }}
                />
                <input
                    type="file"
                    ref={setAiFileInputRef}
                    onChange={handleAiImportProfile}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
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
                                            rules={[validateRules.required()]}
                                        >
                                            <FloatInput
                                                label="Username"
                                                required
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="email"
                                            rules={[validateRules.required()]}
                                        >
                                            <FloatInput
                                                label="Email"
                                                required
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
                                                    toggleModalUploadProfilePicture.src
                                                        ? toggleModalUploadProfilePicture.src
                                                        : defaultProfile
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
                                                <Form.Item name="gender" rules={[validateRules.required()]}>
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
                                                <Form.Item 
                                                    name="birthdate" 
                                                    rules={[
                                                        validateRules.required(),
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
                                                        required
                                                        onChange={handleBirthdateChange}
                                                        disabledDate={(current) => {
                                                            // Disable future dates and dates before 1900
                                                            return current && (current.isAfter(dayjs()) || current.year() < 1900);
                                                        }}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item name="age">
                                                    <FloatInputNumber
                                                        label="Age"
                                                        disabled
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item name="birthplace" rules={[validateRules.required()]}>
                                                    <FloatInput
                                                        label="Place of Birth"
                                                        required
                                                        style={{ textTransform: 'uppercase' }}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                                                <Form.Item name="citizenship" rules={[validateRules.required()]}>
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
                                                <Form.Item name="civil_status" rules={[validateRules.required()]}>
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
                                                <Form.Item name="course" rules={[validateRules.required()]}>
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
                                                <Form.Item name="address" rules={[validateRules.required()]}>
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
                        label: "Parents Information",
                        key: "3",
                        children: (
                            <div>
                                <Typography.Title level={5} >
                                    MOTHER INFORMATION
                                </Typography.Title>

                                <Row gutter={[20, 0]}>
                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="mother_firstname"
                                        >
                                            <FloatInput
                                                label="First Name"
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="mother_middlename"
                                        >
                                            <FloatSelect
                                                label="Middle Initial"
                                                options={alphabetOptions}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="mother_lastname"
                                        >
                                            <FloatInput
                                                label="Last Name"
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item name="mother_name_ext">
                                            <FloatSelect
                                                label="Name Extension"
                                                options={optionNameExtension.map(option => ({
                                                    ...option,
                                                    label: option.label.toUpperCase()
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>

                                </Row>

                                <Typography.Title level={5} >
                                    FATHER INFORMATION
                                </Typography.Title>

                                <Row gutter={[20, 0]}>
                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="father_firstname"
                                        >
                                            <FloatInput
                                                label="First Name"
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="father_middlename"
                                        >
                                            <FloatSelect
                                                label="Middle Initial"
                                                options={alphabetOptions}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="father_lastname"
                                        >
                                            <FloatInput
                                                label="Last Name"
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item name="father_name_ext">
                                            <FloatSelect
                                                label="Name Extension"
                                                options={optionNameExtension.map(option => ({
                                                    ...option,
                                                    label: option.label.toUpperCase()
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>

                                </Row>

                                     <Typography.Title level={5} >
                                    SPOUSE INFORMATION
                                </Typography.Title>

                                <Row gutter={[20, 0]}>
                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="spouse_firstname"
                                        >
                                            <FloatInput
                                                label="First Name"
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="spouse_middlename"
                                        >
                                            <FloatSelect
                                                label="Middle Initial"
                                                options={alphabetOptions}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="spouse_lastname"
                                        >
                                            <FloatInput
                                                label="Last Name"
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item name="spouse_name_ext">
                                            <FloatSelect
                                                label="Name Extension"
                                                options={optionNameExtension.map(option => ({
                                                    ...option,
                                                    label: option.label.toUpperCase()
                                                }))}
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
                                            rules={[
                                                validateRules.required(),
                                                { validator: validateYear }
                                            ]}
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
                                            rules={[
                                                validateRules.required(),
                                                { validator: validateEducationalTimeline('junior') }
                                            ]}
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
                                        >
                                            <FloatInput
                                                label="School Name (Optional)"
                                                style={{ textTransform: 'uppercase' }}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                        <Form.Item
                                            name="senior_high_school_lastyearattened"
                                            rules={[
                                                { validator: validateEducationalTimeline('senior') }
                                            ]}
                                        >
                                            <FloatInput
                                                label="Last Year Attended (Optional)"
                                                maxLength={4}
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

            {/* AI Loading Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FontAwesomeIcon icon={faRobot} style={{ color: '#1890ff' }} />
                        <span>AI Analysis in Progress</span>
                    </div>
                }
                open={aiLoadingModal.open}
                footer={null}
                closable={false}
                centered
                width={400}
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '20px' 
                    }}>
                        <div className="ai-loading-spinner" style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #1890ff',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        
                        <div>
                            <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                                Analyzing image with AI...
                            </p>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                                This may take a few seconds.
                            </p>
                            <div style={{
                                background: '#fff7e6',
                                border: '1px solid #ffd591',
                                borderRadius: '6px',
                                padding: '12px',
                                fontSize: '13px',
                                color: '#d48806'
                            }}>
                                <strong>⚠️ Important:</strong> AI can make mistakes. Please review and verify all extracted information before submitting.
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* AI Warning Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FontAwesomeIcon icon={faRobot} style={{ color: '#fa8c16' }} />
                        <span>Confirm AI Import</span>
                    </div>
                }
                open={aiWarningModal.open}
                onCancel={handleAiWarningCancel}
                onOk={handleAiWarningProceed}
                okText="Proceed"
                cancelText="Cancel"
                okType="primary"
                centered
                width={450}
            >
                <div style={{ padding: '20px 0' }}>
                    <div style={{
                        background: '#fff7e6',
                        border: '1px solid #ffd591',
                        borderRadius: '6px',
                        padding: '16px',
                        marginBottom: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '16px' }}>⚠️</span>
                            <strong style={{ color: '#d48806' }}>Warning</strong>
                        </div>
                        <p style={{ color: '#d48806', margin: 0, fontSize: '14px' }}>
                            You have existing data in the form. Proceeding with AI import will <strong>overwrite all current form data</strong>.
                        </p>
                    </div>
                    
                    <div style={{
                        background: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: '6px',
                        padding: '12px',
                        fontSize: '13px',
                        color: '#389e0d'
                    }}>
                        <strong>💡 Note:</strong> AI can make mistakes. Please review and verify all extracted information before submitting.
                    </div>
                    
                    <p style={{ marginTop: '16px', marginBottom: 0, fontSize: '14px', color: '#666' }}>
                        Do you want to continue and replace all existing form data with AI-extracted information?
                    </p>
                </div>
            </Modal>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}
