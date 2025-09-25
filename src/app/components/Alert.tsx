import React from 'react';


function AlertMessage({ alert, onClose }: { alert: { type: "success" | "error"; message: string } | null; onClose: () => void }) {
  if (!alert) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow text-white ${
        alert.type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
      role="alert"
      onClick={onClose}
      style={{ cursor: 'pointer' }}
    >
      {alert.message}
    </div>
  );
}

export default AlertMessage;
