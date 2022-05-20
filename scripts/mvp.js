export class Broker {
	
	static instance;
	
	constructor(){
		if(Broker.instance){
			return Broker.instance;
		}
		Broker.instance = this;
		this.topics = {};
	}
	
	subscribe(topic, callback){
		if(topic && !this.topics[topic]){
			this.topics[topic] = [];
		}
		this.topics[topic].push(callback);	
	}
	
	unsubscribe(topic, callback){
		if(topic && !this.topics[topic]){
			return ;
		}
		this.topics[topic] = this.topics[topic].filter((x) => x != callback);
		if(!this.topics[topic]){
			delete this.topics[topic];
		}
	}
	
	publish(topic, message){
		let callbacks = this.topics[topic];
		if(callbacks != null && typeof callbacks !== "undefined"){
			for(var i = 0; i < callbacks.length; ++i){
				let callback = callbacks[i];
				callback(message);
			}
		}
	}
	
}

//Observable design pattern using delegate design pattern
export class Observable {
	
	static broker = new Broker();
	
	constructor(_topic, _value){
		this._topic = _topic;
		this._value = _value;
	}
	
	notifyObservers(){
		Observable.broker.publish(this._topic, this._value);
	}
	
	register(observer){
		Observable.broker.subscribe(this._topic, observer);
	}
	
	unregister(observer){
		Observable.broker.unsubscribe(this._topic, observer);
	}
	
	get topic(){
		return this._topic;
	}
	
	get value(){
		return this._value;
	}
	
	set value(val){
		if(val !== this._value){
			this._value = val;
			this.notifyObservers();
		}
	}
}

export class ComputedObservable extends Observable{
	
	constructor(topic, value, dependencies){
		super(topic, value());
		const observer = () => {
			this._value = value();
			this.notifyObservers();
		};
		dependencies.forEach(dependency => dependency.register(observer));
	}
	
	get value(){
		return this._value;
	}
	
	set value(val){
		throw 'Cannot set the value of a ComputedObservable';
	}
	
	
}

