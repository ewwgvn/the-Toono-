"use client";

import { T } from "@/theme/colors";

export default function Inp({ label, type = "text", placeholder, value, onChange, error, maxLength, inputMode }) {
  const showCount = typeof maxLength === "number";
  return (
    <div style={{ marginBottom: 16 }}>
      {(label || showCount) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          {label && (
            <label style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, color: T.textSub, letterSpacing: "0.02em" }}>
              {label}
            </label>
          )}
          {showCount && (
            <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: (value || "").length >= maxLength ? T.red : T.textDim }}>
              {(value || "").length}/{maxLength}
            </span>
          )}
        </div>
      )}
      <input
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        aria-invalid={!!error}
        className="toono-input"
        style={{
          width: "100%",
          background: "#FFFFFF",
          border: `1.5px solid ${error ? T.red : T.border}`,
          borderRadius: 10,
          padding: "12px 14px",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontSize: 14,
          color: T.textH,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {error && (
        <div role="alert" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.red, marginTop: 5 }}>
          {error}
        </div>
      )}
    </div>
  );
}
