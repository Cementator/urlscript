class printmessage {

    text:string = "Sabaton!"

    displayMessage(message) {
        console.log(message)
        return

    }
}

const message:printmessage = new printmessage();

message.displayMessage(message.text)

