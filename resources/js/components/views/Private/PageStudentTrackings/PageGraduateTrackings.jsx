import { useLocation } from "react-router-dom";

import StudentTrackingsContent from "./components/StudentTrackingsContent";

export default function PageGraduateTrackings() {
    const location = useLocation();

    return <StudentTrackingsContent />;
}
