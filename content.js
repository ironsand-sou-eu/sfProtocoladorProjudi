class StaticGlobalStarter {
    static {
        chrome.runtime.onMessage.addListener( (msg, sender, sendResponse) => {
            if (msg.startInjection) StaticGlobalStarter.waitForContainers();
            sendResponse("Dummy response to avoid console error logging");
        });
    }

    static waitForContainers() {
        let j = 0;
        let parentForm = null;
        
        var parentFormWait = setInterval((parentForm, j) => {
            parentForm = document.querySelector("[name=mainFrame]")
                ?.contentDocument.querySelector("#userMainFrame")
                ?.contentDocument.querySelector("#formUpload");
            j++;
            if (parentForm) {
                clearInterval(parentFormWait);
                StaticGlobalStarter.injectDragndropDiv(parentForm);
            } else if(j > 50) { // 50 iterations = 10 seconds
                clearInterval(parentFormWait);
            };
        }, 200, parentForm, j);
    }

    static injectDragndropDiv(parentForm) {
        var proproDiv = parentForm.parentNode.querySelector("[Propro]");
    
        if(parentForm && !proproDiv) {
            const DropDiv = document.createElement("div");
            DropDiv.toggleAttribute("Propro");
            DropDiv.innerText = "Arraste os arquivos para cá";
            DropDiv.setAttribute("class", "sfDropDiv");
            DropDiv.setAttribute("style", this.montarCss());
            parentForm.parentNode.insertBefore(DropDiv, parentForm);
    
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
                    const fInjector = new FileInjector(finalFiles, parentForm);
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
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    }
}

class FileInjector {
    constructor(files, form) {
        this.files = files;
        this.form = form;
        this.fileListWrapperDiv = this.form.querySelector("#arquivoUpload_wrap_list");
    }

    injectFilesToProjudi() {
        let i = 0;
        for(let iFile of this.files) {
            if(!iFile.validFiletype) continue;
            const fileInput = this.getInput(i);
            this.setFileToInput(iFile, fileInput);
            this.handleDescriptionBox(i, iFile);
            i++;
        }
    }

    getInput(i) {
        let qSelector = "";
        if(i===0) {
            qSelector = "#arquivoUpload";
        } else {
            qSelector = "#arquivoUpload_F" + i;
        }
        return this.form.querySelector(qSelector);
    }
    
    setFileToInput(file, fileInput) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        const changeEvent = new Event("change");
        fileInput.dispatchEvent(changeEvent);
    }
    
    handleDescriptionBox (i, myFile) {
        const qSelector = "#codDescricao" + (i + 1);
        let descriptionBox = null;
        let j = 0;
        var selectWait = setInterval((qSelector, descriptionBox, myForm, j, myFile) => {
            descriptionBox = myForm.querySelector(qSelector);
            j++;
            if (descriptionBox) {
                this.changeOption(descriptionBox, myFile.projudiType)
                if(myFile.projudiType == "Outros") {
                    const txtDescriptQSelector = qSelector.replace("codD", "d");
                    console.log(txtDescriptQSelector)
                    const txtDescription = myForm.querySelector(txtDescriptQSelector);
                    txtDescription.value = myFile.nameWithoutDiacritics;
                }
                clearInterval(selectWait);
            } else if(j > 30) {
                clearInterval(selectWait);
            };
        }, 200, qSelector, descriptionBox, this.form, j, myFile);
    }

    changeOption(selElement, optText) {
        const selOptions = selElement.options;
        for (let opt, j = 0; opt = selOptions[j]; j++) {
            if (opt.innerText.trim() == optText) {
                selElement.selectedIndex = j;
                const changeEvent = new Event("change");
                selElement.dispatchEvent(changeEvent);        
                return true;
            }
        }
        return false;
    }
}