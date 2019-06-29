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
	var moreOptionsSection = $("#moreOptionsSection");
	moreOptionsSection.append("<br>Men's Round: <input id = 'mensRound' style='width:50px; margin-left:40px'>");
	moreOptionsSection.append("<br>Women's Round: <input id = 'womensRound' style='width:50px; margin-left:11px'><br>");

	var headers =  "<br><br><table><tr> \
		<th>Team</th> \
		<th>Round</th> \
		<th>Final</th> \
		</tr> ";				
	moreOptionsSection.append(headers);

	for (let i = 0; i < teams.length; i++)
	{
		var row =  '<tr onclick = IncludeOrDisclude(this)> \
			<td>' + teams[i].nickname_ + '</td> \
			<td><input class = "roundInput" onclick = "IgnoreDisable()"></td> \
			<td><input class = "finalCheckBox" onclick = "IgnoreDisable()" unchecked type = "checkbox" data-teamDivision = ' + teams[i].division_ + '></td> \
			</tr></table>';

		moreOptionsSection.append(row);
	}

	moreOptionsSection.append('<br>Year: <input id = "yearInput" value = "2019">');
}

var ignore = false;
function IgnoreDisable()
{
	ignore = true;
}

function IncludeOrDisclude(row)
{
	if (ignore == true)
	{
		ignore = false;
		$(row).css("opacity", 1);
		return;
	}

	if ($(row).css("opacity") == 1)
	{
		$(row).css("opacity", 0.5);
	}
	else if ($(row).css("opacity") == 0.5)
	{
		$(row).css("opacity", 1);
	}
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

function AutoFillMensAndWomensRounds(rounds)
{
	var mensRound = document.getElementById("mensRound");
	var womensRound = document.getElementById("womensRound");
	var tableRows = $("#moreOptionsSection tr");

	for (let i = teams.length - 1; i >= 0; i--)
	{
		if ($(tableRows[i+1]).css("opacity") == 0.5)
		{
			continue;
		}

		if (mensRound.value.length != 0)
		{
			if (teams[i].gender_ == "Mens")
			{
				rounds[i].value = mensRound.value;
			}
		}
		
		if (womensRound.value.length != 0)
		{
			if (teams[i].gender_ == "Womens")
			{
				rounds[i].value = womensRound.value;
			}
		}
	}
	return rounds;
}

function PopulateTeamsWithYearAndRounds()
{
	var rounds = document.getElementsByClassName("roundInput");
	rounds = AutoFillMensAndWomensRounds(rounds);

	var finals = document.getElementsByClassName("finalCheckBox");
	var year   = $("#yearInput").val();

	var tableRows = $("#moreOptionsSection tr");

	for (let i = teams.length - 1; i >= 0; i--)
	{
		if ($(tableRows[i+1]).css("opacity") == 0.5)
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

