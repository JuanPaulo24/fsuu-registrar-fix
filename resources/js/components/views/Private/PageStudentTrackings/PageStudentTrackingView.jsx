import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Button, Collapse, Typography, Card, Image } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faArrowLeft,
    faAngleDown,
    faAngleUp,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { GET } from "../../../providers/useAxiosQuery";
import { apiUrl, defaultProfile } from "../../../providers/appConfig";

const { Title, Text } = Typography;

export default function PageStudentTrackingView() {
    const navigate = useNavigate();
    const params = useParams();

    const [profileData, setProfileData] = useState({});
    const [profilePicture, setProfilePicture] = useState(defaultProfile);

    const { data: dataRole } = GET(
        "api/user_role",
        "user_role_select",
        (res) => {},
        false
    );

    const { refetch: refetchProfileData } = GET(
        `api/profile/${params.id}`,
        ["student_tracking_view_info"],
        (res) => {
            if (res.success && res.data) {
                const data = res.data;
                setProfileData(data);

                // Set profile picture
                if (data.profile_picture) {
                    let profile_picture = data.profile_picture.split("//");
                    if (
                        profile_picture[0] === "http:" ||
                        profile_picture[0] === "https:"
                    ) {
                        setProfilePicture(data.profile_picture);
                    } else {
                        setProfilePicture(apiUrl(data.profile_picture));
                    }
                } else {
                    setProfilePicture(defaultProfile);
                }
            }
        }
    );

    useEffect(() => {
        refetchProfileData();
    }, [params.id]);

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Card>
            <Row gutter={[20, 20]}>
                    {/* Header with Back Button */}
                    <Col xs={24}>
                        <div className="student-tracking-header">
                            <Button
                                type="text"
                                icon={<FontAwesomeIcon icon={faArrowLeft} />}
                                onClick={handleBack}
                                className="student-tracking-header-button"
                            >
                                Back
                            </Button>
                            <Title level={3} className="student-tracking-header-title">
                                View Student Tracking
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
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Username</Text>
                                                                <Text className="student-tracking-field-value">{profileData.user?.username || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Email</Text>
                                                                <Text className="student-tracking-field-value">{profileData.user?.email || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Role</Text>
                                                                <Text className="student-tracking-field-value">{profileData.user?.user_role?.user_role || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Student ID</Text>
                                                                <Text className="student-tracking-field-value">{profileData.id_number || 'N/A'}</Text>
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
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">First Name</Text>
                                                                <Text className="student-tracking-field-value">{profileData.firstname || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Middle Name</Text>
                                                                <Text className="student-tracking-field-value">{profileData.middlename || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Last Name</Text>
                                                                <Text className="student-tracking-field-value">{profileData.lastname || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Name Extension</Text>
                                                                <Text className="student-tracking-field-value">{profileData.name_ext || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Gender</Text>
                                                                <Text className="student-tracking-field-value">{profileData.gender || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Birth Date</Text>
                                                                <Text className="student-tracking-field-value">
                                                                    {profileData.birthdate ? dayjs(profileData.birthdate).format('MMMM DD, YYYY') : 'N/A'}
                                                                </Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Age</Text>
                                                                <Text className="student-tracking-field-value">{profileData.age || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Birth Place</Text>
                                                                <Text className="student-tracking-field-value">{profileData.birthplace || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Citizenship</Text>
                                                                <Text className="student-tracking-field-value">{profileData.citizenship || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Religion</Text>
                                                                <Text className="student-tracking-field-value">{profileData.religion || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Civil Status</Text>
                                                                <Text className="student-tracking-field-value">{profileData.civil_status || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Address</Text>
                                                                <Text className="student-tracking-field-value">{profileData.address || 'N/A'}</Text>
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
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Father's Name</Text>
                                                                <Text className="student-tracking-field-value">{profileData.father_name || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Mother's Name</Text>
                                                                <Text className="student-tracking-field-value">{profileData.mother_name || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Spouse's Name</Text>
                                                                <Text className="student-tracking-field-value">{profileData.spouse_name || 'N/A'}</Text>
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
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Program</Text>
                                                                <Text className="student-tracking-field-value">{profileData.course || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Elementary School</Text>
                                                                <Text className="student-tracking-field-value">{profileData.elem_school || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Elementary Last Year Attended</Text>
                                                                <Text className="student-tracking-field-value">{profileData.elem_lastyearattened || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Junior High School</Text>
                                                                <Text className="student-tracking-field-value">{profileData.junior_high_school || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Junior High School Last Year Attended</Text>
                                                                <Text className="student-tracking-field-value">{profileData.junior_high_school_lastyearattened || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Senior High School</Text>
                                                                <Text className="student-tracking-field-value">{profileData.senior_high_school || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                                            <div className="student-tracking-field">
                                                                <Text strong className="student-tracking-field-label">Senior High School Last Year Attended</Text>
                                                                <Text className="student-tracking-field-value">{profileData.senior_high_school_lastyearattened || 'N/A'}</Text>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                ),
                                            },
                                        ]}
                                    />
                            </Col>

                            {/* Profile Picture Sidebar */}
                            <Col sm={24} md={24} lg={10} xl={10} xxl={10}>
                                <div className="student-tracking-picture-container">
                                    <Image
                                        width={200}
                                        height={200}
                                        src={profilePicture}
                                        alt={`${profileData.firstname || ''} ${profileData.lastname || ''}`}
                                        className="student-tracking-picture"
                                        preview={{
                                            mask: 'Click to preview'
                                        }}
                                    />
                                    <div className="student-tracking-picture-info">
                                        <Title level={4} className="student-tracking-picture-name">
                                            {profileData.firstname} {profileData.lastname}
                                        </Title>
                                        <Typography.Text type="secondary" className="student-tracking-picture-id">
                                            ID: {profileData.id_number}
                                        </Typography.Text>
                                        <br />
                                        <Typography.Text type="secondary" className="student-tracking-picture-course">
                                            {profileData.course}
                                        </Typography.Text>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
        </Card>
    );
}
