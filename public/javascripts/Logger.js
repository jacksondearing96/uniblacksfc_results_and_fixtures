MessageType = {
	NORMAL : 0,
	SUCCESS : 1,
	ERROR : 2,
	WARNING : 3
};

class Logger
{
	static InitialiseLogger()
	{
		var logHTML =  '<div id = "log" display = "inline-block"> \
							<div id = "logTitle"> \
								<i onclick = "CollapseLog()" class="fas fa-times-circle closeButton"></i> \
								<span id = "save" onclick = "SaveLogHTML()"><i class="far fa-save" id = "saveLogIcon"></i>Save</span> \
								<span id = "clear" onclick = "Logger.Clear()"><i class="fas fa-eraser"></i>Clear</span> \
								</div> \
							<div id = "progressBar"></div> \
						</div>';

		$("#content").prepend(logHTML);

		Logger.AssignContainerToLogger();
	}

	static Log(message, messageType = MessageType.NORMAL)
	{
		var iconHTML = "<span display = 'inline-block' style = 'padding-left : 20px'></span>";
		switch (messageType)
		{
			case MessageType.SUCCESS:
				iconHTML = Logger.successIconHTML;
				break;
			case MessageType.ERROR:
				iconHTML = Logger.errorIconHTML;
				break;
			case MessageType.WARNING:
				iconHTML = Logger.warningIconHTML;
		}

		var messageHTML = "<span class = 'logMessage'>";
		messageHTML += iconHTML;
		messageHTML += message + '</span><br>'
		Logger.logContainer_.innerHTML += messageHTML;
	}

	static StartTesting()
	{
		Logger.Log("<br>");
		Logger.logContainer_.innerHTML += "<span style = 'text-align : center' class = 'logMessage'> \
		 -------- Running Tests -------- </span>";
		var date = new Date();
		var message = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " ";
		message += date.getHours() + ":" + date.getMinutes();
		Logger.logContainer_.innerHTML += "<span style = 'text-align : center' class = 'logMessage'> \
		" + message + "</span>";
		Logger.Log("<br>");
	}

	static StartGuiTesting()
	{
		Logger.Log("<br");
		Logger.logContainer_.innerHTML += "<span class = 'logMessage'> \
		--- Graphical User Interface Testing ---</span>";
		Logger.Log("<br>");
	}

	static AssignContainerToLogger() 
	{
		if ($("#log").length != 0)
		{
			Logger.logContainer_ = document.getElementById("log");
		}
		Logger.LoadLogFromSessionState();
	}

	static LoadLogFromSessionState()
	{
		if (sessionStorage.getItem("logState") != null)
		{
			Logger.logContainer_.innerHTML = sessionStorage.getItem("logState");
		}
	}

	static LogSummary(testsPassed, testsFailed)
	{
		Logger.Log("<br>");
		if (testsPassed != 0)
		{
			Logger.Log("<span style = 'color : rgb(0,200,0)'>" + testsPassed + " TESTS PASSED</span>");
		}

		if (testsFailed != 0)
		{
			Logger.Log("<span style = 'color : red'>" + testsFailed + " TESTS FAILED</span>");
		}
		Logger.Log("");

		if (testsFailed == "0")
		{
			$("#runAllTestsButton").html(Logger.successIconHTML + "RUN ALL TESTS");
		}
		else
		{
			$("#runAllTestsButton").html(Logger.errorIconHTML + "RUN ALL TESTS");
		}
	}

	static SaveLogHTML()
	{
		var HTMLToSave = $("#log").html();
		saveAs( data2blob(HTMLToSave), "log.html" );
	}

	static Clear()
	{
		var logChildrenToDelete = $("#progressBar").nextAll();
		logChildrenToDelete.remove();
	}
}

Logger.logContainer_ = null;
Logger.successIconHTML = '<i class = "fas fa-check-circle"></i>';
Logger.errorIconHTML = '<i class = "fas fa-times-circle"></i>';
Logger.warningIconHTML = '<i class = "fas fa-exclamation-triangle"></i>';

$(window).unload(function SessionSaveLogState()
{
	sessionStorage.setItem("logState", $("#log").html());
});

// Helper function for saving the log file
function data2blob(data, isBase64) {
	var chars = "";

	if (isBase64)
		chars = atob(data);
	else
		chars = data;

	var bytes = new Array(chars.length);
	for (var i = 0; i < chars.length; i++) {
		bytes[i] = chars.charCodeAt(i);
	}

	var blob = new Blob([new Uint8Array(bytes)]);
	return blob;
}
