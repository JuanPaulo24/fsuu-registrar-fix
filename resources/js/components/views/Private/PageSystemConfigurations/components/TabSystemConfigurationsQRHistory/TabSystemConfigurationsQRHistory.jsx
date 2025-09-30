import { useState } from 'react';
import { Card, Typography } from 'antd';
import TableQRHistory from './components/TableQRHistory';

const { Title } = Typography;

export default function TabSystemConfigurationsQRHistory() {
    return (
        <div>
            <Card>
                <div style={{ marginBottom: '16px' }}>
                    <Title level={4}>Public QR Scan History</Title>
                </div>
                <TableQRHistory />
            </Card>
        </div>
    );
}
