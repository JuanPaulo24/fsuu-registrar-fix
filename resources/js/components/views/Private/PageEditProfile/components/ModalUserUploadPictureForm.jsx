import { useCallback, useEffect, useRef } from "react";
import { Modal, Button, Form, notification, Row, Col } from "antd";
import FloatInput from "../../../../providers/FloatInput";
import { POST } from "../../../../providers/useAxiosQuery";
import dataURLtoBlob from "../../../../providers/dataURLtoBlob";
import Webcam from "react-webcam";

export default function ModalUserUploadPictureForm(props) {
    const {
        toggleModalUserUploadPictureForm,
        setToggleModalUserUploadPictureForm,
    } = props;

    const webcamRef = useRef(null);

    const capture = useCallback(() => {
        const imageUrl = webcamRef.current.getScreenshot();
        // console.log('webcamRef.current', imageUrl);

        const blob = dataURLtoBlob(imageUrl);
        // console.log('blob dataURLtoBlob', blob);

        // props.setUserImageFile({
        //     ...props.userImageFile,
        //     fileUrl: imageUrl,
        //     file: blob,
        //     fileName: "camera.jpg",
        //     openModal: false,
        // });
    }, [webcamRef]);

    const { mutate: mutateImage, loading: loadingImage } = POST(
        `api/user`,
        "user_image"
    );

    const onFinish = (values) => {
        console.log("onFinish", values);

        let data = {
            ...values,
            id:
                toggleModalUserUploadPictureForm.data &&
                toggleModalUserUploadPictureForm.data.id
                    ? toggleModalUserUploadPictureForm.data.id
                    : "",
        };

        mutateImage(data, {
            onSuccess: (res) => {
                console.log("res", res);
                if (res.success) {
                    setToggleModalUserUploadPictureForm({
                        open: false,
                        data: null,
                    });
                    notification.success({
                        message: "Image",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Image",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notification.error({
                    message: "Image",
                    description: "Something went wrong",
                });
            },
        });
    };

    useEffect(() => {
        if (toggleModalUserUploadPictureForm.open) {
        }

        return () => {};
    }, [toggleModalUserUploadPictureForm]);

    return (
        <Modal
            title="Take Photo"
            className="modal-edit-profile-take-photo"
            open={toggleModalUserUploadPictureForm.open}
            onCancel={() => {
                setToggleModalUserUploadPictureForm({
                    open: false,
                    data: null,
                });
            }}
            forceRender
            footer={null}
        >
            <Row gutter={[12, 12]}>
                <Col xs={24} sm={24} md={24} lg={24} className="text-center">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                            facingMode: "user",
                        }}
                    />
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} className="text-center">
                    <div className="btn-group-wrapper">
                        <Button
                            onClick={() => {
                                capture();
                            }}
                            className="btn-main-primary invert"
                            size="large"
                        >
                            Capture
                        </Button>

                        <Button
                            onClick={() => {
                                onFinish();
                            }}
                            className="btn-main-primary"
                            size="large"
                        >
                            Save
                        </Button>
                    </div>
                </Col>
            </Row>
        </Modal>
    );
}
