var morph = require('morphdom');

var html = require('framework/html');
var EventBus = require('framework/events');

var bus = new EventBus();

var focus = {
	title: `humanist bold`,
	children: [
		`write`,
		`lists of lists`,
		`#read`,
		`#ai`,
		`#design`
	]
}


function row(content) {
	return html`<div class="row">${content}</div>`;
}

function item(text) {
	return html`<div class="row__content item">${text}</div>`
}

function title(text) {
	return html`<div class="row__content item item--title"><span>${text}</span></div>`
}

function many(items, render) {
	return html`${items.map(render)}`
}

function ui(data) {
	return html`<div class="app">${[
		row(title(data.title)),
		...data.children.map(item).map(row)
	]}</div>`;
}

bus.on(document, {
	keypress: ev => console.log(ev),
	click: ev => console.log(ev)
})

var $root = document.querySelector('.app');

ui(focus).then(content => {
	morph($root, content)
})
