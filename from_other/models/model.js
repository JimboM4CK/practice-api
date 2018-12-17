var mysql = require('../db');
const EventEmitter = require('events');

class Model extends EventEmitter {

  init(type, id){
    this.type = type;
    this.id = id;
    this.data = [];
    this.updateData = [];
    this.property = this.property();
    this.required = this.required();
    this.key = {
      required: 0,
      type: 1
    }
    this.fetchData();
  }

  get(field){
    if(typeof this.updateData.field !== 'undefined') return this.updateData.field;
    if(typeof this.data.field !== 'undefined') return this.data.field;
  }

  set(field, value){
    //if(typeof data.field !== 'undefined') throw 'Field does not exist for this object.';
    if(this.data.field != value
      //&& this.objectProperties.field[this.key.type]
    ) this.updateData.field = value;
  }

  delete(){
    var q = mysql.queryize.delete()
    .table(this.type)
    .where(`${this.type}.${this.objectPrimaryKey()} = '${this.id}'`)
    .compile();
    mysql.query(q, (error, results, fields)=>{
      if(error) return this.emit('error', error);
      this.data = {};
      this.updateData = {};
      this.emit('success', this);
    });
  }

  save(){

    if(this.id){
      //update
      var q = mysql.queryize.update()
      .table(this.type)
      .set(this.toObject(this.updateData))
      .where(`${this.type}.${this.objectPrimaryKey()} = '${this.id}'`)
      .compile();
    } else {
      //insert
      var q = mysql.queryize.insert()
      .table(this.type)
      .set(this.toObject(this.updateData))
      .where(`${this.type}.${this.objectPrimaryKey()} = '${this.id}'`)
      .compile();
    }


    mysql.query(q, (error, results, fields)=>{
      if(error) return this.emit('error', error);
      //merges and overwrites current set with updateData;
      this.data = Object.assign(this.data, this.updateData);
      this.updateData = {};
      this.emit('success', this);
    });
    }
  }

  fetchData(){
    var q = mysql.queryize.select('*')
    .from(this.type)
    .where(`${this.type}.${this.objectPrimaryKey()} = '${this.id}'`)
    .compile();
    mysql.query(q, (error, results, fields)=>{
      if(error) return this.emit('error', error);
      if(!results[0]) return this.emit('error', `Could not find ${this.objectName()} with id: ${this.objectId()}`);
      this.data = results[0];
      this.emit('success', this);
    });
  }

  objectId(){
		return this.id;
	}

  objectType(){
  	return this.type;
  }

  objectName(){
    return this.ucwords(this.type.replace('_', ' '));
  }

  objectPrimaryKey(){
    return this.objectName().replace(' ', '') + 'ID';
  }

  ucwords(str){
    return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
  }

  property(){
    return {
      string: 'string',
      int: 'integer',
      double: 'double',
      boolean: 'bool',
      date: 'date',
      timestamp: 'timestamp',
      object: 'object'
    }
  }

  required(){
    return {
      true: true,
      false: false
    }
  }

}

module.exports = Model;
