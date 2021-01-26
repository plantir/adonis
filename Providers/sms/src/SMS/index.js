const request = require("request");
class SMS {
  constructor(Config, View) {
    this.config = Config.get("sms");
    this.connection_type = this.config.connection;
    this.view = View;
    this.token;
    this.credit;
    this.data;
    this.template;
    if (this.connection_type == "sms_ir") {
      this.initial_token();
    }
  }

  initial_token() {
    request(
      {
        method: "POST",
        url: this.config[this.connection_type].auth.url,
        headers: {
          "Content-Type": "application/json",
        },
        body: this.config[this.connection_type].auth,
        json: true,
      },
      (err, response) => {
        if (err) {
          return;
        }
        if (response) {
          this.token = response.body.TokenKey;
        }
      }
    );
  }
  getToken() {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "POST",
          url: this.config[this.connection_type].auth.url,
          headers: {
            "Content-Type": "application/json",
          },
          body: this.config[this.connection_type].auth,
          json: true,
        },
        (err, response) => {
          if (err) {
            reject(err);
            return;
          }
          if (response) {
            this.token = response.body.TokenKey;
            resolve(response.body.TokenKey);
          }
        }
      );
    });
  }

  connection(name) {
    if (name && name in this.config) {
      this.connection_type = name;
    } else {
      this.connection_type = this.config.connection;
    }
    return this;
  }

  async getCredit() {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "GET",
          url: "http://ws.sms.ir/api/credit",
          headers: {
            "x-sms-ir-secure-token": this.token,
          },
          json: true,
        },
        (err, response) => {
          if (err) {
            return reject(err);
          }
          this.credit = response.body.Credit;
          resolve(this.credit);
        }
      );
    });
  }

  send({ view, data = {}, to, is_fast = false }) {
    this.to = to;
    try {
      this.message = this.view.render(view, data);
    } catch (error) {
      this.message = view;
    }
    if (is_fast) {
      this.data = data;
      this.template = this.config[this.connection_type].templates[view];
      return this._send_fast_sms();
    }
    return this._sendSMS();
  }

  raw(message, to) {
    this.message = message;
    this.to = to;
    return this._sendSMS();
  }

  async _sendSMS() {
    return new Promise(async (resolve, reject) => {
      try {
        let body;
        let headers = {
          "Content-Type": "application/json",
        };
        let method = "POST";
        let url = this.config[this.connection_type].url;
        let query = null;
        if (this.connection_type == "sms_ir") {
          await this.getToken();
          body = {
            Messages: [this.message],
            MobileNumbers: [this.to],
            LineNumber: this.config[this.connection_type].lineNumber,
          };
          headers["x-sms-ir-secure-token"] = this.token;
        } else if (this.connection_type == "masgsm") {
          body = {
            originator: this.config[this.connection_type].originator,
            message: this.message,
            to: [this.to],
            encoding: this.config[this.connection_type].encoding,
          };
          headers["Authorization"] = `Key ${
            this.config[this.connection_type].key
          }`;
        } else if (this.connection_type == "meli_payamak") {
          body = {
            username: this.config[this.connection_type].username,
            password: this.config[this.connection_type].password,
            from: this.config[this.connection_type].from,
            text: this.message,
            to: this.to,
          };
        } else if (this.connection_type == "clickSend") {
          let { username, password } = this.config[this.connection_type];
          let auth =
            "Basic " +
            new Buffer.from(username + ":" + password).toString("base64");
          headers["Authorization"] = auth;
          body = {
            messages: [
              {
                body: this.message,
                to: this.to,
                from: this.from || this.config[this.connection_type].from,
              },
            ],
          };
        } else if (this.connection_type == "kavenegar") {
          method = "GET";
          query = {
            message: this.message,
            receptor: this.to,
            sender: this.from || this.config[this.connection_type].from,
          };
        }
        request(
          {
            method: method,
            url: url,
            qs: query,
            headers: headers,
            body: body,
            json: true,
          },
          (err, response) => {
            if (
              this.connection_type == "sms_ir" &&
              response.body.IsSuccessful
            ) {
              resolve(this.message);
            } else if (
              this.connection_type == "masgsm" &&
              response.body.status.code == 200
            ) {
              resolve(this.message);
            } else if (
              this.connection_type == "meli_payamak" &&
              response.body.StrRetStatus == "Ok"
            ) {
              resolve(this.message);
            } else if (
              this.connection_type == "clickSend" &&
              response.body.http_code == 200
            ) {
              resolve(this.message);
            } else if (
              this.connection_type == "kavenegar" &&
              response.statusCode == 200
            ) {
              resolve(this.message);
            } else {
              reject(err);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }
  async _send_fast_sms() {
    return new Promise(async (resolve, reject) => {
      try {
        let body;
        let headers = {
          "Content-Type": "application/json",
        };
        let method = "POST";
        let url = this.config[this.connection_type].fast_url;
        let query = null;
        if (this.connection_type == "sms_ir") {
          await this.getToken();
          headers["x-sms-ir-secure-token"] = this.token;
          let ParameterArray = [];
          for (let key in this.data) {
            ParameterArray.push({
              Parameter: key,
              ParameterValue: this.data[key],
            });
          }
          body = {
            ParameterArray,
            Mobile: this.to,
            TemplateId: this.template,
          };
        } else if (this.connection_type == "kavenegar") {
          method = "GET";
          query = {
            receptor: this.to,
            template: this.template,
          };
          let index = 1;
          for (let key in this.data) {
            let token_key = index == 1 ? "" : index;
            query["token" + token_key] = this.data[key];
            index += 1;
          }
        }
        request(
          {
            method: method,
            url: url,
            qs: query,
            headers: headers,
            body: body,
            json: true,
          },
          (err, response) => {
            if (
              this.connection_type == "sms_ir" &&
              response.body.IsSuccessful
            ) {
              resolve(this.message);
            } else if (
              this.connection_type == "kavenegar" &&
              response.statusCode == 200
            ) {
              resolve(this.message);
            } else {
              reject(err);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = SMS;
