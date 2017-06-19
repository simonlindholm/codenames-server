
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

let width = 5, height = 5;
let cards = [];
let gridShown = true;
let counts = [0,0,0,0];
let engine = 'glove';
let pickedCol = 'r';
let lastClueStr = "";
let minClueIndex = 0;
let seenClues = new Set();

let contEl = document.getElementById('cont');
let optionsEl = elm(contEl, 'div');
let boardEl = elm(contEl, 'div');
let colorsEl = elm(contEl, 'div');
let statusEl = elm(contEl, 'div');
let startingEl = elm(statusEl, 'span');
txt(statusEl, ' ');
let remainingEl = elm(statusEl, 'span');
let cluesEl = elm(contEl, 'div');
let colorsGridEl;
let engineChoiceEl;

function reset() {
	counts = {
		'3x3': [4,4,0,1],
		'4x4': [6,5,4,1],
		'4x5': [8,7,4,1],
		'5x5': [9,8,7,1],
		'6x6': [12,11,12,1],
		'7x7': [17,16,15,1],
	}[height + 'x' + width];
	if (counts[0] + counts[1] + counts[2] + counts[3] != width*height)
		throw new Error("invalid counts...");
	clearelm(boardEl);
	clearelm(colorsEl);
	clearelm(cluesEl);

	toggleGridBtn.value = "Hide grid";
	gridShown = true;
	colorsGridEl = elm(colorsEl, 'div');
	let gridTable = elm(colorsGridEl, 'table', {id: "grid"});
	let wordTable = elm(boardEl, 'table', {id: "words"});

	cards = [];
	for (let i = 0; i < height; i++) {
		let gridRow = gridTable.insertRow(-1);
		let wordRow = wordTable.insertRow(-1);
		for (let j = 0; j < width; j++) {
			let gridCell = gridRow.insertCell(-1);
			let wordCell = wordRow.insertCell(-1);
			let r = i, c = j;
			let card = {color: '', word: '', wordEl: wordCell, gridEl: gridCell, done: false};
			gridCell.onclick = () => {
				setCellColor(r, c, pickedCol);
				setStarter(guessStarter());
			};
			wordCell.onclick = function() {
				card.done = !card.done;
				this.dataset.remaining = (card.done ? 'no' : 'yes');
				updateStatus();
				restrictEngines();
			};
			wordCell.dataset.remaining = 'yes';
			cards.push(card);
			setCellColor(i, j, 'c');
		}
	}

	let picker = elm(colorsGridEl, 'div', {id: "picker"});
	for (let col of "rbca") {
		let cell = elm(picker, 'span', {id: 'picker-' + col, class: 'col-' + col});
		cell.onclick = uiSetSelection.bind(null, col);
	};
	uiSetSelection('r');
	setStarter('empty');
	restrictEngines();
	// (don't reset seenClues, repeated clues are boring anyway.)
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
	if (c.c == height*width)
		return 'empty';
	return '';
}

function updateStatus() {
	let c = {r: 0, b: 0, c: 0, a: 0};
	let t = {r: 0, b: 0, c: 0, a: 0};
	for (let ca of cards) {
		if (!ca.done) c[ca.color]++;
		t[ca.color]++;
	}
	clearelm(remainingEl);
	if (c.a != t.a)
		txt(remainingEl, "Assassin contacted!");
	else if (!c.r && !c.b && t.b && t.r)
		txt(remainingEl, "Tie! :O");
	else if (!c.r && c.b && t.r)
		txt(remainingEl, "Red wins!");
	else if (!c.b && c.r && t.b)
		txt(remainingEl, "Blue wins!");
	else if (t.r && t.b)
		txt(remainingEl, "Remaining: " + c.r + " red, " + c.b + " blue, " + c.c + " neutral, " + c.a + " assassin");
}

function setStarter(start) {
	clearelm(startingEl);
	if (start == 'empty')
		txt(startingEl, "(empty grid)");
	else if (start)
		txt(startingEl, (start == 'r' ? "Red" : "Blue") + " to start.");
	else
		txt(startingEl, "(non-standard grid)");
	updateStatus();
}

function setCellColor(i, j, col) {
	cards[i*width + j].color = col;
	cards[i*width + j].gridEl.className = 'col-' + col;
	cards[i*width + j].wordEl.className = 'col-' + col;
}

function uiSetSelection(col) {
	pickedCol = col;
	document.getElementById('picker').setAttribute("picked", col);
}

function toggleGrid() {
	gridShown = !gridShown;
	colorsGridEl.style.display = gridShown ? 'block' : 'none';
	toggleGridBtn.value = gridShown ? "Hide grid" : "Show grid";
}

function shuffle(list) {
	for (let i = 1; i < list.length; i++) {
		let j = (Math.random() * (i+1)) | 0;
		let t = list[j]; list[j] = list[i]; list[i] = t;
	}
}

function randomGrid() {
	let start = Math.random() < 0.5 ? 'r' : 'b';
	let nonstart = (start == 'r' ? 'b' : 'r');
	let cols = start.repeat(counts[0]) + nonstart.repeat(counts[1]) + 'c'.repeat(counts[2]) + 'a'.repeat(counts[3]);
	cols = cols.split('');
	shuffle(cols);

	let c = 0;
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			setCellColor(i, j, cols[c++]);
		}
	}
	setStarter(start);
}

function restrictEngines() {
	let forceConceptNet = false;
	for (let c of cards) {
		if (!c.done && c.word.includes(" "))
			forceConceptNet = true;
	}

	if (forceConceptNet) {
		if (!engineChoiceEl.disabled) {
			engineChoiceEl.disabled = true;
			engineChoiceEl.title = "Forced conceptnet engine due to words with spaces.";
			engineChoiceEl.selectedIndex = 1;
			engine = 'conceptnet';
		}
	} else {
		engineChoiceEl.disabled = false;
		engineChoiceEl.title = "";
	}
}

function randomWords() {
	shuffle(wordlist);
	let words = wordlist.slice(0, height*width);
	for (let i = 0; i < height*width; i++) {
		cards[i].wordEl.textContent = cards[i].word = words[i];
	}
	restrictEngines();
}

function showClue(col, clue) {
	let el = elm(cluesEl, 'div', {class: "clue clue-" + col});
	txt(elm(el, 'span'), clue.word + " " + clue.count);
	txt(el, ' ');
	let link = elm(el, 'a', {href: "#"});
	txt(link, "(explain?)");
	link.onclick = function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		let col2str = col => {
			if (col == 'r') return "(red)";
			if (col == 'b') return "(blue)";
			if (col == 'c') return "(civilian)";
			if (col == 'a') return "(assassin)";
		};
		alert(clue.why.map(w => w.score + ": " + w.word + " " + col2str(w.type)).join("\n"));
	};
	alert(clue.word + " " + clue.count);
}

function giveClue(col) {
	let cas = [];
	let c = {r: 0, b: 0, c: 0, a: 0};
	let allCivilian = true;
	for (let ca of cards) {
		if (!ca.done && !ca.word) {
			alert("Fill in all the words first.");
			return;
		}
		if (!ca.done) {
			cas.push(ca);
			c[ca.color]++;
		}
		if (ca.color != 'c') allCivilian = false;
	}
	if (allCivilian) {
		alert("Fill in the grid first.");
		return;
	}
	if (!c[col]) {
		alert("No remaining words to give clues for.");
		return;
	}

	let clueStr = JSON.stringify({cas, engine, col});
	if (clueStr != lastClueStr) {
		minClueIndex = 0;
		lastClueStr = clueStr;
	}

	apiCall(engine, col, cas, minClueIndex).then(result => {
		if (result.status == 0) {
			alert("Internal error: " + result.message);
		} else if (result.status == 1) {
			if (seenClues.has(result.word)) {
				console.log("Already seen this clue, giving another...");
				giveClue(col);
			} else {
				seenClues.add(result.word);
				showClue(col, result);
			}
		} else {
			alert("Error: " + result.message);
		}
	});
	minClueIndex++;
}

let sizeChoice = elm(optionsEl, 'select');
for (let s of '3x3,4x4,4x5,5x5,6x6,7x7'.split(','))
	elm(sizeChoice, 'option', {'value': s}, s);
sizeChoice.selectedIndex = 3;
sizeChoice.onchange = function() {
	height = +this.value.split('x')[0];
	width = +this.value.split('x')[1];
	reset();
};

txt(optionsEl, ' ');
elm(optionsEl, 'input', {type: 'button', value: "Reset"}).onclick = reset;

txt(optionsEl, ' | ');
elm(optionsEl, 'input', {type: 'button', value: "Random words"}).onclick = randomWords;

txt(optionsEl, ' ');
elm(optionsEl, 'input', {type: 'button', value: "Random grid"}).onclick = randomGrid;

txt(optionsEl, ' ');
var toggleGridBtn = elm(optionsEl, 'input', {type: 'button'});
toggleGridBtn.onclick = toggleGrid;

txt(optionsEl, ' | ');
engineChoiceEl = elm(optionsEl, 'select', {id: "engine"});
elm(engineChoiceEl, 'option', {value: 'glove'}, "GloVe");
elm(engineChoiceEl, 'option', {value: 'conceptnet'}, "ConceptNet");
engineChoiceEl.selectedIndex = 0;
engineChoiceEl.onchange = function() { engine = this.value; };

txt(optionsEl, ' ');
elm(optionsEl, 'input', {type: 'button', value: "Red clue"}).onclick = () => giveClue('r');
txt(optionsEl, ' ');
elm(optionsEl, 'input', {type: 'button', value: "Blue clue"}).onclick = () => giveClue('b');

reset();
