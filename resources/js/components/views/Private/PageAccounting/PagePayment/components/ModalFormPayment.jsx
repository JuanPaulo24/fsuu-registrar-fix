import React from "react";
import { Modal, Form, Select, Button, Row, Col, Collapse, Divider } from "antd";
import FloatInput from "../../../../../providers/FloatInput";
import FloatDatePicker from "../../../../../providers/FloatDatePicker";
import FloatSelect from "../../../../../providers/FloatSelect";

const { Option } = Select;


export default function ModalFormPayment({ isOpen, onClose }) {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      console.log("Form Submitted:", values);
      onClose();
    });
  };

  return (
    <Modal
      title="PAYMENT FORM"
      open={isOpen}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="secondary"
          onClick={handleSubmit}
        >
          Submit
        </Button>,
      ]}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        name="paymentForm"
      >
        {/* Row 1: Reference No., Date Schedule, Record From */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="referenceNo"
              label="Reference No."
              rules={[{ required: true, message: "Please enter Reference No." }]}
            >
              <FloatInput placeholder="Enter reference no." />
            </Form.Item>
          </Col>
          </Row>
          <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="dateSchedule"
              label="Date Schedule"
              rules={[{ required: true, message: "Please select a date." }]}
            >
              <FloatDatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          </Row>
          <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="recordFrom"
              label="Record from"
              rules={[{ required: true, message: "Please select a source." }]}
            >
              <FloatSelect placeholder="Select one">
                
              </FloatSelect>
            </Form.Item>
          </Col>
        </Row>

        {/* Row 2: Services, Form of Payment, Amount + Add Button */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="services"
              label="Services"
              rules={[{ required: true, message: "Please enter the service." }]}
            >
              <FloatInput placeholder="e.g. Wedding Ceremony" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="formOfPayment"
              label="Form of payment"
              rules={[{ required: true, message: "Please select a payment form." }]}
            >
              <FloatSelect placeholder="Select payment form">
                
              </FloatSelect>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: "Please enter an amount." }]}
            >
              <FloatInput type="number" placeholder="0.00" />
            </Form.Item>
            <Button
              type="primary"
              style={{ marginTop: 30, backgroundColor: "#7cb305" }}
            >
              Add
            </Button>
            <Form.Item name="totalAmount" label="Total Amount">
                <FloatInput type="number" placeholder="0.00" />
            </Form.Item>
        </Col>
     </Row>


      <Divider style={{borderTop: "1px solid black"}} />
        

        {/* Received by, Checked by, Approved by */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="receivedBy" label="Received by">
              <FloatInput placeholder="Name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="checkedBy" label="Checked by">
              <FloatInput placeholder="Name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="approvedBy" label="Approved by">
              <FloatInput placeholder="Name" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
