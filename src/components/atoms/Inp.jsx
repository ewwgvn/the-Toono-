"use client";

import { T } from "@/theme/colors";

export default function Inp({ label, type = "text", placeholder, value, onChange, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <div
          style={{
            fontFamily: "system-ui",
            fontSize: 13,
            fontWeight: 600,
            color: T.textSub,
            marginBottom: 7,
          }}
        >
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
          background: T.s1,
          border: `1.5px solid ${error ? T.red : T.border}`,
          borderRadius: 13,
          padding: "13px 16px",
          fontFamily: "system-ui",
          fontSize: 14,
          color: T.textH,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {error && (
        <div style={{ fontFamily: "system-ui", fontSize: 11, color: T.red, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
