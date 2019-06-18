let needle = require("needle");
let cheerio = require("cheerio");
let async = require("async");

let aUrl = [];
let j = 0;
let max = 56



let q = async.queue(function(url){
    
        needle.get(url,function(err,res){
        if(err) throw(err);
        
        let $ = cheerio.load(res.body);
        
        let vacancy = "\n\nВзято с страницы " + url+"\n" + $("a.bloko-link.HH-LinkModifier").text();
        
        console.log(vacancy);
        writeInFile(vacancy);

        
        });
    },max);



for(max ; max > j; j++ ){
    aUrl[j] = "https://jobs.tut.by/vacancies/programmist/page-"+j;
    q.push(aUrl[j]);
}

function writeInFile(vacancy){
    var fs = require('fs')
var logger = fs.createWriteStream('parser/log.txt', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})

logger.write(vacancy); 
}
