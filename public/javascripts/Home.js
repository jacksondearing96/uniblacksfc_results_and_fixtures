function ExpandOptions()
{
	var moreOptionsSection = $("#moreOptionsSection");
	moreOptionsSection.css("display", "inline-block");
	$("#optionsButton").hide();

	if ($("#moreOptionsSection tr").length == 0)
	{
		PopulateOptionsSection();
	}
}

function PopulateOptionsSection()
{
	var headers =  "<tr> \
		<th> </th> \
		<th>Team</th> \
		<th>Round</th> \
		<th>Final</th> \
		</tr> ";
						
	var moreOptionsSection = $("#moreOptionsSection");
	moreOptionsSection.append(headers);

	for (let i = 0; i < teams.length; i++)
	{
		var row =  '<tr> \
			<td><input type = "checkbox" class = "includeCheckBox" checked = "checked" data-teamDivision = ' + teams[i].division_ + '></td> \
			<td>' + teams[i].nickname_ + '</td> \
			<td><input class = "roundInput" value = "1"></td> \
			<td><input class = "finalCheckBox" unchecked type = "checkbox" data-teamDivision = ' + teams[i].division_ + '></td> \
			</tr>';

		moreOptionsSection.append(row);
	}

	moreOptionsSection.append('<br>Year: <input id = "yearInput" value = "2019">')
}



function CollapseOptions()
{
	$("#moreOptionsSection").hide();
	$("#optionsButton").show();
}

function CollapseLog()
{
	$("#log").fadeOut();
	$("#expandLogButton").css("display", "inline-block");
}

function ExpandLog()
{
	$("#log").fadeIn();
	$("#expandLogButton").fadeOut();
}

function GenerateResults()
{
	// If the options section is hidden, default values apply, otherwise:
	if ($("#moreOptionsSection").css("display") != "none")
	{
		PopulateTeamsWithYearAndRounds();
	}
	
	GetResults(teams);
}

function PopulateTeamsWithYearAndRounds()
{
	var includeCheckBoxes = document.getElementsByClassName("includeCheckBox");
	var rounds = document.getElementsByClassName("roundInput");
	var finals = document.getElementsByClassName("finalCheckBox");
	var year   = $("#yearInput").val();

	for (let i = teams.length - 1; i >= 0; i--)
	{
		if (includeCheckBoxes[i].checked == false)
		{
			teams.splice(i, 1);
		}
		else
		{
			teams[i].final_ = finals[i].checked ? true : false;
			teams[i].pastGame_.round_ = rounds[i].value;
			teams[i].futureGame_.round_ = Number(rounds[i].value) + 1;
			teams[i].year_  = year;
		}
	}
}

function SaveResultsHTML()
{
	var resultsHTML = document.createElement('textarea');
	resultsHTML.value = document.getElementById("results").outerHTML;
	document.body.appendChild(resultsHTML);
	resultsHTML.select();
	document.execCommand('copy');
	document.body.removeChild(resultsHTML);
}

