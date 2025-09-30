import { useCallback, useRef, useState } from "react";
import { Modal, Row, Col, Button, Upload, notification, Flex } from "antd";
import {
    faCamera,
    faRefresh,
    faUpload,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Webcam from "react-webcam";
import ModalCropProfilePhoto from "./ModalCropProfilePhoto";

import { defaultProfile } from "../../../../../../providers/appConfig";
import imageFileToBase64 from "../../../../../../providers/imageFileToBase64";
import dataURLtoBlob from "../../../../../../providers/dataURLtoBlob";

export default function ModalUploadProfilePicture(props) {
    const {
        toggleModalUploadProfilePicture,
        setToggleModalUploadProfilePicture,
        params,
        refetchUserData,
        setStagedProfilePicture,
        stagedProfilePicture,
    } = props;

    const webcamRef = useRef(null);
    const [fileImage, setFileImage] = useState({
        is_camera: false,
        status: null,
        isCapture: false,
        file: null,
        src: null,
        fileName: null,
    });

    const [cropModal, setCropModal] = useState({ open: false, src: null });

    const propsUpload = {
        action: false,
        accept: ".jpg,.png",
        maxCount: 1,
        beforeUpload: async (file) => {
            let error = false;

            const isJPG =
                file.type === "image/jpeg" || file.type === "image/png";

            if (!isJPG) {
                notification.error({
                    message: "Upload Profile Picture",
                    description: "You can only upload JPG/PNG file!",
                });
                error = Upload.LIST_IGNORE;
            }

            if (error === false) {
                let imageFileToBase64Res = await imageFileToBase64(file);

                setFileImage((ps) => ({
                    ...ps,
                    src: imageFileToBase64Res,
                    file: file,
                    fileName: file.name,
                }));
                setCropModal({ open: true, src: imageFileToBase64Res });
            }

            return error;
        },
        showUploadList: false,
    };

    const handleOpenCamera = () => {
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: true,
            })
            .then(function (stream) {
                if (stream.getVideoTracks().length > 0) {
                    // code for when both devices are available

                    setFileImage((ps) => ({
                        ...ps,
                        is_camera: true,
                        status: "available",
                        message: "Camera detected...",
                    }));
                } else {
                    //code for when none of the devices are available
                    setFileImage((ps) => ({
                        ...ps,
                        is_camera: true,
                        status: "unavailable",
                        message: "Camera not detected...",
                    }));
                }
            })
            .catch(function (error) {
                // code for when there is an error
                console.log("not available", error.name, ":", error.message);
                setFileImage((ps) => ({
                    ...ps,
                    is_camera: true,
                    status: "error",
                    message: error.message,
                }));
            });
    };
    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();

        const blob = dataURLtoBlob(imageSrc);

        setFileImage((ps) => ({
            ...ps,
            src: imageSrc,
            file: blob,
            isCapture: true,
            fileName: blob.size + "-camera.png",
        }));
        setCropModal({ open: true, src: imageSrc });
    }, [webcamRef]);

    const isLoadingImage = false; // No longer using mutation for immediate save

    const onFinish = () => {
        if (fileImage.file) {
            // Stage the profile picture instead of saving immediately
            setStagedProfilePicture({
                file: fileImage.file,
                src: fileImage.src,
                fileName: fileImage.fileName,
            });

            setToggleModalUploadProfilePicture({
                open: false,
                file: fileImage.file,
                src: fileImage.src,
                fileName: fileImage.fileName,
            });

            setFileImage({
                is_camera: false,
                status: null,
                file: null,
                src: null,
                isCapture: false,
                fileName: null,
            });

            notification.success({
                message: "Profile Picture",
                description: "Profile picture staged. Click Save to apply changes.",
            });
        }
    };

    const handleRenderCamera = () => {
        if (fileImage.isCapture) {
            return (
                <img
                    alt=""
                    src={fileImage.src ? fileImage.src : defaultProfile}
                    className="w-100"
                />
            );
        } else {
            if (fileImage.status === "available") {
                return (
                    <Webcam
                        ref={webcamRef}
                        style={{
                            maxWidth: "100%",
                        }}
                        disablePictureInPicture={true}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                            width: 1280,
                            height: 720,
                            facingMode: "user",
                        }}
                    />
                );
            } else {
                return (
                    <div
                        style={{
                            display: "flex",
                            width: "100%",
                            padding: "100px 0px",
                            justifyContent: "center",
                            alignItems: "center",
                            background: "#000",
                            color: "#fff",
                            flexDirection: "column",
                            gap: "12px 12px",
                        }}
                    >
                        <div>
                            {fileImage.message}
                            <br />
                            {fileImage.message === "Requested device not found"
                                ? "Please check your camera and try refresh the page."
                                : "Please allow camera access and try refresh the page."}
                        </div>
                    </div>
                );
            }
        }
    };

    return (
        <>
        <Modal
            title={
                fileImage.is_camera ? "Take a picture" : "Upload Profile Photo"
            }
            open={toggleModalUploadProfilePicture.open}
            onCancel={() =>
                setToggleModalUploadProfilePicture((ps) => ({
                    ...ps,
                    open: false,
                }))
            }
            footer={[
                <Button
                    key="cancel"
                    onClick={() => {
                        setToggleModalUploadProfilePicture((ps) => ({
                            ...ps,
                            open: false,
                        }));
                        setFileImage({
                            is_camera: false,
                            status: null,
                            file: null,
                            src: null,
                            isCapture: false,
                            fileName: null,
                        });
                    }}
                    disabled={isLoadingImage}
                >
                    Cancel
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    className="btn-main-primary"
                    disabled={fileImage.file ? false : true}
                    onClick={() => {
                        if (fileImage.file) {
                            if (params.id) {
                                onFinish();
                            } else {
                                setToggleModalUploadProfilePicture({
                                    open: false,
                                    file: fileImage.file,
                                    src: fileImage.src,
                                    fileName: fileImage.fileName,
                                });

                                setFileImage({
                                    is_camera: false,
                                    status: null,
                                    file: null,
                                    src: null,
                                    isCapture: false,
                                });
                            }
                        } else {
                            notification.error({
                                message: "Upload Profile Picture",
                                description:
                                    "Please upload your profile picture!",
                            });
                        }
                    }}
                    loading={isLoadingImage}
                >
                    Save
                </Button>,
            ]}
        >
            <Row gutter={[12, 12]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    {!fileImage.is_camera ? (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                                minHeight: 380,
                            }}
                        >
                            <img
                                alt=""
                                src={fileImage.src ? fileImage.src : (toggleModalUploadProfilePicture.src ? toggleModalUploadProfilePicture.src : defaultProfile)}
                                style={{
                                    width: 360,
                                    height: 480,
                                    objectFit: 'cover',
                                    display: 'block',
                                    borderRadius: 6,
                                }}
                            />
                        </div>
                    ) : (
                        handleRenderCamera()
                    )}
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Flex gap={10} justify="center">
                        {!fileImage.is_camera ? (
                            <Upload {...propsUpload}>
                                <Button
                                    icon={<FontAwesomeIcon icon={faUpload} />}
                                >
                                    Upload Picture
                                </Button>
                            </Upload>
                        ) : (
                            <Button
                                icon={<FontAwesomeIcon icon={faUpload} />}
                                onClick={() =>
                                    setFileImage({
                                        is_camera: false,
                                        status: null,
                                        file: null,
                                        src: null,
                                        isCapture: false,
                                    })
                                }
                            >
                                Click to Upload
                            </Button>
                        )}

                        {fileImage.is_camera ? (
                            fileImage.status === "available" ? (
                                fileImage.isCapture ? (
                                    <Button
                                        icon={
                                            <FontAwesomeIcon icon={faCamera} />
                                        }
                                        className="ml-10"
                                        onClick={() =>
                                            setFileImage((ps) => ({
                                                ...ps,
                                                src: null,
                                                file: null,
                                                isCapture: false,
                                            }))
                                        }
                                    >
                                        Reset
                                    </Button>
                                ) : (
                                    <Button
                                        icon={
                                            <FontAwesomeIcon icon={faCamera} />
                                        }
                                        onClick={handleCapture}
                                        className="ml-10"
                                    >
                                        Capture
                                    </Button>
                                )
                            ) : (
                                <Button
                                    icon={<FontAwesomeIcon icon={faRefresh} />}
                                    onClick={() => window.location.reload()}
                                >
                                    Refresh
                                </Button>
                            )
                        ) : (
                            <Button
                                icon={<FontAwesomeIcon icon={faCamera} />}
                                onClick={handleOpenCamera}
                                className="ml-10"
                            >
                                Click to Open Camera
                            </Button>
                        )}
                    </Flex>
                </Col>
            </Row>
        </Modal>
        <ModalCropProfilePhoto
            open={cropModal.open}
            src={cropModal.src}
            onCancel={() => setCropModal({ open: false, src: null })}
            onCropped={(blob, dataUrl) => {
                setFileImage((ps) => ({
                    ...ps,
                    src: dataUrl,
                    file: blob,
                }));
                setCropModal({ open: false, src: null });
            }}
        />
        </>
    );
}
