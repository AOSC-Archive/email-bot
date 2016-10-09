'use strict';

(() => {
  const Filter = require('../filter.js')
  const mainFilter = new Filter()
  const caseFilter = new Filter()
  module.exports = mainFilter

  mainFilter.from(/@github\.com$/, mainFilter.forward(caseFilter))

  caseFilter.text(/\/releases\/tag\//, (mail) => {
    console.log(mail.seq, mail.subject)
  })

})()
