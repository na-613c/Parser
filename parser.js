let fetch = require("node-fetch");
let cheerio = require("cheerio");


for (let i = 0; i < 1; i++) {
  let url = "https://jobs.tut.by/vacancies/programmist/page-" + i;
  parserPage(url);
}


function parserPage(url) {

  fetch(url)
    .then(function (response) {
      if (response.status !== 200) {
        return Promise.reject(new Error(response.statusText));
      }
      return Promise.resolve(response);
    })
    .then(function (response) {
      return response.text();
    })

    .then(function (body) {
      let $ = cheerio.load(body);

      $(".resume-search-item__name").each((i, el) => {
        fetch($(el).find("a").attr("href"))

          .then(function (response) {
            if (response.status !== 200) {
              return Promise.reject(new Error(response.statusText));
            }
            return Promise.resolve(response);
          })
          .then(function (response) {
            return response.text();

          })

          .then(function (body) {

            let $ = cheerio.load(body),
              job = $("h1.header").text(),
              pay = $("p.vacancy-salary").text(),
              company = $("span[itemprop = 'name']").text(),
              location = $("span[data-qa = 'vacancy-view-raw-address']").text(),
              experience = $("span[data-qa = 'vacancy-experience']").text(),
              employment = $("p[data-qa = 'vacancy-view-employment-mode']").text();


            console.log("работа " + job +
              "; ЗП " + pay +
              "; компания " + company +
              "; расположение " + location +
              "; опыт " + experience +
              "; занятость " + employment +
              "\n");

            let jobInJson = {
              Job: job,
              Pay: pay,
              Company: company,
              Location: location,
              Experience: experience,
              Employment: employment
            }

            let vacancy = JSON.stringify(jobInJson);
            writeInFile(vacancy);
          })
          .catch(function (error) {
            console.log("job reference error: " + error);
          });
      })
    })

    .catch(function (error) {
      console.log("error on " + url + " : " + error);
    });
}

function writeInFile(vacancy) {
  var fs = require('fs')
  var logger = fs.createWriteStream("jobs.json", {
    flags: 'a'
  })

  logger.write(vacancy + ",");
}