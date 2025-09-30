import React from 'react';
import { Modal, Typography } from 'antd';

const { Title, Text } = Typography;

const PayslipModal = ({ visible, onClose, payrollData }) => {
  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      bodyStyle={{ 
        padding: 0, 
        maxWidth: "none" 
     }}
      width={600}
      
    >
      <div className="!pt-5 border-3 border-black ">
        {/* Header Section */}
        <div className="text-center">
          <Title level={3} className="!font-bold !text-4xl">DIOCESE OF BUTUAN</Title>
          <Text className="text-sm block mb-2">
            Purok 6, Bishop's Residence, P.O. Box 54, <br></br> Ampayon, 8600 Butuan City, Agusan del Norte
          </Text>
          <div className="max-w-2xl mx-auto">
          <div className="bg-gray-300 text-center font-bold text-lg !py-10 !mt-5 !border-t !border-b border-black">
            PAYSLIP
          </div>
        </div>

          <div className='flex justify-between items-center !mt-5  !p-5'>
            <div></div>
            <Text className='font-bold'>
              DATE: <Text className="border-b border-black">{payrollData?.date || 'N/A'}</Text>
            </Text>
          </div>
        </div>

        {/* Employee Details Section */}
        <div className="!p-5">
          <Title level={5} className="!font-bold">EMPLOYEE DETAILS</Title>
          <div className="grid grid-cols-2 gap-2">
            <Text className='!ml-5' strong>EMPLOYEE NAME:</Text>
            <Text className="text-right font-bold">{payrollData?.full_name || 'N/A'}</Text>
            <Text className='!ml-5' strong>MONTHLY PAYMENT:</Text>
            <Text className="text-right font-bold">
              {payrollData?.monthly_pay ? `P ${payrollData.monthly_pay.toLocaleString()}` : 'N/A'}
            </Text>
            <Text className='!ml-5' strong>BASIC (BI-MONTHLY):</Text>
            <Text className="text-right font-bold">
              {payrollData?.basic ? `P ${payrollData.basic.toLocaleString()}` : 'N/A'}
            </Text>
            <Text className='!ml-5' strong>HOLIDAY:</Text>
            <Text className="text-right font-bold">
              {payrollData?.holiday ? `P ${payrollData.holiday.toLocaleString()}` : 'N/A'}
            </Text>
            <Text className='!ml-5' strong>TOTAL GROSS PAYMENT:</Text>
            <Text className="text-right font-bold">
              {payrollData?.total_gross_pay ? `P ${payrollData.total_gross_pay.toLocaleString()}` : 'N/A'}
            </Text>
          </div>
        </div>

        {/* Deductions Section */}
        <div className="!p-5">
          <Title level={5} className="!font-bold">DEDUCTIONS</Title>
          <div className="grid grid-cols-2 gap-2">
            <Text className='!ml-5' strong>CASH LOAN:</Text>
            <Text className="text-right font-bold">
              {payrollData?.cash_loan ? `P ${payrollData.cash_loan.toLocaleString()}` : 'N/A'}
            </Text>
            <Text className='!ml-5' strong>SSS:</Text>
            <Text className="text-right font-bold">
              {payrollData?.sss ? `P ${payrollData.sss.toLocaleString()}` : 'N/A'}
            </Text>
            <Text className='!ml-5' strong>INSURANCE:</Text>
            <Text className="text-right font-bold">
              {payrollData?.insurance ? `P ${payrollData.insurance.toLocaleString()}` : 'N/A'}
            </Text>
            <Text className='!ml-5' strong>OTHERS:</Text>
            <Text className="text-right font-bold">
              {payrollData?.others ? `P ${payrollData.others.toLocaleString()}` : 'N/A'}
            </Text>
          </div>
        </div>

        {/* Computation and Summary Section */}
        <div className="!p-5">
          <Title level={5} className="!font-bold">COMPUTATION AND SUMMARY</Title>
          <div className="grid grid-cols-2 gap-2">
            <Text className='!ml-5 font-bold' strong>TOTAL CALCULATIONS:</Text>
            <Text className="text-right font-bold">
              {payrollData?.total_calculations ? `P ${payrollData.total_calculations.toLocaleString()}` : 'N/A'}
            </Text>
            <Text className='!ml-5 font-bold' strong>NET PAY:</Text>
            <Text className="text-right font-bold">
              {payrollData?.net_pay_total ? ` ${payrollData.net_pay_total.toLocaleString()}` : 'N/A'}
            </Text>
          </div>
        </div>

        {/* Authorization Section */}
        <div className="flex justify-between">
          <div></div>
          <div>
            <div className="border-b border-black w-48 mx-auto !mt-10 !my-2 !mr-5"></div>
              <div className='!ml-1'>
               <Text strong>AUTHORIZED SIGNATURE</Text>
              </div>
            <div></div>
            <div className="!ml-10 !mb-10">
                <Text>over printed name</Text>
            </div>
        </div>
      </div>
      </div>
    </Modal>
  );
};

export default PayslipModal;