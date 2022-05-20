import {Broker, Observable, ComputedObservable} from './mvp.js';

export function init(){
	let broker = new Broker();
	broker.subscribe('greeting', hello);
	broker.subscribe('greeting', salut);
	let spanishGreeting = msg => console.log('Hola ' + msg +'!');
	broker.subscribe('greeting', spanishGreeting);
	broker.publish('greeting', 'Med Gazzeh');
	broker.unsubscribe('greeting', spanishGreeting);
	let germanGreeting = msg => console.log('Guten tag ' + msg + '!'); 
	broker.subscribe('greeting', germanGreeting);
	broker.publish('greeting', 'Bedis Mansar');
	let anotherBroker = new Broker();
	if(broker === anotherBroker){
		console.log('It\'s a singleton!');
	}
	
}

function hello(message){
	console.log('Hello ' + message + '!');
}

function salut(message){
	console.log('Salut ' + message + '!');
}

const bindings = {};
const initPerson = () => {
	bindings.forename = new Observable('forename', 'Mohamed');
	bindings.surname = new Observable('surname', 'Gazzeh');
	bindings.fullname = new ComputedObservable(
		'fullname', 
		() => `${bindings.forename.value} ${bindings.surname.value}`.trim(),
		[bindings.forename, bindings.surname]
	);
	
	bindings.birthdate = new Observable('birthdate', new Date().toISOString().split('T')[0]);
	bindings.age = new ComputedObservable(
		'age',
		() => new Date(new Date() - new Date(`${bindings.birthdate.value}`)).getFullYear() - 1970,
		[bindings.birthdate]
	);
	
	bindings.ageCategory = new ComputedObservable(
		'ageCategory', 
		() => {
			let age = `${bindings.age.value}`;
			if(age < 11){
				return 'enfant';
			}else if(age < 18){
				return 'adolescent';
			}else if(age < 31){
				return 'junior';
			}else if(age < 65){
				return 'adulte';
			}else{
				return 'senior';
			}

		},
		[bindings.age]
	);
	
	applyBindings();

	
}

setTimeout(initPerson, 0);

const applyBindings = ()=>{
               document.querySelectorAll("[data-bind]").forEach(elem => {
                              const obs = bindings[elem.getAttribute("data-bind")];
                              bindValue(elem,obs);
               });
};

const bindValue = (input,observable)=>{
               input.value = observable.value;
               observable.register(() => input.value = observable.value);
               input.onkeyup = () => observable.value = input.value;
			   input.onchange = () => observable.value = input.value;
}

// Concrete MVP Example
class UserView extends Observable{
               constructor(){
                              super('userView',{});
                              this.registerWithForm();
               }
               
               registerWithForm(){
                              let _this = this;
                              document.getElementById('user-form').addEventListener('submit',(e) => {
                                             e.preventDefault();
                                             _this.value = _this.toJson();
                              });
               }
               
               toJson(){
                              let forenameVal = document.getElementById('forename').value;
                              let surnameVal = document.getElementById('surname').value;
                              let birthDateVal = document.getElementById('birthdate').value;
                                                            
                              return {forename:forenameVal,
                                                            surname:surnameVal,
                                                            birthDate:birthDateVal};
               }
               
               showWelcomeMessage(){
                              document.getElementById('welcome').innerHTML = 'Hello ' + document.getElementById('fullname').value;
               }
}

class UserModel extends Observable{
               constructor(){
                              super('userModel',{});
               }
               
               saveUser(user){
			   console.log('call API with PATCH method, \'/users/\{user\}\' path and JSON body: ' + user);
                              // If the call to the API was successful, then we do the following, otherwise, an exception is thrown
                              this.value = user;
               }
}

class UserPresenter{
	constructor(_view,_model){
				  this._view = _view;
				  this._model = _model;
				  
				  _view.register((user) => {
								 _model.saveUser(user);
				  });
				  
				  _model.register((user) => {
								 _view.showWelcomeMessage();
								 this.doSomething();
				  });
   }
   
   get view(){
				  return this._view;
   }
   
   get model(){
				  return this._model;
   }
   
   doSomething(){
				  console.log('doing something!');
   }
}

let userPresenter = new UserPresenter(new UserView(),new UserModel());
