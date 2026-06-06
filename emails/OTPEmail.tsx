import * as React from 'react';

interface OTPEmailProps {
  username: string;
  otp: string;
}

export default function OTPEmail({ username, otp }: OTPEmailProps) {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f4f4f4',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1
          style={{
            color: '#333333',
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '10px',
          }}
        >
          Two-Factor Authentication
        </h1>

        <p
          style={{
            color: '#666666',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '20px',
          }}
        >
          Hi {username},
        </p>

        <p
          style={{
            color: '#666666',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '30px',
          }}
        >
          Your One-Time Password (OTP) for logging into Cloak Chat is:
        </p>

        <div
          style={{
            backgroundColor: '#f9f9f9',
            border: '2px solid #0ea5e9',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          <p
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#0ea5e9',
              letterSpacing: '4px',
              margin: '0',
            }}
          >
            {otp}
          </p>
        </div>

        <p
          style={{
            color: '#999999',
            fontSize: '14px',
            lineHeight: '1.6',
            marginBottom: '20px',
          }}
        >
          <strong>This OTP is valid for 10 minutes.</strong> Please do not share
          this code with anyone.
        </p>

        <p
          style={{
            color: '#666666',
            fontSize: '14px',
            lineHeight: '1.6',
            marginBottom: '30px',
          }}
        >
          If you didn't request this OTP, please ignore this email or contact
          our support team.
        </p>

        <div
          style={{
            borderTop: '1px solid #eeeeee',
            paddingTop: '20px',
            textAlign: 'center',
            color: '#999999',
            fontSize: '12px',
          }}
        >
          <p style={{ margin: '0' }}>
            © 2024 Cloak Chat. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
