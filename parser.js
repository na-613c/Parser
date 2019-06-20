let fetch = require("node-fetch");
let cheerio = require("cheerio");


for (let i = 0; i < 1; i++) {
  let url = "https://jobs.tut.by/search/resume?L_is_autosearch=false&area=1002&clusters=true&currency_code=BYR&exp_period=all_time&logic=normal&no_magic=false&order_by=relevance&pos=full_text&text=&page=0";
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

      $(".resume-search-item__header").each((i, el) => {
        let newUrl = $(el).find("a").attr("href");
        console.log("https://jobs.tut.by" + newUrl);
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
              location = $("span[itemprop  = 'address']").text(),
              experience = $(".resume-block__title-text.resume-block__title-text_sub").text(),
              employment = $(".bloko-column.bloko-column_xs-4.bloko-column_s-8.bloko-column_m-9.bloko-column_l-12").text(),
              about = $(".resume-block-container").text();
              

            let jobInJson = {
              Job: job,
              Pay: pay,
              Hobby: hobby,
              Gender:gender,
              age: age,
              Location: location,
              // Experience: experience,
              // Employment: employment,
              About: about
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


  // let  content;
  // $.ajax({
  //         url: "test.txt",
  //         dataType: "text",
  //         async: true,
  //         success: function(msg){
  //           content = msg;
  //             if (content != nill){
  //               logger.write(vacancy);
  //             }else{
  //               logger.write("," + vacancy);
  //             }
  //         }
  //     });


  logger.write(vacancy + ",");

  
}