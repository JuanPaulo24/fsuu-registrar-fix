import { useModalManager, MODAL_TYPES } from './ModalManager';
import ModalEnhancedDocumentGeneration from './ModalEnhancedDocumentGeneration';
import ModalFormProfile from './ModalFormProfile';
import ModalActiveDocumentWarning from './ModalActiveDocumentWarning';
import ModalPasswordVerification from './ModalPasswordVerification';
import ModalRevocationWarning from './ModalRevocationWarning';
import ModalDocumentViewer from './ModalDocumentViewer';
import ModalDocumentLoading from './ModalDocumentLoading';
import PageProfileContext from './PageProfileContext';

export default function ModalRenderer() {
    const { modals, closeModal } = useModalManager();

    if (!modals || modals.length === 0) return null;

    // Keep the Generate Document modal mounted to preserve its state across other modals
    const documentGenerationModal = modals.find((m) => m.type === MODAL_TYPES.DOCUMENT_GENERATION);
    const topModal = modals[modals.length - 1];

    const renderTopModal = () => {
        if (!topModal) return null;
        const { type, props } = topModal;
        switch (type) {
            case MODAL_TYPES.DOCUMENT_GENERATION:
                return null; // Already rendered persistently below
            case MODAL_TYPES.PROFILE_EDIT:
                return (
                    <PageProfileContext.Provider value={{
                        toggleModalForm: { open: true, data: props.data },
                        setToggleModalForm: (state) => {
                            if (!state.open) {
                                closeModal(MODAL_TYPES.PROFILE_EDIT);
                            }
                        },
                        refetch: props.refetch || (() => {})
                    }}>
                        <ModalFormProfile />
                    </PageProfileContext.Provider>
                );
            case MODAL_TYPES.ACTIVE_DOCUMENT_WARNING:
                return (
                    <ModalActiveDocumentWarning
                        {...props}
                        open={true}
                        onCancel={() => closeModal(MODAL_TYPES.ACTIVE_DOCUMENT_WARNING)}
                    />
                );
            case MODAL_TYPES.PASSWORD_VERIFICATION:
                return (
                    <ModalPasswordVerification
                        {...props}
                        open={true}
                        onCancel={() => closeModal(MODAL_TYPES.PASSWORD_VERIFICATION)}
                    />
                );
            case MODAL_TYPES.REVOCATION_WARNING:
                return (
                    <ModalRevocationWarning
                        {...props}
                        open={true}
                        onCancel={() => closeModal(MODAL_TYPES.REVOCATION_WARNING)}
                    />
                );
            case MODAL_TYPES.DOCUMENT_VIEWER:
                return (
                    <ModalDocumentViewer
                        {...props}
                        open={true}
                        onClose={() => closeModal(MODAL_TYPES.DOCUMENT_VIEWER)}
                    />
                );
            case MODAL_TYPES.DOCUMENT_LOADING:
                return (
                    <ModalDocumentLoading
                        {...props}
                        open={true}
                        onComplete={() => closeModal(MODAL_TYPES.DOCUMENT_LOADING)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            {documentGenerationModal && (
                <ModalEnhancedDocumentGeneration
                    {...documentGenerationModal.props}
                    open={true}
                    onCancel={() => closeModal(MODAL_TYPES.DOCUMENT_GENERATION)}
                />
            )}
            {renderTopModal()}
        </>
    );
}