#!/usr/bin/env node
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

import axios from "axios";
import moment = require("moment");
import cheerio = require("cheerio");
import crypto = require("crypto")
const fs = require('fs').promises;



class parsingText {

    textInside: string = ''
    arrayOfUrls: string[] = []

    checkInput() {

        if (process.argv.length < 3) {
            console.log('Please input: parsetext + FILENAME');
            process.exit(1);
        }

    }

    async readFile(filePath: string) {
        try {
            this.textInside = await fs.readFile(filePath, 'utf8')
            console.log(this.textInside)

        } catch (e) {
            console.log(e)
            process.exit(1);
        }
        this.findUrl()

        await this.parseUrlResponse()
    }

    async secondsTimeout(ms: number | undefined) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
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

    encryptEmail(email:string) {

        const secret = process.env.IM_SECRET
        // @ts-ignore
        let hashValue = crypto.createHash('sha256', secret)
            .update(email)
            .digest('hex');

        return hashValue
    }

    async parseUrlResponse() {
        const arr: string[] = this.arrayOfUrls

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
                    let encryptedEmail:string = ''


                    if(email[0]){
                       encryptedEmail = this.encryptEmail(email[0])
                    }

                    let pageInformations: any = {
                        url: url,
                        title: title || undefined,
                        email: encryptedEmail  || undefined
                    }
                    console.log(pageInformations)
                }
            },(error)=>{
                console.log(error)
            })
            if(loadTime < 1000){
                await this.secondsTimeout(1000 - loadTime)
            }
        }
    }
}

const fileHandle: parsingText = new parsingText();

fileHandle.checkInput()

fileHandle.readFile(process.argv[2])
