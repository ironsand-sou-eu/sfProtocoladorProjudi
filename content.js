let tabId = "";
let frameId = "";

class StaticGlobalStarter {
    static {
        chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
            tabId = request.tabId;
            if (request.clicou) StaticGlobalStarter.injectDragndropDiv();
            sendResponse("Resposta irrelevante para evitar erro no console");
        });
    }
    
    static injectDragndropDiv() {
        var framePai = document.querySelector("[name=mainFrame]");
        if(framePai) {
            var iframePai = framePai.contentDocument.querySelector("#userMainFrame");
        }

        if(iframePai) {
            var formPai = iframePai.contentDocument.querySelector("#formUpload");
            var ssfDiv = iframePai.contentDocument.querySelector("[Sisifo]");
        }
    
        if(formPai && !ssfDiv) {
            const DropDiv = document.createElement("div");
            DropDiv.toggleAttribute("Sisifo");
            DropDiv.innerText = "Arraste os arquivos para cá";
            DropDiv.setAttribute("class", "sfDropDiv");
            DropDiv.setAttribute("style", this.montarCss());
            formPai.parentNode.insertBefore(DropDiv, formPai);
    
            DropDiv.addEventListener('dragover', (e) => {
                e.preventDefault();
                DropDiv.style.backgroundColor = "#09447280";
            });
              
            DropDiv.addEventListener('dragleave', () => {
                DropDiv.style.backgroundColor = "#0002";
            });
              
            DropDiv.addEventListener('drop', (e) => {
                e.preventDefault();
                DropDiv.style.backgroundColor = "#0002";
                const draggedFiles = e.dataTransfer.files;
                const fParser = new FileParser(draggedFiles);
                const finalFiles = fParser.parsedFiles;
                if(finalFiles.length > 0) {
                    const fInjector = new FileInjector(finalFiles, formPai);
                    fInjector.injectFilesToProjudi();
                } else {
                    alert("Nenhum arquivo válido selecionado.");
                }
            });
        }
    }

    static montarCss(){
        let conteudo = "background-color: #0002; ";
        conteudo += "border-style: dashed; ";
        conteudo += "border-color: #0003; ";
        conteudo += "height: 3rem; ";
        conteudo += "display: flex; ";
        conteudo += "text-align: center; ";
        conteudo += "justify-content: center; ";
        conteudo += "align-items: center; ";
        conteudo += "align-content: center; ";
        conteudo += "flex-direction: row; ";
        conteudo += "font-size: 1rem; ";
        conteudo += "color: #0007; ";
        conteudo += "font-weight: bold;";
        return conteudo;
    }
}

class FileParser {
    /**
     * @param files {object} Objeto files contendo os arquivos a tratar.
     */
    constructor(files){
        this.files = files;
    }
    
    /**
     * @return {object} Objeto Files contendo os arquivos tratados, com os valores de
     *   nome sem acento, tipo do Projudi e se é de tipo válido (PDF, mp3 ou mp4) ou não.
     * @example
     *  - const foo = new FileParser(e.dataTransfer.files);
     *  - const parsedFoo = foo.parsedFiles();
     *  - console.log(parsedFoo[0].nameWithoutDiacritics);
     */
    get parsedFiles() {
        for(let file of this.files) {
            const fileKey = this.getKeyByValue(this.files, file);
            if(file.type.toLowerCase() !== "application/pdf") {
                file.validFiletype = false;
            } else {
                file.nameWithoutDiacritics = this.stripDiacritics(file.name);
                file.projudiType = this.getProjudiType(file.nameWithoutDiacritics, fileKey);
                file.validFiletype = true;
            }
        }
        return this.files;
    }
    
    /**
     * @param nameWithoutDiacritics {string} String contendo o nome do arquivo, sem acentuação.
     * @param objKey {any} Chave que identifica o arquivo no objeto this.files.
     * @return {string} String contendo um dos tipos de arquivo selecionáveis no Projudi TJ/BA.
     * @example
     *  - const file = this.files[1] // Assuming it is set.
     *  - const fileKey = getKeyByValue(this.files, file);
     *  - const type = getProjudiType;
     *  - console.log(type);
     */
    getProjudiType(nameWithoutDiacritics, objKey){
        const lowCaseName = nameWithoutDiacritics.toLowerCase();
        let resposta = "";
        if(objKey == 0) { // Primeiro arquivo
            if(lowCaseName.includes("peticao inicial") || lowCaseName.includes("inicial")){
                resposta = "Petição Inicial";
            } else if(lowCaseName.includes("contestacao") || lowCaseName.includes("defesa")){
                resposta = "Contestação";
            } else{
                resposta = "Petição";
            }
        } else {
            if(lowCaseName.includes("comprovante de residencia") || lowCaseName.includes("comp res")
            || lowCaseName.includes("comprovante residencia")){
                resposta = "Comprovante Residência";
            } else if(lowCaseName.includes("procuracao")) {
                resposta = "Procuração";
            } else if(lowCaseName.includes("substabelecimento") || lowCaseName.includes("subs")){
                resposta = "Substabelecimento";
            } else{
                resposta = "Outros";
            }
        }
        return resposta;
    }
    
    /**
     * @param object {object} Objeto no qual buscar a propriedade com o valor value.
     * @param value {any} Valor da propriedade cujo índice se quer buscar.
     * @return {any} Chave da proprieadde value.
     * @example
     *  - const obj = { 0: "my value"; 1: "searched value" }.
     *  - const key = getKeyByValue(obj, "searched value");
     *  - console.log(key); // Shall return 1
     */
    getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
    
    /**
     * @param str {string} String da qual remover acentuação.
     * @return {string} String sem acentuação.
     * @example
     *  - const myString = "Textão com acentuação".
     *  - console.log(stripDiacritics(myString)); // Shall return "Textao sem acentuacao"
     */
    stripDiacritics(str){
        let result = "";
        [...str].forEach(char => {
            switch(char) {
                case "á":
                case "à":
                case "ã":
                case "â":
                    char = "a";
                    break;
                case "Á":
                case "À":
                case "Ã":
                case "Â":
                    char = "A";
                    break;
                case "é":
                case "ê":
                    char = "e";
                    break;
                case "É":
                case "Ê":
                    char = "E";
                    break;
                case "í":
                    char = "i";
                    break;
                case "Í":
                    char = "I";
                    break;
                case "ó":
                case "õ":
                case "ô":
                    char = "o";
                    break;
                case "Ó":
                case "Õ":
                case "Ô":
                    char = "O";
                    break;
                case "ú":
                    char = "u";
                    break;
                case "Ú":
                    char = "U";
                    break;
                case "ç":
                    char = "c";
                    break;
                case "Ç":
                    char = "C";
                    break;
            }
            result += char;
        });
        return result;
    }
}

class FileInjector {
    constructor(files, form) {
        this.files = files;
        this.form = form;
        this.fileWrapperDiv = this.form.querySelector("#arquivoUpload_wrap");
        this.fileListWrapperDiv = this.fileWrapperDiv.querySelector("#arquivoUpload_wrap_list");
    }

    injectFilesToProjudi() {
        let i = 0;
        for(let iFile of this.files) {
            if(!iFile.validFiletype) continue;
            const fileInput = this.getInput(i);
            this.setFileToInput(iFile, fileInput);
            this.adjustInput(fileInput);
            this.insertWrapperElements(iFile, i);
        }
    }

    getInput(i) {
        let result = null;
        if(i===0) {
            result = this.form.querySelector("#arquivoUpload");
        } else {
            result = this.form.ownerDocument.createElement("input");
            result.type="file";
            result.id="arquivoUpload_F" + i;
            result.name="arquivoUpload";
            result.size="1";
            result.setAttribute("style", "width: 90px; display: none;");
            result.setAttribute("class", "MultiFile-applied MultiFile");
            result.value="";
            this.wrapperDiv.insertBefore(result, this.fileListWrapperDiv);
        }
        return result;        
    }
    
    async setFileToInput(file, fileInput) {
        // const frameId;

        const resp = await chrome.runtime.sendMessage({criarDataTransfer: true});
        console.log(resp);



        

        fileInput.files.add(file);
    }
    
    adjustInput(fileInput) {
        fileInput.setAttribute("style", "width: 90px; display: none; position: absolute; top: -3000px;");
    }
    
    insertWrapperElements(myFile, i) {
        const base1Ordinal = i + 1;
        const mainDiv = this.form.ownerDocument.createElement("div");
        mainDiv.setAttribute("class", "MultiFile-label");

        const link1 = this.form.ownerDocument.createElement("a");
        link1.setAttribute("class", "MultiFile-remove");
        link1.href = "#arquivoUpload_wrap"
        
        const span = this.form.ownerDocument.createElement("span");
        span.setAttribute("class", "MultiFile-title")
        span.title = "Selecionado: C:\\fakepath\\" + myFile.name;
        
        const subDiv1 = this.form.ownerDocument.createElement("div");
        subDiv1.setAttribute("style", "vertical-align:middle; height:15px; float:left; width:40%; margin-bottom:5px; border-bottom:1px dotted #ccc; padding-bottom:5px");
        
        const img1 = this.form.ownerDocument.createElement("img");
        img1.name = "img";
        img1.width = "15";
        img1.border = "0";
        img1.src = "/projudi/imagens/icon/pdf.jpg"
        
        const looseText = this.form.ownerDocument.createTextNode(file.nameWithoutDiacritics);
        
        const subDiv2 = this.form.ownerDocument.createElement("div");
        subDiv2.setAttribute("style", "vertical-align:middle; height:15px; border-bottom:1px dotted #ccc; margin-bottom:5px; padding-bottom:5px; float:left; width:55%; text-align:center;");
        
        const select = this.form.ownerDocument.createElement("select");
        select.name = "codDescricao";
        select.id = "codDescricao" + base1Ordinal;
        select.onchange = "tipo(this);";
        select.setAttribute("aria-label", "Selecione o tipo de documento adicionado, em seguida tecle TAB para selecionar o certificado");
        const options = {
            0: {value: null, text: "Selecione o Tipo de Documento"},
            1: {value: 1005, text: "Comprovante Residência"},
            2: {value: 47, text: "Contestação"},
            3: {value: 1, text: "Outros"},
            4: {value: 40, text: "Petição"},
            5: {value: 30, text: "Petição Inicial"},
            6: {value: 32, text: "Procuração"},
            7: {value: 41, text: "Substabelecimento"},
            8: {value: 31, text: "Tomada de Termo"}
        }
        for(let j = 0; j < 9; j++){
            const opt = this.form.ownerDocument.createElement("option");
            opt.value = options[j].value;
            opt.text = options[j].text;
            select.add(opt);
        }
        select.options.selectedIndex = 0;
        
        const inputDescricao = this.form.ownerDocument.createElement("input");
        inputDescricao.setAttribute("style", "display:none; width:190px;");
        inputDescricao.name = "descricao";
        inputDescricao.onclick = "mascaraDescricao(this)";
        inputDescricao.acao = "0";
        inputDescricao.value = "Digite/informe aqui a Descrição";
        inputDescricao.id = "descricao" + base1Ordinal;
        inputDescricao.type = "text";
        inputDescricao.maxlength = "210";
        
        const label = this.form.ownerDocument.createElement("label");
        label.setAttribute("style", "display:none;");
        label.name = "obrig";
        label.id = "obrig" + base1Ordinal;
        label.innerText = "*";
        
        const subDiv3 = this.form.ownerDocument.createElement("div");
        subDiv3.setAttribute("style", "vertical-align:middle; height:15px; float:left; width:5%; margin-bottom:5px; border-bottom:1px dotted #ccc; padding-bottom:5px");
        
        const link2 = this.form.ownerDocument.createElement("a");
        link2.setAttribute("style", "cursor: pointer");
        link2.onclick = "$(this).parent().parent().prev().click()"
        
        const img2 = this.form.ownerDocument.createElement("img");
        img2.setAttribute("style", "float: left");
        img2.border = "0";
        img2.setAttribute("aria-label", "Excluir documento");
        img2.src = "/projudi/imagens/botoes/delete.png";
        img2.alt = "Excluir";
        
        subDiv1.appendChild(img1);
        subDiv1.appendChild(looseText);
        subDiv2.appendChild(select);
        subDiv2.appendChild(inputDescricao);
        subDiv2.appendChild(label);
        link2.appendChild(img2);
        subDiv3.appendChild(link2);
        span.appendChild(subDiv1);
        span.appendChild(subDiv2);
        span.appendChild(subDiv3);
        mainDiv.appendChild(link1);
        mainDiv.appendChild(span);

        this.fileListWrapperDiv.appendChild(mainDiv);
    }
}