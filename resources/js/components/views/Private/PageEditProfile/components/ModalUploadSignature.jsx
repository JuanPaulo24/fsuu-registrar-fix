import { Button, Col, Empty, Modal, Row, Upload, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/pro-regular-svg-icons";

import imageFileToBase64 from "../../../../providers/imageFileToBase64";

export default function ModalUploadSignature(props) {
    const {
        toggleModalUploadSignature,
        setToggleModalUploadSignature,
        handleSave,
        fileSignature,
        setFileSignature,
        loadingUploadSignature,
    } = props;

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
                    message: "Upload Signature",
                    description: "You can only upload JPG/PNG file!",
                });
                error = Upload.LIST_IGNORE;
            }

            if (error === false) {
                let imageFileToBase64Res = await imageFileToBase64(file);

                setFileSignature((ps) => ({
                    ...ps,
                    src: imageFileToBase64Res,
                    file: file,
                    fileName: file.name,
                }));
            }

            return error;
        },
        showUploadList: false,
    };

    return (
        <Modal
            title="Upload Signature"
            open={toggleModalUploadSignature}
            onCancel={() => setToggleModalUploadSignature(false)}
            footer={[
                <Button
                    key="cancel"
                    size="large"
                    onClick={() => {
                        setToggleModalUploadSignature(false);
                    }}
                >
                    Cancel
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    className="btn-main-primary"
                    size="large"
                    onClick={() => {
                        if (fileSignature.file) {
                            handleSave();
                        } else {
                            notification.error({
                                message: "Upload Signature",
                                description: "Please upload your signature!",
                            });
                        }
                    }}
                    loading={loadingUploadSignature}
                >
                    Save
                </Button>,
            ]}
        >
            <Row gutter={[12, 12]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    {fileSignature.src ? (
                        <img alt="" src={fileSignature.src} className="w-100" />
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No Signature"
                        />
                    )}
                </Col>
                <Col
                    xs={24}
                    sm={24}
                    md={24}
                    lg={24}
                    xl={24}
                    className="text-center"
                >
                    <Upload {...propsUpload}>
                        <Button
                            icon={<FontAwesomeIcon icon={faUpload} />}
                            size="large"
                        >
                            Upload Signature
                        </Button>
                    </Upload>
                </Col>
            </Row>
        </Modal>
    );
}
