const express = require('express')
const sequelize = require('./config/connection');
const cron = require('node-cron');
const fs = require('fs')
const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express()
const routes = require('./routes')
const Port = process.env.PORT || 3001
const Host = process.env.HOST || 'localhost'

let currentMonth = (new Date).getMonth().toString()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'))
app.use(routes)

let cronMonth;

fs.readFile('delete.txt','utf8',(error, data) =>
error ? console.error(error) : cronMonth=data)
const url = `http://${Host}:${Port}/api/roll/deleteOld`

cron.schedule('*/15 * * * *', () => {
  if(cronMonth != currentMonth){
    fetch(url, {
      method: "DELETE",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
    }).then(function (response) {
      return response.json();
    }).then((response) => {
      fs.writeFile('delete.txt', currentMonth, (err) =>
      err ? console.error(err) : console.log('Success!'))
      cronMonth = currentMonth
      console.log('Performed cron')
    })
    .catch((err) => {console.log(err)})
  }else{
    console.log('cron job already performed this month')
  }
})

sequelize.sync({ force: false }).then(() => {
    app.listen(Port, () => console.log(`Listening on http://localhost:${Port}`));
  });