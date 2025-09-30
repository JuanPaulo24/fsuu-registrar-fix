import React from "react";
import { Card } from "antd";

const CompletedContent = () => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-2">Completed Services</h2>
      <ul className="list-disc pl-5">
        <li>Baptismal Ceremony</li>
        <li>Funeral Service</li>
        <li>Marriage/Wedding</li>
        <li>Community Outreach</li>
        <li>Religious Retreat</li>
      </ul>
    </Card>
  );
};

export default CompletedContent;
