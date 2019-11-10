"use strict";
class ResourceController {
  async index({ response, request }) {
    let data = await this.Model.listOption(request.get() || null);
    response.send(data);
  }
  async store({ response, request }) {
    let data = request.only(this.Model.allowField || []);
    let item = await this.Model.create(data);
    response.status(201).send(item);
  }
  async show({ response, request, params: { id } }) {
    let item = await this.Model.find(id);
    response.status(200).send(item);
  }
  async update({ response, request, params: { id } }) {
    const data = request.only(this.Model.allowField || []);
    let item = await this.Model.find(id);
    item.merge(data);
    await item.save();
    response.status(200).send(item);
  }
  async destroy({ response, request, params: { id } }) {
    let item = await this.Model.find(id);
    item.is_deleted = true;
    await item.save();
    response.send({
      msg: "success"
    });
  }
  async chart({ request }) {
    let qs = request.post();
    return this.Model.chart(qs);
  }
}
module.exports = ResourceController;
