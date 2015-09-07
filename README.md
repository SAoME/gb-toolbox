## GameBanana Admin Toolbox

Small Tampermonkey/Greasemonkey userscript with a few tools to make mod lives easier.

Inspired by the [Quick Links idea submission](http://gamebanana.com/ideas/2791) by [Jonny Higgins](http://gamebanana.com/members/208425).

Licensed under the [MIT License](https://raw.githubusercontent.com/yogensia/gb-toolbox/master/LICENSE).

Coded by [Yogensia](http://gamebanana.com/members/1328950).


## Features

* Adds a toolbar button for textareas with a collection of frequently used links like Rules, Porting List, etc. (Not added on PM forms and some other forms yet).
* Adds Sublog, Modlog, Modnotes and Send PM links to avatar tooltips.


## Installation

1. First install **[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)** (Google Chrome) or **[Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/)** (Firefox).

2. Then **[click here to open the script](https://github.com/yogensia/gb-toolbox/raw/master/gb-userscripts.user.js)** and click the `install` button.

That's it!


## Known Bugs:

* Some Guide shortcodes are placeholders, they will be replaced with real guides as they are recommended by users.
* The script doesn't work anymore once a post or comment has been submitted. Haven't been able to debug this yet.


## Changelog:

* **v0.1:** Initial version with basic shortcode support.
* **v0.2:** Fix bug breaking things when a modal is closed and opened again.
* **v0.3:** Added Modlog, Modnotes and Send PM links to avatar tooltips, and minor general tweaks.
* **v0.4:** Added Blending Textures tutorial to shortcodes and Sublog to avatar tooltips.
* **v0.5:** Added Support link to shortcodes and changed tooltip link generation to avoid issues when hovering over several avatars very quickly.
* **v0.6:** Hide Send PM link in user's own avatar tooltip.
* **v0.7:** Added shortcode support on non-modal forms (ex: PM forms).