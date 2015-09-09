// ==UserScript==
// @name         GameBanana Admin Toolbox
// @namespace    http://gamebanana.com/members/1328950
// @version      0.14
// @description  Set of userscripts to add some admin features to GameBanana
// @author       Yogensia
// @match        http://*.gamebanana.com/*
// @grant        none
// ==/UserScript==

// Licensed under MIT License, for more info:
// https://raw.githubusercontent.com/yogensia/gb-toolbox/master/LICENSE

// DOCUMENT OUTLINE
// 1. COMMON
// 2. SHORTCODES
// 3. AVATAR TOOLTIP TWEAKS
// 4. MODLOG/FLAGGED SUBS TWEAKS


// COMMON
// ==================================================================

// variables
var ownUserID;

// comment to enable console logging
console.log = function() {}

// asociative array (object) size
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

// indexOf for objects
function arrayObjectIndexOf(myArray, property, searchTerm) {
	for (var i = 0, len = Object.size(myArray); i < len; i++) {
		if (myArray[i][property] === searchTerm) return i;
	}
	return -1;
}

// DOM ready
$(function() {

	// add CSS
	var gbUserscriptsCSS = '<link rel="stylesheet" type="text/css" href="https://rawgit.com/yogensia/gb-toolbox/master/gb-userscripts.css" media="all">';
	$("head").append(gbUserscriptsCSS);

	// Get current user ID to be able to write some links like "Send PM"
	var ownUserUrlParts = $(".ProfileIcon").parent().attr("href").split("/");
	ownUserID = ownUserUrlParts[ownUserUrlParts.length - 1];

});



// SHORTCODES
// ==================================================================

// variables
var modalID;               // ID of modal trigger, ex: requester_8c0c9c1d1b9a64c2dcf2b2eae060fff3
var shortcodeMenuHTML;     // stores the generated HTML for shortcode toolbar menu
var n = 0;                 // counter for waitForModalForm()

// register shortcodes
var shortcode = {
	0: {
		"name"     : "site_rules",
		"nicename" : "Rules",
		'url'      : 'http://gamebanana.com/wikis?page=site_rules'
	},
	1: {
		"name"     : "site_skinRules",
		"nicename" : "Skin Rules",
		'url'      : 'http://gamebanana.com/wikis?page=skin_rules'
	},
	2: {
		"name"     : "site_portingWhitelist",
		"nicename" : "Porting Whitelist",
		'url'      : 'http://www.gamebanana.com/wikis?page=porting_whitelist'
	},
	3: {
		"name"     : "site_faq",
		"nicename" : "Frequently Asked Questions",
		'url'      : 'http://gamebanana.com/wikis?page=faq'
	},
	4: {
		"name"     : "site_contact",
		"nicename" : "Contact",
		'url'      : 'http://gamebanana.com/wikis?page=contacts'
	},
	5: {
		"name"     : "site_support",
		"nicename" : "Support",
		'url'      : 'http://gamebanana.com/support/add'
	},
	6: {
		"name"     : "guide_texturing_blendingModes",
		"nicename" : "Guide: Texturing - Blending Modes",
		"linkname" : '"Preserving Details (Blending Modes)" tutorial by ANKH',
		'url'      : 'http://cs.gamebanana.com/tuts/11770'
	}
};
shortcodeSize = Object.size(shortcode);

// return the markup for shortcode menu
function generateShortcodeMenu() {
	var shortcodeMenuBegin = '<li class="markItUpButton markItUpShortcodes"><span class="IconSheet NavigatorTabIcon ReadablesTabIcon"></span><ul style="display:none">';
	var shortcodeMenuEnd = '</ul></li>';
	var shortcodeMenuItems = '';

	for (var n = 0; n < shortcodeSize; n++) {
		shortcodeMenuItems = shortcodeMenuItems + '<li><a class="shortcodeInjector" id="' + shortcode[n]["name"] + '" href="#">' + shortcode[n]["nicename"] + '</a></li>';
	}
	return shortcodeMenuBegin + shortcodeMenuItems + shortcodeMenuEnd;
}
shortcodeMenuHTML = generateShortcodeMenu();

// add shortcode html and behaviour on non-modal forms (ex: PMs)
function hookShortcodeMenuNonModal() {
	var formsFound = $(".markItUp").length;
	if ( formsFound > 0 ) {
		console.log("GAT - Found " + formsFound + " MarkItUp forms on page, attempting shortcode hook...");
		var markItUpID;
		$(".markItUp").each( function() {
			markItUpID = $(this).attr("id");
			$("#"+markItUpID+" .markItUpHeader ul").append(shortcodeMenuHTML);
			console.log("GAT - Working on markItUp form " + markItUpID + ", generated Shortcode Menu HTML");
		});
		shortcodeOnClick();
	}
}

// on shortcode button click, use $.markItUp() to add the link in markdown syntax to the associated textarea
function shortcodeOnClick() {
	$(".shortcodeInjector").click(function(e) {
		e.preventDefault();
		var clicked = $(this).attr("id");
		var thisMarkItUp = $(this).closest(".markItUp").attr("id");
		$.markItUp({
			target: '#'+thisMarkItUp+' .markItUpEditor',
			name: thisMarkItUp+"_gatToolbox",
			replaceWith: function() {
				console.log("Looking for shortcode named: " + clicked);
				clicked = arrayObjectIndexOf(shortcode, "name", clicked);
				console.log('Shortcode "' + shortcode[clicked]["nicename"] + '" found at index ' + clicked);
				if ( "linkname" in shortcode[clicked] ) {
					var linkName = shortcode[clicked]["linkname"];
				} else {
					var linkName = shortcode[clicked]["nicename"];
				}
				return '[' + linkName + '](' + shortcode[clicked]["url"] + ') ';
			}
		});
	});
}

// have to wait for the modal to completely load before editing it
function waitForModalForm() {
	if ($('#'+modalID+'_response .markItUpEditor').length > 0) {
		console.log("GAT - Form for " + modalID + " is ready, continuing...");
		hookShortcodeMenu();
		n = 0;
	} else {
		if (n < 50) {
			setTimeout(waitForModalForm, 100);
			n++;
		} else {
			console.warn("GAT - Form for " + modalID + " failed after waiting 5 seconds, aborting...");
			n = 0;
		}
	}
}

// add shortcode html and behaviour
function hookShortcodeMenu() {
	console.log("GAT - Attempting shortcode hook...");
	$("#"+modalID+"_response .markItUpHeader ul").append(shortcodeMenuHTML);
	console.log("GAT - Working on modal " + modalID + ", generated Shortcode Menu HTML");

	// run shortcode click routine
	shortcodeOnClick();

	// remove modal html after it has been closed or bad stuff happens
	$("#"+modalID+"_response .CloseModal").click(function() {
		setTimeout(function() {
			$("#"+modalID+"_response").remove();
		}, 250);
	});
}

// DOM ready
$(function() {

	// run hookshortcode at DOM ready for non-modal forms if any are found
	hookShortcodeMenuNonModal();

	// click on links that open a modal
	$(".ModalLauncher").click(function() {
		modalID = $(this).attr("id");
		console.log("GAT - CALL TO MODAL " + modalID + " DETECTED, waiting for form to be ready...");
		waitForModalForm();
	});

});



// AVATAR TOOLTIP TWEAKS
// ==================================================================

// DOM ready
$(function() {

	// add links to avatar tooltips when they are hovered
	$(".Avatar.tooltipstered").hover(function() {
		var userUrlParts = $(this).attr("href").split("/");
		var userID = userUrlParts[userUrlParts.length - 1];

		// get username: if there is an Upic use its alt attribute, otherwise get it normally
		if ( $(".tooltipster-base .Upic").length > 0 ) {
			var userName = $(".tooltipster-base .Upic").attr("alt").replace(/ avatar/, "");
		} else {
			var userName = $(".tooltipster-base .NameAndStatus strong").text();
		}
		console.log("GAT - Triggered tooltip for user \"" + userName + "\" with userID " + userID);

		// build avatar links
		var sublog = '<a title="View '+userName+'\'s Sublog" href="http://gamebanana.com/members/submissions/sublog/'+userID+'">Sublog</a>';
		var modlog = '<a title="View '+userName+'\'s Modlog" href="http://gamebanana.com/members/admin/modlog/'+userID+'">Modlog</a>';
		var modnotes = '<a title="View '+userName+'\'s Modnotes" href="http://gamebanana.com/members/admin/modnotes/'+userID+'">Modnotes</a>';
		var sendPM = "";

		// do not show PM link on user's own avatar
		if ( userID !== ownUserID ) {
			sendPM = '<a title="Send '+userName+' a private message" href="http://gamebanana.com/members/pms/compose/'+ownUserID+'?recipients='+userID+'">Send PM</a>';
		}

		// wait 250ms and then add or update the links on the tooltipster html
		setTimeout(function() {
			if ( $(".tooltipster-base .ModTools").length > 0 ) {
				$(".tooltipster-base .ModTools").replaceWith('<div class="ModTools">'+sublog+modlog+modnotes+sendPM+'</div>');
			} else {
				$(".tooltipster-base .NameAndStatus").after('<div class="ModTools">'+sublog+modlog+modnotes+sendPM+'</div>');
			}
		}, 250);
	});

});



// MODLOG/FLAGGED SUBS TWEAKS
// ==================================================================

// variables
//var submissionURL, submissionID;

// add optimizations for Mod Log table
function modLogTweaks() {
	// set widths for cells and add .ModLogTruncateLink on username links to avoid layout breaking
	$("#ModlogListModule tr").each(function() {
		var thisRow = $(this);
		thisRow.children("th").eq(1).css("text-align","center");
		thisRow.children("td").eq(1).css("width","65px").css("text-align","center");
		thisRow.children("td").eq(2).css("width","130px");
		thisRow.children("td").eq(3).css("width","130px");
		var performer = thisRow.children("td").eq(2).children("a").eq(0).text();
		thisRow.children("td").eq(2).children("a").eq(0).addClass("ModLogTruncateLink").attr("title", performer);
		var recipient = thisRow.children("td").eq(3).children("a").eq(0).text();
		thisRow.children("td").eq(3).children("a").eq(0).addClass("ModLogTruncateLink").attr("title", recipient);
	});
}

// add optimizations for Flagged Submissions table
function flaggedSubmissionsTweaks() {
	console.log("GAT - Found Flagged Submissions Table, tweaking links...");
	$(".FlaggedSubmissionsListModule table a").each(function() {
		var thisLink = $(this);

		// get submission ID, Game and Type (skin, model, etc.)
		var submissionID = thisLink.attr("href").split("/");
		var submissionType = submissionID[submissionID.length - 3];
		submissionID = submissionID[submissionID.length - 1];
		var submissionGame = thisLink.attr("href").split(".");
		submissionGame = submissionGame[0];
		submissionGame = submissionGame.replace(/.*?:\/\//g, "");
		if ( submissionGame == "gamebanana" ) {
			submissionGame = "";
		} else {
			var submissionSubdomain = submissionGame+".";
		}

		// build additional submission links
		var subProfile = '[<a title="View Submission\'s Flags" href="http://'+submissionSubdomain+'gamebanana.com/'+submissionType+'/flags/'+submissionID+'">F</a>]';
		var subHistory = '[<a title="View Submission\'s History" href="http://'+submissionSubdomain+'gamebanana.com/'+submissionType+'/history/'+submissionID+'">H</a>]';
		var subWithhold = '[<a title="View Submission\'s Withhold Discussion" href="http://'+submissionSubdomain+'gamebanana.com/'+submissionType+'/withhold/'+submissionID+'">W</a>]';
		thisLink
			.attr("title", "View Submission's Profile")
			.attr("href", 'http://'+submissionSubdomain+'gamebanana.com/'+submissionType+'/'+submissionID)
			.after(function() {
				return '<span class="FlaggedSubmissionTools">'+subProfile+" "+subHistory+" "+subWithhold+"</span>";
		});

		// set fixed width for table cells caontaining links
		thisLink.parent().css("width", "380");
	});
}

// DOM ready
$(function() {

	// if ModLog table is found run code to add optimizations
	if ( $("#ModlogListModule").length > 0 ) {
		modLogTweaks();
	}

	// if Flagged Submissions table is found run code to add optimizations
	if ( $(".FlaggedSubmissionsListModule").length > 0 ) {
		flaggedSubmissionsTweaks();
	}

});