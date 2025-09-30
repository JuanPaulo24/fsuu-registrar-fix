import { Routes, Route } from "react-router-dom";
import {
    faBook,
    faBooks,
    faCalendar,
    faChartLine,
    faCog,
    faHome,
    faMicrochip,
    faUsers,
    faWallet,
    faChurch,
    faHistory,
    faFileText,
    faGraduationCap,
    faLifeRing,
    faUserCircle,
    faClipboardList,
    faHeadset,
    faInfoCircle,
    faQrcode,
} from "@fortawesome/pro-regular-svg-icons";
import { faClockRotateLeft } from "@fortawesome/pro-light-svg-icons";

import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import VerifierRoute from "./VerifierRoute";
import DefaultRedirect from "./DefaultRedirect";

import Page404 from "../views/errors/Page404";
import PageRequestPermission from "../views/errors/PageRequestPermission";

import PageComponents from "../views/private/PageComponents/PageComponents";

import PageLogin from "../views/Public/PageLogin/PageLogin";
import PageHome from "../views/Public/PageVerifier/PageHome";
import PageVerify from "../views/Public/PageVerify/PageVerify";
import PageEditProfile from "../views/private/PageEditProfile/PageEditProfile";
import PageDashboard from "../views/private/PageDashboard/PageDashboard";
import PageProfile from "../views/private/PageProfile/PageProfile";
// @ts-ignore
import PageProfileView from "../views/private/PageProfile/PageProfileView";
import PageProfileViewLegacy from "../views/private/PageProfile/PageProfileViewLegacy";
import PageUser from "../views/private/PageUser/PageUser";
import PageUserForm from "../views/Private/PageUser/PageUserForm";
import TabSystemConfigurationsUserForm from "../views/Private/PageSystemConfigurations/components/TabSystemConfigurationsUsers/TabSystemConfigurationsUserForm";
import PageUserPermission from "../views/private/PageUser/PageUserPermission";
import PagePermission from "../views/private/PagePermission/PagePermission";
import PageCalendar from "../views/private/PageCalendar/PageCalendar";
import PageVenue from "../views/private/PageVenues/PageVenue";
import PageSacraments from "../views/private/PageSacraments/PageSacraments";

import PagePayment from "../views/private/PageAccounting/PagePayment/PagePayment";
import PagePayroll from "../views/private/PageAccounting/PagePayroll/PagePayroll";
import PageDonations from "../views/private/PageAccounting/PageDonations/PageDonations";
import PageMinistries from "../views/Private/PageMinistries/PageMinistries";
import PageReport from "../views/private/PageReport/PageReport";
import PageSystemConfigurations from "../views/Private/PageSystemConfigurations/PageSystemConfigurations";

import PageEmail from "../views/Private/PageEmail/PageEmail";
import PageParish from "../views/private/PageParish/PageParish";
import PageHistoricalData from "../views/private/PageHistoricalData/PageHistoricalData";
import PageBaptism from "../views/private/PageSacraments/PageBaptism/PageBaptism";

import PageDocumentManagement from "../views/Private/PageDocumentManagement/PageDocumentManagement";

import PageInformationPanel from "../views/Private/PageInformationPanel/PageInformationPanel";
import PageSupport from "../views/Private/PageSupport/PageSupport";
import PageDocumentPreview from "../views/Public/PageDocumentPreview/PageDocumentPreview";
import PageQRScanner from "../views/Private/PageQRScanner/PageQRScanner";

// Debug wrapper component to check if route is being hit
const DocumentPreviewWrapper = () => {
    console.log('DocumentPreviewWrapper: Route matched!');
    console.log('DocumentPreviewWrapper: Current URL:', window.location.pathname);
    return <PageDocumentPreview />;
};

export default function RouteList() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <PublicRoute
                        title="LOGIN"
                        pageId="PageLogin"
                        component={PageLogin}
                    />
                }
            />

            <Route
                path="/home"
                element={
                    <VerifierRoute
                        component={PageHome}
                    />
                }
            />

            <Route
                path="/verify"
                element={
                    <VerifierRoute
                        component={PageVerify}
                    />
                }
            />

            <Route
                path="/edit-profile"
                element={
                    <PrivateRoute
                        moduleName={null}
                        title="User"
                        subtitle="VIEW / EDIT"
                        pageId="PageUserProfile"
                        pageHeaderIcon={faUsers}
                        breadcrumb={[
                            {
                                name: "Edit Profile",
                            },
                        ]}
                        component={PageEditProfile}
                    />
                }
            />
            {/* Default redirect - sends to first accessible module */}
            <Route
                path="/dashboard"
                element={<DefaultRedirect />}
            />
            
            {/* Actual dashboard route - only accessible if user has permission */}
            <Route
                path="/dashboard-view"
                element={
                    <PrivateRoute
                        // moduleCode="M-01"
                        moduleName="Dashboard"
                        title="Dashboard"
                        subtitle="ADMIN"
                        pageId="PageDashboard"
                        pageHeaderIcon={faHome}
                        breadcrumb={[
                            {
                                name: "Dashboard",
                            },
                        ]}
                        component={PageDashboard}
                    />
                }
            />

            {/* profile */}

            <Route
                path="/student-profile"
                element={
                    <PrivateRoute
                        // moduleCode="M-02"
                        moduleName="Student Profiles"
                        title="Profile"
                        subtitle="ADD"
                        pageId="PageProfile"
                        pageHeaderIcon={faUserCircle}
                        breadcrumb={[
                            {
                                name: "Student Profile",
                            },
                        ]}
                        component={PageProfile}
                    />
                }
            />

            {/* Legacy route for numeric IDs - must come first to avoid conflicts */}
            <Route
                path="/student-profile/view/:id(\d+)"
                element={
                    <PrivateRoute
                        moduleName="Student Profiles"
                        title="View Profile"
                        subtitle="VIEW"
                        pageId="PageProfileViewLegacy"
                        pageHeaderIcon={faUserCircle}
                        breadcrumb={[
                            {
                                name: "Student Profile",
                                path: "/student-profile",
                            },
                            {
                                name: "View Student Profile",
                            },
                        ]}
                        component={PageProfileViewLegacy}
                    />
                }
            />

            <Route
                path="/student-profile/view/:uuid"
                element={
                    <PrivateRoute
                        moduleName="Student Profiles"
                        title="View Profile"
                        subtitle="VIEW"
                        pageId="PageProfileView"
                        pageHeaderIcon={faUserCircle}
                        breadcrumb={[
                            {
                                name: "Student Profile",
                                path: "/student-profile",
                            },
                            {
                                name: "View Student Profile",
                            },
                        ]}
                        component={PageProfileView}
                    />
                }
            />

            {/* end profile */}

            {/* sacraments */}

            <Route
                path="/sacraments/:id"
                element={
                    <PrivateRoute
                        // moduleCode="M-01"
                        moduleName="Baptism"
                        title="Baptism"
                        subtitle="ADD"
                        pageId="PageBaptism"
                        pageHeaderIcon={faChurch}
                        breadcrumb={[
                            {
                                name: "Sacraments",
                            },
                            {
                                name: "Service Type",
                                className: "sacramentsServiceType",
                            },
                        ]}
                        component={PageSacraments}
                    />
                }
            />

            <Route
                path="/sacraments/baptism"
                element={
                    <PrivateRoute
                        // moduleCode="M-01"
                        moduleName="Baptism"
                        title="Baptism"
                        subtitle="ADD"
                        pageId="PageBaptism"
                        pageHeaderIcon={faChurch}
                        breadcrumb={[
                            {
                                name: "Sacraments",
                            },
                            {
                                name: "Baptism",
                            },
                        ]}
                        component={PageBaptism}
                    />
                }
            />



            <Route
                path="/calendar"
                element={
                    <PrivateRoute
                        // moduleCode="M-01"
                        moduleName="Calendar"
                        title="Calendar"
                        subtitle="VIEW"
                        pageId="PageCalendar"
                        pageHeaderIcon={faCalendar}
                        breadcrumb={[
                            {
                                name: "Calendar",
                            },
                        ]}
                        component={PageCalendar}
                    />
                }
            />

            {/* end calendar */}

            {/* reports */}

            <Route
                path="/reports"
                element={
                    <PrivateRoute
                        // moduleCode="M-01"
                        moduleName="Report"
                        title="Report"
                        subtitle="ADD"
                        pageId="PageReport"
                        pageHeaderIcon={faChartLine}
                        breadcrumb={[
                            {
                                name: "Report",
                            },
                        ]}
                        component={PageReport}
                    />
                }
            />

            {/* end reports */}

            {/* end reports/sacramental-and-pastoral-life */}

            {/* users */}
            <Route
                path="/users"
                element={
                    <PrivateRoute
                        // moduleCode="M-03"
                        moduleName="Users"
                        title="Users"
                        subtitle="VIEW / EDIT"
                        pageId="PageUser"
                        pageHeaderIcon={faUsers}
                        breadcrumb={[
                            {
                                name: "Users",
                            },
                        ]}
                        component={PageUser}
                    />
                }
            />

            <Route
                path="/users/add"
                element={
                    <PrivateRoute
                        // moduleCode="M-02"
                        moduleName="Users"
                        title="Users"
                        subtitle="ADD"
                        pageId="PageUserAdd"
                        pageHeaderIcon={faUsers}
                        breadcrumb={[
                            {
                                name: "Users",
                                link: "/users",
                            },
                            {
                                name: "Add User",
                            },
                        ]}
                        component={PageUserForm}
                    />
                }
            />

            <Route
                path="/users/edit/:id"
                element={
                    <PrivateRoute
                        // moduleCode="M-02"
                        moduleName="Users"
                        title="Users"
                        subtitle="EDIT"
                        pageId="PageUserEdit"
                        pageHeaderIcon={faUsers}
                        breadcrumb={[
                            {
                                name: "Users",
                                link: "/users",
                            },
                            {
                                name: "Edit User",
                            },
                        ]}
                        component={PageUserForm}
                    />
                }
            />

            {/* end users */}

            {/* system configurations */}
            <Route
                path="/system-configurations"
                element={
                    <PrivateRoute
                        // moduleCode="M-04"
                        moduleName="System Configurations"
                        title="Configurations"
                        subtitle="SYSTEM"
                        pageId="PageSystemConfigurations"
                        pageHeaderIcon={faCog}
                        breadcrumb={[
                            {
                                name: "System Configurations",
                                link: "/system-configurations?tab=Users",
                            },
                        ]}
                        component={PageSystemConfigurations}
                    />
                }
            />

            <Route
                path="/system-configurations/users/add"
                element={
                    <PrivateRoute
                        moduleName="System Configurations"
                        title="System Configurations"
                        subtitle="ADD USER"
                        pageId="PageSystemConfigurationUserAdd"
                        pageHeaderIcon={faCog}
                        breadcrumb={[
                            {
                                name: "System Configurations",
                                link: "/system-configurations?tab=Users",
                            },
                            {
                                name: "Add User",
                            },
                        ]}
                        component={TabSystemConfigurationsUserForm}
                    />
                }
            />

            <Route
                path="/system-configurations/users/edit/:id"
                element={
                    <PrivateRoute
                        moduleName="System Configurations"
                        title="System Configurations"
                        subtitle="EDIT USER"
                        pageId="PageSystemConfigurationUserEdit"
                        pageHeaderIcon={faCog}
                        breadcrumb={[
                            {
                                name: "System Configurations",
                                link: "/system-configurations?tab=Users",
                            },
                            {
                                name: "Edit User",
                            },
                        ]}
                        component={TabSystemConfigurationsUserForm}
                    />
                }
            />

            {/* end system configurations */}

            {/* email template */}

            <Route
                path="/email"
                element={
                    <PrivateRoute
                        // moduleCode="M-04"
                        moduleName="Email"
                        title="Email"
                        subtitle="MANAGEMENT"
                        pageId="PageEmail"
                        pageHeaderIcon={faCog}
                        breadcrumb={[
                            {
                                name: "Email",
                                link: "/email?tab=Email",
                            },
                        ]}
                        component={PageEmail}
                    />
                }
            />

            {/* end email template */}



            {/* end permission */}


            <Route
                path="/document-management"
                element={
                    <PrivateRoute
                        moduleName="Document Management"
                        title="Document Management"
                        subtitle="VIEW"
                        pageId="PageDocumentManagement"
                        pageHeaderIcon={faFileText}
                        breadcrumb={[
                            {
                                name: "Document Management",
                                link: "/document-management?tab=TranscriptOfRecords",
                            },
                        ]}
                        component={PageDocumentManagement}
                    />
                }
            />



            <Route
                path="/information-panel"
                element={
                    <PrivateRoute
                        moduleName="Information Panel"
                        title="Information Panel"
                        subtitle="VIEW"
                        pageId="PageInformationPanel"
                        pageHeaderIcon={faInfoCircle}
                        breadcrumb={[
                            {
                                name: "Information Panel",
                                link: "/information-panel?tab=posting",
                            },
                        ]}
                        component={PageInformationPanel}
                    />
                }
            />

            <Route
                path="/support"
                element={
                    <PrivateRoute
                        moduleName="Support"
                        title="Support"
                        subtitle="VIEW"
                        pageId="PageSupport"
                        pageHeaderIcon={faHeadset}
                        breadcrumb={[
                            {
                                name: "Support",
                                link: "/support?tab=TicketingSystem",
                            },
                        ]}
                        component={PageSupport}
                    />
                }
            />

            <Route
                path="/qr-scanner"
                element={
                    <PrivateRoute
                        moduleName="QR Scanner"
                        title="QR Scanner"
                        subtitle="SCAN"
                        pageId="PageQRScanner"
                        pageHeaderIcon={faQrcode}
                        breadcrumb={[
                            {
                                name: "QR Scanner",
                            },
                        ]}
                        component={PageQRScanner}
                    />
                }
            />

            {/* end new modules */}

            <Route
                path="/sample"
                element={
                    <PrivateRoute
                        // moduleCode="M-04"
                        moduleName="Sample"
                        title="Sample"
                        subtitle="VIEW"
                        pageId="PageHistoricalData"
                        pageHeaderIcon={faClockRotateLeft}
                        breadcrumb={[
                            {
                                name: "Sample",
                            },
                        ]}
                        component={PageHistoricalData}
                    />
                }
            />

            <Route
                path="/components"
                element={
                    <PrivateRoute
                        // moduleCode="M-04"
                        moduleName="Components"
                        title="Components"
                        subtitle="LIST"
                        pageId="PageComponents"
                        pageHeaderIcon={faMicrochip}
                        breadcrumb={[
                            {
                                name: "Components",
                            },
                        ]}
                        component={PageComponents}
                    />
                }
            />

            <Route
                path="/request-permission"
                element={<PageRequestPermission />}
            />

            {/* UUID-based document preview route - matches UUIDs at root level */}
            <Route
                path="/:uuid"
                element={<DocumentPreviewWrapper />}
            />

            {/* Fallback route for any document ID format */}
            <Route
                path="/document/:id"
                element={<DocumentPreviewWrapper />}
            />

            <Route path="*" element={<Page404 />} />
        </Routes>
    );
}
