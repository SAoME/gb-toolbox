// ==UserScript==
// @name         GameBanana Admin Toolbox
// @namespace    http://gamebanana.com/members/1328950
// @version      0.1
// @description  Set of userscripts to add some admin features to GameBanana
// @author       Yogensia
// @match        *gamebanana.com/*
// @grant        none
// ==/UserScript==

// Licensed under MIT License, for more info:
// https://raw.githubusercontent.com/yogensia/gb-toolbox/master/LICENSE

// DOCUMENT OUTLINE
// 1. Initial Setup
// 2. Shortcodes
// 3. Init



// Initial Setup
// ==================================================================

// Variables
var modalID;               // ID of modal trigger, ex: requester_8c0c9c1d1b9a64c2dcf2b2eae060fff3
var shortcodeMenuHTML;     // stores the generated HTML for shortcode toolbar menu

// Comment to enable console logging
//console.log = function() {}

// Get asociative array (object) size
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

// Get indexOf for objects
function arrayObjectIndexOf(myArray, property, searchTerm) {
	for (var i = 0, len = Object.size(myArray); i < len; i++) {
		if (myArray[i][property] === searchTerm) return i;
	}
	return -1;
}



// SHORTCODES
// ==================================================================

// Register Shortcodes
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
		"nicename" : "Frequently Asked Question",
		'url'      : 'http://gamebanana.com/wikis?page=faq'
	},
	4: {
		"name"     : "site_contact",
		"nicename" : "Contact",
		'url'      : 'http://gamebanana.com/wikis?page=contacts'
	},
	5: {
		"name"     : "guide_sourceEngine_lighting",
		"nicename" : "Guide: Source Engine - Lighting",
		'url'      : 'http://gamebanana.com/lighting'
	},
	6: {
		"name"     : "guide_sourceEngine_leaks",
		"nicename" : "Guide: Source Engine - Leaks",
		'url'      : 'http://gamebanana.com/leaks'
	},
	7: {
		"name"     : "guide_sourceEngine_textures",
		"nicename" : "Guide: Source Engine - Textures",
		'url'      : 'http://gamebanana.com/textures'
	},
	8: {
		"name"     : "guide_sourceEngine_skyboxes",
		"nicename" : "Guide: Source Engine - Skyboxes",
		'url'      : 'http://gamebanana.com/skyboxes'
	}
};
shortcodeSize = Object.size(shortcode);

// Return the markup for shortcode menu
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



// INIT
// ==================================================================

// DOM Ready
$(function() {

	console.log("GAT: DOM READY");

	// Add CSS
	var gbUserscriptsCSS = '<link rel="stylesheet" type="text/css" href="https://rawgit.com/yogensia/gb-toolbox/master/gb-userscripts.css" media="all">';
	$("head").append(gbUserscriptsCSS);
	console.log("GAT - Append CSS to HEAD");

	function waitForModalForm() {
		if ($('#'+modalID+'_response .markItUpEditor').length > 0) {
			console.log("GAT - Form for " + modalID + " is ready, continuing...");
			hookShortcodeMenu();
		} else {
			console.warn("GAT - Form for " + modalID + " is NOT READY, waiting...");
			setTimeout(waitForModalForm, 100);
		}
	}

	function hookShortcodeMenu() {
		console.log("GAT - Attempting shortcode hook...");
		$("#"+modalID+"_response .markItUpHeader ul").append(shortcodeMenuHTML);
		console.log("GAT - Working on modal " + modalID + ", generated Shortcode Menu HTML: " + shortcodeMenuHTML);

		// On shortcode button click, use $.markItUp() to add the link in markdown syntax
		$("#"+modalID+"_response .shortcodeInjector").click(function(e) {
			e.preventDefault();
			var clicked = $(this).attr("id");
			$.markItUp({
				target:'#'+modalID+'_response .markItUpEditor',
				name:"test",
				replaceWith: function() {
					console.log("Looking for shortcode named: " + clicked);
					clicked = arrayObjectIndexOf(shortcode, "name", clicked);
					console.log('Shortcode "' + shortcode[clicked]["nicename"] + '" found at index ' + clicked);
					return '[' + shortcode[clicked]["nicename"] + '](' + shortcode[clicked]["url"] + ') ';
				}
			});
		});

		// Optimize textare size a bit
		$('#'+modalID+'_response .markItUpEditor').css({
			"width": "100%",
			"height": "215px",
			"box-sizing": "border-box"
		});
	}

	$(".ModalLauncher").click(function() {
		modalID = $(this).attr("id");
		console.log("GAT - CALL TO MODAL " + modalID + " DETECTED, waiting for form to be ready...");
		waitForModalForm();
	});

})