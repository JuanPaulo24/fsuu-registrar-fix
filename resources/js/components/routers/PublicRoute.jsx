import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

import PublicLayout from "../layouts/public/Public";

export default function PublicRoute(props) {
    const { component: Component, ...rest } = props;

    const isLoggedIn = localStorage.getItem("token");

    if (!isLoggedIn) {
        return (
            <PublicLayout {...rest}>
                <Component {...rest} />
            </PublicLayout>
        );
    } else {
        return <Navigate to="/dashboard" />;
    }
}

PublicRoute.propTypes = {
    component: PropTypes.elementType.isRequired,
};
