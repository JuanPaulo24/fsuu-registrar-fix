import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQueryClient } from "react-query";
import { 
    Modal, 
    Form, 
    Input, 
    Select, 
    Row, 
    Col, 
    Divider, 
    Button, 
    Table, 
    Space, 
    Tag, 
    Avatar, 
    Typography, 
    Card,
    Flex,
    Collapse,
    notification,
    Tooltip
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSearch, 
    faUser, 
    faGraduationCap, 
    faQrcode, 
    faFileSignature,
    faFilter,
    faSortAmountDown,
    faCheck,
    faTimesCircle,
    faEdit
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { GET } from "../../../../providers/useAxiosQuery";
import { defaultProfile, apiUrl, token } from "../../../../providers/appConfig";
import ModalDocumentLoading from "./ModalDocumentLoading";
import ModalDocumentViewer from "./ModalDocumentViewer";
import ModalFormProfile from "./ModalFormProfile";
import ModalActiveDocumentWarning from "./ModalActiveDocumentWarning";
import PageProfileContext from "./PageProfileContext";
import { useModalManager, MODAL_TYPES } from "./ModalManager";

const { Text, Title } = Typography;
const { Search } = Input;

export default function ModalEnhancedDocumentGeneration(props) {
    const { 
        open, 
        onCancel, 
        onSubmit, 
        documentType = "", 
        record = {},
        // External modal state for ModalFormProfile
        externalToggleModalForm,
        externalSetToggleModalForm,
        externalRefetch
    } = props;
    
    // Modal Manager
    const { openModal, closeModal } = useModalManager();
    
    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 768);
    
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 576);
            setIsTablet(window.innerWidth <= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(1); // 1: Profile Selection, 2: Document Generation
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [selectedProfiles, setSelectedProfiles] = useState([]);
    const [profileSearch, setProfileSearch] = useState("");
    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const [showViewerModal, setShowViewerModal] = useState(false);
    const [generatedDocumentData, setGeneratedDocumentData] = useState(null);
    const [profileFilter, setProfileFilter] = useState({
        page: 1,
        page_size: 10,
        search: "",
        sort_field: "created_at",
        sort_order: "desc",
        status: "Active"
    });

    // Use external modal state if provided, otherwise use internal state
    const [internalToggleModalForm, setInternalToggleModalForm] = useState({
        open: false,
        data: null
    });
    
    const toggleModalForm = externalToggleModalForm || internalToggleModalForm;
    const setToggleModalForm = externalSetToggleModalForm || setInternalToggleModalForm;

    // Active Document Warning modal state
    const [showActiveDocumentWarning, setShowActiveDocumentWarning] = useState(false);
    const [pendingDocumentData, setPendingDocumentData] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isUpdatingProfilePicture, setIsUpdatingProfilePicture] = useState(false);
    const [tableKey, setTableKey] = useState(0); // Force table re-render when profile pictures are updated
    const [cacheBuster, setCacheBuster] = useState(0); // Force cache refresh when profile pictures are updated
    // Missing required fields indicator state
    const [showMissingFieldsModal, setShowMissingFieldsModal] = useState(false);
    const [profilesWithMissingFields, setProfilesWithMissingFields] = useState([]);

    // Helper to append cache-busting query to image URLs
    const appendCacheBuster = useCallback((url) => {
        try {
            if (!url) return url;
            // Skip cache busting for data/blob URLs
            if (String(url).startsWith('data:') || String(url).startsWith('blob:')) return url;
            const separator = url.includes("?") ? "&" : "?";
            return `${url}${separator}_t=${cacheBuster}`;
        } catch (_) {
            return url;
        }
    }, [cacheBuster]);

    // Query client for cache invalidation
    const queryClient = useQueryClient();

    // Profile data fetching with cache busting
    const profileQueryKey = useMemo(() => ["profiles_for_document", profileFilter, cacheBuster], [profileFilter, cacheBuster]);
    const { data: profilesData, refetch: refetchProfiles } = GET(
        `api/profile?${new URLSearchParams(profileFilter)}&_t=${cacheBuster}`,
        profileQueryKey,
        {
            enabled: open && currentStep === 1,
            isLoading: false // Disable global loading for profile fetching in document generation modal
        }
    );

    // Fetch users with user role 'UNIVERSITY REGISTRAR'
    const { data: registrarUsers } = GET(
        "api/users?user_role=UNIVERSITY%20REGISTRAR&status=Active",
        "registrar_users_select"
    );

    // Fetch user role data for diploma signatures
    const { data: vicePresidentUser } = GET(
        "api/users?user_role=VICE%20PRESIDENT%20FOR%20ACADEMIC%20AFFAIRS%20AND%20RESEARCH&status=Active",
        "vice_president_user"
    );
    
    const { data: universityPresidentUser } = GET(
        "api/users?user_role=UNIVERSITY%20PRESIDENT&status=Active",
        "university_president_user"
    );
    
    const { data: deanUser } = GET(
        "api/users?user_role=DEAN&status=Active",
        "dean_user"
    );

    // Helper function to format user names (matching backend logic)
    const formatUserName = useCallback((user) => {
        if (!user || !user.profile) {
            return null;
        }

        const profile = user.profile;
        const firstname = profile.firstname || '';
        const middlename = profile.middlename || '';
        const lastname = profile.lastname || '';

        let middleInitial = '';
        if (middlename && middlename.trim() !== '') {
            middleInitial = middlename.trim().charAt(0).toUpperCase() + '.';
        }

        let formattedName = `${firstname} ${middleInitial} ${lastname}`.replace(/\s+/g, ' ').trim();

        // Add course code if available (matching backend courseInfo relationship)
        const courseCode = profile.courseInfo?.course_code || profile.course_code;
        if (courseCode) {
            formattedName += `, ${courseCode}`;
        }

        return formattedName || null;
    }, []);

    // Get formatted user role names
    const vicePresidentName = useMemo(() => {
        const user = vicePresidentUser?.data?.data?.[0] || vicePresidentUser?.data?.[0];
        return formatUserName(user) || 'NO DATA';
    }, [vicePresidentUser, formatUserName]);

    const universityPresidentName = useMemo(() => {
        const user = universityPresidentUser?.data?.data?.[0] || universityPresidentUser?.data?.[0];
        return formatUserName(user) || 'NO DATA';
    }, [universityPresidentUser, formatUserName]);

    const deanName = useMemo(() => {
        const user = deanUser?.data?.data?.[0] || deanUser?.data?.[0];
        return formatUserName(user) || 'NO DATA';
    }, [deanUser, formatUserName]);



    const initialDocCategory = useMemo(() => {
        if (documentType?.toLowerCase().includes("transcript")) return "Transcript of Records";
        if (documentType?.toLowerCase().includes("cert")) return "Certification";
        if (record?.document_type?.toLowerCase().includes("transcript")) return "Transcript of Records";
        if (record?.document_type?.toLowerCase().includes("cert")) return "Certification";
        return "Transcript of Records";
    }, [documentType, record]);

    // Ensure initialization runs only once per open
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        if (open && !hasInitializedRef.current) {
            setCurrentStep(1);
            setSelectedProfile(null);
            setSelectedProfiles([]);
            setShowLoadingModal(false);
            setShowViewerModal(false);
            setGeneratedDocumentData(null);
            form.resetFields();
            
            // Initialize form values
            setTimeout(() => {
                updateFormValues();
                setFormValues(prev => ({ ...prev, doc_category: initialDocCategory }));
            }, 100);

            hasInitializedRef.current = true;
        }
        if (!open) {
            hasInitializedRef.current = false;
            setIsEditingProfile(false);
            setIsUpdatingProfilePicture(false);
            setTableKey(0); // Reset table key when modal is closed
            setCacheBuster(0); // Reset cache buster when modal is closed
        }
    }, [open, form]);

    // Effect to update selectedProfiles when profiles data changes (after refetch)
    useEffect(() => {
        if (profilesData?.data?.data && selectedProfiles.length > 0 && !isEditingProfile && !isUpdatingProfilePicture) {
            const updatedProfiles = selectedProfiles.map(selectedProfile => {
                // Find the updated profile data from the refetched data
                const updatedProfile = profilesData.data.data.find(p => p.id === selectedProfile.id);
                if (updatedProfile) {
                    // Recalculate profile picture from fresh attachments
                    const resolveProfilePicture = (p) => {
                        try {
                            const attachments = p?.attachments || [];
                            const pics = Array.isArray(attachments)
                                ? attachments.filter((f) => f?.file_description === "Profile Picture")
                                : [];
                            // Sort by id descending to get the most recent profile picture
                            pics.sort((a, b) => (b.id || 0) - (a.id || 0));
                            if (pics.length > 0 && pics[0]?.file_path) {
                                return appendCacheBuster(apiUrl(pics[0].file_path));
                            }
                        } catch (_) {}
                        return defaultProfile;
                    };

                    return {
                        ...updatedProfile,
                        profile_picture: resolveProfilePicture(updatedProfile)
                    };
                }
                return selectedProfile;
            });
            
            // Only update if there are actual changes
            const hasChanges = updatedProfiles.some((updated, index) => {
                const original = selectedProfiles[index];
                // Compare key fields that might have changed
                return (
                    updated.fullname !== original.fullname ||
                    updated.firstname !== original.firstname ||
                    updated.lastname !== original.lastname ||
                    updated.course !== original.course ||
                    updated.gender !== original.gender ||
                    updated.id_number !== original.id_number ||
                    updated.profile_picture !== original.profile_picture
                );
            });
            
            if (hasChanges) {
                setSelectedProfiles(updatedProfiles);
            }
        }
    }, [profilesData, isEditingProfile, isUpdatingProfilePicture]);

    // Effect to update selected profile when profiles data changes
    useEffect(() => {
        if (selectedProfile && profilesData?.data?.data) {
            const updatedProfile = profilesData.data.data.find(p => p.id === selectedProfile.id);
            if (updatedProfile) {
                // Check if the profile data has actually changed
                const hasChanged = 
                    updatedProfile.firstname !== selectedProfile.firstname ||
                    updatedProfile.middlename !== selectedProfile.middlename ||
                    updatedProfile.lastname !== selectedProfile.lastname ||
                    updatedProfile.fullname !== selectedProfile.fullname ||
                    updatedProfile.course !== selectedProfile.course ||
                    updatedProfile.id_number !== selectedProfile.id_number ||
                    // Check if attachments have changed (for profile picture updates)
                    JSON.stringify(updatedProfile.attachments || []) !== JSON.stringify(selectedProfile.attachments || []);

                if (hasChanged) {
                    // Helper function to resolve profile picture
                    const resolveProfilePicture = (p) => {
                        try {
                            if (p?.profile_picture) return appendCacheBuster(p.profile_picture);
                            if (p?.photo) return appendCacheBuster(p.photo);
                            const attachments = p?.attachments || [];
                            const pics = Array.isArray(attachments)
                                ? attachments.filter((f) => f?.file_description === "Profile Picture")
                                : [];
                            // Sort by id descending to get the most recent profile picture
                            pics.sort((a, b) => (b.id || 0) - (a.id || 0));
                            if (pics.length > 0 && pics[0]?.file_path) {
                                return appendCacheBuster(apiUrl(pics[0].file_path));
                            }
                        } catch (_) {}
                        return defaultProfile;
                    };
                    
                    // Merge the updated profile data with existing attachments
                    const mergedProfile = {
                        ...updatedProfile,
                        // Preserve existing attachments if the new data doesn't have them
                        attachments: updatedProfile.attachments || selectedProfile.attachments || []
                    };
                    
                    // Recalculate profile picture
                    mergedProfile.profile_picture = resolveProfilePicture(mergedProfile);
                    
                    // Update selected profile with fresh data
                    setSelectedProfile(mergedProfile);
                    
                    // Update form values with the fresh profile data
                    const fullName = updatedProfile.fullname || `${updatedProfile.firstname || ''} ${updatedProfile.middlename || ''} ${updatedProfile.lastname || ''}`.trim();
                    form.setFieldsValue({
                        full_name: fullName,
                        student_id: updatedProfile.id_number || updatedProfile.id,
                        program: updatedProfile.course || "",
                        year_level: form.getFieldValue("year_level") || "4th Year",
                        tor_coverage: form.getFieldValue("tor_coverage") || "2022-2026",
                        request_date: form.getFieldValue("request_date") || dayjs()
                    });
                }
            }
        }
    }, [profilesData, selectedProfile, form]);

    // Force re-render when form values change to update button disabled state
    const [formValues, setFormValues] = useState({
        doc_category: initialDocCategory
    });
    
    // Update form values when form fields change
    const updateFormValues = useCallback(() => {
        const values = form.getFieldsValue();
        setFormValues(values);
    }, [form]);

    useEffect(() => {
        refetchProfiles();
    }, [profileFilter, refetchProfiles]);

    const handleProfileSearch = (value) => {
        setProfileSearch(value);
        setProfileFilter(prev => ({
            ...prev,
            search: value,
            page: 1
        }));
    };

    const handleSortChange = (field, order) => {
        setProfileFilter(prev => ({
            ...prev,
            sort_field: field,
            sort_order: order,
            page: 1
        }));
    };

    const handleProfileSelect = async (profile) => {
        const resolveProfilePicture = (p) => {
            try {
                if (p?.profile_picture) return appendCacheBuster(p.profile_picture);
                if (p?.photo) return appendCacheBuster(p.photo);
                const attachments = p?.attachments || p?.profile?.attachments || [];
                const pics = Array.isArray(attachments)
                    ? attachments.filter((f) => f?.file_description === "Profile Picture")
                    : [];
                // Sort by id descending to get the most recent profile picture
                pics.sort((a, b) => (b.id || 0) - (a.id || 0));
                if (pics.length > 0 && pics[0]?.file_path) {
                    return appendCacheBuster(apiUrl(pics[0].file_path));
                }
            } catch (_) {}
            return defaultProfile;
        };

        try {
            // Fetch complete profile data with issued documents
            const response = await fetch(apiUrl(`api/profile/${profile.id}`), {
                headers: {
                    'Authorization': token(),
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                const completeProfile = result.data || result;
                
                const profile_picture = resolveProfilePicture(completeProfile);
                setSelectedProfile({ ...completeProfile, profile_picture });
            } else {
                // Fallback to basic profile data if API call fails
        const profile_picture = resolveProfilePicture(profile);
        setSelectedProfile({ ...profile, profile_picture });
            }
        } catch (error) {
            console.error('Error fetching complete profile data:', error);
            // Fallback to basic profile data
            const profile_picture = resolveProfilePicture(profile);
            setSelectedProfile({ ...profile, profile_picture });
        }
        
        setCurrentStep(2);
        
        // Pre-fill form with selected profile data
        form.setFieldsValue({
            doc_category: initialDocCategory,
            cert_type: "Diploma",
            full_name: profile.fullname || `${profile.firstname || ''} ${profile.middlename || ''} ${profile.lastname || ''}`.trim(),
            student_id: profile.id_number || profile.id,
            program: profile.course || "",
            year_level: "4th Year",
            tor_coverage: "2022-2026",
            request_date: dayjs()
        });
        
        // Update form values state
        setFormValues({
            doc_category: initialDocCategory,
            cert_type: "Diploma",
            full_name: profile.fullname || `${profile.firstname || ''} ${profile.middlename || ''} ${profile.lastname || ''}`.trim(),
            student_id: profile.id_number || profile.id,
            program: profile.course || "",
            year_level: "4th Year",
            tor_coverage: "2022-2026",
            request_date: dayjs()
        });
    };

    const handleBackToSelection = () => {
        setCurrentStep(1);
        setSelectedProfile(null);
        setSelectedProfiles([]);
    };

    // Create a refetch function for the profile context
    const refetch = useCallback(async (updatedFormData = null) => {
        // Use external refetch if provided
        if (externalRefetch) {
            return externalRefetch(updatedFormData);
        }
        try {
            // Close the profile edit modal using Modal Manager
            closeModal(MODAL_TYPES.PROFILE_EDIT);
            
            // Reset the editing flag now that we're done
            setIsEditingProfile(false);
            
            // Always refetch the profiles list to ensure data consistency
            await refetchProfiles();
            
            // If we have updated form data, use it immediately for instant UI update
            if (updatedFormData && selectedProfile) {
                // If a new profile picture was uploaded, handle it with proper error handling
                if (updatedFormData._hasNewProfilePicture) {
                    try {
                        // Set flag to prevent useEffect from interfering
                        setIsUpdatingProfilePicture(true);
                        
                        // Wait for the server to process the new image
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Fetch fresh profile data
                        const response = await fetch(apiUrl(`api/profile/${selectedProfile.id}`), {
                            headers: {
                                'Authorization': token(),
                                'Accept': 'application/json'
                            }
                        });
                        
                        if (response.ok) {
                            const result = await response.json();
                            const freshProfile = result.data || result;
                            
                            // Update selected profile with fresh data
                            setSelectedProfile(prev => ({
                                ...prev,
                                ...freshProfile,
                                attachments: freshProfile.attachments || []
                            }));
                            
                            // Invalidate queries to refresh the data
                            queryClient.invalidateQueries(["profiles_for_document"]);
                            setCacheBuster(prev => prev + 1);
                            setTableKey(prev => prev + 1);
                        }
                    } catch (error) {
                        console.error('Error updating profile picture:', error);
                    } finally {
                        // Always clear the updating flag
                        setIsUpdatingProfilePicture(false);
                    }
                } else {
                    // For regular updates without profile picture, just update the local state
                    setSelectedProfile(prev => ({
                        ...prev,
                        ...updatedFormData
                    }));
                }
            }
            
            notification.success({
                message: 'Profile Updated',
                description: 'Profile has been updated successfully. The document generation form has been refreshed with the latest information.',
                placement: 'topRight',
            });
        } catch (error) {
            console.error('Error in refetch function:', error);
            notification.error({
                message: 'Update Error',
                description: 'Failed to refresh profile data. Please try again.',
                placement: 'topRight',
            });
        }
    }, [refetchProfiles, selectedProfile, form, setIsEditingProfile]);

    // Review Changes handlers
    const handleReviewChanges = (profileToEdit = null) => {
        const targetProfile = profileToEdit || selectedProfile;
        
        if (!targetProfile) {
            notification.warning({
                message: 'No Profile Selected',
                description: 'Please select a profile first before reviewing changes.',
                placement: 'topRight',
            });
            return;
        }

        // Set flag to prevent reset when returning from edit
        setIsEditingProfile(true);
        
        // Create a specific refetch function for this profile
        const profileSpecificRefetch = async (updatedFormData = null) => {
            try {
                // Close the profile edit modal using Modal Manager
                closeModal(MODAL_TYPES.PROFILE_EDIT);
                
                // Reset the editing flag now that we're done
                setIsEditingProfile(false);
            
            // Always refetch the profiles list to ensure data consistency
            await refetchProfiles();
            
            // If we have updated form data, use it immediately for instant UI update
                if (updatedFormData) {
                    // Try to fetch the updated profile to get fresh attachments
                    let updatedAttachments = targetProfile.attachments || [];
                    
                    // If a new profile picture was uploaded, we need to wait and fetch fresh data
                    if (updatedFormData._hasNewProfilePicture) {
                        // Set flag to prevent useEffect from interfering
                        setIsUpdatingProfilePicture(true);
                        // Wait a bit longer for the server to process the new image
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    
                    try {
                        const response = await fetch(apiUrl(`api/profile/${targetProfile.id}`), {
                            headers: {
                                'Authorization': token(),
                                'Accept': 'application/json'
                            }
                        });
                        
                        if (response.ok) {
                            const result = await response.json();
                            const freshProfile = result.data || result;
                            updatedAttachments = freshProfile.attachments || [];
                        }
                    } catch (error) {
                        console.log('Could not fetch fresh profile attachments, using cached:', error);
                    }
                
                // Recalculate profile picture from attachments
                const resolveProfilePicture = (p) => {
                    try {
                        const attachments = p?.attachments || [];
                        const pics = Array.isArray(attachments)
                            ? attachments.filter((f) => f?.file_description === "Profile Picture")
                            : [];
                        // Sort by id descending to get the most recent profile picture
                        pics.sort((a, b) => (b.id || 0) - (a.id || 0));
                        if (pics.length > 0 && pics[0]?.file_path) {
                            return appendCacheBuster(apiUrl(pics[0].file_path));
                        }
                    } catch (_) {}
                    return defaultProfile;
                };
                
                    // For immediate UI feedback, update with form data and fresh attachments
                const immediateUpdate = {
                        ...targetProfile,
                    ...updatedFormData,
                    // Ensure fullname is properly constructed
                    fullname: updatedFormData.fullname || `${updatedFormData.firstname || ''} ${updatedFormData.middlename || ''} ${updatedFormData.lastname || ''}`.trim(),
                        // Use fresh attachments (including any new profile picture)
                        attachments: updatedAttachments,
                        // Add or update course if education attainment is provided
                        course: updatedFormData.course || updatedFormData.education_attainment || targetProfile.course
                };
                
                // Recalculate profile picture
                immediateUpdate.profile_picture = resolveProfilePicture(immediateUpdate);

                    // Update the selectedProfiles array with the updated profile
                    setSelectedProfiles(prevProfiles => 
                        prevProfiles.map(profile => 
                            profile.id === targetProfile.id ? immediateUpdate : profile
                        )
                    );

                    // If this is also the selected profile, update it too
                    if (selectedProfile && selectedProfile.id === targetProfile.id) {
                setSelectedProfile(immediateUpdate);

                        // Update form values if needed
                form.setFieldsValue({
                    full_name: immediateUpdate.fullname,
                    student_id: immediateUpdate.id_number || immediateUpdate.id,
                    program: immediateUpdate.course || "",
                    year_level: "4th Year",
                    tor_coverage: "2022-2026",
                    request_date: form.getFieldValue("request_date") || dayjs()
                });
                    }

                // Wait longer for the API and file system to fully process the new profile picture
                setTimeout(async () => {
                    try {
                        // Refetch the profiles again to get the latest data including updated attachments
                        await refetchProfiles();
                        
                        // After refetch, ensure the profile picture is properly updated if it was changed
                        if (updatedFormData._hasNewProfilePicture) {
                            // Force another update to ensure we have the latest profile picture
                            setTimeout(async () => {
                                try {
                                    const freshResponse = await fetch(apiUrl(`api/profile/${targetProfile.id}`), {
                                        headers: {
                                            'Authorization': token(),
                                            'Accept': 'application/json'
                                        }
                                    });
                                    
                                    if (freshResponse.ok) {
                                        const freshResult = await freshResponse.json();
                                        const freshProfileData = freshResult.data || freshResult;
                                        
                                        // Recalculate profile picture from the latest attachments
                                        const resolveLatestProfilePicture = (p) => {
                                            try {
                                                const attachments = p?.attachments || [];
                                                const pics = Array.isArray(attachments)
                                                    ? attachments.filter((f) => f?.file_description === "Profile Picture")
                                                    : [];
                                                pics.sort((a, b) => (b.id || 0) - (a.id || 0));
                                                if (pics.length > 0 && pics[0]?.file_path) {
                                                    return appendCacheBuster(apiUrl(pics[0].file_path));
                                                }
                                            } catch (_) {}
                                            return defaultProfile;
                                        };
                                        
                                        const finalUpdate = {
                                            ...immediateUpdate,
                                            attachments: freshProfileData.attachments || [],
                                            profile_picture: resolveLatestProfilePicture(freshProfileData)
                                        };
                                        
                                        // Force multiple refreshes to ensure we get the latest data FIRST
                                        // First, invalidate the cache and force fresh data
                                        queryClient.invalidateQueries(["profiles_for_document"]);
                                        setCacheBuster(prev => prev + 1);
                                        setTableKey(prev => prev + 1);
                                        await refetchProfiles();
                                        
                                        // Wait and do another refresh to ensure we have the absolute latest
                                        await new Promise(resolve => setTimeout(resolve, 1000));
                                        queryClient.invalidateQueries(["profiles_for_document"]);
                                        setCacheBuster(prev => prev + 1);
                                        setTableKey(prev => prev + 1);
                                        await refetchProfiles();
                                        
                                        // Clear the updating flag after we have fresh data
                                        setIsUpdatingProfilePicture(false);

                                        // NOW update local state with fresh data from the server
                                        // Fetch the specific profile directly to get the absolute latest data
                                        try {
                                            const freshProfileResponse = await fetch(apiUrl(`api/profile/${targetProfile.id}`), {
                                                headers: {
                                                    'Authorization': token(),
                                                    'Accept': 'application/json'
                                                }
                                            });
                                            
                                            if (freshProfileResponse.ok) {
                                                const freshResult = await freshProfileResponse.json();
                                                const freshProfile = freshResult.data || freshResult;
                                                
                                                const freshProfilePicture = resolveLatestProfilePicture(freshProfile);
                                                const freshUpdate = {
                                                    ...freshProfile,
                                                    profile_picture: freshProfilePicture,
                                                    fullname: freshProfile.fullname || `${freshProfile.firstname || ''} ${freshProfile.lastname || ''}`
                                                };
                                                
                                                // Update the selectedProfiles array with the fresh data
                                                setSelectedProfiles(prevProfiles => 
                                                    prevProfiles.map(profile => 
                                                        profile.id === targetProfile.id ? freshUpdate : profile
                                                    )
                                                );

                                                // If this is also the selected profile, update it too
                                                if (selectedProfile && selectedProfile.id === targetProfile.id) {
                                                    setSelectedProfile(freshUpdate);
                                                }
                                            } else {
                                                // Fallback to the original finalUpdate if API call fails
                                                setSelectedProfiles(prevProfiles => 
                                                    prevProfiles.map(profile => 
                                                        profile.id === targetProfile.id ? finalUpdate : profile
                                                    )
                                                );

                                                if (selectedProfile && selectedProfile.id === targetProfile.id) {
                                                    setSelectedProfile(finalUpdate);
                                                }
                                            }
                                        } catch (error) {
                                            console.warn('Failed to fetch fresh profile data:', error);
                                            // Fallback to the original finalUpdate if error occurs
                                            setSelectedProfiles(prevProfiles => 
                                                prevProfiles.map(profile => 
                                                    profile.id === targetProfile.id ? finalUpdate : profile
                                                )
                                            );

                                            if (selectedProfile && selectedProfile.id === targetProfile.id) {
                                                setSelectedProfile(finalUpdate);
                                            }
                                        }
                                    }
                                } catch (error) {
                                    console.warn('Final profile picture refetch failed:', error);
                                    // Clear the updating flag even on error
                                    setIsUpdatingProfilePicture(false);
                                }
                            }, 1000);
                        }
                    } catch (error) {
                        console.warn('Secondary refetch failed:', error);
                    }
                }, 500);
            }
            
            notification.success({
                message: 'Profile Updated',
                description: 'Profile has been updated successfully. The document generation form has been refreshed with the latest information.',
                placement: 'topRight',
            });
        } catch (error) {
            console.error('Error refetching profiles:', error);
            notification.error({
                message: 'Update Error',
                description: 'Failed to refresh profile data. Please try again.',
                placement: 'topRight',
            });
        }
        };
        
        // Use modal manager to open profile edit modal with profile-specific refetch
        openModal(MODAL_TYPES.PROFILE_EDIT, {
            data: targetProfile,
            refetch: profileSpecificRefetch
        });
    };



    // Helper functions for checking active documents
    const getDocumentsByType = (profile, documentType) => {
        if (!profile?.issued_document) return [];
        
        return profile.issued_document.filter(doc => 
            doc.document_type === documentType
        ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    };

    const isDocumentActive = (document) => {
        return !document.date_revoked && !document.deleted_at;
    };

    const getLatestActiveDocument = (profile, documentType) => {
        const documents = getDocumentsByType(profile, documentType);
        return documents.find(doc => isDocumentActive(doc)) || null;
    };

    const hasActiveDocument = (profile, documentType) => {
        return getLatestActiveDocument(profile, documentType) !== null;
    };

    const proceedWithGeneration = (documentData) => {
        // Handle multiple profiles by processing the first one and storing the rest
        if (documentData.profiles && documentData.profiles.length > 1) {
            // For multiple profiles, process them individually
            // Start with the first profile
            const firstProfile = documentData.profiles[0];
            const singleDocumentData = {
                ...documentData,
                profile_id: firstProfile.id,
                profile_data: firstProfile,
                full_name: firstProfile.fullname || `${firstProfile.firstname || ''} ${firstProfile.lastname || ''}`,
                student_id: firstProfile.id_number || firstProfile.id,
                program: firstProfile.course || 'N/A',
                // Store remaining profiles for batch processing
                remainingProfiles: documentData.profiles.slice(1),
                isMultipleProfiles: true,
                currentProfileIndex: 0,
                totalProfiles: documentData.profiles.length
            };
            
            setGeneratedDocumentData(singleDocumentData);
        } else if (documentData.profiles && documentData.profiles.length === 1) {
            // Single profile from multiple selection
            const profile = documentData.profiles[0];
            const singleDocumentData = {
                ...documentData,
                profile_id: profile.id,
                profile_data: profile,
                full_name: profile.fullname || `${profile.firstname || ''} ${profile.lastname || ''}`,
                student_id: profile.id_number || profile.id,
                program: profile.course || 'N/A'
            };
            
            setGeneratedDocumentData(singleDocumentData);
        } else {
            // Legacy single profile (backward compatibility)
            setGeneratedDocumentData(documentData);
        }
        
        // Show loading modal and hide main modal
        setShowLoadingModal(true);
    };

    const handleActiveDocumentWarningConfirm = () => {
        setShowActiveDocumentWarning(false);
        if (pendingDocumentData) {
            proceedWithGeneration(pendingDocumentData);
            setPendingDocumentData(null);
        }
    };

    const handleActiveDocumentWarningCancel = () => {
        setShowActiveDocumentWarning(false);
        setPendingDocumentData(null);
    };

    const handleOk = async () => {
        if (currentStep === 1) return;

        try {
            // Validate form fields before proceeding
            const values = await form.validateFields();
            
            // Validate required profile fields for all selected profiles
            const requiredFields = {
                birthplace: 'Place of Birth',
                birthdate: 'Date of Birth',
                gender: 'Gender',
                citizenship: 'Citizenship',
                civil_status: 'Civil Status',
                course: 'Course/Program',
                address: 'Home Address',
            };

            const findMissingForProfile = (p) => {
                const missing = [];
                Object.entries(requiredFields).forEach(([key, label]) => {
                    const value = p?.[key];
                    if (value === undefined || value === null || String(value).trim() === '') {
                        missing.push(label);
                    }
                });
                // Composite: require at least one of Mother/Father/Spouse
                const hasAnyParentInfo = [p?.mother_name, p?.father_name, p?.spouse_name]
                    .some((v) => v && String(v).trim() !== '');
                if (!hasAnyParentInfo) {
                    missing.push('Parent/Spouse (any one)');
                }
                return missing;
            };

            const computedMissing = (selectedProfiles || []).map(p => ({
                id: p.id,
                fullname: p.fullname || `${p.firstname || ''} ${p.lastname || ''}`.trim(),
                missing: findMissingForProfile(p)
            })).filter(item => item.missing.length > 0);

            if (computedMissing.length > 0) {
                setProfilesWithMissingFields(computedMissing);
                setShowMissingFieldsModal(true);
                return; // Block proceeding until fixed
            }

            // Require University Registrar for all document categories
            if (!values.registrar_id) {
                notification.error({
                    message: 'Validation Error',
                    description: 'Please select a University Registrar.',
                    placement: 'topRight',
                });
                return;
            }

            if (selectedProfiles.length === 0) {
                notification.error({
                    message: 'No Profiles Selected',
                    description: 'Please select at least one profile to generate documents.',
                    placement: 'topRight',
                });
                return;
            }

            // Check for active documents in any selected profile
            let documentTypeToCheck = values.doc_category;
            if (values.doc_category === 'Certification' && values.cert_type) {
                documentTypeToCheck = values.cert_type; // "Certificate of Units Earned" or "Diploma"
            }

            const profilesWithActiveDocuments = selectedProfiles.filter(profile => 
                hasActiveDocument(profile, documentTypeToCheck)
            );

            if (profilesWithActiveDocuments.length > 0) {
                // Prepare batch document data for the warning modal
                const batchDocumentData = {
                ...values,
                    profiles: selectedProfiles,
                    profilesWithActiveDocuments: profilesWithActiveDocuments,
                qr_enabled: true,
                digital_signature: true,
                // Include user role data for PDF generation
                vice_president_name: vicePresidentName,
                university_president_name: universityPresidentName,
                dean_name: deanName
            };
                // Show warning modal for multiple profiles with active documents
                setPendingDocumentData(batchDocumentData);
                setShowActiveDocumentWarning(true);
                return;
            }
            
            // Prepare batch document data for multiple profiles
            const batchDocumentData = {
                ...values,
                profiles: selectedProfiles,
                qr_enabled: true,
                digital_signature: true,
                // Include user role data for PDF generation
                vice_president_name: vicePresidentName,
                university_president_name: universityPresidentName,
                dean_name: deanName
            };
            
            
            // Proceed with batch generation
            proceedWithGeneration(batchDocumentData);
        } catch (error) {
            // Form validation failed
        }
    };

    const handleLoadingComplete = (apiResponseData) => {
        // Check if we're processing multiple profiles
        if (generatedDocumentData?.isMultipleProfiles && generatedDocumentData?.remainingProfiles?.length > 0) {
            // Process the next profile
            const nextProfile = generatedDocumentData.remainingProfiles[0];
            const nextDocumentData = {
                ...generatedDocumentData,
                profile_id: nextProfile.id,
                profile_data: nextProfile,
                full_name: nextProfile.fullname || `${nextProfile.firstname || ''} ${nextProfile.lastname || ''}`,
                student_id: nextProfile.id_number || nextProfile.id,
                program: nextProfile.course || 'N/A',
                remainingProfiles: generatedDocumentData.remainingProfiles.slice(1),
                currentProfileIndex: generatedDocumentData.currentProfileIndex + 1,
                // Store completed profiles for final viewer
                completedProfiles: [...(generatedDocumentData.completedProfiles || []), {
                    ...generatedDocumentData.profile_data,
                    generatedDocument: apiResponseData
                }]
            };
            
            setGeneratedDocumentData(nextDocumentData);
            // Continue with the next profile (loading modal stays open)
            return;
        }
        
        // All profiles processed or single profile completed
        setShowLoadingModal(false);
        setShowViewerModal(true);
        
        // Update the generated document data with API response
        if (apiResponseData) {
            const finalDocumentData = {
                ...generatedDocumentData,
                ...apiResponseData
            };
            
            // If this was the last profile in a batch, add it to completed profiles
            if (generatedDocumentData?.isMultipleProfiles) {
                finalDocumentData.completedProfiles = [
                    ...(generatedDocumentData.completedProfiles || []),
                    {
                        ...generatedDocumentData.profile_data,
                        generatedDocument: apiResponseData
                    }
                ];
            }
            
            setGeneratedDocumentData(finalDocumentData);
        }
        
        // Show success notification
        const docCategory = generatedDocumentData?.doc_category || 'Transcript of Records';
        const certType = generatedDocumentData?.cert_type || '';
        
        let documentTypeName = 'TOR';
        if (docCategory === 'Certification' && certType === 'Certificate of Units Earned') {
            documentTypeName = 'Certificate of Units Earned';
        } else if (docCategory === 'Certification' && certType === 'Diploma') {
            documentTypeName = 'Diploma';
        }
        
        const isMultiple = generatedDocumentData?.isMultipleProfiles;
        const totalCount = generatedDocumentData?.totalProfiles || 1;
        const completedCount = (generatedDocumentData?.completedProfiles?.length || 0) + 1;
        
        notification.success({
            message: isMultiple ? 'Documents Generated Successfully' : `${documentTypeName} Generated Successfully`,
            description: isMultiple 
                ? `${completedCount}/${totalCount} ${documentTypeName} documents have been generated and are ready for preview.`
                : `${documentTypeName} has been generated with serial number ${apiResponseData?.serial_number || 'N/A'} and includes digital signature with QR code.`,
            placement: 'topRight',
            duration: 6
        });
        
        // Call original onSubmit if needed
        if (onSubmit) onSubmit(apiResponseData || generatedDocumentData);
    };

    const handleViewerClose = () => {
        setShowViewerModal(false);
        if (onCancel) onCancel();
    };

    // Multiple profile selection handlers
    const handleMultipleProfileSelection = (selectedRowKeys, selectedRows) => {
        setSelectedProfiles(selectedRows);
    };

    const handleProceedWithSelectedProfiles = () => {
        if (selectedProfiles.length === 0) {
            notification.warning({
                message: 'No Profiles Selected',
                description: 'Please select at least one profile to proceed.',
                placement: 'topRight',
            });
            return;
        }
        setCurrentStep(2);
    };

    const handleCancelSelection = () => {
        setSelectedProfiles([]);
    };

    const profileColumns = [
        {
            title: "Profile",
            key: "fullname",
            dataIndex: "fullname",
            sorter: true,
            render: (_, record) => {
                const resolveProfilePicture = (p) => {
                    try {
                        // Prefer direct fields if present
                        if (p?.profile_picture) return appendCacheBuster(p.profile_picture);
                        if (p?.photo) return appendCacheBuster(p.photo);
                        // Then recalc from attachments to ensure latest
                        const attachments = p?.attachments || p?.profile?.attachments || [];
                        const pics = Array.isArray(attachments) 
                            ? attachments.filter((f) => f?.file_description === "Profile Picture") 
                            : [];
                        
                        // Sort by id descending to get the most recent profile picture
                        pics.sort((a, b) => (b.id || 0) - (a.id || 0));
                        
                        if (pics.length > 0 && pics[0]?.file_path) {
                            return appendCacheBuster(apiUrl(pics[0].file_path));
                        }
                    } catch (error) {
                        console.log('Error resolving profile picture:', error);
                    }
                    return defaultProfile;
                };

                const src = resolveProfilePicture(record);
                // Check missing required fields for row indicator
                const missing = [];
                const check = (key, label) => {
                    const v = record?.[key];
                    if (v === undefined || v === null || String(v).trim() === '') missing.push(label);
                };
                check('birthplace', 'Place of Birth');
                check('birthdate', 'Date of Birth');
                check('gender', 'Gender');
                check('citizenship', 'Citizenship');
                check('civil_status', 'Civil Status');
                check('course', 'Course/Program');
                check('address', 'Home Address');
                const hasAnyParentInfoRow = [record?.mother_name, record?.father_name, record?.spouse_name]
                    .some((v) => v && String(v).trim() !== '');
                if (!hasAnyParentInfoRow) missing.push('Parent/Spouse (any one)');
                
                return (
                    <Flex align="center" gap={12}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f5f5f5' }}>
                            <img src={src} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </div>
                        <div>
                            <Text strong>{record.fullname || `${record.firstname || ''} ${record.lastname || ''}`}</Text>
                            {missing.length > 0 && (
                                <Tooltip title={missing.join(', ')}>
                                    <Tag color="orange" style={{ marginLeft: 8 }}>Missing Info</Tag>
                                </Tooltip>
                            )}
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                ID: {record.id_number || record.id}
                            </Text>
                        </div>
                    </Flex>
                );
            },
            width: 250
        },
        {
            title: "Course/Program",
            dataIndex: "course",
            key: "course",
            render: (text) => text || "N/A",
            sorter: true,
            width: 200
        },
        {
            title: "Gender",
            dataIndex: "gender",
            key: "gender",
            sorter: true,
            render: (text) => text ? (
                <Tag color={text === 'Male' ? 'blue' : 'pink'}>{text}</Tag>
            ) : "N/A",
            width: 100
        },
        {
            title: "Enrolled",
            dataIndex: "created_at",
            key: "created_at",
            render: (text) => text ? dayjs(text).format("MM/DD/YYYY") : "N/A",
            sorter: true,
            width: 120
        }
    ];

    const onTableChange = (pagination, filters, sorter) => {
        setProfileFilter(prev => ({
            ...prev,
            page: pagination.current,
            page_size: pagination.pageSize,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null
        }));
    };

    const renderProfileSelection = () => (
        <div style={{ minHeight: 500 }}>
            <Title level={4} style={{ marginBottom: 16, color: 'var(--color-primary)' }}>
                <FontAwesomeIcon icon={faUser} style={{ marginRight: 8 }} />
                Select Profile for Document Generation
            </Title>
            
            <Card size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={12} md={10}>
                        <Search
                            placeholder={isTablet ? "Search..." : "Search by name, ID, or course..."}
                            value={profileSearch}
                            onChange={(e) => handleProfileSearch(e.target.value)}
                            onSearch={handleProfileSearch}
                            style={{ 
                                width: '100%',
                                fontSize: isMobile ? '14px' : '16px'
                            }}
                            size={isMobile ? 'middle' : 'large'}
                            prefix={<FontAwesomeIcon icon={faSearch} />}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Sort by..."
                            style={{ width: '100%' }}
                            onChange={(value) => {
                                const [field, order] = value.split('_');
                                handleSortChange(field, order);
                            }}
                            prefix={<FontAwesomeIcon icon={faSortAmountDown} />}
                        >
                            <Select.Option value="created_at_desc">Latest First</Select.Option>
                            <Select.Option value="created_at_asc">Oldest First</Select.Option>
                            <Select.Option value="firstname_asc">Name A-Z</Select.Option>
                            <Select.Option value="firstname_desc">Name Z-A</Select.Option>
                            <Select.Option value="course_asc">Course A-Z</Select.Option>
                            <Select.Option value="age_asc">Age Low-High</Select.Option>
                            <Select.Option value="age_desc">Age High-Low</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={6}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Total: {profilesData?.data?.total || 0} profiles
                        </Text>
                    </Col>
                </Row>
            </Card>

            <Table
                key={tableKey} // Force re-render when profile pictures are updated
                columns={profileColumns}
                dataSource={profilesData?.data?.data || []}
                rowKey="id"
                rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectedProfiles.map(p => p.id),
                    onChange: handleMultipleProfileSelection,
                    onSelect: (record, selected, selectedRows) => {
                        handleMultipleProfileSelection(
                            selectedRows.map(r => r.id),
                            selectedRows
                        );
                    },
                    onSelectAll: (selected, selectedRows, changeRows) => {
                        handleMultipleProfileSelection(
                            selectedRows.map(r => r.id),
                            selectedRows
                        );
                    }
                }}
                pagination={{
                    current: profileFilter.page,
                    pageSize: profileFilter.page_size,
                    total: profilesData?.data?.total || 0,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} profiles`,
                    pageSizeOptions: ['5', '10', '20', '50']
                }}
                scroll={{ x: 800, y: 300 }}
                onChange={onTableChange}
                size="small"
                style={{
                    '& .ant-table-thead > tr > th': {
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-white)',
                        fontWeight: 'bold'
                    }
                }}
            />
            
            {/* Selection Summary and Action Buttons */}
            <Card size="small" style={{ marginTop: 16, backgroundColor: '#f8f9fa' }}>
                <Flex justify="space-between" align="center">
                    <Text strong>
                        {selectedProfiles.length > 0 
                            ? `${selectedProfiles.length} profile(s) selected`
                            : 'No profiles selected'
                        }
                    </Text>
                    <Space>
                        {selectedProfiles.length > 0 && (
                            <Button onClick={handleCancelSelection}>
                                Cancel
                            </Button>
                        )}
                        <Button 
                            type="primary" 
                            className="btn-main-primary"
                            onClick={handleProceedWithSelectedProfiles}
                            disabled={selectedProfiles.length === 0}
                        >
                            Proceed
                        </Button>
                    </Space>
                </Flex>
            </Card>
        </div>
    );

    const renderDocumentGeneration = () => (
        <div>
            <Flex justify="flex-start" align="center" style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0, color: 'var(--color-primary)' }}>
                    <FontAwesomeIcon icon={faFileSignature} style={{ marginRight: 8 }} />
                    Document Generation
                </Title>
            </Flex>

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    doc_category: initialDocCategory,
                    cert_type: "Diploma",
                    qr_enabled: true,
                    digital_signature: true,
                    year_level: "4th Year",
                    tor_coverage: "2022-2026"
                }}
                onValuesChange={() => updateFormValues()}
            >
                {/* Hidden items to keep values registered in the form store */}
                <Form.Item name="doc_category" hidden>
                    <Input />
                </Form.Item>


                <Form.Item name="full_name" hidden>
                    <Input />
                </Form.Item>
                <Form.Item name="student_id" hidden>
                    <Input />
                </Form.Item>
                <Form.Item name="program" hidden>
                    <Input />
                </Form.Item>
                <Form.Item name="year_level" hidden>
                    <Input />
                </Form.Item>
                <Form.Item name="request_date" hidden>
                    <Input />
                </Form.Item>
                <Collapse
                    defaultActiveKey={['1', '2', '3']}
                    items={[
                        {
                            key: '1',
                            label: 'Document Configuration',
                            children: (
                                initialDocCategory === "Certification" ? (
                                    <>
                                        <Row gutter={[12, 12]}>
                                            <Col xs={24} md={12}>
                                                <Form.Item label="Document Category">
                                                    <Text strong>{initialDocCategory}</Text>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                {/* spacer */}
                                            </Col>
                                        </Row>
                                        <Row gutter={[12, 12]}>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="registrar_id" label="University Registrar" rules={[{ required: true, message: "Please select a registrar" }]}> 
                                                    <Select
                                                        placeholder="Select University Registrar"
                                                        showSearch
                                                        allowClear
                                                        optionFilterProp="label"
                                                        loading={!registrarUsers}
                                                        onChange={() => updateFormValues()}
                                                        notFoundContent={!registrarUsers ? "Loading..." : "No registrars found"}
                                                        filterOption={(input, option) =>
                                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                        }
                                                    >
                                                        {registrarUsers?.data?.data && Array.isArray(registrarUsers.data.data) 
                                                            ? registrarUsers.data.data.map(user => {
                                                                const fullName = user.fullname_with_course || user.fullname || 
                                                                    `${user.profile?.firstname || ''} ${user.profile?.lastname || ''}`.trim() || 
                                                                    user.username || 
                                                                    `User ${user.id}`;
                                                                return (
                                                                    <Select.Option key={user.id} value={user.id} label={`${fullName} (${user.user_role?.user_role || 'Unknown Role'})`}>
                                                                        {fullName} ({user.user_role?.user_role || 'Unknown Role'})
                                                                    </Select.Option>
                                                                );
                                                            })
                                                            : registrarUsers?.data && Array.isArray(registrarUsers.data)
                                                            ? registrarUsers.data.map(user => {
                                                                const fullName = user.fullname_with_course || user.fullname || 
                                                                    `${user.profile?.firstname || ''} ${user.profile?.lastname || ''}`.trim() || 
                                                                    user.username || 
                                                                    `User ${user.id}`;
                                                                return (
                                                                    <Select.Option key={user.id} value={user.id} label={`${fullName} (${user.user_role?.user_role || 'Unknown Role'})`}>
                                                                        {fullName} ({user.user_role?.user_role || 'Unknown Role'})
                                                                    </Select.Option>
                                                                );
                                                            })
                                                            : null
                                                        }
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="cert_type" label="Certification Type" rules={[{ required: true, message: "Required" }]}>
                                                    <Select
                                                        onChange={() => updateFormValues()}
                                                        options={[
                                                            { value: "Diploma", label: "Diploma" },
                                                            { value: "Certificate of Units Earned", label: "Certificate of Units Earned" },
                                                        ]}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </>
                                ) : (
                                    <Row gutter={[12, 12]}>
                                        <Col xs={24} md={12}>
                                            <Form.Item label="Document Category">
                                                <Text strong>{initialDocCategory}</Text>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item name="registrar_id" label="University Registrar" rules={[{ required: true, message: "Please select a registrar" }]}> 
                                                <Select
                                                    placeholder="Select University Registrar"
                                                    showSearch
                                                    allowClear
                                                    optionFilterProp="label"
                                                    loading={!registrarUsers}
                                                    onChange={() => updateFormValues()}
                                                    notFoundContent={!registrarUsers ? "Loading..." : "No registrars found"}
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                >
                                                    {registrarUsers?.data?.data && Array.isArray(registrarUsers.data.data) 
                                                        ? registrarUsers.data.data.map(user => {
                                                            const fullName = user.fullname_with_course || user.fullname || 
                                                                `${user.profile?.firstname || ''} ${user.profile?.lastname || ''}`.trim() || 
                                                                user.username || 
                                                                `User ${user.id}`;
                                                            return (
                                                                <Select.Option key={user.id} value={user.id} label={fullName}>
                                                                    {fullName}
                                                                </Select.Option>
                                                            );
                                                        })
                                                        : registrarUsers?.data && Array.isArray(registrarUsers.data)
                                                        ? registrarUsers.data.map(user => {
                                                            const fullName = user.fullname_with_course || user.fullname || 
                                                                `${user.profile?.firstname || ''} ${user.profile?.lastname || ''}`.trim() || 
                                                                user.username || 
                                                                `User ${user.id}`;
                                                            return (
                                                                <Select.Option key={user.id} value={user.id} label={fullName}>
                                                                    {fullName}
                                                                </Select.Option>
                                                            );
                                                        })
                                                        : null
                                                    }
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                )
                            )
                        },
                        {
                            key: '2',
                            label: 'Student Information',
                            children: (
                                <div>
                                    <Title level={5} style={{ marginBottom: 16 }}>
                                        Selected Students ({selectedProfiles.length})
                                    </Title>
                                    <Table
                                        key={`selected-profiles-${tableKey}`} // Force re-render when profile pictures are updated
                                        columns={[
                                            {
                                                title: "Action",
                                                key: "action",
                                                render: (_, record) => (
                                        <Button
                                            type="default"
                                                        size="small"
                                            icon={<FontAwesomeIcon icon={faEdit} />}
                                                        onClick={() => handleReviewChanges(record)}
                                            className="btn-outline-primary"
                                        >
                                            Review Changes
                                        </Button>
                                                ),
                                                width: 140,
                                                align: 'center'
                                            },
                                            {
                                                title: "Profile",
                                                key: "fullname",
                                                dataIndex: "fullname",
                                                render: (_, record) => {
                                                    const resolveProfilePicture = (p) => {
                                                        try {
                                                            // Prefer direct fields if present
                                                            if (p?.profile_picture) return appendCacheBuster(p.profile_picture);
                                                            if (p?.photo) return appendCacheBuster(p.photo);
                                                            // Then recalculate from attachments to ensure we have the latest
                                                            const attachments = p?.attachments || p?.profile?.attachments || [];
                                                            const pics = Array.isArray(attachments) 
                                                                ? attachments.filter((f) => f?.file_description === "Profile Picture") 
                                                                : [];
                                                            
                                                            // Sort by id descending to get the most recent profile picture
                                                            pics.sort((a, b) => (b.id || 0) - (a.id || 0));
                                                            
                                                            if (pics.length > 0 && pics[0]?.file_path) {
                                                                return appendCacheBuster(apiUrl(pics[0].file_path));
                                                            }
                                                        } catch (error) {
                                                            console.log('Error resolving profile picture:', error);
                                                        }
                                                        return defaultProfile;
                                                    };

                                                    const src = resolveProfilePicture(record);
                                                    
                                                    return (
                                                        <Flex align="center" gap={12}>
                                                            <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f5f5f5' }}>
                                                                <img src={src} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                                            </div>
                                                            <div>
                                                                <Text strong>{record.fullname || `${record.firstname || ''} ${record.lastname || ''}`}</Text>
                                                                <br />
                                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                                    ID: {record.id_number || record.id}
                                                                </Text>
                                                            </div>
                                    </Flex>
                                                    );
                                                },
                                                width: 250
                                            },
                                            {
                                                title: "Course/Program",
                                                dataIndex: "course",
                                                key: "course",
                                                render: (text) => text || "N/A",
                                                width: 200
                                            },
                                            {
                                                title: "Gender",
                                                dataIndex: "gender",
                                                key: "gender",
                                                render: (text) => text ? (
                                                    <Tag color={text === 'Male' ? 'blue' : 'pink'}>{text}</Tag>
                                                ) : "N/A",
                                                width: 100
                                            },
                                            {
                                                title: "Enrolled",
                                                dataIndex: "created_at",
                                                key: "created_at",
                                                render: (text) => text ? dayjs(text).format("MM/DD/YYYY") : "N/A",
                                                width: 120
                                            }
                                        ]}
                                        dataSource={selectedProfiles}
                                        rowKey="id"
                                        pagination={false}
                                        size="small"
                                        scroll={{ x: 600 }}
                                        style={{ marginBottom: 16 }}
                                    />
                                </div>
                            )
                        },
                        {
                            key: '3',
                            label: 'Document Security & Features',
                            children: (
                                <Row gutter={[12, 12]}>
                                    <Col xs={24} md={12}>
                                        <Card size="small" style={{ textAlign: 'center', backgroundColor: '#f0f9ff' }}>
                                            <FontAwesomeIcon 
                                                icon={faQrcode} 
                                                style={{ fontSize: 24, color: 'var(--color-primary)', marginBottom: 8 }} 
                                            />
                                            <br />
                                            <Text strong>QR Code Integration</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Automatic QR code generation for document verification
                                            </Text>
                                        </Card>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Card size="small" style={{ textAlign: 'center', backgroundColor: '#f0fdf4' }}>
                                            <FontAwesomeIcon 
                                                icon={faFileSignature} 
                                                style={{ fontSize: 24, color: 'var(--color-success)', marginBottom: 8 }} 
                                            />
                                            <br />
                                            <Text strong>Digital Signature</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Automatic digital signature application
                                            </Text>
                                        </Card>
                                    </Col>
                                </Row>
                            )
                        }
                    ]}
                />
            </Form>
        </div>
    );

    return (
        <PageProfileContext.Provider value={{
            toggleModalForm,
            setToggleModalForm,
            refetch
        }}>
            {/* Missing fields warning modal */}
            <Modal
                open={showMissingFieldsModal}
                onCancel={() => setShowMissingFieldsModal(false)}
                onOk={() => setShowMissingFieldsModal(false)}
                maskClosable={false}
                centered
                title={
                    <Flex align="center" gap={8}>
                        <FontAwesomeIcon icon={faTimesCircle} />
                        Missing Required Information
                    </Flex>
                }
                okText="Return to Form"
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                <Text type="secondary">Please complete the following fields before proceeding:</Text>
                <div style={{ marginTop: 12 }}>
                    {profilesWithMissingFields.map(item => (
                        <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
                            <Text strong>{item.fullname}</Text>
                            <div style={{ marginTop: 6 }}>
                                {item.missing.map((f, idx) => (
                                    <Tag key={idx} color="orange" style={{ marginBottom: 4 }}>{f}</Tag>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            </Modal>
            <Modal
                open={open && !showLoadingModal && !showViewerModal}
                onCancel={onCancel}
                wrapClassName="modal-enhanced-document-generation-wrap"
                footer={
                    currentStep === 1
                        ? null
                        : [
                            <Button
                                key="change_profile"
                                onClick={handleBackToSelection}
                            >
                                Change Profiles
                            </Button>,
                            <Tooltip 
                                title={!formValues.registrar_id ? "Please select a University Registrar first" : selectedProfiles.length === 0 ? "No profiles selected" : ""}
                                placement="top"
                            >
                                <Button
                                    key="proceed"
                                    type="primary"
                                    className="btn-main-primary"
                                    onClick={handleOk}
                                    disabled={!formValues.registrar_id || selectedProfiles.length === 0}
                                >
                                    Proceed ({selectedProfiles.length})
                                </Button>
                            </Tooltip>
                        ]
                }
                title={
                    <Flex align="center" gap={8}>
                        <FontAwesomeIcon icon={faGraduationCap} />
                        {currentStep === 1 ? "Select Profiles" : "Generate Documents"}
                    </Flex>
                }
                width={currentStep === 1 ? 1000 : 800}
                destroyOnClose
                centered
                styles={{
                    header: {
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-white)'
                    }
                }}
            >
                {currentStep === 1 ? renderProfileSelection() : renderDocumentGeneration()}
            </Modal>

            <ModalDocumentLoading 
                open={showLoadingModal}
                onComplete={handleLoadingComplete}
                documentData={generatedDocumentData}
            />

            <ModalDocumentViewer 
                open={showViewerModal}
                onClose={handleViewerClose}
                documentData={generatedDocumentData}
                profileData={selectedProfile}
                profilesData={generatedDocumentData?.completedProfiles || selectedProfiles}
            />

            <ModalActiveDocumentWarning
                open={showActiveDocumentWarning}
                onConfirm={handleActiveDocumentWarningConfirm}
                onCancel={handleActiveDocumentWarningCancel}
                documentType={
                    pendingDocumentData?.doc_category === 'Certification' && pendingDocumentData?.cert_type 
                        ? pendingDocumentData.cert_type 
                        : pendingDocumentData?.doc_category || ''
                }
                profileName={(() => {
                    // Prefer the first selected profile from pending data for context
                    const p = (pendingDocumentData?.profiles && pendingDocumentData.profiles[0]) || selectedProfile || {};
                    const full = (p.fullname || '').toString().trim();
                    if (full) return full;
                    const f = (p.firstname || '').toString().trim();
                    const l = (p.lastname || '').toString().trim();
                    const joined = [f, l].filter(Boolean).join(' ').trim();
                    if (joined) return joined;
                    if (p.id_number) return `ID: ${p.id_number}`;
                    if (p.id) return `Profile #${p.id}`;
                    return 'Unknown Profile';
                })()}
                profilesWithActiveDocuments={pendingDocumentData?.profilesWithActiveDocuments}
            />

            {/* ModalFormProfile moved outside to TabDocumentTranscriptOfRecords for proper layering */}
        </PageProfileContext.Provider>
    );
}
