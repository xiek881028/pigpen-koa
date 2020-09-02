// const moment = require('moment');

module.exports = {
  utcDate: {
    updatedAt: {
      type: Date,
      get: date => {
        return date;
      }
    },
    createdAt: {
      type: Date,
      get: date => {
        // return date && moment(date).utcOffset(-8, true).toDate();
        return date;
      }
    },
  },
};
