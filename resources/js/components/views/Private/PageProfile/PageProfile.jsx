import { useLocation } from "react-router-dom";

import ProfileContent from "./components/ProfileContent";
import ProfileEmployeeContent from "./components/ProfileEmployeeContent";

export default function PageProfile() {
    const location = useLocation();

    return location.pathname === "/employees" ? (
        <ProfileEmployeeContent />
    ) : (
        <ProfileContent />
    );
}
