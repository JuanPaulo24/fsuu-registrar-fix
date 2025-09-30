import { useNavigate } from "react-router-dom";
import { Result, Button } from "antd";

export default function PageRequestPermission() {
    const navigate = useNavigate();

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            id="PageRequestPermission"
        >
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page. Please Request Permission."
                extra={
                    <Button type="primary" onClick={() => navigate("/")}>
                        Back Home
                    </Button>
                }
            />
        </div>
    );
}
