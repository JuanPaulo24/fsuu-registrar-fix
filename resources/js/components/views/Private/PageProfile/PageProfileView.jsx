import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Button, Collapse, Typography, Card, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faArrowLeft,
    faAngleDown,
    faAngleUp,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { GET } from "../../../providers/useAxiosQuery";
import { apiUrl, defaultProfile } from "../../../providers/appConfig";
import { showGlobalLoading, hideGlobalLoading, ensureGlobalLoadingExists } from "../../../providers/globalLoading";
import { hasButtonPermission } from "@/hooks/useButtonPermissions";

const { Title, Text } = Typography;

export default function PageProfileView() {
    const navigate = useNavigate();
    const params = useParams();

    // Permission guard - check if user has permission to view student profiles
    useEffect(() => {
        const hasPermission = hasButtonPermission('M-02-VIEW');

        if (!hasPermission) {
            notification.error({
                message: 'Access Denied',
                description: `You don't have permission to view student profiles.`,
            });
            navigate('/student-profiles');
        }
    }, [navigate]);

    const [profileData, setProfileData] = useState({});
    const [profilePicture, setProfilePicture] = useState(defaultProfile);
    const [isProfileDataReady, setIsProfileDataReady] = useState(false);

    const { data: dataRole } = GET(
        "api/user_role",
        "user_role_select",
        (res) => {},
        false
    );

    const { refetch: refetchProfileData, isLoading: isLoadingProfile } = GET(
        `api/users/${params.uuid}/profile`,
        ["profile_view_info"],
        {
            onSuccess: (res) => {
                if (res.success && res.data) {
                    const data = res.data;
                    setProfileData(data);

                    // Set profile picture (match retrieval used in Edit Profile)
                    try {
                        const attachments = Array.isArray(data.attachments)
                            ? data.attachments.filter(
                                  (f) => f.file_description === "Profile Picture"
                              )
                            : [];

                        if (attachments.length > 0 && attachments[attachments.length - 1]?.file_path) {
                            setProfilePicture(apiUrl(attachments[attachments.length - 1].file_path));
                        } else if (data.profile_picture) {
                            // Fallback to legacy field if present
                            const parts = String(data.profile_picture).split("//");
                            if (parts[0] === "http:" || parts[0] === "https:") {
                                setProfilePicture(data.profile_picture);
                            } else {
                                setProfilePicture(apiUrl(data.profile_picture));
                            }
                        } else {
                            setProfilePicture(defaultProfile);
                        }
                    } catch (e) {
                        setProfilePicture(defaultProfile);
                    }

                    // Ensure all profile data is processed before hiding loading
                    setTimeout(() => {
                        setIsProfileDataReady(true);
                        hideGlobalLoading();
                    }, 400); // Slightly longer delay for profile view
                }
            },
            isLoading: false // Disable automatic global loading, handle manually
        }
    );

    // Manual global loading control for profile view
    useEffect(() => {
        if (isLoadingProfile && !isProfileDataReady) {
            ensureGlobalLoadingExists();
            showGlobalLoading();
        }
    }, [isLoadingProfile, isProfileDataReady]);

    useEffect(() => {
        setIsProfileDataReady(false); // Reset when UUID changes
        refetchProfileData();
    }, [params.uuid]);

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Card>
            <Row gutter={[20, 20]}>
                    {/* Header with Back Button */}
                    <Col xs={24}>
                        <div className="profile-header">
                            <Button
                                type="text"
                                icon={<FontAwesomeIcon icon={faArrowLeft} />}
                                onClick={handleBack}
                                className="profile-header-button"
                            >
                                Back
                            </Button>
                            <Title level={3} className="profile-header-title">
                                View Student Profile
                            </Title>
                        </div>
                    </Col>

                    {/* Main Content */}
                    <Col sm={24} md={24} lg={24} xl={24} xxl={24}>
                        <Row gutter={[20, 20]}>
                            {/* Form Content */}
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
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Username</Text>
                                                                <Text className="profile-field-value">{profileData.user?.username || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Email</Text>
                                                                <Text className="profile-field-value">{profileData.user?.email || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Role</Text>
                                                                <Text className="profile-field-value">
                                                                    {(() => {
                                                                        const id = profileData.user?.user_role_id;
                                                                        if (!id) return 'N/A';
                                                                        const list = Array.isArray(dataRole?.data) ? dataRole.data : [];
                                                                        const found = list.find((item) => item.id === id);
                                                                        return found ? `${found.user_role}` : id;
                                                                    })()}
                                                                </Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Student ID</Text>
                                                                <Text className="profile-field-value">{profileData.id_number || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                ),
                                            },
                                            {
                                                key: "1",
                                                label: "PERSONAL INFORMATION",
                                                children: (
                                                    <Row gutter={[12, 12]}>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">First Name</Text>
                                                                <Text className="profile-field-value">{profileData.firstname || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Middle Name</Text>
                                                                <Text className="profile-field-value">{profileData.middlename || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Last Name</Text>
                                                                <Text className="profile-field-value">{profileData.lastname || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Name Extension</Text>
                                                                <Text className="profile-field-value">{profileData.name_ext || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Gender</Text>
                                                                <Text className="profile-field-value">{profileData.gender || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Birth Date</Text>
                                                                <Text className="profile-field-value">
                                                                    {profileData.birthdate ? dayjs(profileData.birthdate).format('MMMM DD, YYYY') : 'N/A'}
                                                                </Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Age</Text>
                                                                <Text className="profile-field-value">{profileData.age || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Birth Place</Text>
                                                                <Text className="profile-field-value">{profileData.birthplace || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Citizenship</Text>
                                                                <Text className="profile-field-value">{profileData.citizenship || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Religion</Text>
                                                                <Text className="profile-field-value">{profileData.religion || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Civil Status</Text>
                                                                <Text className="profile-field-value">{profileData.civil_status || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Address</Text>
                                                                <Text className="profile-field-value">{profileData.address || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                ),
                                            },
                                            {
                                                key: "2",
                                                label: "PARENTS INFORMATION",
                                                children: (
                                                    <Row gutter={[12, 12]}>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Father's Name</Text>
                                                                <Text className="profile-field-value">{profileData.father_name || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Mother's Name</Text>
                                                                <Text className="profile-field-value">{profileData.mother_name || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Spouse's Name</Text>
                                                                <Text className="profile-field-value">{profileData.spouse_name || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                ),
                                            },
                                            {
                                                key: "3",
                                                label: "EDUCATIONAL BACKGROUND",
                                                children: (
                                                    <Row gutter={[12, 12]}>
                                                        <Col xs={24}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Course</Text>
                                                                <Text className="profile-field-value">{profileData.course || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Elementary School</Text>
                                                                <Text className="profile-field-value">{profileData.elem_school || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Elementary Last Year Attended</Text>
                                                                <Text className="profile-field-value">{profileData.elem_lastyearattened || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Junior High School</Text>
                                                                <Text className="profile-field-value">{profileData.junior_high_school || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Junior High School Last Year Attended</Text>
                                                                <Text className="profile-field-value">{profileData.junior_high_school_lastyearattened || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Senior High School</Text>
                                                                <Text className="profile-field-value">{profileData.senior_high_school || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="profile-field">
                                                                <Text strong className="profile-field-label">Senior High School Last Year Attended</Text>
                                                                <Text className="profile-field-value">{profileData.senior_high_school_lastyearattened || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                ),
                                            },
                                        ]}
                                    />
                            </Col>

                            {/* Profile Picture Sidebar - match Edit Profile style */}
                            <Col
                                sm={24}
                                md={24}
                                lg={10}
                                xl={10}
                                xxl={10}
                                className="collapse-wrapper-photo"
                            >
                                <Collapse
                                    className="collapse-main-primary"
                                    defaultActiveKey={["0"]}
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
                                                        <div
                                                            className="profile-picture-wrapper"
                                                            style={{
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <img
                                                                alt=""
                                                                src={profilePicture || defaultProfile}
                                                                style={{
                                                                    width: 360,
                                                                    height: 480,
                                                                    objectFit: "cover",
                                                                    border: "3px solid #e5e7eb",
                                                                    borderRadius: 6,
                                                                    display: "block",
                                                                    background: "#f5f5f5",
                                                                    boxShadow:
                                                                        "0 2px 6px rgba(0,0,0,0.08)",
                                                                }}
                                                            />
                                                        </div>
                                                    </Col>
                                                </Row>
                                            ),
                                        },
                                    ]}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
        </Card>
    );
}
