var Cursor =require('./Cursor.js');


module.exports= class AggregationCursor extends Cursor {

  constructor(collection, config) {
    super(collection, config);
  }

  async connect() {

  }
};
