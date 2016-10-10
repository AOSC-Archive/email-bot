'use strict';

module.exports = function Mailbox(opt) {
  const Imap = require('imap')
  const MailParser = require('mailparser').MailParser

  this.option = opt

  this.connect = (cb) => {
    this.imap = new Imap(this.option)
    this.imap.once('ready', cb)
    this.imap.once('error', cb)
    this.imap.connect()
  }

  this.disconnect = () => {
    this.imap.end()
  }

  this.fetch = (cb, complete) => {
    this.imap.openBox('INBOX', true, (err, box) => {
      if (err) throw err
      let f = this.imap.seq.fetch('1:*', {
        bodies: ''
      })
      f.on('message', (msg, seqno) => {
        msg.on('body', (stream, info) => {
          const mailparser = new MailParser()
          stream.pipe(mailparser)
          mailparser.on('end', (mail) => {
            mail.seq = seqno
            process.stdout.write(seqno + "/" + box.messages.total + "\x1B[0G")
            if (typeof cb.exec === 'function')
              cb.exec(mail)
            else
              cb(null, mail)
            if (seqno === box.messages.total) complete()
          })
          mailparser.once('error', (err) => {})
        })
      })
      if (typeof cb === 'function')
        f.once('error', cb)
    })
  }
}
