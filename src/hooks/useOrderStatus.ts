"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Supabase Realtime + reconcile 구조로 주문 상태를 구독.
 *
 * - Realtime UPDATE → 즉시 반영 (빠름)
 * - SUBSCRIBED 복귀 / online 이벤트 / visibilitychange / 60초 안전망 → reconcile()
 * - reconcile() = /api/orders/:id/status (서버에서 QPay payment/check까지 수행)
 *
 * 오프라인이어도 QR은 숨기지 말 것 — QPay 결제는 은행 앱에서 진행되므로
 * 사용자 기기가 오프라인이어도 결제 자체는 완료될 수 있음.
 */
export function useOrderStatus(orderId: string | null) {
  const [status, setStatus] = useState<string>("PENDING");
  const [offline, setOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  const reconcile = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/status`);
      const { data } = await res.json();
      if (data?.status) setStatus(data.status);
    } catch {
      // 오프라인이면 무시 — online 이벤트가 다시 부름
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    // 네트워크 상태 추적
    const onOnline  = () => { setOffline(false); reconcile(); };
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // 앱 복귀(탭 전환) 시 재검증
    const onVisible = () => { if (document.visibilityState === "visible") reconcile(); };
    document.addEventListener("visibilitychange", onVisible);

    // 60초 안전망 — 2초 폴링 대체
    const safety = setInterval(reconcile, 60_000);

    // Supabase Realtime 구독 (동적 import — 서버사이드 렌더링 방지)
    let supabase: any = null;
    let channel: any = null;
    (async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;
        const { createClient } = await import("@supabase/supabase-js");
        supabase = createClient(supabaseUrl, supabaseKey);
        channel = supabase
          .channel(`order-status-${orderId}`)
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "pay_orders", filter: `id=eq.${orderId}` },
            (payload: any) => { if (payload.new?.status) setStatus(payload.new.status); }
          )
          .subscribe((state: string) => {
            if (state === "SUBSCRIBED") reconcile();
          });
      } catch {
        // Realtime 불가 시 안전망(60s)으로 폴백
      }
    })();

    // 초기 1회 조회
    reconcile();

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(safety);
      if (supabase && channel) supabase.removeChannel(channel);
    };
  }, [orderId, reconcile]);

  return { status, offline };
}
