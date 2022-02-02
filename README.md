#!/usr/bin/env node
import axios from "axios";
import moment = require("moment");
import cheerio = require("cheerio")




class parsingText {

    textInside: string = ' \\[r323r2\\[qrwxdar [bbbbbbbbb]www.net.hr] cxbdbv[aaaaaaaa]few324] dfhdfx []\n' +
        '45bt\\[asdwdwa www.tibia.com 4575z5!"$&/$"#8] 43ft3g[www.wikipedia.com[asyf]23f]tsdf www.24sata.hr\n' +
        '56h464 [ www.njuskalo.hr 342f3o4g 9f www.imdb.com]\n' +
        '35f8 [adfgtwe0 [www.njuskalo.hr] www.myanimelist.net] 3r3f4f343g56[3e432e4 www.imdb.com 43uf]\n' +
        'afsdg78ht9 fst838gs 9j34 www.google.com\n' +
        'r3bz7 [www.wikipedia.com dfswrq  www.ebay.com]fasdg\\[www.jamnica.hr]fsdg [www.24sata.hr]\n' +
        'r3bz7 [www.adm.hr]fasdg\\[aaaaaaaaaaaaaa[www.jamnica.hr]fsdg [www.24sata.hr]bbbbbbbbb]'
    arrayOfUrls: string[] = []


    async readFile() {

        this.findUrl()
        await this.parseUrlResponse()
    }


    findUrl() {


        let temporaryUrls: string[] = []
        let stateOfOpenBracket: number = 0
        let isBackSlashBeforeBracket: boolean = false
        let temporaryString: string = ''


        for(let i = 0; i < this.textInside.length - 1; i++){

            let character: any = this.textInside.charAt(i)

            if(character==='\\' && stateOfOpenBracket === 0){
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
                        if(!this.arrayOfUrls.includes(temporaryUrls[temporaryUrls.length-1]))
                        this.arrayOfUrls.push(temporaryUrls[temporaryUrls.length-1])
                        temporaryUrls = []
                    }
                }
                stateOfOpenBracket--
            }

        }
        console.log(this.arrayOfUrls)
    }
    async parseUrlResponse() {
        const arr: string[] = this.arrayOfUrls
        let htmlFromResponse: string[] = []

        for (let data of arr) {
            let loadTime:number = 0
            const beforeGet: number = moment.now()
            await axios.get("https://" + data).then((response) =>{
                console.log(response)
                loadTime = moment().diff(beforeGet)
                console.log(loadTime)
                if(response.status === 200){
                    let url: string = data
                    let title: string = cheerio.load(response.data)('title').text()
                    let stringifiedData: string = response.data.toString()
                    let email: RegExpMatchArray = stringifiedData.match(/[a-z0-9A-Z]+\.?[a-z0-9A-Z]+@[a-z0-9A-Z]+\.[a-z0-9A-Z]+/) || []
                    htmlFromResponse.push(response.data)
                    console.log(title)
                    console.log(url)
                    console.log(email[0])
                }
            },(error)=>{
                console.log(error)
            })
            if(loadTime < 1000){
                await this.secondsTimeout(1000 - loadTime)
            }
        }
    }
    async secondsTimeout(ms: number | undefined) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
    }
}

const fileHandle: parsingText = new parsingText();


fileHandle.readFile()
