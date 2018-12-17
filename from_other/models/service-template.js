var model = require('./model');

class ServiceTemplate extends Model {

  new(){
    this.init('service_template');
  }

  load(id){
    this.init('service_template', id);
  }

  objectProperties(){
    return [
      'ServiceTemplateID' => [this.required.false, this.property.int],
			'ServiceCategoryID' => [this.required.true, this.property.int],
			'Title' => [this.required.true, this.property.string],
			'Price' => [this.required.true, this.property.float],
			'GST' => [this.required.true, this.property.float],
			'TimeSlots' => [this.required.true, this.property.int],
			'Commission' => [this.required.true, this.property.int],
			'MaxAttendees' => [this.required.true, this.property.int],
			'RoomID' => [this.required.true, this.property.int],
			'LocationID' => [this.required.true, this.property.int],
			'ItemCodeID' => [this.required.true, this.property.int],
			'Default' => [this.required.true, this.property.int],
			'GroupID' => [this.required.true, this.property.int],
			'CompanyID' => [this.required.true, this.property.int],
			'Active' => [this.required.true, this.property.int]
    ];
  }

}
