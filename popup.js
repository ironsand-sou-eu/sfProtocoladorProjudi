document.addEventListener("DOMContentLoaded", e => {
    const controleLigar = document.querySelector("#ligado");
    chrome.storage.local.get(['rodando'], resposta => {
        controleLigar.checked = resposta.rodando ?? false;    
    });
});

document.querySelector("#ligado").addEventListener("change", (e) => {
    const controle = e.target;
    const ligado = controle.checked;
    chrome.storage.local.set({'rodando': ligado});
    avisarPagina();
});