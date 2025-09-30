import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin } from "antd";

import { GET } from "../../../providers/useAxiosQuery";

export default function PageProfileViewLegacy() {
    const navigate = useNavigate();
    const params = useParams();

    // Fetch profile data to get the user UUID
    const { data: profileData } = GET(
        `api/profile/${params.id}`,
        ["profile_legacy_redirect", params.id],
        (res) => {
            // On success, redirect to UUID-based URL
            if (res?.success && res?.data?.user?.uuid) {
                navigate(`/student-profile/view/${res.data.user.uuid}`, { replace: true });
            }
        }
    );

    useEffect(() => {
        if (profileData?.data?.user?.uuid) {
            // Redirect to the new UUID-based URL
            navigate(`/student-profile/view/${profileData.data.user.uuid}`, { replace: true });
        }
    }, [profileData, navigate]);

    // Show loading while redirecting
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh' 
        }}>
            <Spin size="large" />
            <span style={{ marginLeft: 16 }}>Redirecting...</span>
        </div>
    );
}