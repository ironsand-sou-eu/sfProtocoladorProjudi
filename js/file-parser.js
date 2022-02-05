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