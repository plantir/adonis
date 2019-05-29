'use strict';
const { ServiceProvider } = require('@adonisjs/fold');
const _ = require('lodash');
class BaseModelProvider extends ServiceProvider {
  register() {
    this.app.singleton('vrwebdesign-adonis/Helper/BaseModel', app => {
      const Model = use('Model');
      const Database = use('Database');
      return class BaseModel extends Model {
        static get hidden() {
          return ['is_deleted'];
        }
        static _bootIfNotBooted() {
          if (this.name !== 'BaseModel') {
            super._bootIfNotBooted();
          }
        }
        static listOption(qs) {
          let { filters, page, perPage, sort, withArray } = qs;
          let query = super.query();
          filters = (filters && JSON.parse(filters)) || [];
          if (!JSON.stringify(filters).includes('is_deleted')) {
            filters.push('is_deleted:0:=');
          }
          page = parseInt(page) || 1;
          perPage = parseInt(perPage) || 10;
          let orderby_direction, orderby_field;
          let is_random = false;
          let sorts = sort && sort.split(',');
          if (sorts && sorts.length) {
            for (let item of sorts) {
              item = item && item.split('-');
              if (item && item.length === 2) {
                orderby_direction = 'DESC';
                orderby_field = item[1];
              } else if (item && item.length === 1) {
                orderby_field = item[0];
                orderby_direction = 'ASC';
                if (orderby_field === 'random') {
                  is_random = true;
                }
              } else {
                orderby_field = 'updated_at';
                orderby_direction = 'DESC';
              }
              query = query.orderBy(orderby_field, orderby_direction);
            }
          }

          if (withArray && withArray.length) {
            withArray.forEach(name => {
              if (typeof name === 'object') {
                let with_name = Object.keys(name)[0];
                query = query.with(with_name, name[with_name]);
              } else {
                query = query.with(name);
              }
            });
          }
          for (let filter of filters) {
            let [property, value, opt] = filter.split(':');
            if (opt === 'like' && !value.includes(',')) value = `%${value}%`;
            if (property.includes('.')) {
              let [a, b] = property.split('.');
              if (withArray && withArray.indexOf(a) !== -1) {
                if (opt === 'whereDosentHave') {
                  query = query.whereDoesntHave(a, builder => {
                    builder.where(`${a}.${b}`, value);
                  });
                }
                // else if(opt === 'or'){
                //   value.split(',').map(item=>{
                //   })
                //   query = query.where(builder=> builder.where())
                // }
                else {
                  query = query.whereHas(a, builder => {
                    if (value.includes(',')) {
                      if (opt == 'like') {
                        let value_array = value.split(',');
                        let first_value = value_array.shift();
                        builder.where(b, opt || '=', first_value);
                        for (let val of value_array) {
                          builder.orWhere(b, opt || '=', val);
                        }
                      } else {
                        builder.whereIn(b, value.split(','));
                      }
                    } else {
                      builder.where(b, opt || '=', value);
                    }
                  });
                }
                continue;
              }
            }
            if (value.includes(',')) {
              if (opt === 'between') {
                query = query.whereBetween(property, value.split(','));
              } else {
                query = query.whereIn(property, value.split(','));
              }
            } else {
              query = query.where(property, opt || '=', value);
            }
          }
          // if (is_random) {
          //   query = query.orderByRaw('RAND()');
          // } else {
          //   query = query.orderBy(orderby_field, orderby_direction);
          // }
          query = query.paginate(page, perPage);
          return query;
        }
        static custom_paginate(result, page = 1, perPage = 10) {
          let offset = (page - 1) * perPage;
          let data = _.drop(result, offset).slice(0, perPage);
          return {
            page,
            perPage,
            total: result.length,
            lastPage: Math.ceil(result.length / perPage),
            data
          };
        }
        static async get_enums(columnName) {
          let raw = `
            SELECT COLUMN_TYPE 
            FROM information_schema.\`COLUMNS\` 
            WHERE TABLE_NAME = ? 
            AND COLUMN_NAME = ?;
            `;
          let result = await Database.raw(raw, [this.table, columnName]);
          let res = result[0][0].COLUMN_TYPE.toString();
          let enums = res.replace(/(enum\()(.*)()\)/, '$2');
          enums = enums.replace(/'/g, '');
          enums = enums.split(',');
          return enums;
        }
      };
    });
    this.app.alias('vrwebdesign-adonis/Helper/BaseModel', 'BaseModel');
  }
}

module.exports = BaseModelProvider;
