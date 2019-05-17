const request = require('request')
class SMS {
  constructor(Config, View) {
    this.config = Config.get('sms')
    this.view = View
    this.token
    this.credit
    this.data
    this.template
    this.initial_token()
  }
  initial_token() {
    request(
      {
        method: 'POST',
        url: this.config.auth.url,
        headers: {
          'Content-Type': 'application/json'
        },
        body: this.config.auth,
        json: true
      },
      (err, response) => {
        if (err) {
          return
        }
        if (response) {
          this.token = response.body.TokenKey
        }
      }
    )
  }
  getToken() {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'POST',
          url: this.config.auth.url,
          headers: {
            'Content-Type': 'application/json'
          },
          body: this.config.auth,
          json: true
        },
        (err, response) => {
          if (err) {
            reject(err)
            return
          }
          if (response) {
            this.token = response.body.TokenKey
            resolve(response.body.TokenKey)
          }
        }
      )
    })
  }

  async getCredit() {
    return new Promise((resolve, reject) => {
      request(
        {
          method: 'GET',
          url: 'http://ws.sms.ir/api/credit',
          headers: {
            'x-sms-ir-secure-token': this.token
          },
          json: true
        },
        (err, response) => {
          if (err) {
            return reject(err)
          }
          this.credit = response.body.Credit
          resolve(this.credit)
        }
      )
    })
  }

  send({ view, data = {}, to, is_fast = true }) {
    this.to = to
    if (is_fast) {
      this.data = data
      this.template = this.config.templates[view]
      return this._send_fast_sms()
    }
    try {
      this.message = this.view.render(view, data)
    } catch (error) {
      this.message = view
    }
    return this._sendSMS()
  }

  raw(message, to) {
    this.message = message
    this.to = to
    return this._sendSMS()
  }

  async _sendSMS() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.getToken()
        let body = {
          Messages: [this.message],
          MobileNumbers: [this.to],
          LineNumber: this.config.lineNumber
        }
        request(
          {
            method: 'POST',
            url: this.config.url,
            headers: {
              'x-sms-ir-secure-token': this.token,
              'Content-Type': 'application/json'
            },
            body: body,
            json: true
          },
          (err, response) => {
            response.body.IsSuccessful ? resolve(true) : reject(err)
          }
        )
      } catch (error) {
        reject(error)
      }
    })
  }
  async _send_fast_sms() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.getToken()
        let ParameterArray = []
        for (let key in this.data) {
          ParameterArray.push({
            Parameter: key,
            ParameterValue: this.data[key]
          })
        }
        let body = {
          ParameterArray,
          Mobile: this.to,
          TemplateId: this.template
        }
        request(
          {
            method: 'POST',
            url: this.config.fast_url,
            headers: {
              'x-sms-ir-secure-token': this.token,
              'Content-Type': 'application/json'
            },
            body: body,
            json: true
          },
          (err, response) => {
            response.body.IsSuccessful ? resolve(true) : reject(err)
          }
        )
      } catch (error) {
        reject(error)
      }
    })
  }
}

module.exports = SMS
