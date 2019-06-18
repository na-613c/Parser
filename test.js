// let vacancy = "write";

// const fs = require("fs");


// fs.writeFile("asynchronous.txt", vacancy);// асинхронный вариант
// fs.writeFileSync("synchronous.txt", vacancy);// синхронный вариант


var fs = require('fs')
var logger = fs.createWriteStream('parser/log.txt', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})

logger.write('some data') 