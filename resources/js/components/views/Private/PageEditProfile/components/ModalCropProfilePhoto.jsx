import React, { useCallback, useEffect, useState } from "react";
import { Modal, Slider, Row, Col, Button } from "antd";
import Cropper from "react-easy-crop";

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImg(imageSrc, croppedAreaPixels, options) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const outputWidth = Math.max(1, Math.floor(croppedAreaPixels.width));
  const outputHeight = Math.max(1, Math.floor(croppedAreaPixels.height));
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  if (options?.cropShape === "round") {
    const centerX = outputWidth / 2;
    const centerY = outputHeight / 2;
    const radius = Math.min(centerX, centerY);
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  if (options?.cropShape === "round") {
    ctx.restore();
  }

  const quality = 0.92;
  const mimeType = "image/jpeg";

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ blob, dataUrl: reader.result });
        };
        if (blob) {
          reader.readAsDataURL(blob);
        } else {
          resolve({ blob: null, dataUrl: null });
        }
      },
      mimeType,
      quality
    );
  });
}

export default function ModalCropProfilePhoto({ open, src, onCancel, onCropped }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect] = useState(35 / 45); // Passport default aspect (rectangular)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [open]);

  const onCropComplete = useCallback((_, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleSave = useCallback(async () => {
    if (!src || !croppedAreaPixels) return;
    const result = await getCroppedImg(src, croppedAreaPixels, { cropShape: "rect" });
    if (result?.blob && result?.dataUrl) {
      onCropped(result.blob, result.dataUrl, { cropShape: "rect" });
    }
  }, [src, croppedAreaPixels, onCropped]);

  return (
    <Modal
      title="Crop Photo"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>Cancel</Button>,
        <Button key="save" type="primary" className="btn-main-primary" onClick={handleSave}>Save</Button>,
      ]}
      width={950}
    >
      <Row gutter={[12, 12]}>
        <Col xs={24}>
          <div style={{ position: "relative", width: "100%", height: 400, background: "#333" }}>
            src 
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape="rect"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition
              />
            
          </div>        
        </Col>
        <Col xs={24}>
          <Row gutter={[12, 12]}>
            <Col xs={24}>
              <div>
                <div style={{ marginBottom: 6, fontWeight: 600 }}>Zoom</div>
                <Slider
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={setZoom}
                  style={{ width: "98%" }}
                />
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
}


