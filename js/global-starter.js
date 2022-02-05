class GlobalStarter {
    static {
        chrome.runtime.onMessage.addListener( (msg, sender, sendResponse) => {
            if (msg.startInjection) GlobalStarter.waitForContainers()
            sendResponse("Dummy response to avoid console error logging")
        })
    }

    static waitForContainers() {
        console.log("oi")
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
        
        const sfCss = document.createElement("link")
        sfCss.rel = "stylesheet"
        sfCss.type = "text/css"
        sfCss.href = "ssf-styles.css"
        parentDoc.head.appendChild(sfCss)
        
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

        const petLink = document.createElement("a")
        petLink.toggleAttribute("Propro")
        petLink.setAttribute("class", "sfPetLink")
        petLink.href = "/projudi/movimentacao/Peticionar?numeroProcesso=" + idProc + "&ehPeticionar=s"
        petLink.innerText = "Peticionar"
        const parentP = partesDiv.parentElement.querySelector("div#Partes~p")
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