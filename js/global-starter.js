class GlobalStarter {
    // static {
    //     chrome.runtime.onMessage.addListener( (msg, sender, sendResponse) => {
    //         if (msg.startInjection) GlobalStarter.waitForContainers()
    //         sendResponse("Dummy response to avoid console error logging")
    //     })
    // }

    static {
        const url = document.URL
        const urlType = this.getUrlType(url)
        switch (urlType) {
            case "fileLawsuitUrl":
            case "uploadPage":
                const formElement = document.querySelector("#formUpload")
                this.prepareInject(formElement, document, "dragDropDiv")
                break;
            case "lawSuitHomePage":
                let arquivosDiv = document.querySelector("#Arquivos")
                this.prepareInject(arquivosDiv, document, "peticionarButton")        
                break;
        }
    }
    
    static getUrlType(url) {
        const urls = {
            uploadUrl: "projudi.tjba.jus.br/projudi/movimentacao/Peticionar?numeroProcesso=",
            lawsuitHomeUrl: "projudi.tjba.jus.br/projudi/listagens/DadosProcesso?numeroProcesso=",
            lawsuitHomeAfterUpload: "projudi.tjba.jus.br/projudi/movimentacao/Peticionar",
            fileLawsuitUrl: "projudi.tjba.jus.br/projudi/movimentacao/PeticaoInicial"
        }

        if (url.indexOf(urls.uploadUrl) != -1) {
            return "uploadPage"
        } else if (url.indexOf(urls.lawsuitHomeUrl) != -1) {
            return "lawSuitHomePage"
        } else if (url.indexOf(urls.lawsuitHomeAfterUpload) != -1) {
            return "lawSuitHomePage"
        } else if (url.indexOf(urls.fileLawsuitUrl) != -1) {
            return "fileLawsuitUrl"
        } else {
            return null
        }        
    }

    static waitForContainers() {
        console.log(document.URL)
        let params = {
            j: 0,
            peticionarParentForm: null,
            capaProcessoArquivosDiv: null,
            parentDoc: null
        }
        
        var elementWait = setInterval((params) => {
            params.peticionarParentForm = document.querySelector("[name=mainFrame]")
                ?.contentDocument.querySelector("#userMainFrame")
                ?.contentDocument.querySelector("#formUpload")
            params.capaProcessoArquivosDiv = document.querySelector("[name=mainFrame]")
                ?.contentDocument.querySelector("#userMainFrame")
                ?.contentDocument.querySelector("#Arquivos")
            params.j++
            
            
            if (params.peticionarParentForm || params.capaProcessoArquivosDiv) {
                clearInterval(elementWait)
                params.parentDoc = document.querySelector("[name=mainFrame]")
                    .contentDocument.querySelector("#userMainFrame").contentDocument
            }
            if (params.peticionarParentForm) GlobalStarter.prepareInject(params.peticionarParentForm, params.parentDoc, "dragDropDiv")
            if (params.capaProcessoArquivosDiv) GlobalStarter.prepareInject(params.capaProcessoArquivosDiv, params.parentDoc, "peticionarButton")
            if(params.j > 50) clearInterval(elementWait); // 50 iterations = 10 seconds

        }, 200, params)
    }

    static prepareInject(parentElement, parentDoc, injectType) {
        let proproElement = parentDoc.querySelector("[Propro]")
        if(!parentElement || proproElement) return
        
        // const sfCss = document.createElement("link")
        // sfCss.rel = "stylesheet"
        // sfCss.type = "text/css"
        // sfCss.href = "./ssf-styles.css"
        // parentDoc.head.appendChild(sfCss)
        
        switch (injectType) {
            case "dragDropDiv":
                this.injectDragndropDiv(parentElement)
                break
            case "peticionarButton":
                this.injectPeticionarButton(parentElement)
                break
        }
    }
                
    static injectPeticionarButton(arquivosDiv) {
        const partesDiv = arquivosDiv.parentElement.querySelector("#Partes")
        const idProc = this.getIdProc(partesDiv)
        if(!idProc) return
        const parentP = partesDiv.parentElement.querySelector("div#Partes ~ div > p")
        const petLink = document.createElement("a")
        petLink.toggleAttribute("Propro")
        petLink.setAttribute("class", "sfPetLink")
        petLink.href = "/projudi/movimentacao/Peticionar?numeroProcesso=" + idProc + "&ehPeticionar=s"
        petLink.innerText = "Peticionar"
        parentP.appendChild(petLink)
    }

    static getIdProc(partesDiv) {
        const uriQuerystringNumProcIdentifier = "numeroProcesso="
        const procLink = partesDiv.getElementsByTagName("a")[0]
        const linkUri = procLink.href
        const idProcPosition = linkUri.search(uriQuerystringNumProcIdentifier) + uriQuerystringNumProcIdentifier.length
        return linkUri.substr(idProcPosition)
    }

    static injectDragndropDiv(parentForm) {
        const dropDiv = document.createElement("div")
        dropDiv.toggleAttribute("Propro")
        dropDiv.classList.add("sfDropDiv")
        parentForm.parentNode.insertBefore(dropDiv, parentForm)
        
        const mainText = document.createElement("div")
        mainText.innerText = "Arraste os arquivos para cá"
        dropDiv.appendChild(mainText)
        
        const textSubDiv = document.createElement("div")
        textSubDiv.classList.add("sfSubTextDiv")
        textSubDiv.innerHTML = "Evitemos excesso de anexos: o essencial pode passar despercebido<br />" +
        "Sejamos éticos e responsáveis: falar a verdade é o primeiro passo para uma sociedade sadia"
        dropDiv.appendChild(textSubDiv)

        const blankSpan = document.createElement("span")
        blankSpan.classList.add("movingBorder")
        for(let i = 1; i <= 4; i++){
            dropDiv.appendChild(blankSpan.cloneNode())
        }

        dropDiv.addEventListener('dragover', (e) => {
            e.preventDefault()
            dropDiv.style.backgroundColor = "#09447280"
        })
            
        dropDiv.addEventListener('dragleave', () => {
            dropDiv.removeAttribute("style")
        })
        
        dropDiv.addEventListener('drop', (e) => {
            e.preventDefault()
            dropDiv.removeAttribute("style")
            const draggedFiles = e.dataTransfer.files
            const fParser = new FileParser(draggedFiles)
            const finalFiles = fParser.parsedFiles
            if(finalFiles.length > 0) {
                const fInjector = new FileInjector(finalFiles, parentForm)
                fInjector.injectFilesToProjudi(dropDiv)
            } else {
                alert("Nenhum arquivo válido selecionado.")
            }
        })
    }
}