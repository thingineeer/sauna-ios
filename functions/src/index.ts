/**
 * Sauna 임시 API · Firebase Cloud Functions
 *
 * Hosted on i-lunch-app project (temporary). Migrates to AWS Vapor when scaling.
 *
 * 휘발성 정책 (CRITICAL):
 *   - 메시지 텍스트는 절대 영속 저장하지 않는다.
 *   - Realtime Database 의 `/sauna/rooms/<id>/messages` 노드에 push 후
 *     `serverTimestamp` 기반 60초 TTL (Cloud Scheduler 가 cleanup).
 *   - 로그에도 메시지 텍스트 기록 안 함 — 길이만.
 *
 * 인증:
 *   - 임시 단계: Firebase Anonymous Auth ID 토큰 검증.
 *   - 프로덕션 (AWS 이전 후): Apple Passkey JWT 검증.
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { onRequest, HttpsOptions } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

initializeApp();

// ────────────────────────────────────────────────────────────────────
// 공통 설정
// ────────────────────────────────────────────────────────────────────

const REGION = "asia-northeast3"; // Seoul
const httpsOpts: HttpsOptions = {
    region: REGION,
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 30,
    // Gen 2 Cloud Functions 는 기본 invoker = 인증 필요. 클라이언트가 익명으로
    // /health 등을 호출할 수 있어야 하므로 public 으로 풀어줌.
    // 인증이 필요한 endpoint (sendMessage 등) 는 코드 안에서 verifyAuth 가 거름.
    invoker: "public",
};

const ROOM_KINDS = new Set(["daily", "stock", "job"]);
const MAX_MESSAGE_LENGTH = 240;
const MESSAGE_TTL_SECONDS = 60;

// ────────────────────────────────────────────────────────────────────
// /health  — 200 OK + 버전. 인증 안 함.
// ────────────────────────────────────────────────────────────────────

export const health = onRequest(httpsOpts, (_req, res) => {
    res.status(200).json({ ok: true, version: "0.1.0", host: "firebase" });
});

// ────────────────────────────────────────────────────────────────────
// /rooms/:roomId/send  — 메시지 publish.
// ────────────────────────────────────────────────────────────────────

export const sendMessage = onRequest(httpsOpts, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "method_not_allowed" });
        return;
    }
    const userId = await verifyAuth(req);
    if (!userId) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }

    const roomId = pickRoomId(req);
    if (!roomId) {
        res.status(404).json({ error: "unknown_room" });
        return;
    }

    const text = String((req.body?.text ?? "")).trim();
    if (!text) {
        res.status(400).json({ error: "empty_text" });
        return;
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
        res.status(400).json({ error: "too_long", limit: MAX_MESSAGE_LENGTH });
        return;
    }

    const nickname = String(req.body?.nickname ?? "익명").slice(0, 32);

    // Push to Firestore. iOS 는 같은 collection 을 onSnapshot 으로 구독.
    // expiresAt 은 TTL 정책으로 자동 삭제 (Firestore 콘솔에서 TTL 켜기:
    // sauna_messages.expiresAt — 60s 후 자동 삭제).
    const db = getFirestore();
    const ts = Date.now();
    const docRef = await db.collection("sauna_messages").add({
        roomId,
        nickname,
        text,
        ts,
        senderId: userId,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromMillis(ts + MESSAGE_TTL_SECONDS * 1000),
    });
    void docRef;

    // 메시지 텍스트는 로그 X — 길이/방/사용자만.
    logger.info("send_message", {
        room: roomId, len: text.length, sender: shortHash(userId),
    });

    res.status(204).send();
});

// ────────────────────────────────────────────────────────────────────
// /rooms/:roomId/occupancy  — 현재 방 인원 (Realtime presence count).
// ────────────────────────────────────────────────────────────────────

export const occupancy = onRequest(httpsOpts, async (req, res) => {
    const roomId = pickRoomId(req);
    if (!roomId) {
        res.status(404).json({ error: "unknown_room" });
        return;
    }
    const db = getFirestore();
    // 30초 안에 heartbeat 한 사용자 수 = 현재 인원.
    const cutoff = Timestamp.fromMillis(Date.now() - 30_000);
    const snap = await db.collection("sauna_presence")
        .where("roomId", "==", roomId)
        .where("seenAt", ">=", cutoff)
        .count()
        .get();
    res.status(200).json({ head: snap.data().count });
});

// ────────────────────────────────────────────────────────────────────
// /rooms  — 3개 방 + 인원수
// ────────────────────────────────────────────────────────────────────

export const rooms = onRequest(httpsOpts, async (_req, res) => {
    const db = getFirestore();
    const cutoff = Timestamp.fromMillis(Date.now() - 30_000);
    const out = await Promise.all(
        Array.from(ROOM_KINDS).map(async (id) => {
            const snap = await db.collection("sauna_presence")
                .where("roomId", "==", id)
                .where("seenAt", ">=", cutoff)
                .count()
                .get();
            return { id, head: snap.data().count };
        })
    );
    res.status(200).json(out);
});

// ────────────────────────────────────────────────────────────────────
// /messages/cleanup  — Cloud Scheduler 가 매분 호출하여 만료 메시지 삭제.
// ────────────────────────────────────────────────────────────────────

export const cleanupMessages = onRequest(httpsOpts, async (_req, res) => {
    // Firestore TTL 이 자동으로 만료된 doc 을 삭제하지만, TTL 활성화 전이거나
    // 즉시 청소하고 싶을 때 수동 호출용.
    const db = getFirestore();
    const cutoff = Timestamp.fromMillis(Date.now());
    const snap = await db.collection("sauna_messages")
        .where("expiresAt", "<=", cutoff)
        .limit(500)
        .get();
    let deleted = 0;
    if (!snap.empty) {
        const batch = db.batch();
        snap.docs.forEach((d) => { batch.delete(d.ref); deleted++; });
        await batch.commit();
    }
    logger.info("cleanup", { deleted });
    res.status(200).json({ deleted });
});

// ────────────────────────────────────────────────────────────────────
// 헬퍼
// ────────────────────────────────────────────────────────────────────

function pickRoomId(req: Express.Request): string | null {
    // URL 마지막 path segment 가 roomId. 또는 query ?roomId=
    const r = (req as any).path as string;
    const fromPath = r?.split("/").filter(Boolean).slice(-2, -1)[0];
    const fromQuery = (req as any).query?.roomId as string | undefined;
    const id = fromQuery || fromPath || "";
    return ROOM_KINDS.has(id) ? id : null;
}

async function verifyAuth(req: Express.Request): Promise<string | null> {
    const authz = (req as any).header?.("authorization") as string | undefined;
    if (!authz?.startsWith("Bearer ")) return null;
    const idToken = authz.slice("Bearer ".length).trim();
    if (!idToken) return null;
    try {
        const decoded = await getAuth().verifyIdToken(idToken);
        return decoded.uid;
    } catch {
        return null;
    }
}

function shortHash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(16).slice(0, 8);
}
