## GameBanana Admin Toolbox

Small Tampermonkey/Greasemonkey userscript with a few tools to make mod lives easier.

Inspired by the [Quick Links idea submission](http://gamebanana.com/ideas/2791) by [Jonny Higgins](http://gamebanana.com/members/208425).

Licensed under the [MIT License](https://raw.githubusercontent.com/yogensia/gb-toolbox/master/LICENSE).

Coded by [Yogensia](http://gamebanana.com/members/1328950).


## Features

* Adds a toolbar button for textareas with a collection of frequently used links like Rules, Porting List, etc. Contact Yogensia with ideas for more shortcodes.
* Adds Sublog, Modlog, Modnotes and Send PM links to avatar tooltips.
* Adds a few optimizations to the Flagged Submissions table including links to submission profile, history and withhold conversation.


## Installation

1. First install **[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)** (Google Chrome) or **[Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/)** (Firefox).

2. Then **[click here to open the script](https://github.com/yogensia/gb-toolbox/raw/master/gb-userscripts.user.js)** and click the `install` button.

That's it!


## Known Bugs:

* The script doesn't work anymore once a post or comment has been submitted. Haven't been able to debug this yet.


## Changelog:

* **v0.01:** Initial version with basic shortcode support.
* **v0.02:** Fix bug breaking things when a modal is closed and opened again.
* **v0.03:** Added Modlog, Modnotes and Send PM links to avatar tooltips, and minor general tweaks.
* **v0.04:** Added Blending Textures tutorial to shortcodes and Sublog to avatar tooltips.
* **v0.05:** Added Support link to shortcodes and changed tooltip link generation to avoid issues when hovering over several avatars very quickly.
* **v0.06:** Hide Send PM link in user's own avatar tooltip.
* **v0.07:** Added shortcode support on non-modal forms (ex: PM forms).
* **v0.08:** Refactored and optimized shortcodes code to work on pages with several forms (ex: submit pages).
* **v0.09:** Textarea size optimizations moved from JS to CSS.
* **v0.10:** Remove placeholder shortcodes.
* **v0.11:** Add a few optimizations to the Flagged Submissions table including links to submission profile, history and withhold conversation.
* **v0.12:** Switched Profile and Flags links in Flagged Submissions table. Main link will point to the submission's profile now, and a flag link will be added next to it instead.