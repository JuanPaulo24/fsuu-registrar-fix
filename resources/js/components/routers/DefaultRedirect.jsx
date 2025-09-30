import { Navigate } from "react-router-dom";
import { userData } from "../providers/appConfig";

/**
 * DefaultRedirect - Redirects authenticated users to their first accessible module
 * This prevents 403 errors when the default Dashboard is not accessible
 */
export default function DefaultRedirect() {
    const user = userData();
    
    // Module routing map - maps module names to their routes
    const moduleRoutes = {
        'Dashboard': '/dashboard-view',  // Use the actual dashboard route
        'Student Profiles': '/student-profile',
        'Users': '/users',
        'Email': '/email',
        'QR Scanner': '/qr-scanner',
        'Document Management': '/document-management',
        'Information Panel': '/information-panel',
        'Support': '/support',
        'System Configurations': '/system-configurations'
    };
    
    // Get user's accessible modules
    const accessibleModules = user?.accessible_modules || [];
    
    // If user has no accessible modules, redirect to permission denied
    if (accessibleModules.length === 0) {
        return <Navigate to="/request-permission" replace />;
    }
    
    // Find the first accessible module's route
    const firstModule = accessibleModules[0];
    const defaultRoute = moduleRoutes[firstModule.module_name] || '/request-permission';
    
    // Redirect to the first accessible module
    return <Navigate to={defaultRoute} replace />;
}