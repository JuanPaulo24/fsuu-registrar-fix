import React from "react";
import { Modal, Form, Button, Row, Col, Input, Grid } from "antd";
import FloatInput from "../../../../providers/FloatInput";
import DataPrivacyAct from "../../../../providers/DataPrivacyActTxt";
import FloatDatePicker from "../../../../providers/FloatDatePicker"; // Float Date Picker
import FloatSelect from "../../../../providers/FloatSelect"; // Float Select

const { useBreakpoint } = Grid;

export default function ModalFormParish({ isOpen, onClose }) {
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const handleSubmit = () => {
    form.validateFields()
      .then((values) => {
        console.log("Form Submitted:", values);
        onClose();
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  return (
    <Modal
      title="PARISH GENERAL INFORMATION"
      open={isOpen}
      onCancel={onClose}
      width={screens.xs ? "95%" : screens.md ? 750 : 900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="secondary" onClick={handleSubmit}>
          Save
        </Button>,
      ]}
      centered
    >
      <Form form={form} layout="vertical" name="paymentForm">
        {/* Row 1: Name of Parish, Parish Priest, Date Established */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="nameofParish"
              label="Name of Parish"
              rules={[{ required: true, message: "Please enter Name of Parish." }]}
            >
              <FloatInput placeholder="Name of Parish" />
            </Form.Item>
          </Col>
          {/* <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="parishPriest"
              label="Parish Priest"
              rules={[{ required: false, message: "Please select a priest." }]}
            >
              <FloatSelect placeholder="Select one">
                <FloatSelect.Option value="Rev. Fr. Stephen M. Bongcano">Rev. Fr. Stephen M. Bongcano</FloatSelect.Option>
                <FloatSelect.Option value="Rev. Fr. Juliano Ong">Rev. Fr. Juliano Ong</FloatSelect.Option>
                <FloatSelect.Option value="Rev. Fr. Wilbert Mark R. Simplicio">Rev. Fr. Wilbert Mark R. Simplicio</FloatSelect.Option>
                <FloatSelect.Option value="Rev. Fr. Dennis Prisco">Rev. Fr. Dennis Prisco</FloatSelect.Option>
              </FloatSelect>
            </Form.Item>
          </Col> */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="dateEstablished"
              label="Date Established"
              rules={[{ required: true, message: "Please select a date." }]}
            >
              <FloatDatePicker placeholder="Select Date" />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 2: Address, Vacariate, Titular */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: "Please input an address." }]}
            >
              <FloatInput placeholder="Address" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="vacariate"
              label="Vacariate"
              rules={[{ required: true, message: "Please input a Vacariate." }]}
            >
              <FloatInput placeholder="Vacariate" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="titular"
              label="Titular"
              rules={[{ required: true, message: "Please enter a Titular." }]}
            >
              <FloatInput placeholder="Titular" />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 3: Feast Date, Contact, Email */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="feastDate"
              label="Feast Date"
              rules={[{ required: true, message: "Please enter a Date." }]}
            >
              <FloatDatePicker placeholder="Select Feast Date" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="contact"
              label="Contact"
              rules={[
                { required: true, message: "Please input a Contact No." },
                { pattern: /^[0-9]{11}$/, message: "Please enter a valid contact number." },
              ]}
            >
              <Input placeholder="Contact (11-digit number)" maxLength={11} size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter an Email." },
                { type: "email", message: "Please enter a valid email address." },
              ]}
            >
              <FloatInput placeholder="Email" type="email" />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 4: Data Privacy Act */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <DataPrivacyAct />
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
