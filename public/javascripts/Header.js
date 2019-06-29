$(document).ready(function LoadHeader()
{
	var header = 
	'<div id = "header"> \
		<ul> \
		<li><a href = "index.html"> \
			<i id = "indexPageIcon" class="fas fa-laptop-code"></i> \
			Generate Results \
		</a></li> \
		<li><a href = "configurations.html"> \
			<i id = "configurationsPageIcon" class="fas fa-cog"></i> \
			Configurations \
		</a></li> \
		<li><a href = "test.html"> \
			<i id = "testPageIcon" class="fas fa-check-circle"></i> \
			Test \
		</a></li> \
		<li><a href = "taskManager.html"> \
			<i id = "taskManagerIcon" class="fas fa-tasks"></i> \
			Tasks \
		</a></li> \
		<li><a href = "projectInfo.html"> \
		<i id = "projectInfoIcon" class="fas fa-project-diagram"></i> \
			Project \
		</a></li> \
		</ul> \
	</div>';

	$("body").prepend(header);
	$("body").css("background-color : rgb(30,30,30; min-height: 100%");
});