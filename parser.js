const fetch = require("node-fetch");
const cheerio = require("cheerio");
const generalUrl = "https://jobs.tut.by/search/resume?L_is_autosearch=false&area=1002&clusters=true&currency_code=BYR&exp_period=all_time&logic=normal&no_magic=false&order_by=relevance&pos=full_text&text=&page=";
const parsingStartPage = "248";
const startUrl = generalUrl + parsingStartPage;
const obj = { arrayOfWorkers: [] };

parserPage(startUrl, err, text, catchErr);

function err(response) {
  if (response.status !== 200) {
    return Promise.reject(new Error(response.statusText));
  }
  return Promise.resolve(response);
}

function text(response) {
  return response.text();
}

function catchErr(error) {
  console.log("error on " + startUrl + " : " + error);
}

function writeInFile(vacancy) {
  const fs = require('fs');
  fs.writeFileSync('jobs.json', vacancy);
}

function parserPage(url, err, text, catchErr) {
  fetch(url)
    .then(err)
    .then(text)
    .then(function (body) {
      let $ = cheerio.load(body);

      $(".resume-search-item__header").each((i, el) => {
        let newUrl = $(el).find("a").attr("href");
        let url = "https://jobs.tut.by" + newUrl;

        fetch(url)
          .then(err)
          .then(text)
          .then(function (body) {
            let $ = cheerio.load(body),
              job = $("h1.header").text(),
              pay = $("span[data-qa = 'resume-block-salary']").text(),
              // about = $("span[data-qa = 'resume-block-specialization-category']").text(),
              about = $("div.resume-block-container[data-qa='resume-block-skills-content']").text().replace(/||\r?\n/g, ""),
              gender = $("span[data-qa = 'resume-personal-gender']").text(),
              age = $("span[data-qa ='resume-personal-age']").text(),
              location = $("span[itemprop  = 'addressLocality'][data-qa ='resume-personal-address']").text(),
              emptyLine = "не указанно";

            switch ("") {
              case (job): job = emptyLine;
                break;
              case (pay): pay = emptyLine;
                break;
              case (about): about = emptyLine;
                break;
              case (gender): gender = emptyLine;
                break;
              case (age): age = emptyLine;
                break;
              case (location): location = emptyLine;
                break;
            }

            obj.arrayOfWorkers.push({ job, pay, gender, age, location,about , url });

            let vacancy = JSON.stringify(obj);
            writeInFile(vacancy);
          })
          .catch(catchErr);
      })

      $("a[data-qa='pager-next']").each((i, el) => {
        nextPageUrl = "https://jobs.tut.by" + $("a.bloko-button.HH-Pager-Controls-Next.HH-Pager-Control[data-qa='pager-next']").attr("href");
        console.log("Переход по ссылке " + nextPageUrl);
        parserPage(nextPageUrl, err, text, catchErr);
      });
    })
    .catch(catchErr);
}

