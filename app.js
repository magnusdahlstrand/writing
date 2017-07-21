var morph = require('morphdom');

var html = require('framework/html');
var EventBus = require('framework/events');
var stateMap = require('framework/state');

var bus = new EventBus();
var [on, emit] = [bus.on.bind(bus), bus.emit.bind(bus)]

var state = stateMap({
	title: `humanist bold`,
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

function $row(content) {
	return html`<div class="row">${content}</div>`;
}

function $row__middle(content) {
	return html`
		<div class="row__middle">${content}</div>
	`;
}

function title(text) {
	return html`<div class="row__content item item--title"><span>${text}</span></div>`
}

function $item(text) {
	return html`<div class="item" href="/${urlOf(text)}">${text}</div>`
}

function $title(text) {
	return html`<div class="title"><span>${text}</span></div>`
}

function $field({name, autofocus=false}) {
	return html`<input class="field" name="${name}" ${autofocus ? 'autofocus' : ''} type="text"></input>`
}

function many(items, $view) {
	return items.map($view)
}

function $ui(data) {
	return html`<div class="app">${
		[
			$title(data.title),
			...many(data.items, $item),
			$field({name: 'create-item', autofocus: true}),
		]
		.map(data => $row($row__middle(data)))
	}</div>`;
}


// Rendering
function render(rootEl, $ui, state) {
	$ui(state).then(content => {
		morph(rootEl, content)
	})
}

var rootEl = document.querySelector('.app');

on('change', state => render(rootEl, $ui, state));
emit('change', state);

// Events
on(document, {
	keypress: ev => {
		console.log(ev)
		switch(ev.key) {
			case 'Enter':
				if(ev.target.hasAttribute('name') && ev.target.value) {
					bus.emit(ev.target.getAttribute('name'), ev.target.value);
					ev.target.value = '';
				}
		}
	},
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