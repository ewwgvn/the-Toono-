"use client";
import { T } from "@/theme/colors";
import Simple from "@/components/layout/Simple";

export default function Terms({ nav, goBack }) {
  return <Simple nav={nav} title="Үйлчилгээний нөхцөл" back="settings">
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textB, lineHeight: 1.8, padding: "0 4px" }}>
      <h3 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 18, fontWeight: 700, color: T.textH, marginBottom: 16 }}>The TOONO — Үйлчилгээний нөхцөл</h3>
      <p style={{ marginBottom: 16 }}>Сүүлд шинэчлэгдсэн: 2026 оны 4-р сарын 1</p>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 8 }}>1. Ерөнхий зүйл</h4>
      <p style={{ marginBottom: 16 }}>The TOONO нь Монголын бүтээлчдийг дэмжих дижитал зах зээлийн платформ юм. Энэхүү нөхцөлийг зөвшөөрснөөр та манай үйлчилгээг ашиглах эрхтэй болно.</p>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 8 }}>2. Хэрэглэгчийн үүрэг</h4>
      <p style={{ marginBottom: 16 }}>Хэрэглэгч нь бүртгүүлэхдээ үнэн зөв мэдээлэл оруулах, бусдын эрхийг хүндэтгэх, зохиогчийн эрхийг зөрчихгүй байх үүрэгтэй.</p>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 8 }}>3. Төлбөр ба буцаалт</h4>
      <p style={{ marginBottom: 16 }}>Бүх төлбөрийг The TOONO-ийн escrow систем хамгаална. Худалдан авагч бүтээлээ хүлээн авсны дараа мөнгө бүтээлчид шилжинэ.</p>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 8 }}>4. Хувийн мэдээлэл</h4>
      <p style={{ marginBottom: 16 }}>Таны хувийн мэдээллийг Монгол Улсын Хувь хүний нууцлалын тухай хуулийн дагуу хамгаална.</p>
    </div>
  </Simple>;
}
