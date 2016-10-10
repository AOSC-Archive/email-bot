'use strict';

(() => {
  const Filter = require('../filter.js')
  const mainFilter = new Filter()
  const caseFilter = new Filter()
  module.exports = mainFilter

  mainFilter.from(/@github\.com$/, mainFilter.forward(caseFilter))

  caseFilter.text(/\/releases\/tag\//, (mail) => {
    // Release Message
    /* Example

    Subject: [AOSC-Dev/bash-config] bash-config 0.4.3.0

    Display hostname by default.

    --
    You are receiving this because you are subscribed to this thread.
    View it on GitHub:
    https://github.com/AOSC-Dev/bash-config/releases/tag/v0.4.3.0

    */
    const regexSubject = /\[(.+)\/(.+)\]/
    const regexTag = /\/releases\/tag\/(.+)/
    const owner = mail.subject.match(regexSubject)[1]
    const repo = mail.subject.match(regexSubject)[2]
    const tag = mail.text.split('-- ').pop().match(regexTag)[1]
    console.log(`#${mail.seq}    ${repo}@${owner}: ${tag}`);
  })

})()
