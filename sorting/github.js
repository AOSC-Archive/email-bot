'use strict';

(() => {
  const Filter = require('../filter.js')
  const mainFilter = new Filter()
  const caseFilter = new Filter()
  module.exports = mainFilter

  mainFilter.from('notifications@github.com', (mail, next) => {
    mail.github = {}
    mail.github.owner = mail.to[0].name.split('/')[0]
    mail.github.repo = mail.to[0].name.split('/')[1]
    let a = mail.messageId.match(/[^/]+\/[^/]+\/([^/]+)\/(.+)@github\.com/)
    mail.github.type = a[1]
    mail.github.arg = a[2].split('/')
    const regexSubject = /(Re: \[.+?\] |\[.+?\] )(.*)/
    mail.github.title = mail.subject.match(regexSubject)[2]
    mail.see()
    mainFilter.forward(caseFilter)(mail, next)
  })

  caseFilter.all((mail, next) => {
    if (mail.github.type !== 'releases') return next()
    const regexTag = /\/releases\/tag\/(.+)/
    mail.github.tag = mail.text.split('-- ').pop().match(regexTag)[1]
    onRelease(mail)
  })

  caseFilter.all((mail, next) => {
    if (mail.github.type !== 'issues' && mail.github.type !== 'issue' && mail.github.type !== 'pull') return next()
    switch (mail.github.arg.length) {
      case 1:
        mail.github.method = 'new'
        break
      case 2:
        mail.github.method = 'reply'
        break
      case 3:
        switch (mail.github.arg[1]) {
          case 'issue_event':
            mail.github.method = mail.text.match(/\w+/)[0].toLowerCase()
            break
          default:
            mail.github.method = mail.github.arg[1]
        }
        break
      default:
        mail.github.method = 'unknown+' + JSON.stringify(mail.github.arg)
    }
    switch (mail.github.type) {
      case 'issues':
      case 'issue':
        onIssue(mail)
        break
      case 'pull':
        onPullRequest(mail)
        break
    }
  })

  caseFilter.all((mail, next) => {
    if (mail.github.type !== 'commit') return next()
    mail.github.hash = mail.github.arg[0]
    onCommitComment(mail)
  })

  caseFilter.all((mail, next) => {
    console.error(`!! ${mail.github.type} ${mail.github.arg} ${mail.github.title}`)
  })

  function onRelease(mail) {
    console.log(`#${mail.seq} \t\x1b[1;32mrelease \t\x1b[1;37m${mail.github.repo}\x1b[0m@${mail.github.owner} \t${mail.github.tag}`)
  }

  function onCommitComment(mail) {
    console.error(`#${mail.seq} \tcomment \t\x1b[1;37m${mail.github.repo}\x1b[0m@${mail.github.owner} \t${mail.github.title}`)
  }

  function onIssue(mail) {
    console.error(`#${mail.seq} \t\x1b[${mail.github.method === 'new' ? 1 : 0};33missue ${mail.github.method} \t\x1b[1;37m${mail.github.repo}\x1b[0m@${mail.github.owner} \t${mail.github.title}`)
  }

  function onPullRequest(mail) {
    console.error(`#${mail.seq} \t\x1b[${mail.github.method === 'new' ? 1 : 0};34mpull ${mail.github.method} \t\x1b[1;37m${mail.github.repo}\x1b[0m@${mail.github.owner} \t${mail.github.title}`)
  }
})()
