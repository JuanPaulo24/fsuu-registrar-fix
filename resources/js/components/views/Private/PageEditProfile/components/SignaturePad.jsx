import { useEffect, useState } from "react";
import { Button, Empty, Popconfirm, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/pro-regular-svg-icons";
import ESignaturePad from "signature_pad";

import { POST } from "../../../../providers/useAxiosQuery";
import { apiUrl, userData } from "../../../../providers/appConfig";
import notificationErrors from "../../../../providers/notificationErrors";
import ModalUploadSignature from "./ModalUploadSignature";
import dataURLtoBlob from "../../../../providers/dataURLtoBlob";
import "../../../../../../sass/pages/signature-pad/signature-pad.scss";

export default function SignaturePad(props) {
    const { fileSignature, setFileSignature } = props;

    const [signatureValue, setSignatureValue] = useState(null);

    const [checkEmptySignature, setCheckEmptySignature] = useState(false);
    const [toggleModalUploadSignature, setToggleModalUploadSignature] =
        useState(false);

    const { mutate: mutateUploadSignature, loading: loadingUploadSignature } =
        POST(`api/upload_signature`, "upload_signature");

    const handleSave = () => {
        let data = new FormData();

        if (fileSignature.file) {
            data.append("signature", fileSignature.file);
        } else {
            data.append(
                "signature",
                dataURLtoBlob(signatureValue.toDataURL()),
                "signature.png"
            );
        }

        data.append("user_id", userData().id);

        mutateUploadSignature(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalUploadSignature(false);
                    notification.success({
                        message: "Upload Signature",
                        description: res.message,
                    });
                    let signature = res.data.attachments.filter(
                        (f) => f.file_description === "Signature"
                    );
                    setFileSignature({
                        file: null,
                        src: null,
                        filePath: apiUrl(signature[0].file_path),
                        fileName: null,
                    });
                    signatureValue.clear();
                    setCheckEmptySignature(true);
                } else {
                    notification.error({
                        message: "Upload Signature",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useEffect(() => {
        const canvas = document.getElementById("signature-pad");

        const signaturePad = new ESignaturePad(canvas);
        // Returns signature image as data URL (see https://mdn.io/todataurl for the list of possible parameters)
        setSignatureValue(signaturePad);
        signaturePad.toDataURL(); // save image as PNG

        function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
            signaturePad.clear(); // otherwise isEmpty() might return incorrect value
        }

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        if (signaturePad.isEmpty()) {
            console.log("no sign");
            setCheckEmptySignature(true);
        }

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    return (
        <div className="signature-pad-wrapper">
            {!fileSignature.filePath ? (
                <div className="empty-wrapper">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No Signature"
                    >
                        <>
                            <Button
                                icon={<FontAwesomeIcon icon={faEdit} />}
                                onClick={() => setCheckEmptySignature(false)}
                            >
                                Create Signature
                            </Button>

                            <Button
                                icon={<FontAwesomeIcon icon={faEdit} />}
                                onClick={() =>
                                    setToggleModalUploadSignature(true)
                                }
                            >
                                Upload Signature
                            </Button>
                        </>
                    </Empty>
                </div>
            ) : (
                <>
                    <div className="img-wrapper">
                        <img src={fileSignature.filePath} alt="fileSignature" />
                    </div>
                    <div className="action">
                        <Button
                            icon={<FontAwesomeIcon icon={faEdit} />}
                            onClick={() => setCheckEmptySignature(false)}
                        >
                            Update Signature
                        </Button>

                        <Button
                            icon={<FontAwesomeIcon icon={faEdit} />}
                            onClick={() => setToggleModalUploadSignature(true)}
                        >
                            Upload Signature
                        </Button>
                    </div>
                </>
            )}

            <canvas
                id="signature-pad"
                className="signature-canvas"
                style={{
                    display: checkEmptySignature ? "none" : "block",
                }}
            />

            {!checkEmptySignature && (
                <div className="signature-buttons">
                    <Popconfirm
                        title="Are you sure to save this signature?"
                        onConfirm={() => {
                            handleSave();
                        }}
                        onCancel={() => {
                            notification.error({
                                message: "Upload Signature",
                                description: "Signature not saved!",
                            });
                        }}
                        okText="Yes"
                        cancelText="No"
                        placement="topRight"
                        okButtonProps={{
                            className: "btn-main-invert",
                        }}
                    >
                        <Button
                            className="btn-main-primary btn-save-signature signature-button"
                        >
                            Save
                        </Button>
                    </Popconfirm>
                    
                    <Button
                        onClick={() => {
                            setCheckEmptySignature(true);
                            if (signatureValue) {
                                signatureValue.clear();
                            }
                        }}
                        className="signature-button"
                    >
                        Cancel
                    </Button>
                    
                    <Button
                        onClick={() => {
                            if (signatureValue) {
                                signatureValue.clear();
                            }
                        }}
                        className="signature-button"
                    >
                        Clear
                    </Button>
                </div>
            )}

            <ModalUploadSignature
                toggleModalUploadSignature={toggleModalUploadSignature}
                setToggleModalUploadSignature={setToggleModalUploadSignature}
                handleSave={handleSave}
                fileSignature={fileSignature}
                setFileSignature={setFileSignature}
                loadingUploadSignature={loadingUploadSignature}
            />
        </div>
    );
}
