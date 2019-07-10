function GetResults(teams)
{
	for (var i = 0; i < teams.length; i++)
	{
		GetResultsForTeamOfTeams(teams, i);
	}
	console.log(teams);
}

function GetResultsForTeamOfTeams(teams, teamIndex)
{
	var resultsRequest = new XMLHttpRequest();
	resultsRequest.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			var finishedTeam = JSON.parse(this.responseText);

			if (finishedTeam.success_ == true)
			{
				PopulateWinOrLossVerb(finishedTeam);
				PopulateNicknames(finishedTeam);
				UpdateTeamsWithReturnedTeam(teams, finishedTeam);
				DisplayResults(teams);
				WhatsOnNextWeek(teams);
			}

			if (teamIndex == teams.length - 1)
			{
				console.log("FINISHED");
			}
		}
	};

	resultsRequest.open("POST", "../getResults", true);
	resultsRequest.setRequestHeader("content-type", "application/json");
	resultsRequest.send(JSON.stringify(teams[teamIndex]));
}

function UpdateTeamsWithReturnedTeam(teams, finishedTeam)
{
	for (let i = 0; i < teams.length; i++)
	{
		if (teams[i].nickname_ == finishedTeam.nickname_)
		{
			teams[i] = finishedTeam;
			break;
		}
	}
}

function DisplayResults(teams) 
{
	$("#saveResultsHTMLButton").css("display", "block");
	console.log(teams);
	var resultsDiv = document.getElementById('results');
	var dummyContainer = document.getElementById('dummyContainer');
	dummyContainer.style.display = "block";
	resultsDiv.innerHTML = '';
	resultsDiv.style.display = "block";
	var previousDate = 0;

	resultsDiv.innerHTML += '<p style="font-size:25px;text-align:center;">' +
	'<b><i>"If winning is all there is, we want no part of it"</i></b></p>';

	for (var i=0 ; i<teams.length; i++) 
	{
		if ((teams[i].success_ != true) ||
			(teams[i].pastGame_.round_ == 0))
		{
			continue;
		}

		if (i != 0)
		{
			resultsDiv.innerHTML += '<hr style="margin-top:10px; height:2px;  background-color:lightgrey; border:none">';
		}

		var teamName = "";
		if (teams[i].gender_ == "Womens") 
		{
			teamName = "Div " + teams[i].division_ + " Womens";
		} 
		else 
		{
			teamName = teams[i].nickname_;
		}

		if (teams[i].pastGame_.date_ !== previousDate) 
		{
			includeDate = teams[i].pastGame_.date_ + "<br/>";
			previousDate = teams[i].pastGame_.date_;
		} 
		else 
		{
			includeDate = "";
		}

		if (teams[i].pastGame_.result_ == 'bye') 
		{
			resultsDiv.innerHTML += '<p style="text-align:center;color:darkgrey;font-size:17px;"><b>' + includeDate + '</b></p> \
			<div class="gameResult" style="text-align:center; margin-bottom:10px"><div class="teamsDisplay" margin-left:20px;="" \
			margin-right:20px"=""><span style="display:flex; float:left"><img style="height:50px !important; margin-right:10px" \
			src="https://upload.wikimedia.org/wikipedia/en/4/45/Adelaide_University_Football_Club_Logo.png"><span class="uniNameAndScore" \
			style="text-align:left; margin: auto 0;"><b>' + teamName + '</b></span></span><div style="display:inline-block; margin: 9px auto; \
			margin-left:-150px">(BYE)</div></div></div><br>';
		} 
		else 
		{
			// determine whether the game was a forfeit
			var forfeitText = (teams[i].pastGame_.result_ == "forfeit") ? "(Forfeit)" : "";

			if (teams[i].pastGame_.oppositionNickname_ !== null) 
			{
				var opposition = teams[i].pastGame_.oppositionNickname_;
			} 
			else 
			{
				var opposition = teams[i].pastGame_.opposition_;
			}

			var scoreFor = (teams[i].pastGame_.scoreFor_ == null) ? "" : teams[i].pastGame_.scoreFor_;
			var scoreAgainst = (teams[i].pastGame_.scoreAgainst_ == null) ? "" : teams[i].pastGame_.scoreAgainst_;

			resultsDiv.innerHTML +=
				'<p style="text-align:center;color:darkgrey;font-size:17px;"><b>' + includeDate + '</b></p> \
				<div class="gameResult" style="text-align:center; margin-bottom:10px"> \
					<div class="teamsDisplay" margin-left:20px; margin-right:20px"> \
						<span style="display:flex; float:left"> \
							<img style="height:50px !important; margin-right:10px" src="https://upload.wikimedia.org/wikipedia/en/4/45/Adelaide_University_Football_Club_Logo.png"></img> \
							<span class = uniNameAndScore style="text-align:left; margin: auto 0;"><b>' + teamName + '</b>\
							<br>' + scoreFor + '</span> \
						</span>  \
						<div style="display:inline-block; margin: 9px auto;">' + teams[i].winOrLossVerb_ + '</div> \
						<span style="display:inline-block; float:right"> \
							<span style="display:flex; right:0px"> \
								<span class="oppNameAndScore" style="text-align:right; margin: auto 0;">' + opposition + '<br>' + scoreAgainst + '</span> \
								<img style="height:50px !important; margin-left:10px" src="' + teams[i] .pastGame_.oppositionImageUrl_ + '"></img> \
							</span>  \
						</span> \
					</div> \
				</div><br>';

			// CorrectWidths('uniNameAndScore');
			// CorrectWidths('oppNameAndScore');

			if (forfeitText == "") 
			{
				resultsDiv.innerHTML +=
					'<table style="margin-top:-8px"> \
						<tr> \
							<td style="width: 108px; padding:0px; margin:0px; float:left"><span style="font-size:16px";>Goal Kickers:</span></td> \
							<td style="width: max-content; text-align:left"><span style="font-size:16px">' + teams[i].pastGame_.goalKickers_ + '</span></td> \
						</tr> \
						<tr> \
							<td style="width: 108px; padding:0px; margin:0px; float:left"><span style="font-size:16px">Best Players:</span></td> \
							<td style="text-align:left; width:max-content"><span style="font-size:16px">' + teams[i].pastGame_.bestPlayers_ + '</span></td> \
						</tr> \
					</table>';

			}

		} // end if bye
	} // end teams loop
}

function CorrectWidths(className)
{
	var namesAndScores = document.getElementsByClassName(className);
	var maxWidth = 0;
	for (let nameAndScore of namesAndScores)
	{
		let width = $(nameAndScore).css("width").replace("px", "");
		if (Number(width) > maxWidth)
		{
			maxWidth = width;
		}
	}

	for (let nameAndScore of namesAndScores)
	{
		if (Number($(nameAndScore).css("width").replace("px", "")) < maxWidth)
		{
			$(nameAndScore).css("width", maxWidth + "px");
		}
	}	
}

function PopulateWinOrLossVerb(team) 
{
	if ((team.pastGame_.result == 'forfeit') || 
		(team.pastGame_.scoreAgainst_ == null) || 
		(team.pastGame_.scoreFor_ == null))
	{
		team.winOrLossVerb_ = 'v';
		return;
	}

	randVerbs = 
	[
      "smashed",
      "crushed",
      "flogged",
      "conquored",
      "spanked",
      "destroyed",
      "wrecked"
    ];
  
	randExtremeVerbs = 
	[
      "annihilated",
      "demolished",
      "killed",
      "humiliated",
      "obliterated",
      "slaughtered",
      "murdered"
    ];
  
	var dashInd = team.pastGame_.scoreFor_.indexOf('-');
	var len = team.pastGame_.scoreFor_.length;
	var scoreFor = team.pastGame_.scoreFor_.substring(dashInd+1,len);
	scoreFor = Number(scoreFor);

	dashInd = team.pastGame_.scoreAgainst_.indexOf('-');
	len = team.pastGame_.scoreAgainst_.length;
	var scoreAg = team.pastGame_.scoreAgainst_.substring(dashInd+1,len);
	scoreAg = Number(scoreAg);

	if (scoreFor > scoreAg) 
	{
		var randNum;
		if (scoreFor > scoreAg+60) 
		{
			randNum = Math.floor(Math.random()*randVerbs.length);
			team.winOrLossVerb_ = randExtremeVerbs[randNum];
			randExtremeVerbs.splice(randNum,1);
		}

		randNum = Math.floor(Math.random()*randVerbs.length);
		team.winOrLossVerb_ = randVerbs[randNum];
		randVerbs.splice(randNum,1);
	} 
	else if (scoreFor == scoreAg && scoreFor == '') 
	{
		team.winOrLossVerb_ = "(NO SCORES ENTERED)";
	} 
	else if (scoreFor == scoreAg) 
	{
		team.winOrLossVerb_ = "drew against";
	} 
	else 
	{
		team.winOrLossVerb_ = "def by";
	}
}

nicknames = {"Edwardstown":"Edwards Clowns","Broadview":"Abroadsview","Athelstone":"The Raggies","Henley Greek":"Henley Geeks","Goodwood Saints":"Goodwood Sinners","Port District":"Port Red Light District","Tea Tree Gully":"Tee Hee Gully","Kilburn":"The Kilburn Motorcyle & Tattoo Club","PHOS Camden":"PHOS Williams","Portland":"Flagon of Portland","SMOSH West Lakes":"SMUSH West Fakes","Rostrevor OC":"Ross and Trevor","Greenacres":"Gang Green Acres","Salisbury North":"Salisbury NSE&W","Gaza":"Nice Gaza","Hectorville":"Hannibal Hectorville","Colonel Light Gardens":"Colonel Light's Garbage","Adelaide Lutheran":"Adelaide Loos","Glenunga":"Glenunga & Thirst","Pembroke OS.":"Pembrokedown","Unley":"Ugly","CB.C.OC":"Can The Blacks Crap on the Catholics","Mitcham":"Robert Mitchum","Plympton":"Pimp Town","Kenilworth":"Whats A Kenilworth","Henley":"Henley-definitely-not-on-Drugs","Sacred Heart OC":"Sacred Fart","Pooraka":"The Poos","Brahma Lodge":"Bananaramafudge","Houghton Districts":"Hout and About","Eastern Park":"Far Eastern Park","Flinders University":"Karl Marx University","Ovingham":"The Roving Hams","Flinders Park":"Flinders Parkour","Old Ignatians":"Very Old Ignatians","Prince Alfred OC":"The Tarnished Spooners","St Peters OC":"The Silver Spooners","Scotch OC":"Scotch on the Rocks","Seaton Ramblers":"The Seaton Trams","Walkerville":"Max Walkerville","Gepps Cross":"Gepps Double Cross","Modbury":"Mudbury","Paralowie":"Paralowsie","Salisbury West":"Salisbury NSE&W","Salvation Army":"The Tambourine Bangers","Bye":"","Wingfield Royals":"The Wingfield Dump","Rosewater":"Sweet Smelling Rosewater","Pulteney OS.":"Paltry Old Socks","Ingle Farm":"Giggle Farm","Salisbury":"Smallsbury","Alberton United":"Al & Bert's Unit","Central United":"Central DisUnited","North Pines":"North Pines for a Win","North Haven":"North Haven for Hobos","Payneham Norwood Union":"Payneham in the Arse","Brighton District & OS.":"Brighton Bummers","Adelaide High OS.":"Ka Ringa Ronga Ringa","Ethelton":"Ethel Weights a Ton","SMOSH":"SMUSH","West Lakes":"West Fakes","Norwood Union":"Norwood Non-Workers Union","Saint Pauls OS.":"Saint Paul","Salisbury Central":"Salisbury Sickoes","Riverside":"Down by the River Side","Campbelltown Magill":"Donald Campbelltown","Burnside Kensington":"Burn Down Kensington","Lockleys":"Lock & Keys","Hope Valley":"No Hope Valley","West Croydon":"West Croydon Bleau","Cedars":"The Conceders","Greek Camden":"","Woodville South":"Woodville NSE&W","Edwardstown Baptist":"","Fitzroy":"If the Cap Fits Roy","Kenilworth Colonel Light":"","Ferryden Park":"Fairey Den Park","Plympton High OS.":"PHOS Williams","Port Adelaide Presbyterian":"","Para Hills":"Para Dills","AN.Z. Bank":"","Woodville District":"","Immanuel OS.":"","Australian National Institute":"","Brighton High OS.":"","Para District Uniting":"","SA Cats":"","SAIT":"","Glandore":"Glad Whore","Greek":"Bleek","Saint Dominics":"","Saint Peters YCW":"","Post Tel Institute":"","Renown Park":"Unrenown Park","Adelaide College":"","Murray Park Teachers":"","Saint Raphaels":"","National Bank":"","Banksia Park High OS.":"","Woodville West":"","Salisbury College":"","Port Adelaide United":"","Taperoo":"","Eastwood":"","Albert Sports":"","The Parks":"","Henley District & OS.":"","Sydney University":"","Monash University":"","Melbourne University":"","LaTrobe University":"","Macquarie University":"","Queensland University":"","Deakin University":"","Philip University":"","Northern Territory University":"","Victoria University":"","Australian National University":"","Australian Defence Academy":"","Wollongong University":"","Swinburne University":"","Charles Sturt Mitchell University":"","NSW University":"","Golden Grove":"Golden Grovel","Westminster OS.":"Westminster Cathedral","Internal Trial":"","Mitchell Park":"Mitchell Car Park","Western Warriors":"Western Worriers","Smithfield":"Smith's Chips","Ballarat University":"","University Technology Sydney":"","Elizabeth":"Lizbef","Kaurna Eagles":"","University of WA":"","Black Friars":"Friar Tuck","Angel Vale":"Angel Fail","Riverland Super Dogs":"Riverland Super Dogs","Blackwood":"Blackwood","Morphettville Park":"Morphies","Mawson Lakes":"Sir Douglas Mawson Lakes","Christies Beach":"Christies a B!tch","Port Adelaide":"The Wharfies","Happy Valley":"Unhappy Valley"};
groundNames = {"University Oval":"Bob Neil #1","Park 10":"Bob Neil #2","Broadview Oval":"Prostitute Park","Henley Oval":"The Opium Den","Largs Reserve":"Largs Loony Bin","Blair Athol Reserve":"Kill Burn Maim & Destroy Oval","Edwardstown Oval":"Clown Town","Torrens Valley Oval":"Rat Reserve","Goodwood Oval":"Sin Stadium","Pertaringa Oval":"The Comedy Colosseum","Camden Oval":"Fos's Farm","Prospect Oval":"Wembley of the North","West Lakes Reserve":"Fake Field","Rostrevor College":"Abode of the Angelic Umpire","Payneham Oval":"Arse Park","Port Reserve":"Port Wildlife Reserve","St Marys Oval":"The Dog Pound","Foxfield Oval":"Rat Reserve","Eric Sutton Oval":"Perfume Park","LJ. Lewis Reserve":"Yatala Jail","Klemzig Reserve":"Mardi Gras Park","Salisbury North Oval":"Unemployment Park","Campbelltown Oval":"Campbell's Cow Paddock","Pedlar Reserve":"The Tram Terminus","Daly Oval":"Arfur Daly Oval","Mortlock Park":"The Rubbish Bin","Cnr Sth Tce and Goodwood Rd":"South Terrace Lavatories","Cnr Greenhill and Glen Osmond Rd":"Big Als' Toilet","Plympton Oval":"Pimp Park","Newlands Reserve":"Imperial Park","Webb Oval":"Starvation Stadium","Renown Park Oval":"Unrenown Park","Kingswood Oval":"Home For Horribles","Dwight Reserve":"Elton John Reserve","Flinders University Oval":"The Gulag","Cane Reserve":"Dog Poo/Postage Stamp Park","Brahma Lodge Oval":"Fudge Field","Houghton Oval":"Faraway Field","Duncan Fraser Reserve":"Animal Farm","Edward Smith Reserve":"Paint Pot Park","Modbury Oval":"The Mud Heap","Paralowie Oval":"The Flea Pit","Lindholm Park":"Poo Park","Salisbury Downs Oval":"Salisbury Downs Syndrome","Windsor Gardens High School":"The Citadel","Flinders Park Oval":"Paedophile Playground","Park 9":"Bob Neil Four","Wilson Oval, St Peters College":"Hackney High","Unley Oval":"Jack Oatey Stables","Walkerville Oval":"Tangle Park","Thomas More College":"Bob Neil Three","Hawthorn Oval":"Hawthorn Odeon","Ledger Oval":"General Ledger","Adelaide Oval":"The Light Towers","Eastern Parade Reserve":"Rubbish Reserve","Morgan Oval, South Tce":"Sock City","Rowe Park":"Giggle Ground","Sacred Heart Middle School":"Stink Stadium","Sacred Heart Junior School":"Stink Stadium","Salisbury Oval":"Tiny Town","Mofflin Reserve":"The Welfare Office","Andrew Smith Reserve":"Paint Pot Park","Largs North Reserve":"Largs North Toilets","Fawk Reserve":"Guy Fawkes Reserve","Alberton Oval":"Al and Bert's Unit","Brighton Oval":"Brighton-On-Sludge","Railways Oval":"The Acropolis","EP. Nazer Reserve":"Nazi Reserve","McNally Oval":"The Reformatory","PA.C. Park Oval":"Bob Neil Five","Carnegie Reserve":"Carnegie Hall","Brookway Park Oval":"Layabout Lounge","Saint Pauls College":"The Cathedral","Parafield Gardens High School":"","Daws Road High School":"","The Levels":"","Sturt CAE Oval":"","Scotch College Oval":"Rock Reserve","Bartels Road Oval":"Bob Neil Six","Bill Cooper Oval":"","Lockleys Oval":"Padlock Park","Bourke Oval, St Ignatius College":"Old Folks Home","Hope Valley Oval":"Home for Incurables","Adelaide High School Oval":"The Acropolis","Salisbury CA.E. Oval":"","Haslam Oval":"Don Haslam Oval","STA Employees Club Oval":"","Almond Tree Flat":"","Memorial Oval, Rostrevor College":"Abode of the Angelic Oval","Caterer Oval, St Peters College":"Hackney High","Sacred Heart Senior School":"Stink Stadium","Ferryden Park Reserve":"Fairies' Den","St Peters College Front Oval":"Hackney High","Northfield High School":"","Saint Clair Oval":"","Atkinson Oval, St Ignatius College":"Old Folks Home","Magill CA.E. Oval":"","Unley High School":"","Myer Sports Ground":"","Pennington Oval":"","Paddocks Oval":"The Dopey Dugout","Post Tel Oval, West Tce":"","West Lakes High School":"","Glandore Oval":"The Brothel","Norwood Oval":"","Park 25":"","Graduates Oval":"","Barratt Reserve":"Stink Stadium","Plympton High School":"","Immanuel College":"","Parks Community Centre":"","Colonel Waite Oval":"","Fitzroy Terrace":"","Thebarton Oval":"","Mawson High School":"","Glengowrie High School":"","Brighton High School":"","PA.C.":"","Weigall Oval":"","Tubemakers Oval":"","Devitt Oval":"","Baulderstone Oval, St Ignatius College":"Old Folks Home","Cnr Pulteney St & Sth Tce":"Sock City","Banksia Park High School":"","Enfield High School":"","Park 17, Greenhill Road":"","Park 19":"","Meyer Oval":"","Findon High School":"","Challa Gardens Primary School":"","Marion High School":"","Thorndon High School":"","Hillcrest Hospital Oval":"","Saint Michaels College":"","Urrbrae College":"","Australian National University":"","Melbourne University":"","Allard Park, Brunswick":"","Prince Park No 2":"","Sydney University":"","Surfers Paradise":"","Albert Park Oval":"","Monash University":"","Cazaly Park":"","Jack Dyer Oval":"","Labrador Oval":"","Westminster College":"Heaven Number Two","Greenwith Community Centre":"Grovel Park","Underdale High School":"Worry Park","Yalumba Drive Reserve":"The Flea Pit","Croydon High School":"Surrender Stadium","Bye":"","Kensington Oval":"Bradman Park","Smithfield Oval":"","Woodville Oval":"","Richmond Oval":"","Newcastle University":"","Argana Park":"","Kilburn Oval":"Kill Burn Maim & Destroy Oval","Harpers Field":"","Salisbury West Oval":"","Mitchell Park Oval":"","Mawson Lakes Oval":"South Pole Mawson Lakes","West Lakes Shore Oval":"","Vaughton Oval":"","St Dominics Oval":"Sherwood Forest","Roseworthy Oval":"","Elliott Goodger Memorial Park":"Beyond the Black Stump","Fitzroy Sports Club":"","Ottoway Reserve":"","Lyrup":"Lyrup","Reynella":"Reynella","The Paddocks":"The Cow Paddock","Thomas Farms Oval (Price Memorial Oval)":"The Meat Works","Max Amber Sportsfield (Torrens Valley Oval)":"Rat Reserve","John Bice Memorial Oval":"Bicep Oval","Kellett Reserve":"The Pastie","Happy Valley Sports Park":"Unhappy Land"};

function PopulateNicknames(team)
{
	team.pastGame_.oppositionNickname_ = FindNickname(nicknames, team.pastGame_.opposition_);
	team.futureGame_.oppositionNickname_ = FindNickname(nicknames, team.futureGame_.opposition_);
	team.pastGame_.locationNickname_ = FindNickname(groundNames, team.pastGame_.location_);
	team.futureGame_.locationNickname_ = FindNickname(groundNames, team.futureGame_.location_);
}

function FindNickname(options, name)
{	
	if (name == null || name == '')
	{
		return null;
	}

	// Exact match
	for (let option in options)
	{
		if (option == name)
		{
			if (options[option] == '')
			{
				return "NO NICKNAME IN DATABASE";
			}
			else
			{
				return options[option];
			}
		}
	}

	for (let option in options)
	{
		if (option.includes(name))
		{
			if (options[option] == '')
			{
				return "NO NICKNAME IN DATABASE";
			}
			else
			{
				return options[option];
			}
		}
	}

	if (name.includes(' '))
	{
		var lastIndex = name.lastIndexOf(" ");
		name = name.substring(0, lastIndex);
		return FindNickname(options, name);
	}
	
	return null;
}

function WhatsOnNextWeek(teams)
{
	//teams = [{"nickname_":"Smithy's Smelly #1s","division_":"1","sponsor_":"OTR","gender_":"Mens","urlCode_":"1-114-0-510206-0","final_":false,"year_":"2019","pastGame_":{"round_":"2","date_":"Saturday, April 13, 2019","opposition_":"Brighton Bombers","oppositionNickname_":"Brighton Bummers","oppositionImageUrl_":"http://www-static.spulsecdn.net/pics/00/36/07/46/36074646_1_T.jpg","home_":true,"location_":null,"locationNickname_":null,"locationURL_":"http://websites.sportstg.com/comp_info.cgi?round=2&amp;a=VENUE&amp;venueid=26688848&amp;c=1-114-0-510206-0&amp;fID=125234885","result_":null,"winOrLossVerb_":null,"scoreFor_":"12.13-85","scoreAgainst_":"12.9-81","goalKickers_":"N. Langridge 4, C. Parker 2, R. Marini, M. Langridge, S. Sharley, A. Offe, J. Keynes, M. Slade","bestPlayers_":"D. Cunningham, C. Parker, B. Adams, N. Langridge, M. Marini, A. Offe            ","location":"Brighton Oval"},"futureGame_":{"round_":3,"date_":"Thursday, April 25, 2019","opposition_":"Goodwood Saints","oppositionNickname_":"Goodwood Sinners","oppositionImageUrl_":"http://www-static.spulsecdn.net/pics/00/02/20/16/2201604_1_T.jpg","home_":true,"location_":"University Oval","locationNickname_":"Bob Neil #1","locationURL_":"http://websites.sportstg.com/comp_info.cgi?round=3&amp;a=VENUE&amp;venueid=15225989&amp;c=1-114-0-510206-0&amp;fID=125234850","result_":null,"winOrLossVerb_":null,"time_":"2:30 PM"},"lastRoundOfTheSeason_":18,"success_":true,"winOrLossVerb_":"wrecked"}];

	$("#saveWhatsOnNextWeekHTMLButton").css("display", "block");

	var nextWeekDiv = document.getElementById('whatsOnNextWeek');
	nextWeekDiv.innerHTML = '';
	nextWeekDiv.style.display = "block";
	var previousDate = 0;

	nextWeekDiv.innerHTML += "<p style='font-size:25px;text-align:center;color:rgb(75,75,75);'><b>WHAT'S ON THIS WEEKEND</b></p>";

	for (var i=0 ; i<teams.length ; i++) 
	{
		if (teams[i].success_ != true)
		{
			continue;
		}

		if (teams[i].futureGame_.result_ == 'bye') 
		{
			nextWeekDiv.innerHTML += '<table class="nextGame" style="width:100%;"><tbody> \
			<tr><td style="display:inline-block; width:23%; text-align:center"><img \
			style="height:50px !important; margin-right:10px; margin-bottom:5px" \
			src="https://upload.wikimedia.org/wikipedia/en/4/45/Adelaide_University_Football_Club_Logo.png"> \
			<p style="margin:0"><b>' + teams[i].nickname_ + '</b></p></td><td style="display:inline-block; \
			width:13%; text-align:center"><p style="margin:0">(BYE)</p></td></tr><tr></tr></tbody> \
			</table><hr style="margin-top:10px; margin-bottom:10px; height:1px;  background-color:lightgrey; border:none">';
		} 
		else 
		{
			if (teams[i].futureGame_.date_ !== previousDate) 
			{
				includeDate = "<p style='text-align:center;color:darkgrey;font-size:1.2em'><b>" +
				teams[i].futureGame_.date_ + "</b></p>";
				previousDate = teams[i].futureGame_.date_;
			} 
			else 
			{
				includeDate = "";
			}

			if (teams[i].futureGame_.oppositionNickname_ == null) 
			{
				var opposition = teams[i].futureGame_.opposition_;
			} 
			else 
			{
				var opposition = teams[i].futureGame_.oppositionNickname_;
			}

			var actualLocation = "("+teams[i].futureGame_.location_ + ") ";
			if (actualLocation.includes("University Oval"))
			{
				actualLocation = '';
			} 
			else if (actualLocation.includes("Park 10"))
			{
				actualLocation = '';
			}

			var locationNickname = "";
			if (teams[i].futureGame_.locationNickname_ == null)
			{
				locationNickname = '';
			}
			else
			{
				locationNickname = teams[i].futureGame_.locationNickname_ + ' ';
			}

			nextWeekDiv.innerHTML += includeDate +
				"<table class=nextGame style='width:100%;'> \
					<td style='display:inline-block; width:23%; text-align:center'> \
						<img style='height:50px !important; margin-right:10px; margin-bottom:5px' src='https://upload.wikimedia.org/wikipedia/en/4/45/Adelaide_University_Football_Club_Logo.png'></img> \
						<p style='margin:0'><b>" + teams[i].nickname_ + "</b></p> \
					</td> \
					\
					<td style='display:inline-block; width:13%; text-align:center'> \
						<p style='margin:0'>Round " + teams[i].futureGame_.round_ + "</p> \
						<p style='margin:0'>vs</p> \
					</td> \
					\
					<td style='display:inline-block; width:23%; text-align:center'> \
						<img style='height:50px !important; margin-left:10px; margin-bottom:5px' src='" + teams[i] .futureGame_.oppositionImageUrl_ + "'></img> \
						<p style='margin:0'>" + opposition + "</p> \
						</div> \
					</td> \
					\
					<td style='display:inline-block; width:39%; text-align:left;'> \
						<table style='text-align:left; margin-left:5px; width:230px'> \
							<tr> \
							<td style='width:21px'> \
								<a href='" + teams[i].futureGame_.locationURL_ + "'style='color:black; text-decoration:none'> \
									<img style = 'height:20px; display:inline; margin-botton:' src='https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png'> \
								</a> \
							</td> \
							<td style='text-align:left'><p style='padding-left:4px; margin:0; display:inline; margin-top:-5px'> \
								<a href='" + teams[i].futureGame_.locationURL_ + "'style='color:black; text-decoration:none'>" + 
								locationNickname + actualLocation + "</a> \
							</p></td> \
							</tr> \
							\
							<tr> \
								<td style='width:21px'><img style = 'height:20px; display:inline' src='https://cdn2.iconfinder.com/data/icons/pittogrammi/142/10-512.png'></td> \
								<td style='text-align:left'><p style='padding-left:4px; margin:0; display:inline'>" + teams[i].futureGame_.time_ + "</p></td> \
							</tr> \
							\
							<tr> \
								<td style='width:21px'><img style = 'height:17px; display:inline; margin-left:3px' src='https://png.pngtree.com/svg/20170719/69722b249c.svg'></td> \
								<td style='text-align:left;'><p style='padding-left:4px; margin:0; display:inline'>" + teams[i].gender_ + " Div " + teams[i].division_ + "</p></td> \
							</tr> \
						</table> \
					</td> \
				</table>";

				if (i != teams.length - 1)
				{
					nextWeekDiv.innerHTML += '<hr style="margin-top:10px; margin-bottom:10px; height:1px;  background-color:lightgrey; border:none">';
				}
		}
	}
}