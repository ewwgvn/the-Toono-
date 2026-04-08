"use client";
import { T } from "@/theme/colors";
import Simple from "@/components/layout/Simple";

export default function Privacy({ nav, goBack }) {
  return <Simple nav={nav} title="Нууцлалын бодлого" back="settings">
    <div style={{ fontFamily: "system-ui", fontSize: 14, color: T.textB, lineHeight: 1.8, padding: "0 4px" }}>
      <h3 style={{ fontFamily: "system-ui", fontSize: 18, fontWeight: 700, color: T.textH, marginBottom: 16 }}>The TOONO — Нууцлалын бодлого</h3>
      <p style={{ marginBottom: 16 }}>Сүүлд шинэчлэгдсэн: 2026 оны 4-р сарын 1</p>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 8 }}>1. Цуглуулах мэдээлэл</h4>
      <p style={{ marginBottom: 16 }}>Бид таны нэр, имэйл, профайл зураг, байршуулсан бүтээлүүд, худалдан авалтын түүхийг цуглуулна.</p>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 8 }}>2. Мэдээлэл ашиглалт</h4>
      <p style={{ marginBottom: 16 }}>Таны мэдээллийг зөвхөн үйлчилгээг сайжруулах, захиалга боловсруулах, аюулгүй байдлыг хангах зорилгоор ашиглана.</p>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 8 }}>3. Мэдээлэл хамгаалалт</h4>
      <p style={{ marginBottom: 16 }}>Бүх мэдээллийг Supabase платформ дээр шифрлэгдсэн байдлаар хадгална. SSL/TLS, RLS бодлогууд хэрэглэгдэнэ.</p>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 8 }}>4. Таны эрх</h4>
      <p style={{ marginBottom: 16 }}>Та хүссэн үедээ өөрийн мэдээллийг үзэх, засах, устгах эрхтэй. Хүсэлтээ thetoono@gmail.com руу илгээнэ үү.</p>
    </div>
  </Simple>;
}
