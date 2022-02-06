#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const axios_1 = __importDefault(require("axios"));
const moment = require("moment");
const cheerio = require("cheerio");
const crypto = require("crypto");
const fs = require('fs').promises;
class parsingText {
    constructor() {
        this.textInside = '';
        this.arrayOfUrls = [];
    }
    // Checks input for file or for input through the terminal
    checkInput() {
        if (process.argv.length < 3) {
            console.log('Please input: text you want to parse fo urls');
            process.stdin.on('data', (chunk) => {
                this.textInside += chunk;
                this.readInput();
            });
        }
        if (process.argv[2]) {
            fileHandle.readFile(process.argv[2]);
        }
    }
    // main function to start reading file
    readFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.textInside = yield fs.readFile(filePath, 'utf8');
            }
            catch (e) {
                console.log(e);
                process.exit(1);
            }
            this.findUrl();
            yield this.getResponse();
        });
    }
    readInput() {
        return __awaiter(this, void 0, void 0, function* () {
            this.findUrl();
            yield this.getResponse();
        });
    }
    // timer async function, needs to be awaited
    secondsTimeout(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        });
    }
    // this functions parses text file and searches for urls inside it
    findUrl() {
        let temporaryUrls = [];
        let stateOfOpenBracket = 0;
        let isBackSlashBeforeBracket = false;
        let temporaryString = '';
        for (let i = 0; i < this.textInside.length - 1; i++) {
            let character = this.textInside.charAt(i);
            if (character === '\\' && stateOfOpenBracket === 0) {
                temporaryString = temporaryString.concat(character);
            }
            if (stateOfOpenBracket === 1 && isBackSlashBeforeBracket === false) {
                if (character === ']' || character === '[' || character === ' ' || character === /\r/ || character === /\n/) {
                    let foundUrl = temporaryString.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/i);
                    if (foundUrl !== null) {
                        temporaryUrls.push(foundUrl[0]);
                    }
                    temporaryString = '';
                }
                if ((character !== '[' && character !== "]") && (character !== /\r/ && character !== /\n/) && (character !== ' ' && character !== '\\')) {
                    temporaryString = temporaryString.concat(character);
                }
            }
            if (character === '[') {
                if (stateOfOpenBracket === 0) {
                    if (temporaryString.charAt(temporaryString.length - 1) === '\\') {
                        isBackSlashBeforeBracket = true;
                        temporaryString = '';
                    }
                }
                stateOfOpenBracket++;
            }
            else if (character === ']') {
                if (stateOfOpenBracket === 1) {
                    isBackSlashBeforeBracket = false;
                    if (temporaryUrls.length > 0) {
                        if (!this.arrayOfUrls.includes(temporaryUrls[temporaryUrls.length - 1]))
                            this.arrayOfUrls.push(temporaryUrls[temporaryUrls.length - 1]);
                        temporaryUrls = [];
                    }
                }
                stateOfOpenBracket--;
            }
        }
    }
    // encrypt found email into hexadecimal hash
    encryptEmail(email) {
        const secret = process.env.IM_SECRET;
        // @ts-ignore
        let hashValue = crypto.createHash('sha256', secret)
            .update(email)
            .digest('hex');
        return hashValue;
    }
    // for given array of urls gets webpages data
    getResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            const arr = this.arrayOfUrls;
            if (arr.length === 0 && process.argv[2]) {
                console.log(`No web pages found in file : ${process.argv[2]}`);
            }
            for (let urlAddress of arr) {
                let loadTime = 0;
                const beforeGet = moment.now();
                yield axios_1.default.get("https://" + urlAddress).then((response) => {
                    const afterGet = moment.now();
                    loadTime = moment(afterGet).diff(beforeGet);
                    if (response.status === 200) {
                        this.parseUrlResponse(urlAddress, response.data);
                    }
                }, (error) => {
                    this.tryUrlAgain(urlAddress);
                });
                if (loadTime < 1000) {
                    yield this.secondsTimeout(1000 - loadTime);
                }
            }
        });
    }
    // writes stdout in terminal for given url
    parseUrlResponse(urlAddress, dataFromResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = urlAddress;
            let title = cheerio.load(dataFromResponse)('title').text();
            let stringifiedData = dataFromResponse.toString();
            let email = stringifiedData.match(/[a-z0-9A-Z]+\.?[a-z0-9A-Z]+@[a-z0-9A-Z]+\.[a-z0-9A-Z]+/) || [];
            let encryptedEmail = '';
            if (email[0]) {
                encryptedEmail = this.encryptEmail(email[0]);
            }
            let pageInformations = {
                url: url,
                title: title || undefined,
                email: encryptedEmail || undefined
            };
            this.outputResponse(pageInformations);
        });
    }
    // print parsed page information in terminal
    outputResponse(pageInformations) {
        //  if(process.argv[2]){
        process.stdout.write(JSON.stringify(pageInformations, null) + "\n");
        //      }
    }
    // this function is called when we cannot get status 200 from the response
    // it makes second request after 60 seconds and if it doesn't succeed print error in stderr
    tryUrlAgain(urlAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.secondsTimeout(60000);
            let loadTime = 0;
            const beforeGet = moment.now();
            yield axios_1.default.get("https://" + urlAddress).then((response) => {
                const afterGet = moment.now();
                loadTime = moment(afterGet).diff(beforeGet);
                if (response.status === 200) {
                    this.parseUrlResponse(urlAddress, response.data);
                }
            }, (error) => {
                process.stderr.write(error.message + "\n");
            });
            if (loadTime < 1000) {
                yield this.secondsTimeout(1000 - loadTime);
            }
        });
    }
}
const fileHandle = new parsingText();
fileHandle.checkInput();
//# sourceMappingURL=index.js.map