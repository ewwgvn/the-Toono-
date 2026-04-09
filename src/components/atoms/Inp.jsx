"use client";

import { T } from "@/theme/colors";

export default function Inp({ label, type = "text", placeholder, value, onChange, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 500, color: T.textSub, marginBottom: 6, letterSpacing: "0.02em", textTransform: "uppercase" }}>
          {label}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        style={{
          width: "100%",
          background: "#FFFFFF",
          border: `1px solid ${error ? T.red : T.border}`,
          borderRadius: 8,
          padding: "12px 16px",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontSize: 14,
          color: T.textH,
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 150ms ease",
        }}
      />
      {error && (
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.red, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
