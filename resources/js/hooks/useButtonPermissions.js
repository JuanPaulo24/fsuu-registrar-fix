import { userData } from "@/components/providers/appConfig";

/**
 * Hook to check specific button permissions from localStorage
 * @param {string} buttonCode - The module button code (e.g., "M-04-REPLY", "M-02-NEW")
 * @returns {boolean} - Whether the user has permission for this button
 */
export const useButtonPermission = (buttonCode) => {
    const user = userData();
    
    if (!user || !user.tab_permissions) {
        return false;
    }

    // Search through all modules for the button code
    for (const moduleName in user.tab_permissions) {
        const modulePermissions = user.tab_permissions[moduleName];
        if (modulePermissions[buttonCode] === true) {
            return true;
        }
    }
    
    return false;
};

/**
 * Utility function to check button permission without hook
 * @param {string} buttonCode - The module button code
 * @returns {boolean} - Whether the user has permission for this button
 */
export const hasButtonPermission = (buttonCode) => {
    const user = userData();
    
    if (!user || !user.tab_permissions) {
        return false;
    }

    // Search through all modules for the button code
    for (const moduleName in user.tab_permissions) {
        const modulePermissions = user.tab_permissions[moduleName];
        if (modulePermissions[buttonCode] === true) {
            return true;
        }
    }
    
    return false;
};

/**
 * Check multiple button permissions at once
 * @param {string[]} buttonCodes - Array of button codes to check
 * @returns {Object} - Object with button codes as keys and boolean permissions as values
 */
export const hasMultipleButtonPermissions = (buttonCodes) => {
    const user = userData();
    const permissions = {};
    
    buttonCodes.forEach(code => {
        permissions[code] = false;
    });

    if (!user || !user.tab_permissions) {
        return permissions;
    }

    // Search through all modules for each button code
    for (const moduleName in user.tab_permissions) {
        const modulePermissions = user.tab_permissions[moduleName];
        buttonCodes.forEach(code => {
            if (modulePermissions[code] === true) {
                permissions[code] = true;
            }
        });
    }
    
    return permissions;
};