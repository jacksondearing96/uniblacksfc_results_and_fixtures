function CreateTestingWindow()
{
    testWindow = open("index.html");
    setTimeout(RunAllTests, 100);
}

function RunAllTests()
{
    Logger.Clear();
    Logger.StartTesting();
    Logger.StartGuiTesting();

    var testsPassed  = 0;
    var testsFailed = 0;

    for (let test of testFunctions)
    {
        if (test() == true)
        {
            Logger.Log(test.name, MessageType.SUCCESS);
            testsPassed++;
        }
        else
        {
            Logger.Log(test.name, MessageType.ERROR);
            testsFailed++;
        }
    }
    
    Logger.LogSummary(testsPassed, testsFailed);
    
    testWindow.close();
    ExpandLog();
}

function COMPARE(actual, expected)
{
    if (actual == expected)
    {
        return true;
    }
    else
    {
        Logger.Log("<span style = 'padding-left: 20px'>Actual =====>" + actual.toString() + "</span");
        Logger.Log("<span style = 'padding-left: 20px'>Expected ===>" + expected.toString() + "</span>");
        return false;
    }
}

function isHidden(element)
{
    return ($(element).css("display") == "none") 
        || ($(element).is(":hidden"))
        || ($(element).css("opacity") < 1);
}

function isVisible(element)
{
    return ($(element).css("display") != "none") 
        || ($(element).is(":visible"));
}

function testElement(selector)
{
    var element = testWindow.document.querySelector(selector);
    return $(element);
}

var InitialPageVisibility = function()
{
    var correctInitialVisibility = true;

    var hiddenElements = testWindow.document.querySelectorAll
    (
        "#log, #moreOptionsSection"
    );

    var visibleElements = testWindow.document.querySelectorAll
    (
        "#generateResultsButton, \
        #expandLogButton, \
        #optionsButton, \
        #header"
    );

    for (let element of hiddenElements)
    {
        correctInitialVisibility = isHidden(element);
    }

    for (let element of visibleElements)
    {
        correctInitialVisibility = isVisible(element);
    }
    return COMPARE(correctInitialVisibility, true);
}

var OpenLog = function()
{
    var expandLogButton = testElement("#expandLogButton");
    expandLogButton.click();
    var testWindowLog = testElement("#log");
    var successfulOpen = isVisible(testWindowLog);
    return COMPARE(successfulOpen, true);
}

var CloseLog = function()
{
    var closeLogButton = testElement("#log .closeButton");
    closeLogButton.click();
    var testWindowLog = testElement("#expandLogButton");
    var successfulClose = isVisible(testWindowLog);

    return COMPARE(successfulClose, true);
}

var OpenOptions = function()
{
    var optionsButton = testElement("#optionsButton");
    optionsButton.click();
    var moreOptionsSection = testElement("#moreOptionsSection");
    var successfulOpen = isVisible(moreOptionsSection);
    return COMPARE(successfulOpen, true);
}

var CloseOptions = function()
{
    var optionsSectionCloseButton = testElement("#moreOptionsSection .closeButton");
    optionsSectionCloseButton.click();
    var optionsButton = testElement("#optionsButton");
    var successfulClose = isVisible(optionsButton)
    return COMPARE(successfulClose, true);
}

var testFunctions = 
[
    InitialPageVisibility,
    OpenLog,
    CloseLog,
    OpenOptions,
    CloseOptions,
];