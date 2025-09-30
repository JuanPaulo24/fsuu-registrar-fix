import { createContext, useContext, useState } from 'react';

// Modal Manager Context
const ModalManagerContext = createContext();

// Modal types
export const MODAL_TYPES = {
    DOCUMENT_GENERATION: 'DOCUMENT_GENERATION',
    PROFILE_EDIT: 'PROFILE_EDIT',
    ACTIVE_DOCUMENT_WARNING: 'ACTIVE_DOCUMENT_WARNING',
    PASSWORD_VERIFICATION: 'PASSWORD_VERIFICATION',
    REVOCATION_WARNING: 'REVOCATION_WARNING',
    DOCUMENT_VIEWER: 'DOCUMENT_VIEWER',
    DOCUMENT_LOADING: 'DOCUMENT_LOADING'
};

// Modal Manager Provider
export function ModalManagerProvider({ children }) {
    const [modals, setModals] = useState([]);

    const openModal = (type, props = {}) => {
        setModals(prev => [...prev, { type, props, id: Date.now() }]);
    };

    const closeModal = (type) => {
        setModals(prev => prev.filter(modal => modal.type !== type));
    };

    const closeTopModal = () => {
        setModals(prev => prev.slice(0, -1));
    };

    const closeAllModals = () => {
        setModals([]);
    };

    const isModalOpen = (type) => {
        return modals.some(modal => modal.type === type);
    };

    const getModalProps = (type) => {
        const modal = modals.find(modal => modal.type === type);
        return modal ? modal.props : {};
    };

    const getTopModal = () => {
        return modals[modals.length - 1] || null;
    };

    return (
        <ModalManagerContext.Provider value={{
            modals,
            openModal,
            closeModal,
            closeTopModal,
            closeAllModals,
            isModalOpen,
            getModalProps,
            getTopModal
        }}>
            {children}
        </ModalManagerContext.Provider>
    );
}

// Hook to use Modal Manager
export function useModalManager() {
    const context = useContext(ModalManagerContext);
    if (!context) {
        throw new Error('useModalManager must be used within a ModalManagerProvider');
    }
    return context;
}