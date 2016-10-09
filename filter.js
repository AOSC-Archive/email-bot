'use strict';

module.exports = function Filter(opt) {
  this.option = opt
  this.stack = []

  let addFilter = (condition, cb) => {
    this.stack.push((mail, next) => {
      if (condition(mail))
        cb(mail, next)
      else
        next()
    })
  }

  let test = (pattern, str) => {
    if (typeof pattern.test === 'function')
      return pattern.test(str)
    return pattern === str
  }

  this.all = (cb) => {
    addFilter((mail) => true, cb)
  }

  this.header = (key, value, cb) => {
    addFilter((mail) => {
      return test(value, mail.header[key])
    }, cb)
  }

  this.html = (value, cb) => {
    addFilter((mail) => test(value, mail.html), cb)
  }

  this.text = (value, cb) => {
    addFilter((mail) => test(value, mail.text), cb)
  }

  let fieldAddr = ['from', 'to', 'replyTo']
  // Generate functions this.from, this.fromName, this.to, this.toName, etc.
  for (let field of fieldAddr) {
    this[field] = (address, cb) => {
      addFilter((mail) => {
        for (let ctt of mail[field]) {
          if (test(address, ctt.address)) return true
        }
        return false
      }, cb)
    }
    this[field + 'Name'] = (name, cb) => {
      addFilter((mail) => {
        for (let ctt of mail[field]) {
          if (test(name, ctt.name)) return true
        }
        return false
      }, cb)
    }
  }

  this.forward = (subFilter) => {
    return (mail, next) => {
      subFilter.exec(mail, (broke) => {
        if (!broke) next()
      })
    }
  }

  this.exec = (mail, cb) => {
    let pointer = 0
    let next = () => {
      let fnc = this.stack[pointer++]
      if (fnc)
        return fnc(mail, next)
    }
    next()
    if (typeof cb === 'function') cb(this.stack[--pointer] !== undefined)
  }
}
