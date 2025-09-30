import React, { useEffect, useState } from "react";
import { Modal, Table, Switch, Card, Typography, Space, notification, Divider, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faShieldKeyhole, faSave, faExclamationTriangle, faSignOut } from "@fortawesome/pro-regular-svg-icons";
import { GET, POST } from "../../../../../../providers/useAxiosQuery";
import { userData } from "@/components/providers/appConfig";
import { showGlobalLoading, hideGlobalLoading } from "@/components/providers/globalLoading";

const { Title, Text } = Typography;

const ModalRolePermissions = ({ 
    visible, 
    onClose, 
    roleData, 
    onPermissionChange 
}) => {
    const [modules, setModules] = useState([]);
    const [pendingChanges, setPendingChanges] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showLogoutWarning, setShowLogoutWarning] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Fetch modules and permissions for the selected role
    const { data: permissionsData, refetch: refetchPermissions } = GET(
        roleData ? `api/user_role_permission?user_role_id=${roleData.id}` : null,
        roleData ? [`role_permissions_${roleData.id}`] : null,
        {
            enabled: !!roleData && visible,
            onSuccess: (res) => {
                if (res?.data) {
                    setModules(res.data);
                    setPendingChanges({}); // Reset pending changes when data loads
                }
            }
        }
    );

    // Mutation for updating permissions
    const { mutate: updatePermissions, loading: updateLoading } = POST(
        'api/user_role_permission',
        [`role_permissions_${roleData?.id}`]
    );

    const handlePermissionToggle = (moduleButton, checked) => {
        let changes = {
            [moduleButton.id]: {
                moduleButton,
                status: checked ? 1 : 0,
                originalStatus: getCurrentPermissionStatus(moduleButton)
            }
        };

        // If this is a tab being disabled, also disable all its child buttons
        if (moduleButton.is_tab && !checked) {
            const childButtons = getChildButtons(moduleButton.id);
            childButtons.forEach(childButton => {
                changes[childButton.id] = {
                    moduleButton: childButton,
                    status: 0,
                    originalStatus: getCurrentPermissionStatus(childButton)
                };
            });
        }

        // If this is a tab being enabled, we don't auto-enable children (user choice)
        // If this is a child button being enabled, ensure parent tab is enabled
        if (!moduleButton.is_tab && checked && moduleButton.parent_button_id) {
            const parentButton = getParentButton(moduleButton.parent_button_id);
            if (parentButton) {
                // Auto-enable parent tab if it's disabled
                const parentCurrentStatus = getDisplayPermissionStatus(parentButton);
                if (!parentCurrentStatus) {
                    changes[parentButton.id] = {
                        moduleButton: parentButton,
                        status: 1,
                        originalStatus: getCurrentPermissionStatus(parentButton)
                    };
                }
            }
        }

        // Store all pending changes
        setPendingChanges(prev => ({
            ...prev,
            ...changes
        }));
    };

    const getChildButtons = (parentButtonId) => {
        const childButtons = [];
        modules.forEach(module => {
            module.module_buttons?.forEach(button => {
                if (button.parent_button_id === parentButtonId) {
                    childButtons.push(button);
                }
            });
        });
        return childButtons;
    };

    const getParentButton = (parentButtonId) => {
        let parentButton = null;
        modules.forEach(module => {
            module.module_buttons?.forEach(button => {
                if (button.id === parentButtonId) {
                    parentButton = button;
                }
            });
        });
        return parentButton;
    };

    const getCurrentPermissionStatus = (moduleButton) => {
        return moduleButton.user_role_permissions?.length > 0 && 
               parseInt(moduleButton.user_role_permissions[0]?.status) === 1;
    };

    const getDisplayPermissionStatus = (moduleButton) => {
        // Check if there's a pending change, otherwise use current status
        if (pendingChanges[moduleButton.id] !== undefined) {
            return pendingChanges[moduleButton.id].status === 1;
        }
        return getCurrentPermissionStatus(moduleButton);
    };

    const hasPendingChanges = () => {
        return Object.keys(pendingChanges).length > 0;
    };

    const handleSaveChanges = () => {
        const currentUser = userData();
        const isEditingOwnRole = currentUser && currentUser.user_role_id === roleData.id;
        
        if (isEditingOwnRole) {
            // Show logout warning for current user's role
            setShowLogoutWarning(true);
        } else {
            // Show regular confirmation modal
            setShowConfirmModal(true);
        }
    };

    const handleConfirmSave = async (shouldLogout = false) => {
        // Show global loading immediately for all permission changes
        showGlobalLoading();
        
        if (shouldLogout) {
            setIsLoggingOut(true);
            setShowLogoutWarning(false);
            setShowConfirmModal(false);
        } else {
            setShowConfirmModal(false);
        }

        const changes = Object.values(pendingChanges);
        let successCount = 0;
        let failCount = 0;

        // Process each change individually since we're using the existing single update API
        for (const change of changes) {
            try {
                const response = await fetch('/api/user_role_permission', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')?.replace('Bearer ', '')}`,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        user_role_id: roleData.id,
                        mod_button_id: change.moduleButton.id,
                        status: change.status
                    })
                });

                const result = await response.json();
                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                failCount++;
            }
        }

        // Show results
        if (successCount > 0) {
            notification.success({
                message: "Permissions Updated",
                description: `Successfully updated ${successCount} permission(s). ${failCount > 0 ? `${failCount} failed.` : ''} ${shouldLogout ? 'Logging out in 3 seconds...' : 'Users will need to re-login for changes to take effect.'}`,
            });
            
            setPendingChanges({});
            refetchPermissions();
            if (onPermissionChange) {
                onPermissionChange();
            }

            if (shouldLogout) {
                // Global loading already shown at the beginning
                // Just wait 3 seconds and logout
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = '/';
                }, 3000);
            } else {
                // Hide global loading for other users' permission changes
                hideGlobalLoading();
                setShowLogoutWarning(false);
            }
        } else {
            notification.error({
                message: "Permission Update Failed",
                description: "Failed to update permissions",
            });
            
            // Hide global loading on failure
            hideGlobalLoading();
            if (shouldLogout) {
                setIsLoggingOut(false);
            }
            
            setShowConfirmModal(false);
            setShowLogoutWarning(false);
        }
    };

    const handleDiscardChanges = () => {
        setPendingChanges({});
    };

    const renderModuleCard = (module) => {
        // Separate tabs and direct buttons
        const tabs = module.module_buttons?.filter(button => button.is_tab) || [];
        const directButtons = module.module_buttons?.filter(button => !button.is_tab && !button.parent_button_id) || [];

        return (
            <Card 
                key={module.id}
                size="small"
                title={
                    <Space>
                        <FontAwesomeIcon icon={faShieldKeyhole} className="text-blue-500" />
                        <Text strong>{module.module_name}</Text>
                        <Text type="secondary">({module.module_code})</Text>
                    </Space>
                }
                className="mb-4"
            >
                {/* Direct module buttons (no tabs) */}
                {directButtons.length > 0 && (
                    <div className="mb-4">
                        <Text type="secondary" className="text-sm font-medium mb-2 block">Module Actions</Text>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {directButtons.map((button) => renderButton(button))}
                        </div>
                    </div>
                )}

                {/* Tab-based permissions */}
                {tabs.map((tab) => {
                    const childButtons = module.module_buttons?.filter(button => button.parent_button_id === tab.id) || [];
                    const isTabEnabled = getDisplayPermissionStatus(tab);
                    
                    return (
                        <div key={tab.id} className="mb-6 border border-gray-200 rounded-lg">
                            {/* Tab header */}
                            <div className="bg-blue-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <Text className="font-medium text-blue-700">{tab.mod_button_name}</Text>
                                        {tab.mod_button_description && (
                                            <div>
                                                <Text type="secondary" className="text-xs">
                                                    {tab.mod_button_description}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                    <Switch
                                        checked={isTabEnabled}
                                        onChange={(checked) => handlePermissionToggle(tab, checked)}
                                        checkedChildren={<FontAwesomeIcon icon={faCheck} />}
                                        unCheckedChildren={<FontAwesomeIcon icon={faXmark} />}
                                        className="ml-3"
                                    />
                                </div>
                            </div>

                            {/* Tab buttons */}
                            <div className="p-4">
                                {childButtons.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {childButtons.map((button) => renderButton(button, !isTabEnabled))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <Text type="secondary">No actions available for this tab</Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {(!module.module_buttons || module.module_buttons.length === 0) && (
                    <div className="text-center py-4">
                        <Text type="secondary">No permissions available for this module</Text>
                    </div>
                )}
            </Card>
        );
    };

    const renderButton = (button, isDisabledDueToParent = false) => {
        const isChecked = getDisplayPermissionStatus(button);
        const isDisabled = isDisabledDueToParent;

        return (
            <div 
                key={button.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                    isDisabled ? 'bg-gray-100 opacity-60' : 'bg-gray-50'
                }`}
            >
                <div className="flex-1">
                    <Text className={`font-medium ${isDisabled ? 'text-gray-400' : ''}`}>
                        {button.mod_button_name}
                    </Text>
                    {button.mod_button_description && (
                        <div>
                            <Text type="secondary" className="text-xs">
                                {button.mod_button_description}
                            </Text>
                        </div>
                    )}
                </div>
                <Switch
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={(checked) => handlePermissionToggle(button, checked)}
                    checkedChildren={<FontAwesomeIcon icon={faCheck} />}
                    unCheckedChildren={<FontAwesomeIcon icon={faXmark} />}
                    className="ml-3"
                />
            </div>
        );
    };

    return (
        <Modal
            title={
                <Space>
                    <FontAwesomeIcon icon={faShieldKeyhole} className="text-blue-500" />
                    <span>Manage Permissions - {roleData?.user_role}</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={
                <div className="flex justify-between items-center">
                    <div>
                        {hasPendingChanges() && (
                            <Text type="warning" className="text-orange-600">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                                {Object.keys(pendingChanges).length} unsaved change(s)
                            </Text>
                        )}
                    </div>
                    <Space>
                        <Button onClick={onClose}>
                            Cancel
                        </Button>
                        {hasPendingChanges() && (
                            <>
                                <Button onClick={handleDiscardChanges}>
                                    Discard Changes
                                </Button>
                                <Button 
                                    type="primary" 
                                    icon={<FontAwesomeIcon icon={faSave} />}
                                    onClick={handleSaveChanges}
                                    loading={updateLoading}
                                >
                                    Save Changes
                                </Button>
                            </>
                        )}
                    </Space>
                </div>
            }
            width={1000}
            style={{ top: 20 }}
            bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
        >
            {roleData && (
                <div>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <Title level={5} className="mb-2">Role Information</Title>
                        <Text><strong>Role:</strong> {roleData.user_role}</Text>
                        <br />
                        <Text type="secondary">
                            Manage module permissions for this role. Users assigned to this role will inherit these permissions.
                        </Text>
                        
                        {modules?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                                <Space split={<span className="text-blue-300">•</span>}>
                                    <Text type="secondary">
                                        <strong>{modules.length}</strong> modules available
                                    </Text>
                                    <Text type="secondary">
                                        <strong>
                                            {modules.reduce((total, module) => 
                                                total + (module.module_buttons?.filter(btn => 
                                                    btn.user_role_permissions?.length > 0 && 
                                                    parseInt(btn.user_role_permissions[0]?.status) === 1
                                                ).length || 0), 0
                                            )}
                                        </strong> permissions granted
                                    </Text>
                                    <Text type="secondary">
                                        <strong>
                                            {modules.reduce((total, module) => 
                                                total + (module.module_buttons?.length || 0), 0
                                            )}
                                        </strong> total permissions
                                    </Text>
                                </Space>
                            </div>
                        )}
                    </div>

                    <Divider>Module Permissions</Divider>

                    {modules?.length > 0 ? (
                        <div>
                            {modules.map((module) => renderModuleCard(module))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Text type="secondary">No modules found</Text>
                        </div>
                    )}
                </div>
            )}

            {/* Regular Confirmation Modal */}
            <Modal
                title={
                    <Space>
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500" />
                        <span>Confirm Permission Changes</span>
                    </Space>
                }
                open={showConfirmModal}
                onCancel={() => setShowConfirmModal(false)}
                footer={
                    <Space>
                        <Button onClick={() => setShowConfirmModal(false)}>
                            Cancel
                        </Button>
                        <Button 
                            type="primary" 
                            onClick={() => handleConfirmSave(false)}
                            loading={updateLoading}
                        >
                            Yes, Save Changes
                        </Button>
                    </Space>
                }
            >
                <div>
                    <Text>
                        Are you sure you want to save these permission changes? 
                        This will affect {Object.keys(pendingChanges).length} permission(s) for the <strong>{roleData?.user_role}</strong> role.
                    </Text>
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                        <Text type="secondary" className="text-sm">
                            Users with this role will need to re-login for the changes to take effect.
                        </Text>
                    </div>
                </div>
            </Modal>

            {/* Logout Warning Modal */}
            <Modal
                title={
                    <Space>
                        <FontAwesomeIcon icon={faSignOut} className="text-red-500" />
                        <span>Logout Required</span>
                    </Space>
                }
                open={showLogoutWarning}
                onCancel={() => !isLoggingOut && setShowLogoutWarning(false)}
                closable={!isLoggingOut}
                maskClosable={!isLoggingOut}
                footer={
                    <Space>
                        <Button 
                            onClick={() => setShowLogoutWarning(false)}
                            disabled={isLoggingOut}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="primary" 
                            danger
                            icon={<FontAwesomeIcon icon={faSignOut} />}
                            onClick={() => handleConfirmSave(true)}
                            loading={updateLoading || isLoggingOut}
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? 'Logging out...' : 'Yes, Save & Logout'}
                        </Button>
                    </Space>
                }
            >
                <div>
                    <Text className="text-red-600 font-medium">
                        ⚠️ You are modifying permissions for your own role!
                    </Text>
                    <div className="mt-3">
                        <Text>
                            Changing your own role's permissions requires an immediate logout to prevent system inconsistencies. 
                            Are you sure you want to proceed?
                        </Text>
                    </div>
                    <div className="mt-4 p-3">
                        <Text type="secondary" className="text-sm">
                            <strong>What happens next:</strong>
                            <br />• Your permission changes will be saved
                            <br />• You will be automatically logged out in 3 seconds
                            <br />• You'll need to log back in to continue
                        </Text>
                    </div>
                </div>
            </Modal>
        </Modal>
    );
};

export default ModalRolePermissions;