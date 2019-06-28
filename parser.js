const tress = require('tress');
const needle = require('needle');
const fs = require('fs');
const DomParser = require('dom-parser');
const parser = new DomParser();
const timeStart = new Date();

const startPageForParsing = 0;
let URL = `https://jobs.tut.by/search/resume?L_is_autosearch=false&area=1002&clusters=true&currency_code=BYR&exp_period=all_time&logic=normal&no_magic=false&order_by=relevance&pos=full_text&text=&page=${startPageForParsing}`;
const results = [];

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
                let urlResumePage = `https://jobs.tut.by${newResumeUrl}`
                parserPage.push(urlResumePage);
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
}, 20); // запускаем 20 параллельных потоков

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
        let about = (aboutArray[0]).split(', ');
        const genderAndAge = about.splice(0, 2);
        let city = (about.splice(0, 1)).join(',');
        let counter = 0;
        let maxIndex = 0;

        const searchIdCity = (city, counter) => {
            const number = city.lastIndexOf(counter);
            if (maxIndex < number) maxIndex = number;
            counter++;
            if (counter < 10) searchIdCity(city, counter, maxIndex);
        }

        searchIdCity(city, counter, maxIndex);

        if (maxIndex != 0) maxIndex++;

        let location = `${city.slice(maxIndex)}, ${about}`,
            gender = genderAndAge[0],
            age = genderAndAge[1],
            emptyLine = "не указано";

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
        callback();
    });
}, 20); // запускаем 20 параллельных потоков

mainPage.drain = function () {
    parserPage.drain = function () {
        console.log("Начало записи в jobs.json")
        fs.writeFileSync('jobs.json', JSON.stringify(results, null, 4));

        const timeEnd = new Date();
        let workSecond = timeEnd.getSeconds() - timeStart.getSeconds();
        let workMinutes = timeEnd.getMinutes() - timeStart.getMinutes();
        let workHours = timeEnd.getHours() - timeStart.getHours();
        if (workSecond < 0) {
            workMinutes--;
            workSecond += 60;
        }
        if (workMinutes < 0) {
            workHours--;
            workMinutes += 60;
        }
        console.log(`Время выполнения ${workHours} часов, ${workMinutes} минут, ${workSecond} секунд.`);
    }
}

mainPage.push(URL);

