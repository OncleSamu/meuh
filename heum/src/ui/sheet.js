// Heum — le volet qui monte du bas pour choisir (une culture, un produit…).
let box;
export function setupSheet() {
    box = document.getElementById('sheet');
    box.addEventListener('click', e => {
        if (e.target === box || e.target.closest('[data-close]')) closeSheet();
    });
}
export function openSheet(title, html) {
    box.innerHTML = `<div class="sheet-panel"><header><h3>${title}</h3><button class="x" data-close aria-label="Fermer">✕</button></header><div class="sheet-body">${html}</div></div>`;
    box.classList.add('on');
}
export const closeSheet = () => box && box.classList.remove('on');
export const sheetOpen = () => box && box.classList.contains('on');
