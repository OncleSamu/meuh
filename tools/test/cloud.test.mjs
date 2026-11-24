// 1.167 : Tests unitaires de la synchro cloud Supabase (code secret, push/pull auto, détection de conflit et backup).
import test from 'node:test';
import assert from 'node:assert/strict';
import { state, newState, setState, setStore, SAVE_KEY, BACKUP_KEY } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';

function memStore() {
    const map = new Map();
    return {
        getItem: k => (map.has(k) ? map.get(k) : null),
        setItem: (k, v) => map.set(k, String(v)),
        removeItem: k => map.delete(k),
    };
}

function fakeSupabaseServer() {
    const rows = new Map();
    return {
        rows,
        fetch: async (url, opts) => {
            assert.ok(opts.headers.apikey && opts.headers.apikey.startsWith('sb_publishable_'), 'envoie apikey publishable');
            assert.equal(opts.headers.Authorization, undefined, 'n’envoie pas Authorization Bearer avec sb_publishable_');
            const body = JSON.parse(opts.body);
            if (url.endsWith('/meuh_push')) {
                const cur = rows.get(body.p_token);
                if (cur && cur.updated_at > body.p_updated_at && !body.p_force) {
                    return {
                        ok: true,
                        json: async () => ({
                            ok: false,
                            conflict: true,
                            updated_at: cur.updated_at,
                            meta: cur.meta,
                            device: cur.device,
                            payload: cur.payload,
                        }),
                    };
                }
                rows.set(body.p_token, {
                    payload: body.p_payload,
                    updated_at: body.p_updated_at,
                    meta: body.p_meta,
                    device: body.p_device,
                });
                return { ok: true, json: async () => ({ ok: true, updated_at: body.p_updated_at }) };
            }
            if (url.endsWith('/meuh_pull')) {
                const cur = rows.get(body.p_token);
                if (!cur) return { ok: true, json: async () => ({ ok: true, found: false }) };
                return {
                    ok: true,
                    json: async () => ({
                        ok: true,
                        found: true,
                        payload: cur.payload,
                        updated_at: cur.updated_at,
                        meta: cur.meta,
                        device: cur.device,
                    }),
                };
            }
            return { ok: false, status: 404, json: async () => ({}) };
        },
    };
}

test('1.167 : génération et normalisation du code de ferme cloud', () => {
    const tok = G.cloudGenerateToken();
    assert.match(tok, /^MEUH-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
    assert.equal(G.cloudNormalizeToken('  meuh 7k4p-9r2m x8q3 '), 'MEUH-7K4P-9R2M-X8Q3');
    assert.equal(G.cloudNormalizeToken('7k4p9r2mx8q3'), 'MEUH-7K4P-9R2M-X8Q3');
    assert.equal(G.cloudNormalizeToken('tropcourt'), '');
});

test('1.167 : synchro PC <-> Téléphone (activation, liaison, pull auto, détection de conflit & backup)', async () => {
    const srv = fakeSupabaseServer();
    G.cloudSetFetcher(srv.fetch);
    let reloaded = 0;
    G.cloudSetHooks({ onReload: () => reloaded++, onUpdate: () => {} });

    // Appareil A (PC) : niveau 25, 12 345 pièces
    const storeA = memStore();
    setStore(storeA);
    setState(newState());
    state.level = 25;
    state.money = 12345;
    assert.equal(await G.cloudEnable(), true);
    const tok = G.cloudStatus().token;
    assert.ok(tok.startsWith('MEUH-'));
    assert.ok(srv.rows.has(tok), 'sauvegarde envoyée sur Supabase');

    // Appareil B (Téléphone tout neuf) : lie le code -> détecte la ferme du PC et propose de la charger
    const storeB = memStore();
    setStore(storeB);
    setState(newState());
    state.level = 1;
    state.money = 50;
    const linkRes = await G.cloudLinkToken(tok);
    assert.equal(linkRes.ok, true);
    assert.equal(linkRes.found, true);
    const cf = G.cloudStatus().conflict;
    assert.ok(cf && cf.linking, 'propose de charger la ferme existante au lien');
    assert.ok(cf.meta.includes('Niveau 25'));

    // Accepter le chargement sur Téléphone -> sauvegarde locale en backup + écrit la ferme du PC + recharge
    assert.equal(G.cloudAcceptPull(), true);
    assert.equal(reloaded, 1);
    const loadedB = JSON.parse(storeB.getItem(SAVE_KEY));
    assert.equal(loadedB.level, 25);
    assert.equal(loadedB.money, 12345);
    assert.ok(JSON.parse(storeB.getItem(BACKUP_KEY)).length >= 1, 'copie locale de secours gardée');

    // Maintenant le PC joue et pousse une nouvelle version (niveau 26) avec timestamp plus récent
    const newerPayload = await G.packSave(JSON.stringify({ ...loadedB, level: 26, money: 99999 }));
    const newerTs = G.cloudStatus().lastSyncAt + 60000;
    srv.rows.set(tok, { payload: newerPayload, updated_at: newerTs, meta: 'Niveau 26 · 99 999 pièces', device: 'PC Windows' });

    // Téléphone revient sur l'onglet sans avoir joué hors ligne -> pull automatique immédiat !
    const syncRes = await G.cloudSync({ autoApply: true, silent: true });
    assert.equal(syncRes.action, 'pulled');
    assert.equal(reloaded, 2);
    assert.equal(JSON.parse(storeB.getItem(SAVE_KEY)).level, 26);

    // Si le Téléphone a AUSSI joué hors ligne pendant que le PC progressait -> conflit proposé sans écraser !
    const evenNewerTs = newerTs + 120000;
    const pc27 = await G.packSave(JSON.stringify({ ...loadedB, level: 27, money: 200000 }));
    srv.rows.set(tok, { payload: pc27, updated_at: evenNewerTs, meta: 'Niveau 27 · 200 000 pièces', device: 'PC Windows' });
    // Simuler une modif locale sur B après lastSyncAt
    const cfgB = JSON.parse(storeB.getItem('meuh_cloud_v1'));
    cfgB.localModAt = newerTs + 30000;
    storeB.setItem('meuh_cloud_v1', JSON.stringify(cfgB));
    const confRes = await G.cloudSync({ autoApply: true, silent: true });
    assert.equal(confRes.action, 'conflict', 'ne détruit jamais une progression locale hors ligne');
    assert.equal(reloaded, 2);
    assert.ok(G.cloudStatus().conflict);

    // Désactivation propre
    assert.equal(G.cloudDisable(), true);
    assert.equal(G.cloudStatus().enabled, false);
});
