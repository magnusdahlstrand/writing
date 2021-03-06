var html = require('framework/html');
var EventBus = require('framework/events');
var stateMap = require('framework/state');
var {component, render} = require('framework/view');

var bus = new EventBus();
var [on, emit] = [bus.on.bind(bus), bus.emit.bind(bus)]

var state = stateMap({
	title: `writing`,
	items: [
		`write`,
		`lists of lists`,
		`#read`,
		`#ai`,
		`#design`
	]
}, (...args) => bus.emit(...args));

function urlOf(item) {
	return item.replace(/[^a-z], ''/);
}

function $list({list=[], $item=null, $head=null, $tail=null, $empty=null}) {
	return html`
		<div class="list">
			${$head && html`
				<div class="list__head">${$head}</div>
			`}
			${list.length && html`
				<ul class="list__items">${
					list.map(item => html`
						<li class="list__item">
							${$item && $item(item) || item}
						</li>
					`)
				}</ul>
			`}
			${!list.length && $empty && html`
				<ul class="list__empty">${$empty}</ul>
			`}
			${$tail && html`
				<div class="list__tail">${$tail}</div>
			`}
		</div>
	`;
	// IDEA: If an item in a list has the progress symbol defined,
	// use it as an interface to the data and build a user interface,
	// for example a loading icon indicating when the item has been saved
}

function $item(text) {
	return html`<div class="item" href="/${urlOf(text)}">${text}</div>`
}

function $title(text) {
	return html`<div class="title"><span>${text}</span></div>`
}

function $field({submitEvent, autofocus=false}) {
	return component(
		html`<input class="field" type="text"></input>`,
		{
			// TODO: Make init run on render of component,
			// or have any event run on a component by
			// triggering it on the data. Would the component
			// listen to events on the data?
			init: el => {
				console.log('init field', el);
				el.focus();
			},
			keypress: ev => {
				if(ev.key === 'Enter') {
					emit(submitEvent, ev.target.value);
					ev.target.value = '';
				}
			}
		}
	)
}

function many(items, $view) {
	return items.map($view)
}

function $ui(data) {
	return html`<div class="app">${
		$list({
			$head: $title(data.title),
			$tail: $field({submitEvent: 'create-item', autofocus: true}),
			list: data.items,
			$item: $item,
		})
	}</div>`;
}


var rootEl = document.querySelector('.app');

// Events
on(document, {
	click: ev => {
		if(ev.target.hasAttribute('href')) {
			console.log(ev.target.getAttribute('href'));
			emit(ev.target.getAttribute('href'))
		}
	}
})

on({
	'create-item': (data) => {
		console.log('create-item', data);
		state.items.push(data);
	}
})

// Re-render app on state change
on('change', state => render(rootEl, $ui, state));

// Start the app
emit('change', state);