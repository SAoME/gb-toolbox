// ==UserScript==
// @name         GameBanana Admin Toolbox
// @namespace    http://gamebanana.com/members/1328950
// @version      0.39
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
// 3. WITHHOLD MESSAGES
// 4. AVATAR TOOLTIP TWEAKS
// 5. FRONTEND TWEAKS
// 6. ADMIN BACKEND TWEAKS
// 7. ADMIN MENU


// COMMON
// ==================================================================

// variables
var GAT_VERSION = "0.39";
var GAT_EDGECSS = false;
var ownUserID;

// uncomment to disable console logging
// console.log = function() {}

console.log("GBAT: INIT");

// utility function to load external scripts with a callback
function getScript(src, callback) {
  var s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.onreadystatechange = s.onload = function() {
    if (!callback.done && (!s.readyState || /loaded|complete/.test(s.readyState))) {
      callback.done = true;
      callback();
    }
  };
  document.querySelector('head').appendChild(s);
}

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

// capitalize first letter in a string
String.prototype.capitalizeFirstLetter = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

// generate a random alphanumeric string
function randomString(length) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
}

// cookie handling functions
function setCookie(name, value, days, path, domain ) {
	var d = new Date();
	d.setTime(d.getTime() + (days*24*60*60*1000));
	var expires = "; expires=" + d.toUTCString();
	var path = "; path=" + encodeURI( path );
	var domain = "; domain=" + encodeURI( domain );
	document.cookie = name + "=" + value + expires + path + domain;
}

function getCookie(name) {
	var name = name + "=";
	var ca = document.cookie.split(';');
	for (var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}

// for a given submission link, store all found data in an object (game, subdomain, section, subsection, ID)
function getSubmissionLinkDetails(submissionLink) {
	// recognized link examples:
	// tf2.gamebanana.com/maps/187142 (submission, 3 parts after split)
	// tf2.gamebanana.com/maps/flags/187142 (submission subsection, 4 parts after split)
	// gamebanana.com/posts/7201865, gamebanana.com/members/37 (post/member, 3 parts after split, no subdomain)

	// initiate object
	var submission = new Object();

	// remove protocol and get subdomain
	var submissionLinkSubdomain = submissionLink.replace(/.*?:\/\//g, "").split(".");
	submissionLinkSubdomain = submissionLinkSubdomain[0];

	// if link doesn't start with gamebanana it means there is a game subdomain
	if ( submissionLinkSubdomain !== "gamebanana" && submissionLinkSubdomain !== "www" ) {
		submission["game"] = submissionLinkSubdomain;
		submission["subdomain"] = submissionLinkSubdomain+".";
	} else {
		submission["game"] = "gamebanana";
		submission["subdomain"] = "";
	}

	// remove protocol and split by slashes
	var submissionLinkParts = submissionLink.replace(/.*?:\/\//g, "").split("/");

	// second link part should always be the submission section (skins, models, maps, etc.)
	var submissionSection = submissionLinkParts[1];
	submission["section"] = submissionSection;

	// generate nice name for section (capitalize first letter and remove trailing "s" for plural)
	submission["sectionNiceName"] = submissionSection.substring(0, submissionSection.length - 1).capitalizeFirstLetter();

	// last link part should always be the submission ID
	submission["ID"] = submissionLinkParts[submissionLinkParts.length - 1];

	// if submission link has 4 parts, second to last should be the subsection (ratings, flags, etc.)
	if ( submissionLinkParts.length == 4 ) {
		submission["subSection"] = submissionLinkParts[submissionLinkParts.length - 2];
	}

	return submission;
}

// DOM ready
$(function() {

	// add CSS
	if ( GAT_EDGECSS == true ) {
		var gbUserscriptsCSS = '<link rel="stylesheet" href="http://yogensia.com/gamebanana/gb-toolbox/gb-userscripts.css">';
	} else {
		var gbUserscriptsCSS = '<link rel="stylesheet" href="https://rawgit.com/yogensia/gb-toolbox/master/gb-userscripts.css">';
	}
	var fontAwesome = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">';
	$("head").append(gbUserscriptsCSS+fontAwesome);

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
		"nicename" : "Guide: Texturing - Blending Textures by ANKH",
		"linkname" : '"Preserving Details (Blending Modes)" tutorial by ANKH',
		'url'      : 'http://cs.gamebanana.com/tuts/11770'
	},
	7: {
		"name"     : "guide_site_clearOrganizedCredits",
		"nicename" : "Guide: Site - Clear and Organized Credits by Yogensia",
		"linkname" : '"Clear and Organized Credits" tutorial by Yogensia',
		'url'      : 'http://gamebanana.com/tuts/11908'
	},
	8: {
		"name"     : "guide_site_idLinkCredits",
		"nicename" : "Guide: Site - How to ID-Link credit entries by KillerExe_01",
		"linkname" : '"How to ID-Link credit entries" tutorial by KillerExe_01',
		'url'      : 'http://gamebanana.com/tuts/11649'
	},
	9: {
		"name"     : "guide_site_markdown",
		"nicename" : "Guide: Site - Using Markdown on GameBanana by Mini",
		"linkname" : '"Using Markdown on GameBanana" tutorial by Mini',
		'url'      : 'http://gamebanana.com/tuts/11357'
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
		console.log("GBAT: Found " + formsFound + " MarkItUp forms on page, attempting shortcode hook...");
		var markItUpID;
		$(".markItUp").each( function() {
			markItUpID = $(this).attr("id");
			$("#"+markItUpID+" .markItUpHeader ul").append(shortcodeMenuHTML);
			console.log("GBAT: Working on markItUp form " + markItUpID + ", generated Shortcode Menu HTML");
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
		console.log("GBAT: Form for " + modalID + " is ready, continuing...");
		hookShortcodeMenu();
		n = 0;
	} else {
		if (n < 50) {
			setTimeout(waitForModalForm, 100);
			n++;
		} else {
			console.warn("GBAT: Form for " + modalID + " failed after waiting 5 seconds, aborting...");
			n = 0;
		}
	}
}

// add shortcode html and behaviour
function hookShortcodeMenu() {
	console.log("GBAT: Attempting shortcode hook...");
	$("#"+modalID+"_response .markItUpHeader ul").append(shortcodeMenuHTML);
	console.log("GBAT: Working on modal " + modalID + ", generated Shortcode Menu HTML");

	// run shortcode click routine
	shortcodeOnClick();

	// remove modal html after it has been closed or bad stuff happens
	$("#"+modalID+"_response .CloseModal").click(function() {
		setTimeout(function() {
			$("#"+modalID+"_response").remove();
		}, 250);
	});
}

// hook for links that open a modal
function hookModalLauncher() {
	$(".ModalLauncher").unbind("click").click(function() {
		modalID = $(this).attr("id");
		console.log("GBAT: CALL TO MODAL " + modalID + " DETECTED, waiting for form to be ready...");
		waitForModalForm();
	});
}

// keep an eye on #PostsListModule for changes
function watchPostsListModule() {

	if ( $('#PostsListModule').not('.GatEdited').length > 0 ) {
		console.log("GBAT: #PostsListModule changed, redoing edits...");

		// Fix tooltips on avatars inside the module (GB bug)
		$("#PostsListModule .Tooltip").each(function() {
			$(this).prev().tooltipster({
				animation: "fade",
				delay: 0,
				speed: 0,
				onlyOne: true,
				interactive: true,
				contentAsHTML: true,
				position: "left",
				content: $('<div class="'+$(this).attr("class")+'" style="'+$(this).attr("style")+'">'+$(this).html()+'</div>')
			});
		});

		// redo hook modifications to avatar tooltips (sublog, modlog, ...)
		editAvatarTooltips( $("#PostsListModule .Avatar.tooltipstered") );

		// redo hook ModalLauncher buttons for modal forms
		hookModalLauncher();

		$('#PostsListModule').addClass("GatEdited");

	}

	setTimeout(watchPostsListModule, 1000);
}

// DOM ready
$(function() {

	// run hookshortcode at DOM ready for non-modal forms if any are found
	hookShortcodeMenuNonModal();

	// hook ModalLauncher buttons for modal forms
	hookModalLauncher();

	// mark #PostsListModule as edited until Gb code replaces it
	$('#PostsListModule').addClass("GatEdited");

	// keep an eye on #PostsListModule for changes
	watchPostsListModule();

});



// WITHHOLD MESSAGES
// ==================================================================

// register withhold messages
var withholdMessage = {
	0: {
		"id"   : "gat_withholdMsg_0",
		"name" : "Intro",
		"text" : "Your submission has been withheld because it failed to follow some of our rules. To have your submission re-listed please follow these steps:\\n\\n"
	},
	1: {
		"id"   : "gat_withholdMsg_1",
		"name" : "Credits",
		"text" : "- Provide clear credits mentioning all authors involved, including any material ported from other games, and specifying exactly what you did (texture edits, models, compile, etc.).\\n\\n"
	},
	2: {
		"id"   : "gat_withholdMsg_2",
		"name" : "Render",
		"text" : "- Provide a render (1st screenshot) that shows the Skin clearly.\\n\\n"
	},
	3: {
		"id"   : "gat_withholdMsg_3",
		"name" : "Custom",
		"text" : "Add your custom messages here."
	},
	4: {
		"id"   : "gat_withholdMsg_4",
		"name" : "Custom",
		"text" : "Add your custom messages here."
	},
	5: {
		"id"   : "gat_withholdMsg_5",
		"name" : "Outro",
		"text" : "Please reply to this message after making the requested fixes."
	},
	6: {
		"id"   : "gat_withholdMsg_6",
		"name" : "Screenshots",
		"text" : "- Provide at least 2 in-game screenshots (not including the render) showing gameplay in a map.\\n\\n"
	},
	7: {
		"id"   : "gat_withholdMsg_7",
		"name" : "Custom",
		"text" : "Add your custom messages here."
	},
	8: {
		"id"   : "gat_withholdMsg_8",
		"name" : "Custom",
		"text" : "Add your custom messages here."
	},
	9: {
		"id"   : "gat_withholdMsg_9",
		"name" : "Custom",
		"text" : "Add your custom messages here."
	}
};
var withholdMessageSize = Object.size(withholdMessage);

// initialize storage/HTML objects with the same structure as withholdMessage{}
var withholdMessageStorage = withholdMessage;
var withholdMessageHTML    = withholdMessage;

// if cookies not found, save them, otherwise read stored data
function withholdMessages_cookieCheck() {
	if( ! getCookie('gat_withholdMsg_0_name') ) {
		withholdMessages_save(withholdMessage);
	} else {
		withholdMessages_load();
	}
}

// save selected values to cookie
function withholdMessages_save(object) {
	for (var n = 0; n < withholdMessageSize; n++) {
		setCookie('gat_withholdMsg_'+n+'_name', object[n]["name"], 1825, '/', '.gamebanana.com');
		setCookie('gat_withholdMsg_'+n+'_text', object[n]["text"], 1825, '/', '.gamebanana.com');
	}
	withholdMessages_load();
}

// get values from cookie
function withholdMessages_load() {
	for (var n = 0; n < withholdMessageSize; n++) {
		// load cookies
		withholdMessageStorage[n]["name"] = getCookie('gat_withholdMsg_'+n+'_name');
		withholdMessageStorage[n]["text"] = getCookie('gat_withholdMsg_'+n+'_text').replace( /\\n/g, "\r\n" );
	}
}

// generate main interface for withhold messages
function withholdMessagesGenerateUI(modal) {
	withholdMessages_cookieCheck();

	var thisID = 'WithholdMessages_'+randomString(8);

	var withholdMessagesUIBegin = '<div id="'+thisID+'" style="display: none;" class="WithholdMessages"><div id="WithholdMessagesMinimizedWrapper">Show Withhold Messages Injector</div><div id="WithholdMessagesWrapper"><i title="Minimize Withhold Messages Injector" id="WithholdMessagesMinimizeButton" class="fa fa-lg fa-fw fa-minus"></i><h3>Withhold Message Injector <a class="gat_withholdMsg_settingsOpen" title="Customize Messages" href="#"><i class="fa fa-lg fa-fw fa-gear"></i></a></h3><ul class="gat_withholdMsg_buttons">';
	var withholdMessagesUIEnd = '</ul><ul class="gat_withholdMsg_settings"><a class="gat_withholdMsg_settingsSave" title="Save Withhold Message Injector Settings" href="#">Save Withhold Message Injector Settings</a></ul></div></div>';
	var withholdMessagesUIItems = '';

	// frontend UI
	for (var n = 0; n < withholdMessageSize; n++) {
		withholdMessagesUIItems = withholdMessagesUIItems + '<li><a href="#" class="gat_withholdMsg" id="gat_withholdMsg_'+n+'">'+withholdMessageStorage[n]['name']+'</a></li>';
	}

	if ( modal == true ) {
		$("#PostAddFormModule .markItUp textarea").addClass("markItUpEditorWithholdMsg").css("height", "220px").closest(".markItUp").before(withholdMessagesUIBegin + withholdMessagesUIItems + withholdMessagesUIEnd);
	} else {
		$("#WithholdFormModule textarea").addClass("markItUpEditorWithholdMsg").css("height", "220px").before(withholdMessagesUIBegin + withholdMessagesUIItems + withholdMessagesUIEnd);
	}

	// toggle settings button behaviour
	$("#"+thisID+" .gat_withholdMsg_settingsOpen, #"+thisID+" .gat_withholdMsg_settingsSave").click(function(e) {
		e.preventDefault();
		$("#"+thisID+" .gat_withholdMsg_buttons, #"+thisID+" .gat_withholdMsg_settings").slideToggle("fast");

		// if using the save setting button, also scroll back to the top of the module
		if ( $(this).hasClass("gat_withholdMsg_settingsSave") ) {
			$('html,body').animate({ scrollTop: $("#"+thisID).closest(".Module").offset().top }, "fast");
		}
	});

	// settings UI
	var withholdMessagesSettingsItems = '';
	for (var n = 0; n < withholdMessageSize; n++) {
		withholdMessagesSettingsItems = withholdMessagesSettingsItems + '<li id="gat_withholdMsg_'+n+'"><label for="gat_withholdMsg_'+n+'_name">Message #'+n+': </label><input maxlength="11" type="text" id="gat_withholdMsg_'+n+'_name" name="gat_withholdMsg_'+n+'_name" value="'+withholdMessageStorage[n]['name']+'"><textarea name="gat_withholdMsg_'+n+'_text">'+withholdMessageStorage[n]['text']+'</textarea></li>';
	}

	$("#"+thisID+" .gat_withholdMsg_settings").prepend(withholdMessagesSettingsItems);

	// keep html hidden to give CSS time to load
	setTimeout(function() {
		$("#"+thisID).show();
	}, 250);

	withholdMsgOnClick();
	withholdMsgSettings();
	withholdMsgToggle();
}

// on withholdMsg button click, append message to the associated textarea
function withholdMsgOnClick() {
	$(".gat_withholdMsg").click(function(e) {
		e.preventDefault();

		// get info of the textarea we are working on
		var clicked = $(this).attr("id");
		var thisTextarea = $(this).closest(".WithholdMessages").attr("id");
		thisTextarea = $('#'+thisTextarea).parent().find('.markItUpEditorWithholdMsg');

		// find out what button was clicked and retrieve its value
		console.log("Looking for Withhold msg named: "+clicked);
		clicked = arrayObjectIndexOf(withholdMessageStorage, "id", clicked);
		console.log('Withhold msg "'+withholdMessageStorage[clicked]["name"]+'" found at index '+clicked);

		// add a valhook to avoid loosing line breaks from textarea
		$.valHooks.textarea = {
			get: function( elem ) {
				return elem.value.replace( /\r?\n/g, "\r\n" );
			}
		};

		// get textarea text
		var oldValue = thisTextarea.val();

		// append value from button to textarea
		thisTextarea.val(oldValue+withholdMessageStorage[clicked]["text"]).focus();

	});
}

// on save settings button click, store settings to cookies and update html
function withholdMsgSettings() {
	$(".gat_withholdMsg_settingsSave").click(function(e) {
		e.preventDefault();

		// get currect settings container
		var WithholdMessagesContainer = $(this).closest(".WithholdMessages");
		console.log("Saving withhold message settings from HTML for container with ID: "+WithholdMessagesContainer.attr("id"));

		// get settings from html
		for (var n = 0; n < withholdMessageSize; n++) {
			withholdMessageHTML[n]["name"] = WithholdMessagesContainer.find('[name=gat_withholdMsg_'+n+'_name]').val();
			withholdMessageHTML[n]["text"] = WithholdMessagesContainer.find('[name=gat_withholdMsg_'+n+'_text]').val().replace(/\r?\n/g, "\\n");
			console.log("Saved to withholdMessageHTML: gat_withholdMsg_"+n+"_name, value "+withholdMessageHTML[n]["name"]);
		}

		// save settings to cookie
		withholdMessages_save(withholdMessageHTML);

		// refresh buttons to work with newly saved settings
		withholdMessages_UpdateOnHTML(WithholdMessagesContainer);
	});
}

// update setting on HTML after having been saved to avoid need to reload page
function withholdMessages_UpdateOnHTML(container) {
	WithholdMessagesContainer = container;

	// remove old html
	WithholdMessagesContainer.find(".gat_withholdMsg_buttons li").remove();

	// repopulate html with newly saved values
	var withholdMessagesUIItems = '';
	for (var n = 0; n < withholdMessageSize; n++) {
		withholdMessagesUIItems = withholdMessagesUIItems + '<li><a href="#" class="gat_withholdMsg" id="gat_withholdMsg_'+n+'">'+withholdMessageStorage[n]['name']+'</a></li>';
	}

	WithholdMessagesContainer.find(".gat_withholdMsg_buttons").prepend(withholdMessagesUIItems);

	// refresh click behaviour on new buttons
	withholdMsgOnClick();
}

// when a modal is opened in a unwithhold conversation
function withholdMessagesGenerateUIModal() {
	$("#PostAddFormRequesterModule .ModalLauncher").click(function() {
		modalID = $(this).attr("id");
		console.log("GBAT: CALL TO MODAL " + modalID + " DETECTED, waiting for form to be ready...");
		waitForWithholdMsgInjectorModal();
	});
}

// wait for modal to be ready
function waitForWithholdMsgInjectorModal() {
	if ($('#'+modalID+'_response .markItUpEditor').length > 0) {
		console.log("GBAT: Form for " + modalID + " is ready, continuing...");
		hookWithholdMsgInjectorUI();
		n = 0;
	} else {
		if (n < 50) {
			setTimeout(waitForWithholdMsgInjectorModal, 100);
			n++;
		} else {
			console.warn("GBAT: Form for " + modalID + " failed after waiting 5 seconds, aborting...");
			n = 0;
		}
	}
}

// run main Withhold Message UI code
function hookWithholdMsgInjectorUI() {
	console.log("GBAT: Working on modal " + modalID + ", generated Shortcode Menu HTML");

	// generate withhold message injector UI
	withholdMessagesGenerateUI(true);

	// remove modal html after it has been closed or bad stuff happens
	$("#"+modalID+"_response .CloseModal").click(function() {
		setTimeout(function() {
			$("#"+modalID+"_response").remove();
		}, 250);
	});
}

// check if WithholdMessages should be minimized and add toggle behaviour
function withholdMsgToggle() {
	//var withholdMsgMinimized = getCookie('gat_withholdMsg_minimized');
	if ( getCookie('gat_withholdMsg_minimized') == "true" ) {
		$("#WithholdMessagesWrapper, #WithholdMessagesMinimizeButton").hide();
		$(".WithholdMessages").addClass("is-minimized");
	} else {
		$("#WithholdMessagesMinimizedWrapper").hide();
	}

	$("#WithholdMessagesMinimizedWrapper, #WithholdMessagesMinimizeButton").click(function() {
		if ( $("#WithholdMessagesWrapper:visible").length > 0 ) {
			setCookie('gat_withholdMsg_minimized', "true", 1825, '/', '.gamebanana.com');
		} else {
			setCookie('gat_withholdMsg_minimized', "false", 1825, '/', '.gamebanana.com');
		}
		$("#WithholdMessagesWrapper, #WithholdMessagesMinimizeButton, #WithholdMessagesMinimizedWrapper").slideToggle("fast");
		$(".WithholdMessages").toggleClass("is-minimized");
	});
}

// DOM ready
$(function() {

	// if Withhold page
	if ( $("html.Withhold").length > 0 ) {
		withholdMessagesGenerateUI();
	}

	// if Unwithhold conversation
	if ( $("html.Unwithhold").length > 0 ) {
		withholdMessagesGenerateUIModal();
	}

});



// AVATAR TOOLTIP TWEAKS
// ==================================================================

// add links to avatar tooltips when they are hovered
function editAvatarTooltips(target) {

	target.hover(function() {
		var userUrlParts = $(this).attr("href").split("/");
		var userID = userUrlParts[userUrlParts.length - 1];

		// get username: if there is an Upic use its alt attribute, otherwise get it normally
		if ( $(".tooltipster-base .Upic").length > 0 ) {
			var userName = $(".tooltipster-base .Upic").attr("alt").replace(/ avatar/, "");
		} else {
			var userName = $(".tooltipster-base .NameAndStatus strong").text();
		}
		console.log("GBAT: Triggered tooltip for user \"" + userName + "\" with userID " + userID);

		// build avatar links
		var sublog = '<a title="View '+userName+'\'s Sublog" href="http://gamebanana.com/members/submissions/sublog/'+userID+'">Sublog</a>';
		var modlog = '<a title="View '+userName+'\'s Modlog" href="http://gamebanana.com/members/admin/modlog/'+userID+'">Modlog</a>';
		var modnotes = '<a title="View '+userName+'\'s Modnotes" href="http://gamebanana.com/members/admin/modnotes/'+userID+'">Modnotes</a>';
		var sendPM = "";

		// do not show PM link on user's own avatar
		if ( userID !== ownUserID ) {
			sendPM = '<a title="Send '+userName+' a private message" href="http://gamebanana.com/pms/add?recipients='+userID+'">Send PM</a>';
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
}

// DOM ready
$(function() {

	editAvatarTooltips( $(".Avatar.tooltipstered, .MemberLink.tooltipstered") );

});



// FRONTEND TWEAKS
// ==================================================================

// add "Go to last reply" link to thread links
function addThreadLastReplyLink(link, submission) {
	if ( submission["section"] == "threads" ) {
		link.after(' [<a title="Go to last reply" href="'+link.attr("href")+'?vl[page]=LAST&mid=PostsList#PostsListLastPost">»</a>]');
	}
}

// add optimizations for NavigatorTabs Menu
function navigatorTabsTweaks() {
	console.log("GBAT: adding Activity Log tweaks...");

	// Activity tweaks
	$("#PersonalActivities a[href*='threads'], #PostActivities a[href*='threads'], #SubmissionActivities a[href*='threads'], #GuildActivities a[href*='threads'], #MiscellaneousActivities a[href*='threads']").each(function() {
		var thisSubmissionLink = $(this);
		var submission = getSubmissionLinkDetails(thisSubmissionLink.attr("href"));
		addThreadLastReplyLink(thisSubmissionLink, submission);
	});

	// Submissions tweaks
	$("#SubmissionsPane li span:contains('(0)')").parent().hide();
}

// add optimizations for Watches table
function watchesTweaks() {
	console.log("GBAT: Found Watches Table, adding tweaks...");
	$("#WatchesListModule tbody td:first-child a").each(function() {
		var thisSubmissionLink = $(this);
		var submission = getSubmissionLinkDetails(thisSubmissionLink.attr("href"));
		addThreadLastReplyLink(thisSubmissionLink, submission);
	});
}

// DOM ready
$(function() {

	// Navigator Tabs tweaks
	navigatorTabsTweaks();

	// if Watches
	if ( $("#WatchesListModule").length > 0 ) {
		watchesTweaks();
	}

	// if #PostListModule, add #PostsListLastPost to last post on the page and check url hash to scroll to last post
	if ( $("#PostsListModule").length > 0 ) {
		$("#PostsListModule li:last-child").find("a[name]").after('<a id="PostsListLastPost"></a>');
		if ( window.location.hash == "#PostsListLastPost" ) {
			$('html,body').animate({ scrollTop: $("#PostsListLastPost").offset().top }, 0);
		}
	}

	// if any Go to last Post links written by GB is found, change their hash to #PostsListLastPost
	if ( $("a[title='Go to last reply']").length > 0 ) {
		$("a[title='Go to last reply']").each(function() {
			var link = $(this).attr("href").replace("#PostsListBottom", "#PostsListLastPost");
			$(this).attr("href", link);
		});
	}

});



// ADMIN BACKEND TWEAKS
// ==================================================================

// add a toggle button to Filter modules
function filterModuleTweaks() {
	var filterModule = $(".AdvancedListSettingsModule");
	var filterColumn = $(".AdvancedListSettingsModule").parent();

	filterModule
		.addClass("FilterModuleTweaked")
		.appendTo(".PageNavigation:eq(0)")
		.children("h3")
		.append('<i class="fa fa-lg fa-fw fa-angle-right"></i>')
		.next()
		.hide();

	filterColumn.remove();

	filterModule.find("legend").unbind("click");

	filterModule.children("h3").click(function() {
		filterModule.toggleClass("is-toggled").children(".Content").slideToggle("fast");
	});

	// close filter menu when user clicks outside the element
	$(document).click(function(event) {
		if ( ! $(event.target).closest('.FilterModuleTweaked').length ) {
			if ( $('.FilterModuleTweaked .Content').is(":visible") ) {
				filterModule.toggleClass("is-toggled").children(".Content").slideToggle("fast");
			}
		}
	});

}

// add optimizations for ModLog table
function modLogTweaks() {
	console.log("GBAT: Found ModLog Table, adding tweaks...");

	// add section icons where necessary
	$("#ModlogListModule .ActionPerformed a").each(function() {
		var thisSubmissionLink = $(this);
		if ( thisSubmissionLink.text() !== "»" ) {
			var submission = getSubmissionLinkDetails(thisSubmissionLink.attr("href"));

			// generate icons
			var submissionGameIcon, submissionCategory;
			if ( submission["game"] !== "gamebanana" ) {
				submissionGameIcon = '<img  class="cursorHelp gameIcon" alt="" width="16" title="'+submission["game"].toUpperCase()+'" src="https://raw.githubusercontent.com/yogensia/gb-toolbox/master/img/game-icons/'+submission["game"]+'.png" />';
			}
			if ( submission["section"] !== "admin" && submission["section"] !== "members" ) {
				submissionCategory = "<span class='submissionCategory cursorHelp IconSheet SubmissionTypeSmall "+submission["sectionNiceName"]+"' title='"+submission["sectionNiceName"]+"'></span>";
			}

			thisSubmissionLink
				.before(submissionCategory)
				.before(submissionGameIcon);
		}

		// set fixed table column widths
		$("#ModlogListModule table th:eq(1)").css({"width": "85", "text-align": "center"});
		$("#ModlogListModule table th:eq(2)").css({"width": "190", "text-align": "left"});
		$("#ModlogListModule table th:eq(3)").css({"width": "190", "text-align": "left"});
	});
}

// add optimizations for FlaggedSubs table
function flaggedSubmissionsTweaks() {
	console.log("GBAT: Found Flagged Submissions Table, adding tweaks...");
	$(".FlaggedSubmissionsListModule table a").each(function() {
		var thisSubmissionLink = $(this);
		var submission = getSubmissionLinkDetails(thisSubmissionLink.attr("href"));

		// generate icons
		var submissionGameIcon = '<img  class="cursorHelp" alt="" width="16" title="'+submission["game"].toUpperCase()+'" src="https://raw.githubusercontent.com/yogensia/gb-toolbox/master/img/game-icons/'+submission["game"]+'.png" />';
		var submissionCategory = "<span class='submissionCategory cursorHelp IconSheet SubmissionTypeSmall "+submission["sectionNiceName"]+"' title='"+submission["sectionNiceName"]+"'></span>";

		// generate links
		var subFlags = '[<a title="View Submission\'s Flags" href="http://'+submission["subdomain"]+'gamebanana.com/'+submission["section"]+'/flags/'+submission["ID"]+'">F</a>]';
		var subHistory = '[<a title="View Submission\'s History" href="http://'+submission["subdomain"]+'gamebanana.com/'+submission["section"]+'/history/'+submission["ID"]+'">H</a>]';
		var subWithhold = "";
		if ( thisSubmissionLink.parent().children(".IsWithheld").length > 0 ) {
			subWithhold = '[<a title="View Submission\'s Withhold Discussion" href="http://'+submission["subdomain"]+'gamebanana.com/'+submission["section"]+'/unwithhold/'+submission["ID"]+'">W</a>]';
		}

		thisSubmissionLink
			// add links and tweak original link
			.addClass("FlagLogTruncateLink")
			.attr("title", "View Submission's Profile")
			.attr("href", "http://"+submission["subdomain"]+"gamebanana.com/"+submission["section"]+"/"+submission["ID"])
			.after('<span class="FlaggedSubmissionTools">'+subFlags+' '+subHistory+' '+subWithhold+'</span>')
			// make fixes on category column
			.parent()
			.prev()
			.addClass("alignCenter")
			.wrapInner(submissionCategory)
			.append(submissionGameIcon)
			// make fixes on flags column
			.siblings().last()
			.addClass("alignCenter");

		// set fixed table column widths
		$("#FlaggedSubmissionsListModule table th:eq(0)").css({"width": "40", "text-align": "center"});
		$("#FlaggedSubmissionsListModule table th:eq(1)").css({"width": "60", "text-align": "center"});
		$("#FlaggedSubmissionsListModule table th:eq(3)").css({"width": "80", "text-align": "left"});
		$("#FlaggedSubmissionsListModule table th:eq(4)").css({"width": "60", "text-align": "center"});
	});
}

// add optimizations for WithheldSubs table
function withheldSubmissionsTweaks() {
	console.log("GBAT: Found Withheld Submissions Table, adding tweaks...");
	$(".WithheldSubmissionsListModule table a").each(function() {
		var thisSubmissionLink = $(this);
		var submission = getSubmissionLinkDetails(thisSubmissionLink.attr("href"));

		// generate icons
		var submissionGameIcon = '<img  class="cursorHelp" alt="" width="16" title="'+submission["game"].toUpperCase()+'" src="https://raw.githubusercontent.com/yogensia/gb-toolbox/master/img/game-icons/'+submission["game"]+'.png" />';
		var submissionCategory = "<span class='submissionCategory cursorHelp IconSheet SubmissionTypeSmall "+submission["sectionNiceName"]+"' title='"+submission["sectionNiceName"]+"'></span>";

		// generate links
		var subFlags = '[<a title="View Submission\'s Flags" href="http://'+submission["subdomain"]+'gamebanana.com/'+submission["section"]+'/flags/'+submission["ID"]+'">F</a>]';
		var subHistory = '[<a title="View Submission\'s History" href="http://'+submission["subdomain"]+'gamebanana.com/'+submission["section"]+'/history/'+submission["ID"]+'">H</a>]';
		var subWithhold = '[<a title="View Submission\'s Withhold Discussion" href="http://'+submission["subdomain"]+'gamebanana.com/'+submission["section"]+'/unwithhold/'+submission["ID"]+'">W</a>]';

		thisSubmissionLink
			// add links and tweak original link
			.addClass("FlagLogTruncateLink")
			.attr("title", "View Submission's Profile")
			.attr("href", "http://"+submission["subdomain"]+"gamebanana.com/"+submission["section"]+"/"+submission["ID"])
			.after('<span class="FlaggedSubmissionTools">'+subFlags+' '+subHistory+' '+subWithhold+'</span>')
			// make fixes on category column
			.parent()
			.prev()
			.addClass("alignCenter")
			.wrapInner(submissionCategory)
			.append(submissionGameIcon)
			// make fixes on flags column
			.siblings().last()
			.addClass("alignCenter");

		// set fixed table column widths
		$("#WithheldSubmissionsListModule table th:eq(0)").css({"width": "40", "text-align": "center"});
		$("#WithheldSubmissionsListModule table th:eq(1)").css({"width": "60", "text-align": "center"});
		$("#WithheldSubmissionsListModule table th:eq(3)").css({"width": "100", "text-align": "center"});
	});
}

// add optimizations for Features table
function featuresTweaks() {
	console.log("GBAT: Found Features Table, adding tweaks...");

	// if there is more than one feature enabled, highlight in red the ones that should be disabled
	$("#SubmissionsListModule tr:not(:first)").each(function() {
		if ( $(this).children(".State span").text() == "Active" ) {
			$(this).css("background", "#3d1f24");
		 }
	});
}

// add optimizations for Unwithhold page
function unwithholdTweaks() {
	console.log("GBAT: Unwithhold page found, adding tweaks...");

	// kill subFeed column
	$(".ContentColumn").eq(2).hide();

	// set new column widths
	$(".ContentColumn").eq(0).css("width", "395px");
	$(".ContentColumn").eq(1).css("width", "590px");
}

// DOM ready
$(function() {

	// if ModLog
	if ( $("#ModlogListModule").length > 0 ) {
		modLogTweaks();
		//filterModuleTweaks();
	}

	// if Flagged Submissions
	if ( $(".FlaggedSubmissionsListModule").length > 0 ) {
		flaggedSubmissionsTweaks();
		//filterModuleTweaks();
	}

	// if Withheld Submissions
	if ( $(".WithheldSubmissionsListModule").length > 0 ) {
		withheldSubmissionsTweaks();
		//filterModuleTweaks();
	}

	// if Features
	if ( $("#Feature_Index").length > 0 ) {
		featuresTweaks();
		//filterModuleTweaks();
	}

	// if Unwithhold
	if ( $("html.Unwithhold").length > 0 ) {
		unwithholdTweaks();
	}

});

// add optimizations for Unwithhold page
function appendDateToTextarea() {

	getScript("https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js", momentJSReady);
	// wait for moment.js
	function momentJSReady(){
		var currentDate = moment().format("MMMM Do YYYY");

		// member modnote form found
		if ( $("html.Modnotes").length > 0 ) {
			// if textarea is empty
			if (!$(".MainForm textarea").val()) {
				// add date to the textarea field
				$(".MainForm textarea").val(currentDate+": ").focus();
				console.log("Added current date ("+currentDate+") to Modnote form.");
			}
		}

		// submission modnote
		if ( $("html.Edit #Modnote").length > 0 ) {
			// if textarea is empty
			if (!$("#Modnote textarea").val()) {
				// add date to the textarea field
				$("#Modnote textarea").val(currentDate+": ").focus();
				console.log("Added current date ("+currentDate+") to Modnote form.");
			}
		}
	}

}

// DOM ready
$(function() {

	// run date function for modnote forms
	appendDateToTextarea();

});



// ADMIN MENU
// ==================================================================

// generates and adds the admin menu to the left side of the site
function loadAdminMenu() {
	var adminMenu;
	adminMenu = '<div id="AdminMenuWrap">';
		adminMenu += '<ul id="AdminMenu">';
			adminMenu += '<li><a href="http://gamebanana.com"><i class="fa fa-lg fa-fw fa-home"></i>Frontpage</a></li>';
			adminMenu += '<li><a href="http://gamebanana.com/wikis?page=site_rules"><i class="fa fa-lg fa-fw fa-book"></i>Rules</a></li>';
			adminMenu += '<li><a href="http://gamebanana.com/wikis?page=contacts"><i class="fa fa-lg fa-fw fa-users"></i>Contacts</a></li>';
			adminMenu += '<li><a href="http://gamebanana.com/wikis/cats/1"><i class="fa fa-lg fa-fw fa-briefcase"></i>ModDocs</a></li>';
			adminMenu += '<li><a href="http://gamebanana.com/admin/modlog"><i class="fa fa-lg fa-fw fa-binoculars"></i>ModLog</a></li>';
			adminMenu += '<li><a href="http://gamebanana.com/admin/flags"><i class="fa fa-lg fa-fw fa-flag"></i>Flagged Submissions</a></li>';
			adminMenu += '<li><a href="http://gamebanana.com/admin/withheld"><i class="fa fa-lg fa-fw fa-legal"></i>Withheld Submissions</a></li>';
			adminMenu += '<li><a href="http://gamebanana.com/admin/catmod"><i class="fa fa-lg fa-fw fa-folder-open"></i>Pending Categories</a></li>';
			adminMenu += '<li><a href="http://gamebanana.com/support"><i class="fa fa-lg fa-fw fa-support"></i>Support Tickets</a></li>';
			adminMenu += '<li><a href="http://gamebanana.com/bugs"><i class="fa fa-lg fa-fw fa-bug"></i>Bug Reports</a></li>';
			adminMenu += '<li><a href="http://gamebanana.com/ideas"><i class="fa fa-lg fa-fw fa-lightbulb-o"></i>Suggested Ideas</a></li>';
			adminMenu += '<li class="SubMenuHeader"><i class="fa fa-lg fa-fw fa-comments"></i>Forums<i class="fa fa-lg fa-fw fa-angle-right"></i>';
			adminMenu += '<ul class="SubMenu">';
				adminMenu += '<li><a href="http://gamebanana.com/game/threads/cats/3563"><i class="fa fa-lg fa-fw fa-commenting"></i>AdminTalk</a></li>';
				adminMenu += '<li><a href="http://gamebanana.com/game/threads/cats/783"><i class="fa fa-lg fa-fw fa-commenting"></i>ModTalk</a></li>';
			adminMenu += '</ul></li>';
			adminMenu += '<li class="SubMenuHeader"><i class="fa fa-lg fa-fw fa-wrench"></i>Tools<i class="fa fa-lg fa-fw fa-angle-right"></i>';
			adminMenu += '<ul class="SubMenu">';
				adminMenu += '<li><a href="http://gamebanana.com/admin/bananabank"><i class="fa fa-lg fa-fw fa-bank"></i>BananaBank</a></li>';
				adminMenu += '<li><a href="http://gamebanana.com/admin/recordselector"><i class="fa fa-lg fa-fw fa-server"></i>RecordSelector</a></li>';
				adminMenu += '<li><a href="http://gamebanana.com/admin/reportmaker"><i class="fa fa-lg fa-fw fa-file-text-o"></i>ReportMaker</a></li>';
				adminMenu += '<li><a href="http://gamebanana.com/admin/ipsearch"><i class="fa fa-lg fa-fw fa-terminal"></i>IP Search</a></li>';
				adminMenu += '<li><a href="http://gamebanana.com/ip-blocks"><i class="fa fa-lg fa-fw fa-terminal"></i>IP Blocker</a></li>';
			adminMenu += '</ul></li>';
			adminMenu += '<li class="SubMenuHeader"><i class="fa fa-lg fa-fw fa-bullhorn"></i>Promotional<i class="fa fa-lg fa-fw fa-angle-right"></i>';
			adminMenu += '<ul class="SubMenu">';
				adminMenu += '<li><a href="http://gamebanana.com/contest-winners"><i class="fa fa-lg fa-fw fa-trophy"></i>Contest Winners</a></li>';
				adminMenu += '<li><a href="http://gamebanana.com/features"><i class="fa fa-lg fa-fw fa-tv"></i>Features</a></li>';
				adminMenu += '<li><a href="http://gamebanana.com/newsletters"><i class="fa fa-lg fa-fw fa-newspaper-o"></i>Newsletters</a></li>';
			adminMenu += '</ul></li>';
			adminMenu += '<li class="SubMenuHeader"><i class="fa fa-lg fa-fw fa-info-circle"></i>GB Admin Toolbox<i class="fa fa-lg fa-fw fa-angle-right"></i>';
			adminMenu += '<ul class="SubMenu">';
				adminMenu += '<li><a href="https://github.com/yogensia/gb-toolbox#readme"><i class="fa fa-lg fa-fw fa-file-text-o"></i>Readme</a></li>';
				adminMenu += '<li><a href="https://github.com/yogensia/gb-toolbox#changelog"><i class="fa fa-lg fa-fw fa-gear"></i>Changelog</a></li>';
				adminMenu += '<li><a href="https://github.com/yogensia/gb-toolbox/issues"><i class="fa fa-lg fa-fw fa-exclamation-circle"></i>Known Issues / TODO</a></li>';
				adminMenu += '<li><a href="http://gamebanana.com/threads/198550"><i class="fa fa-lg fa-fw fa-envelope"></i>Send Feedback</a></li>';
				adminMenu += '<li class="AdminMenuHeader"><i class="fa fa-lg fa-fw fa-check"></i>Version '+GAT_VERSION+'</li>';
			adminMenu += '</ul></li>';
		adminMenu += '</ul>';
	adminMenu += '</div>';
	$("#Wrapper").append(adminMenu);
}

// DOM ready
$(function() {

	// add Admin Menu
	loadAdminMenu();

});