import CryptoJS from "crypto-js";
import dayjs from "dayjs";

export const apiUrl = (url, api = window.location.origin) => `${api}/${url}`;

export const {
    VITE_APP_NAME,
    VITE_APP_DESCRIPTION,
    VITE_APP_LOGO,
    VITE_LOGIN_LOGO,
    VITE_APP_LOGO_FULLWIDTH,
    VITE_APP_ENCRYPT_KEY,
    VITE_APP_PRIMARY_COLOR,
    VITE_APP_SECONDARY_COLOR,
    VITE_APP_PUSHER_APP_ID,
    VITE_APP_PUSHER_APP_KEY,
    VITE_APP_PUSHER_APP_SECRET,
    VITE_APP_PUSHER_APP_CLUSTER,
    VITE_APP_PUSHER_APP_CHANNEL,
    VITE_AZURE_OPENAI_KEY,
    VITE_AZURE_TARGET_URL,
    VITE_AZURE_OPENAI_VERSION,
    VITE_AZURE_OPENAI_MODEL,
    VITE_AZURE_OPENAI_DEPLOYMENT,
    VITE_TINYMCE_API_KEY,
    VITE_GOOGLEAI_API_KEY,
    VITE_GOOGLE_AI_PROJECTNUMBER,
    VITE_CLOUDFLARE_SITE_KEY,
    VITE_CLOUDFLARE_SECRET_KEY,
} = import.meta.env;

export const appName = VITE_APP_NAME;
export const appDescription = VITE_APP_DESCRIPTION;
export const appLogo = apiUrl(VITE_APP_LOGO);
export const appLoginLogo = apiUrl(VITE_LOGIN_LOGO);
export const appLogoFullWidth = apiUrl(VITE_APP_LOGO_FULLWIDTH);
export const primaryColor = VITE_APP_PRIMARY_COLOR;
export const secondaryColor = VITE_APP_SECONDARY_COLOR;
export const pusherAppId = VITE_APP_PUSHER_APP_ID;
export const pusherAppKey = VITE_APP_PUSHER_APP_KEY;
export const pusherAppSecret = VITE_APP_PUSHER_APP_SECRET;
export const pusherAppCluster = VITE_APP_PUSHER_APP_CLUSTER;
export const pusherAppChannel = VITE_APP_PUSHER_APP_CHANNEL;
export const azureOpenaiKey = VITE_AZURE_OPENAI_KEY;
export const azureTargetUrl = VITE_AZURE_TARGET_URL;
export const azureOpenaiVersion = VITE_AZURE_OPENAI_VERSION;
export const azureOpenaiModel = VITE_AZURE_OPENAI_MODEL;
export const azureOpenaiDeployment = VITE_AZURE_OPENAI_DEPLOYMENT;
export const tinyMceApiKey = VITE_TINYMCE_API_KEY;
export const googleAiKey = VITE_GOOGLEAI_API_KEY;
export const googleAiProjectNumber = VITE_GOOGLE_AI_PROJECTNUMBER;
export const cloudflareSiteKey = VITE_CLOUDFLARE_SITE_KEY || '';
export const cloudflareSecretKey = VITE_CLOUDFLARE_SECRET_KEY || '';

export const defaultProfile = apiUrl("images/default.png");
export const defaultDocument = apiUrl("images/documents.png");

const encryptKey = `${VITE_APP_ENCRYPT_KEY}-${dayjs().format("YYYY")}`;

export const encrypt = (data) =>
    CryptoJS.AES.encrypt(data, encryptKey).toString();

export const decrypt = (data) => {
    try {
        return CryptoJS.AES.decrypt(data, encryptKey).toString(
            CryptoJS.enc.Utf8
        );
    } catch (error) {
        console.error("Error decrypting data:", error);
        clearLocalStorage();
        window.location.reload();
        return null;
    }
};

const clearLocalStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userdata");
};

export const token = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        clearLocalStorage();
        return false;
    }
    return `Bearer ${token}`;
};

export const userData = () => {
    const encryptedUserData = localStorage.getItem("userdata");
    if (!encryptedUserData) {
        clearLocalStorage();
        return false;
    }
    const decryptedData = decrypt(encryptedUserData);
    return decryptedData ? JSON.parse(decryptedData) : null;
};

export const role = () => {
    const user = userData();
    return user ? user.role : null;
};
