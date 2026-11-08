// Heum — sauvegarde : fichier à exporter, fichier à reprendre, sauvegarde illisible.
import { rawSave, importSave, state } from '../core/state.js';
import { btn } from './kit.js';
import { openSheet, closeSheet } from './sheet.js';
import { toast } from './fx.js';

export function exportSave() {
    const blob = new Blob([rawSave()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Heum-niveau${state.level}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        URL.revokeObjectURL(a.href);
        a.remove();
    }, 500);
}
export function pickImport(done) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async () => {
        const f = input.files && input.files[0];
        if (!f) return;
        const ok = importSave(await f.text());
        toast(ok ? 'Sauvegarde reprise.' : 'Ce fichier n’est pas une sauvegarde de Heum.');
        if (ok) closeSheet();
        done();
    };
    input.click();
}
// la sauvegarde présente est illisible : on la garde intacte et on propose de l'exporter ou de repartir
export function showBad() {
    openSheet(
        'Sauvegarde illisible',
        `<p>La partie enregistrée ne peut pas être lue (version inconnue ou fichier abîmé). Je ne l’ai <b>pas</b> effacée : une copie de secours est gardée.</p>
        <div class="row">${btn('Exporter la sauvegarde', 'saveExport', {}, { kind: 'go' })}${btn('Reprendre un fichier', 'saveImport', {})}</div>
        <p class="hint">Rien n’est enregistré tant que vous n’avez pas choisi.</p>
        <div class="row">${btn('Recommencer à zéro', 'resetYes', {}, { kind: 'danger', size: 'sm' })}</div>`,
    );
}
