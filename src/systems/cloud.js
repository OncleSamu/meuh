// 1.167 : Synchro cloud cross-plateforme (PC <-> Téléphone) via Supabase REST RPC.
// Zéro compte ni mot de passe : un code secret de ferme (hashé en SHA-256 côté serveur) + RLS verrouillée.
import { state, getStore } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast } from '../core/bus.js';
import { packSave, readCode, replaceSave, saveSummary } from './savecodes.js';

export const CLOUD_URL = 'https://jhoebnumlyylkfddcgaf.supabase.co';
const CLOUD_KEY = 'sb_publishable_bpMywlWP29uSmKPihw_RMw_5fBUO0l5';
const CLOUD_STORE_KEY = 'meuh_cloud_v1';
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

let fetcher = (...args) => globalThis.fetch(...args);
let busy = false;
let pendingConflict = null; // { token, payload, json, updatedAt, meta, device, linking }
let lastAutoCheckAt = 0;
let reloadHook = () => {
    if (globalThis.location) globalThis.location.reload();
};
let notifyHook = () => {};

export function cloudSetFetcher(fn) {
    fetcher = fn;
}
export function cloudSetHooks({ onReload, onUpdate } = {}) {
    if (onReload) reloadHook = onReload;
    if (onUpdate) notifyHook = onUpdate;
}

function detectDevice() {
    const nav = globalThis.navigator;
    if (!nav) return 'Appareil';
    const ua = nav.userAgent || '';
    if (/ipad/i.test(ua)) return 'iPad';
    if (/iphone/i.test(ua)) return 'iPhone';
    if (/android/i.test(ua)) return 'Android';
    if (/macintosh/i.test(ua) && nav.maxTouchPoints > 1) return 'iPad';
    if (/macintosh|mac os/i.test(ua)) return 'Mac';
    if (/windows/i.test(ua)) return 'PC Windows';
    if (/linux/i.test(ua)) return 'PC Linux';
    return 'Navigateur';
}

function readCfg() {
    const store = getStore();
    if (!store) return {};
    try {
        const raw = store.getItem(CLOUD_STORE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function writeCfg(patch, { notify = true } = {}) {
    const store = getStore();
    const next = { ...readCfg(), ...patch };
    if (store) {
        try {
            store.setItem(CLOUD_STORE_KEY, JSON.stringify(next));
        } catch {
            // stockage indisponible
        }
    }
    if (notify) notifyHook();
    return next;
}

export function cloudNormalizeToken(raw) {
    const clean = String(raw || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
    if (!clean) return '';
    const body = clean.startsWith('MEUH') ? clean.slice(4) : clean;
    if (body.length < 12) return '';
    const parts = body.slice(0, 12).match(/.{1,4}/g) || [];
    return 'MEUH-' + parts.join('-');
}

export function cloudGenerateToken() {
    const bytes = new Uint8Array(12);
    if (globalThis.crypto && globalThis.crypto.getRandomValues) {
        globalThis.crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    let out = '';
    for (let i = 0; i < 12; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
    return `MEUH-${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 12)}`;
}

export function cloudStatus() {
    const cfg = readCfg();
    return {
        enabled: !!cfg.token,
        token: cfg.token || '',
        device: cfg.device || detectDevice(),
        lastSyncAt: cfg.lastSyncAt || 0,
        lastPushAt: cfg.lastPushAt || 0,
        localModAt: cfg.localModAt || 0,
        lastError: cfg.lastError || '',
        busy,
        conflict: pendingConflict,
    };
}

export function cloudShareUrl(token = readCfg().token) {
    if (!token) return '';
    const loc = globalThis.location;
    const base = loc && loc.protocol && loc.protocol.startsWith('http') ? `${loc.origin}${loc.pathname}` : 'https://onclesamu.github.io/meuh/';
    return `${base}#cloud=${encodeURIComponent(token)}`;
}

export function cloudMarkLocalMod() {
    const cfg = readCfg();
    if (!cfg.token) return;
    writeCfg({ localModAt: now() }, { notify: false });
}

export function cloudConsumeSyncNotice() {
    const cfg = readCfg();
    if (!cfg.justSyncedFrom) return '';
    const from = cfg.justSyncedFrom;
    writeCfg({ justSyncedFrom: '' }, { notify: false });
    return from;
}

async function rpc(fn, body, { keepalive = false } = {}) {
    const text = JSON.stringify(body);
    const opts = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: CLOUD_KEY,
        },
        body: text,
    };
    // Les navigateurs limitent keepalive à 64 ko
    if (keepalive && text.length < 58000) opts.keepalive = true;
    const res = await fetcher(`${CLOUD_URL}/rest/v1/rpc/${fn}`, opts);
    if (!res.ok) throw new Error(`http_${res.status}`);
    return res.json();
}

export async function cloudEnable() {
    const existing = readCfg();
    const token = existing.token || cloudGenerateToken();
    const device = existing.device || detectDevice();
    writeCfg({ token, device, lastError: '' });
    const ok = await cloudPush({ force: true, silent: false });
    if (ok) toast('Synchro cloud activée ! Partage le code ou le lien vers ton autre appareil.', ['ui', 'check']);
    return ok;
}

export function cloudDisable() {
    const store = getStore();
    pendingConflict = null;
    if (store) {
        try {
            store.removeItem(CLOUD_STORE_KEY);
        } catch {
            // ignore
        }
    }
    notifyHook();
    toast('Synchro cloud désactivée sur cet appareil (ta ferme locale reste intacte).', ['ui', 'info']);
    return true;
}

export async function cloudPush({ force = false, keepalive = false, silent = true, onlyIfDirty = false } = {}) {
    const cfg = readCfg();
    if (!cfg.token) return false;
    if (busy) return false;
    if (onlyIfDirty && !force) {
        const synced = Math.max(cfg.lastPushAt || 0, cfg.lastSyncAt || 0);
        if ((cfg.localModAt || 0) <= synced) return false;
    }
    if (!keepalive) {
        busy = true;
        notifyHook();
    }
    try {
        const ts = now();
        state.lastSaved = ts;
        if (keepalive) writeCfg({ pendingPushTs: ts }, { notify: false });
        const payload = await packSave(JSON.stringify(state));
        const res = await rpc(
            'meuh_push',
            {
                p_token: cfg.token,
                p_payload: payload,
                p_updated_at: ts,
                p_meta: saveSummary(state),
                p_device: cfg.device || detectDevice(),
                p_force: !!force,
            },
            { keepalive },
        );
        if (res && res.ok) {
            pendingConflict = null;
            writeCfg(
                {
                    lastSyncAt: ts,
                    lastPushAt: ts,
                    localModAt: ts,
                    pendingPushTs: 0,
                    lastError: '',
                },
                { notify: !keepalive },
            );
            return true;
        }
        if (res && res.conflict && res.payload) {
            try {
                const parsed = await readCode(res.payload);
                pendingConflict = {
                    token: cfg.token,
                    payload: res.payload,
                    json: parsed.json,
                    updatedAt: Number(res.updated_at) || now(),
                    meta: res.meta || saveSummary(parsed.save),
                    device: res.device || 'Autre appareil',
                    linking: false,
                };
            } catch {
                writeCfg({ lastError: 'Sauvegarde cloud illisible.' });
            }
            notifyHook();
            if (!silent) toast('Une sauvegarde plus récente existe dans le cloud : choisis dans Réglages › Sauvegarde.', ['ui', 'download']);
            return false;
        }
        writeCfg({ lastError: 'Impossible d’envoyer la sauvegarde.' }, { notify: !keepalive });
        return false;
    } catch {
        if (!keepalive) writeCfg({ lastError: 'Hors ligne ou serveur indisponible.' });
        return false;
    } finally {
        if (!keepalive) {
            busy = false;
            notifyHook();
        }
    }
}

export async function cloudSync({ autoApply = true, silent = true } = {}) {
    const cfg = readCfg();
    if (!cfg.token || busy) return { ok: false };
    busy = true;
    lastAutoCheckAt = now();
    notifyHook();
    try {
        const res = await rpc('meuh_pull', { p_token: cfg.token });
        if (!res || !res.ok) {
            writeCfg({ lastError: 'Code cloud invalide.' });
            return { ok: false };
        }
        if (!res.found) {
            busy = false;
            const pushed = await cloudPush({ force: true, silent });
            return { ok: pushed, action: 'pushed' };
        }
        const serverTs = Number(res.updated_at) || 0;
        const lastSync = cfg.lastSyncAt || 0;
        const localMod = cfg.localModAt || 0;

        // 1.170 : reconnaît notre propre envoi keepalive d'un onglet qui vient de se fermer (évite toute boucle de rechargement)
        if (cfg.pendingPushTs && Math.abs(serverTs - cfg.pendingPushTs) <= 1000) {
            writeCfg(
                {
                    lastSyncAt: Math.max(lastSync, serverTs),
                    lastPushAt: Math.max(cfg.lastPushAt || 0, serverTs),
                    pendingPushTs: 0,
                    lastError: '',
                },
                { notify: !silent },
            );
            if (!silent) toast('Ta ferme est déjà à jour avec le cloud.', ['ui', 'check']);
            return { ok: true, action: 'noop' };
        }

        // Le cloud est plus récent que notre dernière synchro
        if (serverTs > lastSync + 2000) {
            const parsed = await readCode(res.payload);
            const localChanged = localMod > lastSync + 5000;
            const justAutoReloaded = !!(cfg.lastAutoReloadAt && now() - cfg.lastAutoReloadAt < 15000);
            if (autoApply && !localChanged && !justAutoReloaded) {
                if (replaceSave(parsed.json)) {
                    writeCfg(
                        {
                            lastSyncAt: serverTs,
                            localModAt: serverTs,
                            pendingPushTs: 0,
                            lastAutoReloadAt: now(),
                            lastError: '',
                            justSyncedFrom: res.device || 'le cloud',
                        },
                        { notify: false },
                    );
                    reloadHook();
                    return { ok: true, action: 'pulled' };
                }
            }
            pendingConflict = {
                token: cfg.token,
                payload: res.payload,
                json: parsed.json,
                updatedAt: serverTs,
                meta: res.meta || saveSummary(parsed.save),
                device: res.device || 'Autre appareil',
                linking: false,
            };
            writeCfg({ lastError: '' });
            if (!silent) toast('Une sauvegarde plus récente est disponible dans le cloud.', ['ui', 'download']);
            return { ok: true, action: 'conflict' };
        }

        // Le local a progressé depuis la dernière synchro -> on envoie
        if (localMod > lastSync + 1500 || !lastSync) {
            busy = false;
            const pushed = await cloudPush({ force: false, silent });
            return { ok: pushed, action: 'pushed' };
        }

        writeCfg({ lastError: '' }, { notify: !silent });
        if (!silent) toast('Ta ferme est déjà à jour avec le cloud.', ['ui', 'check']);
        return { ok: true, action: 'noop' };
    } catch {
        writeCfg({ lastError: 'Hors ligne ou serveur indisponible.' });
        if (!silent) toast('Synchro impossible pour le moment (vérifie ta connexion).', ['ui', 'info']);
        return { ok: false };
    } finally {
        busy = false;
        notifyHook();
    }
}

export async function cloudLinkToken(rawToken) {
    const token = cloudNormalizeToken(rawToken);
    if (!token) {
        toast('Code invalide : il ressemble à MEUH-XXXX-XXXX-XXXX.', ['ui', 'info']);
        return { ok: false, error: 'format' };
    }
    if (busy) return { ok: false, error: 'busy' };
    busy = true;
    notifyHook();
    try {
        const res = await rpc('meuh_pull', { p_token: token });
        if (!res || !res.ok) {
            writeCfg({ lastError: 'Code non reconnu.' });
            return { ok: false, error: 'invalid' };
        }
        const device = readCfg().device || detectDevice();
        if (res.found && res.payload) {
            const parsed = await readCode(res.payload);
            pendingConflict = {
                token,
                payload: res.payload,
                json: parsed.json,
                updatedAt: Number(res.updated_at) || now(),
                meta: res.meta || saveSummary(parsed.save),
                device: res.device || 'Autre appareil',
                linking: true,
            };
            notifyHook();
            return { ok: true, found: true };
        }
        // Code encore vide dans le cloud : on lie cet appareil et on y dépose la ferme actuelle
        writeCfg({ token, device, lastError: '' });
        busy = false;
        await cloudPush({ force: true, silent: true });
        toast('Appareil lié et ferme envoyée dans le cloud !', ['ui', 'check']);
        return { ok: true, found: false };
    } catch {
        writeCfg({ lastError: 'Connexion au cloud impossible.' });
        toast('Impossible de joindre le cloud (vérifie ta connexion).', ['ui', 'info']);
        return { ok: false, error: 'network' };
    } finally {
        busy = false;
        notifyHook();
    }
}

export function cloudAcceptPull() {
    const c = pendingConflict;
    if (!c || !c.json) return false;
    const device = readCfg().device || detectDevice();
    if (!replaceSave(c.json)) {
        toast('Impossible d’enregistrer la sauvegarde sur cet appareil.', ['ui', 'info']);
        return false;
    }
    pendingConflict = null;
    writeCfg({
        token: c.token,
        device,
        lastSyncAt: c.updatedAt,
        localModAt: c.updatedAt,
        lastError: '',
        justSyncedFrom: c.device || 'le cloud',
    });
    reloadHook();
    return true;
}

export async function cloudForcePush() {
    const c = pendingConflict;
    const token = (c && c.token) || readCfg().token;
    if (!token) return false;
    const device = readCfg().device || detectDevice();
    writeCfg({ token, device, lastError: '' });
    pendingConflict = null;
    const ok = await cloudPush({ force: true, silent: true });
    if (ok) toast('La ferme de cet appareil a été envoyée dans le cloud !', ['ui', 'check']);
    return ok;
}

export function cloudDismissConflict() {
    pendingConflict = null;
    notifyHook();
}

export function cloudReadHashToken() {
    const loc = globalThis.location;
    if (!loc || !loc.hash) return '';
    const m = loc.hash.match(/#cloud=([A-Za-z0-9_-]+)/i);
    if (!m) return '';
    const token = cloudNormalizeToken(decodeURIComponent(m[1]));
    try {
        if (globalThis.history && globalThis.history.replaceState) {
            globalThis.history.replaceState(null, '', loc.pathname + loc.search);
        }
    } catch {
        // ignore
    }
    return token;
}

export function cloudMaybeAutoSync() {
    const cfg = readCfg();
    if (!cfg.token || busy || pendingConflict) return;
    if (now() - lastAutoCheckAt < 15000) return;
    cloudSync({ autoApply: true, silent: true });
}

export function cloudMaybeAutoPush() {
    const cfg = readCfg();
    if (!cfg.token || busy || pendingConflict) return;
    if ((cfg.localModAt || 0) <= (cfg.lastPushAt || 0)) return;
    if (now() - (cfg.lastPushAt || 0) < 25000) return;
    cloudPush({ force: false, silent: true });
}
