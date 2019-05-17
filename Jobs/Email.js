'use strict';
const MailService = use('MailService');
class Email {
  // If this getter isn't provided, it will default to 1.
  // Increase this number to increase processing concurrency.
  static get concurrency() {
    return 1;
  }

  // This is required. This is a unique key used to identify this job.
  static get key() {
    return 'Email-job';
  }

  // This is where the work is done.
  async handle(data) {
    let mailService = new MailService({
      edge: data.edge,
      data: data.data,
      to: data.to,
      from: data.from,
      subject: data.subject
    });
    return mailService.send();
  }
}

module.exports = Email;
