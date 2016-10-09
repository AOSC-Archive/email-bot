'use strict';

(() => {
  const fs = require('fs')
  const path = require('path')
  const Filter = require('./filter.js')
  const filter = new Filter()

  let files = fs.readdirSync('sorting')

  for (let file of files) {
    let subFilter = require(path.format({
      dir: './sorting',
      base: file
    }))
    filter.all(filter.forward(subFilter))
  }

  module.exports = filter
})()
