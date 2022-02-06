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


    // Checks input for file or for input through the terminal
    checkInput() {

        if (process.argv.length < 3) {
            console.log('Please input: text you want to parse fo urls');
            process.stdin.on('data', (chunk) => {
                this.textInside += chunk;
                this.readInput()
            });

        }
        if(process.argv[2]){
            fileHandle.readFile(process.argv[2])
        }

    }

    // main function to start reading file
    async readFile(filePath: string) {
        try {
            this.textInside = await fs.readFile(filePath, 'utf8')

        } catch (e) {
            console.log(e)
            process.exit(1);
        }
        this.findUrl()

        await this.getResponse()
    }

    async readInput() {
        this.findUrl()

        await this.getResponse()
    }


    // timer async function, needs to be awaited
    async secondsTimeout(ms: number | undefined) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
    }

    // this functions parses text file and searches for urls inside it
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
                    let foundUrl:string[] | null = temporaryString.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/i)

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

    }

    // encrypt found email into hexadecimal hash
    encryptEmail(email:string) {

        const secret = process.env.IM_SECRET
        // @ts-ignore
        let hashValue = crypto.createHash('sha256', secret)
            .update(email)
            .digest('hex');

        return hashValue
    }

    // for given array of urls gets webpages data
    async getResponse() {
        const arr: string[] = this.arrayOfUrls

        if(arr.length === 0 && process.argv[2]){
            console.log(`No web pages found in file : ${process.argv[2]}`)
        }

        for (let urlAddress of arr) {

            let loadTime:number = 0
            const beforeGet: number = moment.now()

            await axios.get("https://" + urlAddress).then((response) =>{

                const afterGet:any = moment.now()

                loadTime = moment(afterGet).diff(beforeGet)

                if(response.status === 200){

                    this.parseUrlResponse(urlAddress, response.data)
                }

            },(error)=>{

                this.tryUrlAgain(urlAddress)
            })

            if(loadTime < 1000){
                await this.secondsTimeout(1000 - loadTime)
            }
        }
    }

    // writes stdout in terminal for given url
    async parseUrlResponse(urlAddress: string, dataFromResponse: string | cheerio.Node | cheerio.Node[] | Buffer){

        let url: string = urlAddress
        let title: string = cheerio.load(dataFromResponse)('title').text()
        let stringifiedData: string = dataFromResponse.toString()
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
        this.outputResponse(pageInformations)

    }

    // print parsed page information in terminal

    outputResponse(pageInformations: any){
      //  if(process.argv[2]){
            process.stdout.write(JSON.stringify(pageInformations,null, )+ "\n")
  //      }

    }

    // this function is called when we cannot get status 200 from the response
    // it makes second request after 60 seconds and if it doesn't succeed print error in stderr
    async tryUrlAgain(urlAddress:string){

        await this.secondsTimeout(60000)
        let loadTime:number = 0
        const beforeGet: number = moment.now()

        await axios.get("https://" + urlAddress).then((response) =>{

            const afterGet:any = moment.now()

            loadTime = moment(afterGet).diff(beforeGet)

            if(response.status === 200){

                this.parseUrlResponse(urlAddress, response.data)
            }

        },(error)=>{
            process.stderr.write(error.message+ "\n")

        })
        if(loadTime < 1000){
            await this.secondsTimeout(1000 - loadTime)
        }

    }

}

const fileHandle: parsingText = new parsingText();

fileHandle.checkInput()



