
function elm(par, tag, attr = {}, text = "") {
	let el = document.createElement(tag);
	par.appendChild(el);
	for (let at in attr) {
		el.setAttribute(at, attr[at]);
	}
	if (text) txt(el, text);
	return el;
}

function txt(par, text) {
	let el = document.createTextNode(text);
	par.appendChild(el);
	return el;
}

function clearelm(el) {
	el.textContent = '';
}

function apiCall(engine, color, cards, index) {
	let colors = cards.map(x => x.color);
	let words = cards.map(x => x.word);
	return fetch("api/1?engine=" + engine +
			"&color=" + color +
			"&colors=" + colors.join('') +
			"&words=" + encodeURIComponent(words.join(',')) +
			"&index=" + index)
		.then(response => response.json());
}

let size = 5;
let cards = [];
let gridShown = true;
let counts = [0,0,0,0];
let engine = 'glove';

let cont = document.getElementById('cont');
let optionsel = elm(cont, 'div');
let board = elm(cont, 'div');
let colors = elm(cont, 'div');
let startingEl = elm(cont, 'div');
let colorsGrid;
let pickedCol = 'r';

function reset() {
	counts = {
		'3': [4,4,0,1],
		'4': [6,5,4,1],
		'5': [9,8,7,1],
		'6': [12,11,12,1],
		'7': [17,16,15,1],
	}[size];
	if (counts[0] + counts[1] + counts[2] + counts[3] != size*size)
		throw new Error("invalid counts...");
	clearelm(board);
	clearelm(colors);
	txt(board, "No board set.");

	toggleGridBtn.value = "Hide grid";
	gridShown = true;
	colorsGrid = elm(colors, 'div');
	let table = elm(colorsGrid, 'table', {id: "grid"});
	cards = [];
	for (let i = 0; i < size; i++) {
		let row = table.insertRow(-1);
		for (let j = 0; j < size; j++) {
			let cell = row.insertCell(-1);
			let r = i, c = j;
			cell.onclick = () => {
				setCellColor(r, c, pickedCol);
				setStarter(guessStarter());
			};
			cards.push({color: '', word: '', colEl: cell});
			setCellColor(i, j, 'c');
		}
	}

	let picker = elm(colorsGrid, 'div', {id: "picker"});
	for (let col of "rbca") {
		let cell = elm(picker, 'span', {id: 'picker-' + col, class: 'col-' + col});
		cell.onclick = uiSetSelection.bind(null, col);
	};
	uiSetSelection('r');
	setStarter('empty');
}

function guessStarter() {
	let c = {r: 0, b: 0, c: 0, a: 0};
	for (let ca of cards)
		c[ca.color]++;
	if (c.r == counts[0] && c.b == counts[1] && c.c == counts[2] && c.a == counts[3] && Math.random() < 0.5)
		return 'r';
	if (c.b == counts[0] && c.r == counts[1] && c.c == counts[2] && c.a == counts[3])
		return 'b';
	if (c.r == counts[0] && c.b == counts[1] && c.c == counts[2] && c.a == counts[3])
		return 'r';
	if (c.c == size*size)
		return 'empty';
	return '';
}

function setStarter(start) {
	clearelm(startingEl);
	if (start == 'empty')
		txt(startingEl, "(empty grid)");
	else if (start)
		txt(startingEl, (start == 'r' ? "Red" : "Blue") + " to start.");
	else
		txt(startingEl, "(non-standard grid)");
}

function setCellColor(i, j, col) {
	cards[i*size + j].color = col;
	cards[i*size + j].colEl.className = 'col-' + col;
}

function uiSetSelection(col) {
	pickedCol = col;
	document.getElementById('picker').setAttribute("picked", col);
}

function toggleGrid() {
	gridShown = !gridShown;
	colorsGrid.style.display = gridShown ? 'block' : 'none';
	toggleGridBtn.value = gridShown ? "Hide grid" : "Show grid";
}

function randomGrid() {
	let start = Math.random() < 0.5 ? 'r' : 'b';
	let nonstart = (start == 'r' ? 'b' : 'r');
	let cols = start.repeat(counts[0]) + nonstart.repeat(counts[1]) + 'c'.repeat(counts[2]) + 'a'.repeat(counts[3]);
	cols = cols.split('');
	for (let i = 1; i < size*size; i++) {
		let j = (Math.random() * (i+1)) | 0;
		let t = cols[j]; cols[j] = cols[i]; cols[i] = t;
	}

	let c = 0;
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			setCellColor(i, j, cols[c++]);
		}
	}
	setStarter(start);
}

function randomWords() {
}

txt(optionsel, "Size: ");
let sizeChoice = elm(optionsel, 'select');
for (let s = 3; s <= 7; s++)
	elm(sizeChoice, 'option', {'value': s}, s);
sizeChoice.selectedIndex = 2;
sizeChoice.onchange = function() {
	size = +this.value;
	reset();
};

txt(optionsel, " Engine: ");
let engineChoice = elm(optionsel, 'select');
elm(engineChoice, 'option', {value: 'glove'}, "GloVe");
elm(engineChoice, 'option', {value: 'conceptnet'}, "ConceptNet");
engineChoice.selectedIndex = 0;
engineChoice.onchange = function() { engine = this.value; };

txt(optionsel, ' ');
elm(optionsel, 'input', {type: 'button', value: "Reset"}).onclick = reset;

txt(optionsel, ' | ');
var toggleGridBtn = elm(optionsel, 'input', {type: 'button'});
toggleGridBtn.onclick = toggleGrid;

txt(optionsel, ' ');
elm(optionsel, 'input', {type: 'button', value: "Random grid"}).onclick = randomGrid;

txt(optionsel, ' ');
elm(optionsel, 'input', {type: 'button', value: "Random words"}).onclick = randomWords;

reset();
