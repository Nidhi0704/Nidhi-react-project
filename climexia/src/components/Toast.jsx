import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  return (
    <div className={`toast${toast.visible ? ' on' : ''}`}>
      <span className="ti">{toast.icon}</span>
      <span className="tm">{toast.msg}</span>
    </div>
  );
}