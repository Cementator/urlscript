#!/usr/bin/env node
import axios from "axios";

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

        for (let data of arr) {
            await axios.get("https://" + data).then((response) =>{
                console.log(response)
            },(error)=>{
                console.log(error)
            })
            await this.secondsTimeout(1000)
        }
    }
}

const fileHandle: parsingText = new parsingText();

fileHandle.checkInput()

fileHandle.readFile(process.argv[2])



// fileHandle.findUrl()





// let firstSplit:string[] = row.split(/\\\[[^\]]*\]/)
//     for (let textNoSlash of firstSplit){
//         textNoSlash.search(/\]/)
//         let openBracketArray = textNoSlash.match(/\[/g)
//         let closedBracketArray = textNoSlash.match(/\]/g)
//         let openBracket = openBracketArray?openBracketArray.length : 0
//         let closedBracket = closedBracketArray?closedBracketArray.length : 0
//         if(closedBracket>openBracket){
//         return
//         } else {
//             let textInsideBracket = textNoSlash.match(/\[[^]*\]/)
//             if(textInsideBracket !==null){
//                 let a= textInsideBracket[0].match(/www\.[a-z0-9A-Z]+\./g)
//                 let blabla = textInsideBracket[0].match(/\][^\[\]]*\[/g)
//                 console.log(textInsideBracket)
//                 console.log(blabla)
//                 if(blabla!==null){
//                     for(let betweenBrackets of blabla){
//                         // let removeBetween:any = textInsideBracket[0].match(`/\[[[^]${betweenBrackets}[^]]\]/`)
//                         let removeBetween:any = textInsideBracket[0].search(`${betweenBrackets.substring(1,betweenBrackets.length-1)}`)
//                         while ((indexOftext= (/\[/g).exec(textInsideBracket[0]))!==null)
//                         console.log(indexof)
//                         console.log(removeBetween)
//                     }
//                 }
//
//
//             }
//
//         }
//
// }

//let blabla = firstArray[0].match(/\][^]*\[/)


// console.log(firstArray[0].split(blabla[0].substring(1, blabla[0].length-1)))
// row.search(/\[/g)
//  console.log(row.match(/\[[^]*\]/g))