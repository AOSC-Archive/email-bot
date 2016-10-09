'use strict';

const Mailbox = require('./mailbox.js')
const sorting = require('./sorting.js')

const fs = require('fs')
const conf = fs.readFileSync('mailbox.json').toString('utf8')

const mailbox = new Mailbox(JSON.parse(conf))

mailbox.connect((err) => {
  if (err) throw err
  mailbox.fetch(sorting, () => {
    mailbox.disconnect()
  })
})
