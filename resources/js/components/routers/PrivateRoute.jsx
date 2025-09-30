import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import PrivateLayout from "../layouts/private/Private";
import useCheckAuthStatus from "../providers/useCheckAuthStatus";
import SessionTimeoutProvider from "../../providers/SessionTimeoutProvider";
import SessionTimeoutModal from "../common/SessionTimeoutModal";
import { userData } from "../providers/appConfig";

export default function PrivateRoute(props) {
    const { component: Component, layout = true, moduleName, ...rest } = props;
    const [hasAccess, setHasAccess] = useState(true);

    useCheckAuthStatus();

    let isLoggedIn = localStorage.getItem("token");

    // Check if user has permission to access this module
    const checkModuleAccess = (moduleName) => {
        if (!moduleName) {
            return true; // If no module specified, allow access
        }

        const user = userData();
        if (!user || !user.accessible_modules) {
            return false; // No user data or modules, deny access
        }

        // Check if user has access to this module
        return user.accessible_modules.some(module => module.module_name === moduleName);
    };

    // Initial access check
    useEffect(() => {
        setHasAccess(checkModuleAccess(moduleName));
    }, [moduleName]);

    // Listen for permission refresh events
    useEffect(() => {
        const handlePermissionRefresh = () => {
            setHasAccess(checkModuleAccess(moduleName));
        };

        window.addEventListener('userPermissionsRefreshed', handlePermissionRefresh);

        return () => {
            window.removeEventListener('userPermissionsRefreshed', handlePermissionRefresh);
        };
    }, [moduleName]);

    if (isLoggedIn) {
        // Check module permission using state
        if (!hasAccess) {
            return <Navigate to="/request-permission" replace />;
        }

        return (
            <SessionTimeoutProvider>
                {layout ? (
                    <PrivateLayout {...rest} moduleName={moduleName}>
                        <Component {...rest} />
                    </PrivateLayout>
                ) : (
                    <Component {...rest} />
                )}
                <SessionTimeoutModal />
            </SessionTimeoutProvider>
        );
    } else {
        return <Navigate to="/" />;
    }
}

PrivateRoute.propTypes = {
    component: PropTypes.elementType.isRequired,
    layout: PropTypes.bool,
    moduleName: PropTypes.string,
};
