'use strict';
const { ServiceProvider } = require('@adonisjs/fold');
const _ = require('lodash');
const moment = require('moment-jalaali');
moment.loadPersian({ dialect: 'persian-modern' });


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
          query = BaseModel.apply_sort(query, sort)
          query = BaseModel.apply_filters(query, filters, withArray)
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
        static async chart(qs) {
          let {
            filters = [],
            withArray,
            series
          } = qs;
          filters.push('is_deleted:0:=');
          for (let item of series) {
            let custom_filters = filters.concat(item.filters || []);
            let query = super.query();
            query = BaseModel.apply_filters(query, custom_filters, withArray)
            item.query = query.fetch();
          }
          let chart_data = BaseModel.format_chart_data(qs);
          return chart_data;
        }
        static async format_chart_data(params) {
          let {
            type,
            title,
            subtitle,
            xAxis_title,
            yAxis_title,
            start_date,
            end_date,
            series
          } = params;
          end_date = end_date || moment.now();
          start_date = start_date || moment(end_date).subtract(1, 'month');
          let diff = moment(end_date).diff(moment(start_date), 'days');
          let format = 'jYYYY-jMM-jDD';
          if (diff > 365) {
            format = 'jYYYY';
          } else if (diff > 31) {
            format = 'jMMMM jYYYY';
          }
          let date_range = BaseModel.getDates(start_date, end_date, diff, format);
          let chart_series = [];
          for (var serie of series) {
            let data = await serie.query;
            data = data.toJSON();
            let field = serie.field;
            let count = {};
            data.map(item => {
              if (item.created_at) {
                let x = moment(item.created_at).format(format);
                count[x] = count[x] || 0;
                count[x] += field ? item[field] : 1;
              }
            });
            let this_chart = { name: serie.name };
            let chart_array = [];
            for (var date of date_range) {
              chart_array.push(count[date] || 0);
            }
            this_chart.data = chart_array;
            // this_chart.total = data.length;
            // let total = _.sum(chart_array);
            chart_series.push(this_chart);
          }
          if (type == 'pie') {
            let new_chart_data = [
              {
                name: yAxis_title,
                data: []
              }
            ];
            for (let serie of chart_series) {
              new_chart_data[0].data.push({
                name: serie.name,
                y: _.sum(serie.data)
              });
            }
            chart_series = new_chart_data;
          }
          let chart = {
            type,
            title,
            subtitle,
            series: chart_series,
            xAxis: {
              categories: date_range
            },
            yAxis: {
              title: {
                text: yAxis_title || 'عنوان نمودار Y'
              }
            }
          };
          return chart;
        }
        static getDates(startDate, stopDate, diff, format) {
          var dateArray = [];
          var currentDate = moment(startDate);
          if (diff > 365) {
            var addon_time = 'year';
          } else if (diff > 31) {
            var addon_time = 'month';
          } else {
            var addon_time = 'day';
          }
          var stopDate = moment(stopDate); //.add(1, addon_time);
          while (currentDate <= stopDate) {
            dateArray.push(moment(currentDate).format(format));
            if (diff > 365) {
              currentDate = moment(currentDate).add(1, 'jyear');
            } else if (diff > 31) {
              currentDate = moment(currentDate).add(1, 'jmonth');
            } else {
              currentDate = moment(currentDate).add(1, 'days');
            }
          }
          return dateArray;
        }
        static apply_filters(query, filters, withArray) {
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
              if (withArray.length) {
                let exist_in_array = withArray.some(item => {
                  return item == a || Object.keys(item)[0] == a;
                });
                if (!exist_in_array) {
                  return;
                }
                if (opt === 'whereDosentHave') {
                  query = query.whereDoesntHave(a, builder => {
                    builder.where(b, value);
                  });
                } else {
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
          return query
        }
        static apply_sort(query, sort) {
          let orderby_direction = 'DESC', orderby_field = 'created_at';
          let sorts = sort && sort.split(',');
          if (sorts && sorts.length) {
            for (let item of sorts) {
              orderby_field = item
              if (item.startsWith('-')) {
                item = item.replace('-', '')
              } else {
                orderby_direction = 'ASC'
              }
              orderby_field = item;
            }
          }
          query = query.orderBy(orderby_field, orderby_direction);
          return query
        }
      };
    });
    this.app.alias('vrwebdesign-adonis/Helper/BaseModel', 'BaseModel');
  }
}

module.exports = BaseModelProvider;
