document.addEventListener("DOMContentLoaded", (e) => {
    const controleLigar = document.querySelector("#ligado");
    chrome.storage.local.get(['rodando'], function(resposta){
        controleLigar.checked = resposta.rodando ?? false;    
    });
    
    const controleCorFundo = document.querySelector("#corFundo");
    chrome.storage.local.get(['corFundo'], function(resposta){
        controleCorFundo.value = resposta.corFundo ?? "#FFFFFF";    
    });

    const controleCorTexto = document.querySelector("#corTexto");
    chrome.storage.local.get(['corTexto'], function(resposta){
        controleCorTexto.value = resposta.corTexto ?? "#000000";    
    });

    const controleIntensidadeTexto = document.querySelector("#intensidadeTexto");
    chrome.storage.local.get(['intensidadeTexto'], function(resposta){
        controleIntensidadeTexto.value = resposta.intensidadeTexto ?? "400";    
    });

    const controleTamanhoTexto = document.querySelector("#tamanhoTexto");
    chrome.storage.local.get(['tamanhoTexto'], function(resposta){
        controleTamanhoTexto.value = resposta.tamanhoTexto ?? "1";
    });

});

document.querySelector("#ligado").addEventListener("change", (e) => {
    const controle = e.target;
    const ligado = controle.checked;
    chrome.storage.local.set({'rodando': ligado});
    avisarPagina();
});

document.querySelector("#corFundo").addEventListener("change", (e) => {
    const controle = e.target;
    const valor = controle.value;
    chrome.storage.local.set({'corFundo': valor});
    avisarPagina();
});

document.querySelector("#corTexto").addEventListener("change", (e) => {
    const controle = e.target;
    const valor = controle.value;
    chrome.storage.local.set({'corTexto': valor});
    avisarPagina();
});

document.querySelector("#intensidadeTexto").addEventListener("change", (e) => {
    const controle = e.target;
    const valor = controle.value;
    chrome.storage.local.set({'intensidadeTexto': valor});
    avisarPagina();
});

document.querySelector("#tamanhoTexto").addEventListener("change", (e) => {
    const controle = e.target;
    const valor = controle.value;
    chrome.storage.local.set({'tamanhoTexto': valor});
    avisarPagina();
});
