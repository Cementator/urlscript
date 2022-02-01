# urlscript
Node script for reading urls

    findUrl() {

        let arrayOfUrls: string[] = []
        let temporaryUrls: string[] = []
        let stateOfOpenBracket: number = 0
        let isBackSlashBeforeBracket: boolean = false
        let temporaryString: string = ''


        for(let i = 0; i < this.textInside.length - 1; i++){

            let character: any = this.textInside.charAt(i)

            if(character==='\\'){
                temporaryString = temporaryString.concat(character)
            }

            if(stateOfOpenBracket === 1 && isBackSlashBeforeBracket === false){
                if(character ===']'|| character ==='[' || character === ' ' || character === /\r/ || character === /\n/){
                    let foundUrl:string[] | null = temporaryString.match(/www\.[a-z0-9A-Z]+\.[a-z0-9-A-Z]+/)

                    if(foundUrl !== null) {
                        temporaryUrls.push(foundUrl[0])
                    }
                    temporaryString = ''

                }
                if((character !== '['&& character !== "]") && (character !== /\r/ && character !== /\n/) && (character !== ' ' && character !== '\\')){
                    temporaryString = temporaryString.concat(character)
                }

            }

            if(character === '['){
                if(stateOfOpenBracket === 0){
                    if(temporaryString.charAt(temporaryString.length-1) === '\\') {
                        isBackSlashBeforeBracket = true
                        temporaryString = ''
                    }
                }
                stateOfOpenBracket++
            }
            else if(character === ']'){
                if(stateOfOpenBracket === 1){
                    isBackSlashBeforeBracket = false
                    if(temporaryUrls.length > 0){
                        arrayOfUrls.push(temporaryUrls[temporaryUrls.length-1])
                        temporaryUrls = []
                    }
                }
                stateOfOpenBracket--
            }

        }
        console.log(arrayOfUrls)
    }
