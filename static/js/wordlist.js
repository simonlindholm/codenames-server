"use strict";

var wordlists = {
'eng': [
	"africa",
	"agent",
	"air",
	"alien",
	"alps",
	"amazon",
	"ambulance",
	"america",
	"angel",
	"antarctica",
	"apple",
	"arm",
	"atlantis",
	"australia",
	"aztec",
	"back",
	"ball",
	"band",
	"bank",
	"bar",
	"bark",
	"bat",
	"battery",
	"beach",
	"bear",
	"beat",
	"bed",
	"beijing",
	"bell",
	"belt",
	"berlin",
	"bermuda",
	"berry",
	"bill",
	"block",
	"board",
	"bolt",
	"bomb",
	"bond",
	"boom",
	"boot",
	"bottle",
	"bow",
	"box",
	"bridge",
	"brush",
	"buck",
	"buffalo",
	"bug",
	"bugle",
	"button",
	"calf",
	"canada",
	"cap",
	"capital",
	"car",
	"card",
	"carrot",
	"casino",
	"cast",
	"cat",
	"cell",
	"centaur",
	"center",
	"chair",
	"change",
	"charge",
	"check",
	"chest",
	"chick",
	"china",
	"chocolate",
	"church",
	"circle",
	"cliff",
	"cloak",
	"club",
	"code",
	"cold",
	"comic",
	"compound",
	"concert",
	"conductor",
	"contract",
	"cook",
	"copper",
	"cotton",
	"court",
	"cover",
	"crane",
	"crash",
	"cricket",
	"cross",
	"crown",
	"cycle",
	"czech",
	"dance",
	"date",
	"day",
	"death",
	"deck",
	"degree",
	"diamond",
	"dice",
	"dinosaur",
	"disease",
	"doctor",
	"dog",
	"draft",
	"dragon",
	"dress",
	"drill",
	"drop",
	"duck",
	"dwarf",
	"eagle",
	"egypt",
	"embassy",
	"engine",
	"england",
	"europe",
	"eye",
	"face",
	"fair",
	"fall",
	"fan",
	"fence",
	"field",
	"fighter",
	"figure",
	"file",
	"film",
	"fire",
	"fish",
	"flute",
	"fly",
	"foot",
	"force",
	"forest",
	"fork",
	"france",
	"game",
	"gas",
	"genius",
	"germany",
	"ghost",
	"giant",
	"glass",
	"glove",
	"gold",
	"grace",
	"grass",
	"greece",
	"green",
	"ground",
	"ham",
	"hand",
	"hawk",
	"head",
	"heart",
	"helicopter",
	"himalayas",
	"hole",
	"hollywood",
	"honey",
	"hood",
	"hook",
	"horn",
	"horse",
	"horseshoe",
	"hospital",
	"hotel",
	"ice",
	"ice cream",
	"india",
	"iron",
	"ivory",
	"jack",
	"jam",
	"jet",
	"jupiter",
	"kangaroo",
	"ketchup",
	"key",
	"kid",
	"king",
	"kiwi",
	"knife",
	"knight",
	"lab",
	"lap",
	"laser",
	"lawyer",
	"lead",
	"lemon",
	"leprechaun",
	"life",
	"light",
	"limousine",
	"line",
	"link",
	"lion",
	"litter",
	"loch ness",
	"lock",
	"log",
	"london",
	"luck",
	"mail",
	"mammoth",
	"maple",
	"marble",
	"march",
	"mass",
	"match",
	"mercury",
	"mexico",
	"microscope",
	"millionaire",
	"mine",
	"mint",
	"missile",
	"model",
	"mole",
	"moon",
	"moscow",
	"mount",
	"mouse",
	"mouth",
	"mug",
	"nail",
	"needle",
	"net",
	"new york",
	"night",
	"ninja",
	"note",
	"novel",
	"nurse",
	"nut",
	"octopus",
	"oil",
	"olive",
	"olympus",
	"opera",
	"orange",
	"organ",
	"palm",
	"pan",
	"pants",
	"paper",
	"parachute",
	"park",
	"part",
	"pass",
	"paste",
	"penguin",
	"phoenix",
	"piano",
	"pie",
	"pilot",
	"pin",
	"pipe",
	"pirate",
	"pistol",
	"pit",
	"pitch",
	"plane",
	"plastic",
	"plate",
	"platypus",
	"play",
	"plot",
	"point",
	"poison",
	"pole",
	"police",
	"pool",
	"port",
	"post",
	"pound",
	"press",
	"princess",
	"pumpkin",
	"pupil",
	"pyramid",
	"queen",
	"rabbit",
	"racket",
	"ray",
	"revolution",
	"ring",
	"robin",
	"robot",
	"rock",
	"rome",
	"root",
	"rose",
	"roulette",
	"round",
	"row",
	"ruler",
	"satellite",
	"saturn",
	"scale",
	"school",
	"scientist",
	"scorpion",
	"screen",
	"scuba diver",
	"seal",
	"server",
	"shadow",
	"shakespeare",
	"shark",
	"ship",
	"shoe",
	"shop",
	"shot",
	"sink",
	"skyscraper",
	"slip",
	"slug",
	"smuggler",
	"snow",
	"snowman",
	"sock",
	"soldier",
	"soul",
	"sound",
	"space",
	"spell",
	"spider",
	"spike",
	"spine",
	"spot",
	"spring",
	"spy",
	"square",
	"stadium",
	"staff",
	"star",
	"state",
	"stick",
	"stock",
	"straw",
	"stream",
	"strike",
	"string",
	"sub",
	"suit",
	"superhero",
	"swing",
	"switch",
	"table",
	"tablet",
	"tag",
	"tail",
	"tap",
	"teacher",
	"telescope",
	"temple",
	"theater",
	"thief",
	"thumb",
	"tick",
	"tie",
	"time",
	"tokyo",
	"tooth",
	"torch",
	"tower",
	"track",
	"train",
	"triangle",
	"trip",
	"trunk",
	"tube",
	"turkey",
	"undertaker",
	"unicorn",
	"vacuum",
	"van",
	"vet",
	"wake",
	"wall",
	"war",
	"washer",
	"washington",
	"watch",
	"water",
	"wave",
	"web",
	"well",
	"whale",
	"whip",
	"wind",
	"witch",
	"worm",
	"yard",
],
'swe': [
	"ackord",
	"advokat",
	"afrika",
	"agent",
	"alperna",
	"amazon",
	"ambassad",
	"ambulans",
	"amerika",
	"ansikte",
	"antarktis",
	"arena",
	"ask",
	"astronaut",
	"atlantis",
	"australien",
	"axel",
	"bak",
	"banan",
	"bank",
	"bar",
	"ben",
	"bil",
	"biograf",
	"björn",
	"blad",
	"blixt",
	"block",
	"bläckfisk",
	"bock",
	"bok",
	"bomb",
	"bomull",
	"bord",
	"box",
	"bro",
	"broms",
	"brygga",
	"bulle",
	"bälte",
	"bär",
	"båge",
	"båt",
	"casino",
	"centrum",
	"choklad",
	"cirkel",
	"cykel",
	"dag",
	"dal",
	"damm",
	"dans",
	"diamant",
	"dinosaurie",
	"docka",
	"doktor",
	"drag",
	"drake",
	"drog",
	"drottning",
	"dräkt",
	"dvärg",
	"dykare",
	"däck",
	"död",
	"egypten",
	"ek",
	"eka",
	"eld",
	"elfenben",
	"england",
	"enhörning",
	"etikett",
	"europa",
	"fackla",
	"fall",
	"fallskärm",
	"far",
	"fat",
	"fenix",
	"figur",
	"fika",
	"fil",
	"film",
	"fisk",
	"fjäll",
	"flagga",
	"flaska",
	"fluga",
	"fläck",
	"fläkt",
	"flöjt",
	"forskare",
	"fot",
	"frankrike",
	"full",
	"fält",
	"fängelse",
	"får",
	"gaffel",
	"geni",
	"gift",
	"glas",
	"glass",
	"godis",
	"grad",
	"gran",
	"grav",
	"grekland",
	"grotta",
	"gräs",
	"grön",
	"guld",
	"gunga",
	"halt",
	"hand",
	"handske",
	"helikopter",
	"hjärta",
	"hollywood",
	"hologram",
	"hon",
	"honung",
	"hopp",
	"horn",
	"hotell",
	"hund",
	"huvud",
	"hylla",
	"häst",
	"häxa",
	"hål",
	"indian",
	"internet",
	"is",
	"isberg",
	"jet",
	"järn",
	"jätte",
	"kall",
	"kam",
	"kanal",
	"kanin",
	"kanon",
	"katt",
	"kentaur",
	"ketchup",
	"kina",
	"klippa",
	"klister",
	"klocka",
	"klubba",
	"klyftig",
	"klämma",
	"klöver",
	"knapp",
	"kniv",
	"knut",
	"kock",
	"kod",
	"konsert",
	"kontra",
	"koppar",
	"kor",
	"kors",
	"kort",
	"kraft",
	"kran",
	"krig",
	"kristall",
	"krita",
	"krock",
	"krok",
	"krona",
	"kräfta",
	"kung",
	"kyrka",
	"känguru",
	"kärna",
	"kåk",
	"kö",
	"lag",
	"lager",
	"land",
	"lapp",
	"larv",
	"laser",
	"leder",
	"ledning",
	"lejon",
	"lek",
	"lik",
	"limousine",
	"linje",
	"liv",
	"ljus",
	"london",
	"lov",
	"lucia",
	"luffare",
	"luft",
	"lur",
	"lyra",
	"län",
	"länk",
	"lärare",
	"lår",
	"låt",
	"mammut",
	"man",
	"mantel",
	"mark",
	"mars",
	"mask",
	"maskerad",
	"matta",
	"medelhavet",
	"mikroskop",
	"miljonär",
	"mina",
	"missil",
	"mocka",
	"morot",
	"moskva",
	"motor",
	"mullvad",
	"mun",
	"mus",
	"mätare",
	"mål",
	"måne",
	"mås",
	"natt",
	"new york",
	"ninja",
	"norden",
	"nyckel",
	"näbbdjur",
	"nät",
	"nål",
	"nöt",
	"odjur",
	"olja",
	"opera",
	"panna",
	"papper",
	"paraply",
	"pil",
	"pilot",
	"pingvin",
	"pipa",
	"pirat",
	"piska",
	"pistol",
	"pjäs",
	"plan",
	"planet",
	"polis",
	"post",
	"press",
	"prinsessa",
	"pumpa",
	"punkt",
	"pyjamas",
	"pyramid",
	"päron",
	"rabatt",
	"rad",
	"ram",
	"rasta",
	"regnbåge",
	"ren",
	"riddare",
	"ring",
	"ris",
	"ro",
	"robot",
	"rock",
	"rom",
	"roulette",
	"runda",
	"ruta",
	"rymd",
	"rör",
	"sadel",
	"saga",
	"same",
	"satellit",
	"saturnus",
	"serie",
	"sjukdom",
	"sjukhus",
	"skandinavien",
	"skatt",
	"skinka",
	"skiva",
	"sko",
	"skog",
	"skola",
	"skott",
	"skugga",
	"skydd",
	"skyskrapa",
	"skärm",
	"skål",
	"skåpbil",
	"sköld",
	"slag",
	"slang",
	"slant",
	"slända",
	"snapphane",
	"snö",
	"snögubbe",
	"snöre",
	"soldat",
	"spel",
	"spets",
	"spik",
	"spindel",
	"spion",
	"spira",
	"springa",
	"spår",
	"spö",
	"spöke",
	"stack",
	"stadium",
	"stam",
	"stav",
	"stjärna",
	"stock",
	"stockholm",
	"stol",
	"stolpe",
	"strand",
	"ström",
	"sund",
	"superhjälte",
	"sverige",
	"svin",
	"svärd",
	"syster",
	"säng",
	"såg",
	"tand",
	"tangent",
	"tank",
	"tappa",
	"tavla",
	"teater",
	"teleskop",
	"tentakel",
	"tid",
	"tiger",
	"tjuv",
	"tokyo",
	"tomte",
	"torn",
	"troll",
	"tron",
	"träff",
	"tumme",
	"tunga",
	"tunna",
	"tur",
	"tärna",
	"tång",
	"tår",
	"tårta",
	"uggla",
	"under",
	"ur",
	"utomjording",
	"vad",
	"vagn",
	"vakuum",
	"val",
	"vals",
	"valv",
	"vass",
	"vatten",
	"viking",
	"vind",
	"vrak",
	"vulkan",
	"vägg",
	"väst",
	"våg",
	"vår",
	"yxa",
	"zombie",
	"zoo",
	"älg",
	"ängel",
	"äpple",
	"åker",
	"öga",
	"örn",
	"östersjön",
],
};
