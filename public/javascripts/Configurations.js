teams = [];

class Team {
	constructor() {
		this.nickname_ = null;
		this.division_ = null;
		this.sponsor_ = null;
		this.gender_ = null;

		this.urlCode_ = null;

		this.final_ = false;
		this.year_ = 2020;

		this.pastGame_ = new PastGame();
		this.futureGame_ = new FutureGame();

		this.lastRoundOfTheSeason_ = null;

		this.success_ = null;
	}
}

class Game {
	constructor() {
		this.round_ = 1;
		this.date_ = null;
		this.opposition_ = null;
		this.oppositionNickname_ = null;
		this.oppositionImageUrl_ = null;

		this.home_ = null;
		this.location_ = null;
		this.locationNickname_ = null;
		this.locationURL_ = null;

		this.result_ = null;
		this.winOrLossVerb_ = null;
	}
}

class PastGame extends Game {
	constructor() {
		super();
		this.scoreFor_ = null;
		this.scoreAgainst_ = null;
		this.goalKickers_ = null;
		this.bestPlayers_ = null;
	}
}

class FutureGame extends Game {
	constructor() {
		super();
		this.time_ = null;
	}
}

function PopulateTeamsFromFile(callback) {
	var configurationsFile = new XMLHttpRequest();

	configurationsFile.onreadystatechange = function () {
		if (configurationsFile.readyState === 4 && configurationsFile.status === 200) {
			PopulateTeamsFromText(configurationsFile.responseText, callback);
		}
	}

	configurationsFile.open("GET", "../configurations", true);
	configurationsFile.send(null);
}

function PopulateTeamsFromText(text, callback) {
	var fileLines = text.split('\n');

	// start from 1 because first line is headers, not data
	for (var i = 1; i < fileLines.length; i++) {
		fileLines[i] = fileLines[i].replace('\r', '');
		teams[i - 1] = new Team();

		var dataList = fileLines[i].split(',');

		teams[i - 1].nickname_ = dataList[0];
		teams[i - 1].division_ = dataList[1];
		teams[i - 1].sponsor_ = dataList[2];
		teams[i - 1].lastRoundOfTheSeason_ = Number(dataList[3]);
		teams[i - 1].gender_ = dataList[4];
		teams[i - 1].urlCode_ = dataList[5];
	}

	if ($("#configurationsTable").length > 0) {
		LoadConfigurationsDataIntoTable();
	}

	callback();
}

function LoadConfigurationsDataIntoTable() {
	$("#configurationsTable tr").remove();

	// put in table headers
	var headers = "<tr> \
				  <th>NICKNAME</th> \
				  <th>DIVISION</th> \
				  <th>SPONSOR</th> \
				  <th>LAST ROUND OF THE YEAR</th> \
				  <th>GENDER</th> \
				  <th>URL CODE</td> \
				  </tr>";
	$("#configurationsTable").append(headers);

	for (var i = 0; i < teams.length; i++) {
		var newTableRow = "<tr>";
		newTableRow += "<td>" + teams[i].nickname_ + "</td>";
		newTableRow += "<td>" + teams[i].division_ + "</td>";
		newTableRow += "<td>" + teams[i].sponsor_ + "</td>";
		newTableRow += "<td>" + teams[i].lastRoundOfTheSeason_ + "</td>";
		newTableRow += "<td>" + teams[i].gender_ + "</td>";
		newTableRow += "<td>" + teams[i].urlCode_ + "</td>";
		newTableRow += "</tr>";

		$("#configurationsTable").append(newTableRow);
	}

	SetContentEditable();
}

function SetContentEditable() {
	var tableData = $("#configurationsTable td");

	for (let i = 0; i < tableData.length; i++) {
		tableData[i].setAttribute("contenteditable", "true");
	}
}

function FindUrlCodes() {
	var findUrlCodesRequest = new XMLHttpRequest();

	findUrlCodesRequest.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			console.log("URL CODES FOUND:");
			teams = JSON.parse(this.responseText);
			LoadConfigurationsDataIntoTable();
			console.log(teams);
		}
	};

	findUrlCodesRequest.open("POST", "../FindUrlCodes", true);
	findUrlCodesRequest.setRequestHeader("content-type", "application/json");
	findUrlCodesRequest.send(JSON.stringify(teams));
}

function SaveConfigurations() {
	var configurationsText = ExtractConfigurationsTextFromTable();

	var saveConfigurationsRequest = new XMLHttpRequest();

	saveConfigurationsRequest.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			console.log(this.responseText, " saving configurations");
		}
	};

	saveConfigurationsRequest.open("POST", "../saveConfigurations", true);
	saveConfigurationsRequest.setRequestHeader("content-type", "application/json");
	saveConfigurationsRequest.send(JSON.stringify([configurationsText]));

	//PopulateTeamsFromFile();
}

function ExtractConfigurationsTextFromTable() {
	var configurationsText = "";
	configurationsText += "NICKNAME, DIVISION, SPONSOR, LAST ROUND OF THE YEAR, GENDER, URL CODE"
	var tableRows = $("#configurationsTable tr");
	for (let i = 0; i < tableRows.length; i++) {
		let tds = $(tableRows[i]).find("td");
		for (let j = 0; j < tds.length; j++) {
			configurationsText += $(tds[j]).text() + ",";
		}

		// Don't want a loose empty line at the end
		if (i != tableRows.length - 1) {
			configurationsText += "\n";
		}
	}
	return configurationsText;
}