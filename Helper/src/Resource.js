"use strict";
class ResourceController {
  async index({ response, request }) {
    let data = await this.Model.listOption(request.get() || null);
    response.send(data);
  }

  async store({ response, request, auth }) {
    let data = request.only(this.Model.allowField || []);
    if (this.Model.history) {
      data.$sideLoaded = {
        admin_id: auth && auth.user && auth.user.id,
      };
    }
    let item = await this.Model.create(data);
    response.status(201).send(item);
  }

  async show({ response, request, params: { id } }) {
    let item = await this.Model.find(id);
    response.status(200).send(item);
  }

  async update({ response, request, params: { id }, auth }) {
    const data = request.only(this.Model.allowField || []);
    let item = await this.Model.find(id);
    item.merge(data);
    if (this.Model.history) {
      item.$sideLoaded = {
        admin_id: auth && auth.user && auth.user.id,
      };
    }
    await item.save();
    response.status(200).send(item);
  }

  async destroy({ response, request, params: { id }, auth }) {
    let item = await this.Model.find(id);
    item.$sideLoaded = {
      admin_id: auth && auth.user && auth.user.id,
    };
    if (this.Model.softDelete !== false) {
      item.is_deleted = true;
      await item.save();
    } else {
      await item.delete();
    }
    response.send({
      msg: "success",
    });
  }

  async recycle({ response, request, params: { id }, auth }) {
    let item = await this.Model.find(id);
    item.is_deleted = false;
    item.$sideLoaded = {
      admin_id: auth && auth.user && auth.user.id,
    };
    await item.save();
    response.send({
      msg: "success",
    });
  }

  async chart({ request }) {
    let qs = request.post();
    return this.Model.chart(qs);
  }
}
module.exports = ResourceController;
