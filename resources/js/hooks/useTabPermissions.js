import { userData } from "@/components/providers/appConfig";

/**
 * Hook to get tab permissions from localStorage
 * @returns {Object} Tab permissions object organized by module name
 */
export const useModuleTabPermissions = () => {
    const user = userData();
    return user?.tab_permissions || {};
};

/**
 * Check if a specific tab is accessible
 * @param {string} moduleName - The name of the module (e.g., "Email")
 * @param {string} tabCode - The button code of the tab (e.g., "M-04-EMAIL")
 * @returns {boolean} Whether the tab is accessible
 */
export const isTabAccessible = (moduleName, tabCode) => {
    const tabPermissions = useModuleTabPermissions();
    const modulePermissions = tabPermissions[moduleName];
    
    if (!modulePermissions) return false;
    
    return modulePermissions[tabCode] === true;
};

/**
 * Filter tabs based on user permissions
 * @param {string} moduleName - The name of the module
 * @param {Array} tabs - Array of tab objects with 'code' or 'permissionCode' property
 * @returns {Array} Filtered array of accessible tabs
 */
export const filterAccessibleTabs = (moduleName, tabs) => {
    const tabPermissions = useModuleTabPermissions();
    const modulePermissions = tabPermissions[moduleName];
    
    if (!modulePermissions) return [];
    
    return tabs.filter(tab => {
        const tabCode = tab.code || tab.permissionCode;
        return modulePermissions[tabCode] === true;
    });
};

/**
 * Get button-level permissions for a module
 * @param {string} moduleName - The name of the module
 * @returns {Object} Object with button codes as keys and boolean values
 */
export const useButtonPermissions = (moduleName) => {
    const tabPermissions = useModuleTabPermissions();
    const modulePermissions = tabPermissions[moduleName];
    
    if (!modulePermissions) return {};
    
    return modulePermissions;
};

/**
 * Check if user has a specific button permission
 * @param {string} buttonCode - The button code (e.g., "M-04-COMPOSE")
 * @returns {boolean} Whether the user has this permission
 */
export const hasButtonPermission = (buttonCode) => {
    const user = userData();
    const tabPermissions = user?.tab_permissions || {};
    
    // Search through all modules to find the button permission
    for (const modulePermissions of Object.values(tabPermissions)) {
        if (modulePermissions[buttonCode] === true) {
            return true;
        }
    }
    
    return false;
};

/**
 * Check multiple button permissions at once
 * @param {Array<string>} buttonCodes - Array of button codes
 * @returns {Object} Object with button codes as keys and boolean values
 */
export const hasMultipleButtonPermissions = (buttonCodes) => {
    const user = userData();
    const tabPermissions = user?.tab_permissions || {};
    const permissions = {};
    
    // Initialize all permissions as false
    buttonCodes.forEach(code => {
        permissions[code] = false;
    });
    
    // Search through all modules to find the button permissions
    for (const modulePermissions of Object.values(tabPermissions)) {
        buttonCodes.forEach(code => {
            if (modulePermissions[code] === true) {
                permissions[code] = true;
            }
        });
    }
    
    return permissions;
};