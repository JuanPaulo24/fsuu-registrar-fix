import { apiUrl, token, encrypt } from "../components/providers/appConfig";

/**
 * Refresh user data and update localStorage
 * This fetches the latest user permissions and updates the stored user data
 */
export const refreshUserData = async () => {
    try {
        const authToken = token();
        if (!authToken) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(apiUrl('api/refresh_user_data'), {
            method: 'GET',
            headers: {
                'Authorization': authToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
            // Update localStorage with new user data
            const encryptedUserData = encrypt(JSON.stringify(result.data));
            localStorage.setItem('userdata', encryptedUserData);
            
            return {
                success: true,
                data: result.data,
                message: 'User data refreshed successfully'
            };
        } else {
            throw new Error(result.message || 'Failed to refresh user data');
        }
    } catch (error) {
        console.error('Error refreshing user data:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to refresh user data'
        };
    }
};

/**
 * Trigger a global refresh of user permissions
 * This can be used to notify all components that user data has been updated
 */
export const triggerPermissionRefresh = () => {
    // Dispatch a custom event that components can listen to
    const event = new CustomEvent('userPermissionsRefreshed', {
        detail: { timestamp: new Date().getTime() }
    });
    window.dispatchEvent(event);
};

/**
 * Combined function to refresh user data and trigger UI updates
 */
export const refreshUserPermissions = async () => {
    const result = await refreshUserData();
    
    if (result.success) {
        // Trigger UI refresh
        triggerPermissionRefresh();
    }
    
    return result;
};