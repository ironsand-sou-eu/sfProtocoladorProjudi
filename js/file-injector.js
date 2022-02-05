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