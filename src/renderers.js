	function Registry(){
	}

	Registry.prototype.register = function(type, component){
		this[type] = component;
	};

	Registry.prototype.unregister = function(type) {
		delete this[type];
	};

	Registry.prototype.get = function(type){
		var renderer = this[type];
		return renderer !== undefined ? renderer : this.default;
	};

	Registry.prototype.registerDefault = function(component) {
		this.default = component;
	};

	var ref;
	if(!ref) {
		ref = {
			items: new Registry(),
			containers: new Registry()
		};
	}

export default ref;
