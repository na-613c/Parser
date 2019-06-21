let fetch = require("node-fetch");
let cheerio = require("cheerio");

const obj = {
  arr: []
};


let startUrl = "https://jobs.tut.by/search/resume?L_is_autosearch=false&area=1002&clusters=true&currency_code=BYR&exp_period=all_time&logic=normal&no_magic=false&order_by=relevance&pos=full_text&text=&page=";

  let url = startUrl + "0";
  parserPage(url);



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

      $(".resume-search-item__header").each((i, el) => {
        let newUrl = $(el).find("a").attr("href");
        
        
        fetch("https://jobs.tut.by" + newUrl)

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
              pay = $("span[data-qa = 'resume-block-salary']").text(),
              hobby = $("span[data-qa = 'resume-block-specialization-category']").text(),
              gender = $("span[data-qa = 'resume-personal-gender']").text(),
              age = $("span[data-qa ='resume-personal-age']").text(),
              location = $("span[itemprop  = 'addressLocality'][data-qa ='resume-personal-address']").text(),
              about = $(".resume-block-container").text();

              
            let jobInJson = {job,pay,hobby,gender,age,location};

            obj.arr.push({ jobInJson });

            let vacancy = JSON.stringify(obj);
            writeInFile(vacancy);
          })
          .catch(function (error) {
            console.log("job reference error: " + error);
          });
      })

      $("a[data-qa='pager-next']").each((i, el) => {
        nextPageUrl = "https://jobs.tut.by" + $("a.bloko-button.HH-Pager-Controls-Next.HH-Pager-Control[data-qa='pager-next']").attr("href");
        console.log("Переход по ссылке "+ nextPageUrl);
        parserPage(nextPageUrl);
    });

    })

    .catch(function (error) {
      console.log("error on " + url + " : " + error);
    });
}

function writeInFile(vacancy) {
  var fs = require('fs')
  fs.writeFileSync('jobs.json', vacancy);
}





