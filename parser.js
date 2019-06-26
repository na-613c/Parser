const tress = require('tress');
const needle = require('needle');
const fs = require('fs');
const DomParser = require('dom-parser');
const parser = new DomParser();

const startPageForParsing = 0;
let URL = `https://jobs.tut.by/search/resume?L_is_autosearch=false&area=1002&clusters=true&currency_code=BYR&exp_period=all_time&logic=normal&no_magic=false&order_by=relevance&pos=full_text&text=&page=${startPageForParsing}`;
const results = [];

const writeInFile = (vacancy) => {
    fs.writeFileSync('jobs.json', vacancy);
}

const mainPage = tress((url, callback) => {
    needle.get(url, (err, res) => {
        if (err) throw err;

        // парсим DOM
        const doc = parser.parseFromString(res.body);
        console.log(`Link ${URL}  processed!`);

        //информация о резюме
        const resumeOnMainPage = (doc) => {
            const resumeUrl = doc.getElementsByClassName('resume-search-item__name');
            const resumeArray = Array.from(resumeUrl);
            resumeArray.forEach((resumeUrl) => {
                const newResumeUrl = resumeUrl.getAttribute('href');
                parserPage.push(`https://jobs.tut.by${newResumeUrl}`);
            })
        }

        //переход
        const movingOnPage = (doc) => {
            const nextPage = doc.getElementsByClassName('bloko-button.HH-Pager-Controls-Next');
            const resumeArray = Array.from(nextPage);
            resumeArray.forEach((nextPage) => {
                const nextPageUrl = nextPage.getAttribute('href');
                URL = (`https://jobs.tut.by${nextPageUrl}`).trim();
                mainPage.push(URL);
            })
        }

        resumeOnMainPage(doc);
        movingOnPage(doc);
        callback();
    });
}, 10); // запускаем 10 параллельных потоков

const parserPage = tress((url, callback) => {
    needle.get(url, (err, res) => {
        if (err) throw err;

        // парсим DOM
        const doc = parser.parseFromString(res.body);
        // JOB
        const jobElement = doc.getElementsByClassName('resume-block__title-text');
        const jobArray = [];
        const jobCollection = Array.from(jobElement);
        jobCollection.forEach((jobElement) => {
            jobArray.push(jobElement.innerHTML);
        });
        let job = jobArray[0];
        //   PAY
        const payElement = doc.getElementsByClassName('resume-block__title-text_salary');
        const payArray = [];
        const payCollection = Array.from(payElement);
        payCollection.forEach((payElement) => {
            payArray.push(payElement.innerHTML);
        })
        let pay = payArray[0];
        //  OTHER
        const aboutElement = doc.getElementsByClassName('resume-header-block');
        const aboutArray = [];
        const aboutCollection = Array.from(aboutElement);
        aboutCollection.forEach((aboutElement) => {
            const regExp = /<!-- -->/g;
            aboutArray.push(aboutElement.textContent.replace(regExp, ""));
        })

        let about = aboutArray[0];
        about = about.split(', ');
        const genderAndAge = about.splice(0, 2);

        let local = about.splice(0, 1);
        local = local.join(',');
        let counter = 0;
        let maxIndex = 0;

        const searchIdCity = (local, counter) => {
            const number = local.lastIndexOf(counter);
            if (maxIndex < number) maxIndex = number;
            counter++;
            if (counter < 10) searchIdCity(local, counter, maxIndex);
        }

        searchIdCity(local, counter, maxIndex);

        if (maxIndex != 0) maxIndex++;

        let location = `${local.slice(maxIndex)}, ${about}`,
            gender = genderAndAge[0],
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

        const vacancy = JSON.stringify(results);

        writeInFile(vacancy);
        callback();
    });
}, 20); // запускаем 20 параллельных потоков

mainPage.push(URL);