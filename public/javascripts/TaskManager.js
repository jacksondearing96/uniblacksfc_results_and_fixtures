function AddTask()
{
    var taskHTML = "<div class = 'task'>";
    taskHTML += TaskHeader();
    taskHTML += TaskBody();
    $("#addTaskButton").after(taskHTML);
}

function TaskHeader()
{
    var taskHeader = "<div class = 'standardStyle taskHeader'>";
    taskHeader += TaskStatus();
    taskHeader += TaskTitle();
    taskHeader += GarbageBin();
    taskHeader += MoreInfo();
    taskHeader += "</div>";
    return taskHeader;
}

function TaskStatus()
{
    var taskStatus = "<div class = 'taskStatus'>";
    taskStatus += '<i class="todo         fas fa-folder-plus" onclick = "StatusIconClicked(event)"></i>';
    taskStatus += '<i class="highPriority fas fa-exclamation" onclick = "StatusIconClicked(event)"></i>';
    taskStatus += '<i class="idea         far fa-lightbulb"   onclick = "StatusIconClicked(event)"></i>';
    taskStatus += '<i class="complete     fas fa-check"       onclick = "StatusIconClicked(event)"></i>';
    taskStatus += "</div>";
    return taskStatus;
}

function TaskTitle()
{
    var taskTitle = "<div class = 'taskTitle' contenteditable = 'true'>task title...</div>";
    return taskTitle;
}

function GarbageBin()
{
    var moreInfo = "<div id = 'garbageBin'>";
    moreInfo += '<i onclick = "DeleteTask()" class="far fa-trash-alt"></i>';
    moreInfo += "</div>";
    return moreInfo;
}

function MoreInfo()
{
    var moreInfo = "<div class = 'moreInfo'>";
    moreInfo += '<i onclick = "MoreInfoIconClicked(event)" class="fas fa-info-circle"></i>';
    moreInfo += "</div>";
    return moreInfo;
}

function TaskBody()
{
    var taskBody = "<div class = 'taskBody standardStyle' contenteditable = 'true' onkeyup = 'ReplaceListIfDeleted(event)'>";
    taskBody += "detailed description...";
    taskBody += TaskSteps() + "<br>";
    taskBody += TimeStamp();
    taskBody += "</div>";
    return taskBody;
}

function TaskSteps()
{
    var taskSteps = "<ul class = 'taskSteps'>";
    taskSteps += "<li></li>";
    taskSteps += "</ul>";
    return taskSteps;
}

function TimeStamp()
{
    var date = new Date();
    var dateString = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " ";
    var timeStamp = "<div class = 'timeStamp'>";
    timeStamp += "<div class = 'dateCreated'>Date Created: " + dateString + "</div>";
    timeStamp += "<div class = 'dateCompleted'>Date Completed: </div>";
    timeStamp += "</div>"
    return timeStamp;
}

function StatusIconClicked(event)
{
    var iconClicked = $(event.target);
    var allIcons = iconClicked.parent().find("i");
    
    var allVisible = true;
    for (let i = 0; i < allIcons.length; i++)
    {
        if ($(allIcons[i]).css("display") == "none")
        {
            allVisible = false;
            break;
        }
    }

    if (allVisible == true)
    {
        for (let i = 0; i < allIcons.length; i++)
        {
            $(allIcons[i]).css("display", "none");
        }
        $(iconClicked).css("display", "inline-block");
        if ($(iconClicked).hasClass("complete"))
        {
            AddCompletedTime($(iconClicked));
        }
    }
    else
    {
        for (let i = 0; i < allIcons.length; i++)
        {
            $(allIcons[i]).css("display", "inline-block");
        }
    }
}

function AddCompletedTime(iconClicked)
{
    var date = new Date();
    var dateString = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " ";
    var taskClicked = $(iconClicked).parent().parent().parent();
    $(taskClicked).find(".dateCompleted").html("Date Completed: " + dateString);
}

function MoreInfoIconClicked(event)
{
    var task = ($(event.target).parent().parent().parent());
    var taskBody = task.find(".taskBody");
    if ($(taskBody).css("display") == "none")
    {
        $(taskBody).css("display", "block");
    }
    else
    {
        $(taskBody).css("display", "none");
    }
}

$(document).ready(function()
{
    LoadTasks();
    window.addEventListener("beforeunload", SaveTasks);
    DisplayTasks();
});

function LoadTasks()
{
    var loadTasksRequest = new XMLHttpRequest();
	
	loadTasksRequest.onreadystatechange = function() {
		if (loadTasksRequest.readyState === 4 && loadTasksRequest.status === 200)
		{
            $("#content").append(loadTasksRequest.responseText);
            var button = $("#addTaskButton");
            if (button.length == 0)
            {
                $("#content").append('<button onclick="AddTask()" id="addTaskButton" class="standardStyle"> \
                <i class="fas fa-plus"></i>Add Task</button>');
            }
		}
	}

	loadTasksRequest.open("GET", "../loadTasks", true);
	loadTasksRequest.send(null);
}

function SaveTasks()
{
    var tasksHTML = $("#content").html().toString();
    tasksHTML = tasksHTML.replace('\n', '');
    tasksHTML = tasksHTML.replace('\r', '');
    var saveTasksRequest = new XMLHttpRequest();

	saveTasksRequest.onreadystatechange = function() {
		if (saveTasksRequest.readyState === 4 && saveTasksRequest.status === 200)
		{
            console.log("FINISHED SAVING TASKS");
		}
    }
    
    saveTasksRequest.open("POST", "../saveTasks", true);
    saveTasksRequest.setRequestHeader("content-type", "application/json");
    saveTasksRequest.send(JSON.stringify([tasksHTML]));
};

function DisplayTasks()
{
    // var tasks = $(".task");
    // for (let task of tasks)
    // {
    //     // if task priority is complete, collapse
    // }
}

function ReplaceListIfDeleted(event)
{
    var bodyHTML = $(event.target).html();
    if (bodyHTML.includes("<li>") == false)
    {
        $(event.target).append("<ul><li></li></ul>");
    }
}

function DeleteTask()
{
    var taskToDelete = $(event.target).parent().parent().parent();
    if (taskToDelete.hasClass("task"))
    {
        taskToDelete.remove();
    }
}
