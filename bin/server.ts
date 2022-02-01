var http = require('http');

http.createServer(function(request:any, response:any){

    //The following code will print out the incoming request text
    request.pipe(response);

}).listen(80, '127.0.0.1');

console.log('Listening on port 80...');