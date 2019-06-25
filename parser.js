var tress = require('tress');
var needle = require('needle');
var fs = require('fs');
var DomParser = require('dom-parser');
var parser = new DomParser();

let startPageForParsing = 249;
var URL = 'https://jobs.tut.by/search/resume?L_is_autosearch=false&area=1002&clusters=true&currency_code=BYR&exp_period=all_time&logic=normal&no_magic=false&order_by=relevance&pos=full_text&text=&page='+startPageForParsing;
var results = [];


let q = tress(function (url, callback) {
    needle.get(url, function (err, res) {
        if (err) throw err;

        // парсим DOM
        const doc = parser.parseFromString(res.body); 
        console.log("URL = " + URL);

        resumeOnMainPage(doc);
        movingOnPage(doc);


        //информация о резюме
        function resumeOnMainPage(doc){
            const resumeUrl = doc.getElementsByClassName('resume-search-item__name'); 
            const resumeArray = Array.from(resumeUrl); 
            resumeArray.forEach((resumeUrl) => { 
            let newResumeUrl = resumeUrl.getAttribute('href'); 
                parserPage.push("https://jobs.tut.by" + newResumeUrl); 
            })
        }


        //переход
        function movingOnPage(doc){
            const nextPage = doc.getElementsByClassName('bloko-button.HH-Pager-Controls-Next'); 
            const resumeArray = Array.from(nextPage); 
            resumeArray.forEach((nextPage) => { 
            let nextPageUrl = nextPage.getAttribute('href'); 
            URL = ("https://jobs.tut.by" + nextPageUrl).trim();
            console.log(URL);
            q.push(URL);
            })
        }
        callback();
    });
}, 10); // запускаем 10 параллельных потоков

let parserPage = tress(function (url, callback) {
    needle.get(url, function (err, res) {
        if (err) throw err;

        // парсим DOM
        const doc = parser.parseFromString(res.body); 
        // JOB
            let jobElement = doc.getElementsByClassName('resume-block__title-text');
            const jobArray = [];
            let jobCollection = Array.from(jobElement);
            jobCollection.forEach((jobElement) => {jobArray.push(jobElement.innerHTML);})
            let job = jobArray[0];
        //   PAY
            let payElement = doc.getElementsByClassName('resume-block__title-text_salary');
            const payArray = [];
            let payCollection = Array.from(payElement);
            payCollection.forEach((payElement) => {payArray.push(payElement.innerHTML);})
            let pay = payArray[0];
        // GENDER
        let aboutElement = doc.getElementsByClassName('resume-header-block');
        const aboutArray = [];
        let aboutCollection = Array.from(aboutElement);
        aboutCollection.forEach((aboutElement) => {
            let regExp = /<!-- -->|(|)|/g;
            
            aboutArray.push(aboutElement.textContent.replace(regExp,""));
        })
        
        let about = aboutArray[0];
        about = about.split(', ');
        let genderAndAge = about.splice(0, 2);
        
        let local = about.splice(0, 1);
        local = local.join(',');
        number = local.lastIndexOf(1||2);

        
        let location = local.slice(number+4) + ", " + about;
            console.log("Cтрока = "+location+' ___||||___ ' + local+" ");

        let gender = genderAndAge[0],
            age = genderAndAge[1],
            
            emptyLine = "не указанно";

            



        switch (undefined) {
            case (job): job = emptyLine;
                break;
            case (pay): pay = emptyLine;
                break;
            case (gender): gender = emptyLine;
                break;
            case (age): age = emptyLine;
                break;
            case (location): location = emptyLine;
                break;
        }

        results.push({ job, pay, gender, age, location, url });

        let vacancy = JSON.stringify(results);
        writeInFile(vacancy);

        callback();
    });
}, 20); // запускаем 20 параллельных потоков

function writeInFile(vacancy) {
    fs.writeFileSync('jobs.json', vacancy);
}

q.push(URL);
