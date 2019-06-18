var needle = require("needle");
var cheerio = require("cheerio");
var async = require("async");

var aUrl = [];
// aUrl[0] = "https://jobs.tut.by/vacancies/programmist/page-1";
// aUrl[1] = "https://jobs.tut.by/vacancies/programmist/page-2";
// aUrl[2] = "https://jobs.tut.by/vacancies/programmist/page-3";

aUrl[0] = "https://runningdeath.000webhostapp.com/macro.html";


var q = async.queue(function(url){
        needle.get(url,function(err,res){
        if(err) throw(err);
        
        var $ = cheerio.load(res.body);
        
        // console.log($(".bloko-link HH-LinkModifier").text());
        console.log($(".code").text());


        // img = $(".img-thumb-item img");
        // 
        // img.each(function(i,val){
        //     console.log($(val).attr("src").replace("50x50","640x640"));
        //     });
        
        });
    },10);

var i = 0;
while(aUrl.length > i)
{
    q.push(aUrl[i]);
    i++;
}
