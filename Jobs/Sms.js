'use strict'
const SMS = use('SMS')
class Sms {
  // If this getter isn't provided, it will default to 1.
  // Increase this number to increase processing concurrency.
  static get concurrency() {
    return 1
  }

  // This is required. This is a unique key used to identify this job.
  static get key() {
    return 'Sms-job'
  }

  // This is where the work is done.
  async handle(data) {
    return SMS.send({
      view: data.template,
      data: data.data,
      to: data.to,
      is_fast: data.is_fast
    })
  }
}

module.exports = Sms
