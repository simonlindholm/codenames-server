"use strict";

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

function reduceFileSize(file, acceptFileSize, maxWidth, maxHeight, quality) {
	if (file.size <= acceptFileSize) {
		return Promise.resolve(file);
	}
	return new Promise(resolve => {
		let im = new Image();
		im.onerror = () => resolve(file);
		im.onload = () => {
			getExifOrientation(file).then(orientation => {
				if (orientation > 4) {
					let t = maxWidth;
					maxWidth = maxHeight;
					maxHeight = t;
				}

				let w = im.width, h = im.height;
				let scale = Math.min(maxWidth / w, maxHeight / h, 1);
				h = Math.round(h * scale);
				w = Math.round(w * scale);

				let canvas = imgToCanvasWithOrientation(im, w, h, orientation);
				canvas.toBlob(blob => {
					console.log("Resized image to " + w + "x" + h + ", " + (blob.size >> 10) + "kB");
					resolve(blob);
				}, 'image/jpeg', quality);
			});
		};
		im.src = URL.createObjectURL(file);
	});
}

function apiClue(engine, color, cards, index, oldClues, hintedWords) {
	let colors = cards.map(x => x.color);
	let words = cards.map(x => x.word);
	return fetch("api/1/clue?engine=" + engine +
			"&color=" + color +
			"&colors=" + colors.join('') +
			"&words=" + encodeURIComponent(words.join(',')) +
			"&old_clues=" + encodeURIComponent(oldClues.join(',')) +
			"&hinted_words=" + encodeURIComponent(hintedWords.join(',')) +
			"&index=" + index +
			"&count=1")
		.then(response => response.json());
}

function apiScanWords(blob, language) {
	let fd = new FormData();
	fd.set('size', '5x5');
	fd.set('lang', language);
	fd.set('file', blob, blob.name || "file.jpg");
	return fetch('api/1/ocr-board', {method: 'POST', body: fd})
		.then(response => response.json());
}

function apiScanGrid(blob) {
	let fd = new FormData();
	fd.set('size', '5x5');
	fd.set('file', blob, blob.name || "file.jpg");
	return fetch('api/1/ocr-grid', {method: 'POST', body: fd})
		.then(response => response.json());
}

let width = 5, height = 5;
let cards = [];
let previousClues = [];
let previousHintedWords = new Set();
let gridShown = true;
let counts = [0,0,0,0];
let engine = 'glove';
let pickedCol = 'r';
let seenClues = new Set();
let ownEngineChoice = 0;
let playing = false;
let starter = '';
let language = 'eng';

let contEl = document.getElementById('cont');
let optionsEl = elm(contEl, 'div');
let boardEl = elm(contEl, 'div');
let colorsEl = elm(contEl, 'div');
let statusEl = elm(contEl, 'div', {id: "status"});
let cluesEl = elm(contEl, 'div');
let wordsFileEl = document.getElementById("ocr-words-input");
let gridFileEl = document.getElementById("ocr-grid-input");
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

	selectMode(false);
	toggleGridBtn.value = "Hide grid";
	gridShown = true;
	colorsGridEl = elm(colorsEl, 'div');
	let gridTable = elm(colorsGridEl, 'table', {id: "grid"});
	let wordTable = elm(boardEl, 'table', {id: "words"});
	starter = '';

	previousClues = [];
	previousHintedWords = new Set();
	cards = [];
	for (let i = 0; i < height; i++) {
		let gridRow = gridTable.insertRow(-1);
		let wordRow = wordTable.insertRow(-1);
		for (let j = 0; j < width; j++) {
			let gridEl = gridRow.insertCell(-1);
			let wordEl = wordRow.insertCell(-1);
			elm(wordEl, 'span', {class: 'word-display'});
			let inputEl = elm(wordEl, 'input', {class: 'word-input', type: 'text'});
			let pos = i*width + j;
			let card = {color: '', word: '', inputEl, wordEl, gridEl, done: false};
			gridEl.onclick = () => {
				setCellColor(pos, pickedCol);
				starter = guessStarter();
				updateStatus();
			};
			wordEl.onclick = function() {
				if (playing) {
					card.done = !card.done;
					this.dataset.remaining = (card.done ? 'no' : 'yes');
					updateStatus();
					restrictEngines();
				} else {
					inputEl.focus();
				}
			};
			inputEl.addEventListener('input', function() {
				setWord(pos, this.value.toLowerCase().trim(), 'input');
			}, false);
			wordEl.dataset.remaining = 'yes';
			cards.push(card);
			setCellColor(pos, 'c');
		}
	}

	let picker = elm(colorsGridEl, 'div', {id: "picker"});
	for (let col of "rbca") {
		let cell = elm(picker, 'span', {id: 'picker-' + col, class: 'col-' + col});
		cell.onclick = uiSetSelection.bind(null, col);
	};
	uiSetSelection('r');
	restrictEngines();
	updateStatus();
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
	return '';
}

function updateStatus() {
	let c = {r: 0, b: 0, c: 0, a: 0};
	let t = {r: 0, b: 0, c: 0, a: 0};
	let inProgress = false;
	for (let ca of cards) {
		if (!ca.done) c[ca.color]++;
		else inProgress = true;
		t[ca.color]++;
	}
	clearelm(statusEl);
	let msg = ' ', msg2 = ' ';
	if (c.a != t.a)
		msg = "Assassin contacted!";
	else if (!c.r && !c.b && t.b && t.r)
		msg = "Tie! :O";
	else if (!c.r && c.b && t.r)
		msg = "Red wins!";
	else if (!c.b && c.r && t.b)
		msg = "Blue wins!";
	else
		msg = "Remaining: " + c.r + " red, " + c.b + " blue, " + c.c + " neutral, " + c.a + " assassin";
	if (starter && !inProgress)
		msg2 = (starter == 'r' ? "Red" : "Blue") + " to start.";
	else if (!starter && !playing)
		msg2 = (c.c != width*height ? "(non-standard grid)" : "(no grid set)");
	elm(statusEl, 'div', {}, msg);
	elm(statusEl, 'div', {}, msg2);
}

function setCellColor(pos, col) {
	cards[pos].color = col;
	cards[pos].gridEl.className = 'col-' + col;
	cards[pos].wordEl.className = 'col-' + col;
}

function uiSetSelection(col) {
	pickedCol = col;
	document.getElementById('picker').setAttribute("picked", col);
}

function uiStartPlaying() {
	let allCivilian = true;
	for (let ca of cards) {
		if (!ca.word) {
			alert("Fill in all the words first.");
			return;
		}
		if (ca.color != 'c') allCivilian = false;
	}
	if (allCivilian) {
		alert("Fill in the color grid first.");
		return;
	}
	let seenWords = new Set();
	for (let ca of cards) {
		if (seenWords.has(ca.word)) {
			alert("Duplicate word: " + ca.word);
			return;
		}
		seenWords.add(ca.word);
	}
	selectMode(true);
}

function toggleGrid() {
	gridShown = !gridShown;
	colorsGridEl.style.display = gridShown ? 'block' : 'none';
	toggleGridBtn.value = gridShown ? "Hide grid" : "Show grid";
}

function selectMode(nplaying) {
	playing = nplaying;
	contEl.dataset.playing = playing ? 'yes' : 'no';
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
	for (let i = 0; i < width*height; i++) {
		setCellColor(i, cols[i]);
	}
	starter = start;
	updateStatus();
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
		engineChoiceEl.selectedIndex = ownEngineChoice;
	}
}

function setWord(pos, w, context) {
	let c = cards[pos];
	c.word = w;
	if (context != 'input')
		c.inputEl.value = w;
	c.wordEl.firstChild.textContent = w;
	if (context != 'delay-restrict')
		restrictEngines();
}

function randomWords() {
	let wordlist = wordlists[language];
	shuffle(wordlist);
	let words = wordlist.slice(0, height*width);
	for (let i = 0; i < width*height; i++) {
		setWord(i, words[i], 'delay-restrict');
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

function giveClue(col, clueIndex = 0) {
	let cas = [];
	let c = {r: 0, b: 0, c: 0, a: 0};
	for (let ca of cards) {
		if (!ca.word)
			throw new Error("should have filled in all words");
		if (!ca.done) {
			cas.push(ca);
			c[ca.color]++;
		}
	}
	if (!c[col]) {
		alert("No remaining words to give clues for.");
		return;
	}

	let oldClues = previousClues.filter(w => w.color == col).map(w => w.word);
	let hintedWords = cards.filter(c => previousHintedWords.has(c.word) && c.color == col)
		.map(c => c.word);
	apiClue(engine, col, cas, clueIndex, oldClues, hintedWords).then(resp => {
		if (resp.status == 0) {
			alert("Internal error: " + resp.message);
		} else if (resp.status == 1) {
			let clue = resp.result[0];
			if (seenClues.has(clue.word)) {
				console.log("Already seen this clue, giving another...");
				giveClue(col, clueIndex + 1);
			} else {
				previousClues.push({word: clue.word, color: col});
				let count = 0;
				for (let w of clue.why) {
					if (count < clue.count && w.type === col) {
						count++;
						previousHintedWords.add(w.word);
					}
				}
				seenClues.add(clue.word);
				showClue(col, clue);
			}
		} else {
			alert("Error: " + resp.message);
		}
	}).catch(err => {
		alert("Error: " + err);
	});
}

function scanWords(file) {
	reduceFileSize(file, 500*1000, 2048, 2048, 0.9)
		.then(blob => apiScanWords(blob, language))
		.then(resp =>
	{
		if (height != 5 || width != 5) {
			alert("Error: Only 5x5 grids can be scanned.");
		} else if (resp.status == 0) {
			alert("Internal error: " + resp.message);
		} else if (resp.status == 1) {
			let grid = resp.grid;
			for (let i = 0; i < height; i++) {
				for (let j = 0; j < width; j++)
					setWord(i * width + j, grid[i][j].toLowerCase(), 'delay-restrict');
			}
			restrictEngines();
		} else {
			alert("Error: " + resp.message);
		}
	}).catch(err => {
		alert("Error: " + err);
	});
}

function scanGrid(file) {
	reduceFileSize(file, 500*1000, 1024, 1024, 0.7)
		.then(apiScanGrid)
		.then(resp =>
	{
		if (height != 5 || width != 5) {
			alert("Error: Only 5x5 grids can be scanned.");
		} else if (resp.status == 0) {
			alert("Internal error: " + resp.message);
		} else if (resp.status == 1) {
			let grid = resp.grid;
			for (let i = 0; i < height; i++) {
				for (let j = 0; j < width; j++)
					setCellColor(i * width + j, grid[i][j]);
			}
			starter = guessStarter();
			updateStatus();
		} else {
			alert("Error: " + resp.message);
		}
	}).catch(err => {
		alert("Error: " + err);
	});
}

// Options UI:
// 5x5 Reset | Hide grid, Random grid, Scan grid, Random words, Scan words, Start, OR:
// 5x5 Reset | Hide grid, Edit | GloVe, Red clue, Blue clue

let sizeChoice = elm(optionsEl, 'select');
for (let s of '3x3,4x4,4x5,5x5,6x6,7x7'.split(','))
	elm(sizeChoice, 'option', {'value': s}, s);
sizeChoice.selectedIndex = 3;
contEl.dataset.size = '5x5';
sizeChoice.onchange = function() {
	height = +this.value.split('x')[0];
	width = +this.value.split('x')[1];
	contEl.dataset.size = this.value;
	reset();
};

txt(optionsEl, ' ');
elm(optionsEl, 'input', {type: 'button', value: "Reset"}).onclick = reset;
txt(optionsEl, ' | ');

var toggleGridBtn = elm(optionsEl, 'input', {type: 'button', id: 'toggle-grid-btn'});
toggleGridBtn.onclick = toggleGrid;
txt(optionsEl, ' ');

// Editing:
let editOptionsEl = elm(optionsEl, 'span', {id: 'edit-options'});
elm(editOptionsEl, 'input', {type: 'button', value: "Random grid"}).onclick = randomGrid;

txt(editOptionsEl, ' ');
elm(editOptionsEl, 'input', {type: 'button', value: "Scan grid", id: 'scan-grid-btn'}).onclick = () => gridFileEl.click();

txt(editOptionsEl, ' ');
elm(editOptionsEl, 'input', {type: 'button', value: "Random words"}).onclick = randomWords;

txt(editOptionsEl, ' ');
elm(editOptionsEl, 'input', {type: 'button', value: "Scan words", id: 'scan-words-btn'}).onclick = () => wordsFileEl.click();

txt(editOptionsEl, ' ');
elm(editOptionsEl, 'input', {type: 'button', value: "Start"}).onclick = uiStartPlaying;

// Playing:
let playOptionsEl = elm(optionsEl, 'span', {id: 'play-options'});

elm(playOptionsEl, 'input', {type: 'button', value: "Edit"}).onclick = () => selectMode(false);
txt(playOptionsEl, ' | ');

engineChoiceEl = elm(playOptionsEl, 'select', {id: "engine"});
elm(engineChoiceEl, 'option', {value: 'glove'}, "GloVe");
elm(engineChoiceEl, 'option', {value: 'conceptnet'}, "ConceptNet");
engineChoiceEl.selectedIndex = 0;
engineChoiceEl.onchange = function() {
	ownEngineChoice = this.selectedIndex;
	engine = this.value;
};

txt(playOptionsEl, ' ');
elm(playOptionsEl, 'input', {type: 'button', value: "Red clue"}).onclick = () => giveClue('r');
txt(playOptionsEl, ' ');
elm(playOptionsEl, 'input', {type: 'button', value: "Blue clue"}).onclick = () => giveClue('b');

document.addEventListener('keydown', function(ev) {
	if (ev.keyCode == 13) {
		let el = document.activeElement;
		if (el && el.type == 'text') {
			for (let i = 0; i < width*height; i++) {
				if (cards[i].inputEl == el) {
					cards[(i+1) % (width*height)].inputEl.focus();
					ev.preventDefault();
					ev.stopPropagation();
					return;
				}
			}
		}
	}
}, true);

wordsFileEl.onchange = function() {
	if (this.files && this.files[0])
		scanWords(this.files[0]);
};
gridFileEl.onchange = function() {
	if (this.files && this.files[0])
		scanGrid(this.files[0]);
};

reset();
