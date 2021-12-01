class StaticGlobalStarter {
    static {
        chrome.runtime.onMessage.addListener( (msg, sender, sendResponse) => {
            if (msg.startInjection) StaticGlobalStarter.waitForContainers();
            sendResponse("Dummy response to avoid console error logging");
        });
    }

    static waitForContainers() {
        let params = {
            j: 0,
            peticionarParentForm: null,
            capaProcessoArquivosDiv: null,
            parentDoc: null
        };
        
        var elementWait = setInterval((params) => {
            params.peticionarParentForm = document.querySelector("[name=mainFrame]")
                ?.contentDocument.querySelector("#userMainFrame")
                ?.contentDocument.querySelector("#formUpload");
            params.capaProcessoArquivosDiv = document.querySelector("[name=mainFrame]")
                ?.contentDocument.querySelector("#userMainFrame")
                ?.contentDocument.querySelector("#Arquivos");
            params.j++;
            
            
            if (params.peticionarParentForm || params.capaProcessoArquivosDiv) {
                clearInterval(elementWait);
                params.parentDoc = document.querySelector("[name=mainFrame]")
                    .contentDocument.querySelector("#userMainFrame").contentDocument;
            }
            if (params.peticionarParentForm) StaticGlobalStarter.prepareInject(params.peticionarParentForm, params.parentDoc, "dragDropDiv");
            if (params.capaProcessoArquivosDiv) StaticGlobalStarter.prepareInject(params.capaProcessoArquivosDiv, params.parentDoc, "peticionarButton");
            if(params.j > 50) clearInterval(elementWait); // 50 iterations = 10 seconds

        }, 200, params);
    }

    static prepareInject(parentElement, parentDoc, injectType) {
        let proproElement = parentDoc.querySelector("[Propro]");
        if(!parentElement || proproElement) return;
        
        const sfCss = document.createElement("link");
        sfCss.rel = "stylesheet";
        sfCss.type = "text/css";
        sfCss.href = "ssf-styles.css";
        parentDoc.head.appendChild(sfCss);
        
        switch (injectType) {
            case "dragDropDiv":
                this.injectDragndropDiv(parentElement);
                break;
            case "peticionarButton":
                this.injectPeticionarButton(parentElement);
                break;
        }
    }
                
    static injectPeticionarButton(arquivosDiv) {
        const partesDiv = arquivosDiv.parentElement.querySelector("#Partes");
        const idProc = this.getIdProc(partesDiv);
        if(!idProc) return;

        const petLink = document.createElement("a");
        petLink.toggleAttribute("Propro");
        petLink.setAttribute("class", "sfPetLink");
        petLink.href = "/projudi/movimentacao/Peticionar?numeroProcesso=" + idProc + "&ehPeticionar=s";
        petLink.innerText = "Peticionar";
        const parentP = partesDiv.parentElement.querySelector("div#Partes~p");
        parentP.appendChild(petLink);
    }

    static getIdProc(partesDiv) {
        const uriQuerystringNumProcIdentifier = "numeroProcesso=";
        const procLink = partesDiv.getElementsByTagName("a")[0];
        const linkUri = procLink.href;
        const idProcPosition = linkUri.search(uriQuerystringNumProcIdentifier) + uriQuerystringNumProcIdentifier.length;
        return linkUri.substr(idProcPosition);
    }

    static injectDragndropDiv(parentForm) {
        const dropDiv = document.createElement("div");
        dropDiv.toggleAttribute("Propro");
        dropDiv.classList.add("sfDropDiv");
        parentForm.parentNode.insertBefore(dropDiv, parentForm);
        
        const mainText = document.createElement("div");
        mainText.innerText = "Arraste os arquivos para cá";
        dropDiv.appendChild(mainText);
        
        const textSubDiv = document.createElement("div");
        textSubDiv.classList.add("sfSubTextDiv");
        textSubDiv.innerHTML = "Evitemos excesso de anexos: o essencial pode passar despercebido<br />" +
        "Sejamos éticos e responsáveis: falar a verdade é o primeiro passo para uma sociedade sadia";
        dropDiv.appendChild(textSubDiv);

        const blankSpan = document.createElement("span");
        blankSpan.classList.add("movingBorder");
        for(let i = 1; i <= 4; i++){
            dropDiv.appendChild(blankSpan.cloneNode());
        }

        dropDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropDiv.style.backgroundColor = "#09447280";
        });
            
        dropDiv.addEventListener('dragleave', () => {
            dropDiv.removeAttribute("style");
        });
        
        dropDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            dropDiv.removeAttribute("style");
            const draggedFiles = e.dataTransfer.files;
            const fParser = new FileParser(draggedFiles);
            const finalFiles = fParser.parsedFiles;
            if(finalFiles.length > 0) {
                const fInjector = new FileInjector(finalFiles, parentForm);
                fInjector.injectFilesToProjudi(dropDiv);
            } else {
                alert("Nenhum arquivo válido selecionado.");
            }
        });
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
     *  - console.log(parsedFoo[0].displayName);
     */
    get parsedFiles() {
        for(let file of this.files) {
            const fileKey = this.getKeyByValue(this.files, file);
            file.validFiletype = this.allowedFileType(file.type.toLowerCase());
            if(file.validFiletype) {
                file.displayName = this.stripDiacritics(file.name);
                file.displayName = this.stripFileExtension(file.displayName);
                file.projudiType = this.getProjudiType(file.displayName, fileKey);
                file.validFiletype = true;
            }
        }
        return this.files;
    }

    allowedFileType(fileType) {
        const regexPdf = /application\/pdf/i;
        const regexMp3 = /audio\/(x-)*mpeg-3/i;
        const regexMp4 = /video\/mp4/i;

        if(fileType.search(regexPdf) == -1 &&
            fileType.search(regexMp3) == -1 &&
            fileType.search(regexMp4) == -1) {
            return false;
        } else {
            return true;
        }
    }
    
    /**
     * @param displayName {string} String contendo o nome do arquivo, sem acentuação.
     * @param objKey {any} Chave que identifica o arquivo no objeto this.files.
     * @return {string} String contendo um dos tipos de arquivo selecionáveis no Projudi TJ/BA.
     * @example
     *  - const file = this.files[1] // Assuming it is set.
     *  - const fileKey = getKeyByValue(this.files, file);
     *  - const type = getProjudiType;
     *  - console.log(type);
     */
    getProjudiType(displayName, objKey){
        const lowCaseName = displayName.toLowerCase();
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
            } else if(lowCaseName.includes("substab") || lowCaseName.search(/subs\b/gi) != -1){
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

    stripFileExtension(str) {
        return str.replace(/((.pdf)|(.mp3)|(.mp4))$/i, "");
    }
}

class FileInjector {
    constructor(files, form) {
        this.files = files;
        this.form = form;
        this.fileListWrapperDiv = this.form.querySelector("#arquivoUpload_wrap_list");
    }

    injectFilesToProjudi(dropDiv) {
        let i = 0;
        let rejectedFiles = [];
        for(let iFile of this.files) {
            if(!iFile.validFiletype) {
                rejectedFiles.push(iFile.name);
                continue;
            }
            const fileInput = this.getInput(i);
            this.setFileToInput(iFile, fileInput);
            this.handleDescriptionBox(i, iFile);
            i++;
        }
        if(rejectedFiles.length !== 0){
            dropDiv.classList.add("sfDropDivErro");
            dropDiv.getElementsByTagName("div")[0].innerText = "Os seguintes arquivos não foram inseridos:"
            const fileListDiv = dropDiv.getElementsByTagName("div")[1];
            fileListDiv.innerText = "";
            rejectedFiles.forEach(fileName => {
                fileListDiv.innerHTML += (fileListDiv.innerText) ? "<br />" : "";
                fileListDiv.innerHTML += fileName;
            });
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
                    const txtDescription = myForm.querySelector(txtDescriptQSelector);
                    txtDescription.value = myFile.displayName;
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