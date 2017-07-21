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

function $field({name, autofocus=false}) {
	return html`<input class="field" name="${name}" ${autofocus ? 'autofocus' : ''} type="text"></input>`
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