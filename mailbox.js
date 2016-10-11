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
    this.imap.openBox('INBOX', false, (err, box) => {
      if (err) throw err
      this.imap.search(['UNSEEN'], (err, results) => {
        if (err) throw err
        if (results.length === 0) return complete()
        let f = this.imap.fetch(results, {
          bodies: '',
        })
        f.on('message', (msg, seqno) => {
          const mailparser = new MailParser()
          let stream = null
          let attrs = null
          msg.on('body', (_stream, info) => stream = _stream)
          msg.on('attributes', (_attrs) => attrs = _attrs)
          msg.on('end', () => {
            stream.pipe(mailparser)
            mailparser.once('error', (err) => {})
            mailparser.on('end', (mail) => {
              mail.attrs = attrs
              mail.seq = attrs.uid
              mail.see = () => {
                this.imap.addFlags(mail.seq, '\\Seen', (err) => {
                  if (err) throw err
                })
              }
              mail.unsee = () => {
                this.imap.delFlags(mail.seq, '\\Seen', (err) => {
                  if (err) throw err
                })
              }
              if (typeof cb.exec === 'function')
                cb.exec(mail)
              else
                cb(null, mail)
            })
          })
        })
        f.once('end', complete)
        if (typeof cb === 'function') f.once('error', cb)
      })
    })
  }
}
