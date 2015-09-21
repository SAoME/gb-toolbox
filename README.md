## GameBanana Admin Toolbox

Small Tampermonkey/Greasemonkey userscript with a few tweaks to make mod lives easier.

Inspired by the [Quick Links idea submission](http://gamebanana.com/ideas/2791) by [Jonny Higgins](http://gamebanana.com/members/208425).

Licensed under the [MIT License](https://raw.githubusercontent.com/yogensia/gb-toolbox/master/LICENSE).

Coded by [Yogensia](http://gamebanana.com/members/1328950).


## Features

- **Posting forms:** Added a toolbar menu with common links like Rules, Porting Whitelist, etc. These links can be clicked and they will be added to the form ([screenshot](http://i.imgur.com/lalQ1PY.png)) / ([video](https://dl.dropboxusercontent.com/u/251256/ShareX/150903_175545_122236.webm)).
- **Quick Admin Menu:** Added a menu that appears on the left edge on all pages hidden until mouse over, with links to frequently used admin sections ([screenshot](http://i.imgur.com/47eWJdj.png)).
- **Avatar tooltips:** Sublog, Modlog, Modnotes, Send PM links added to avatar tooltips ([screenshot](http://i.imgur.com/4SWQq9F.png)).
- **ModLog:** Layout tweaks especially to keep the layout from breaking because of long usernames ([screenshot](http://i.imgur.com/AQynQkW.png)).
- **Flagged Submissions List:** Layout tweaks, game icons, links to submission profile, history and withhold conversation ([screenshot](http://i.imgur.com/GOr8Vnp.png)).
- **Features Admin List:** Layout tweaks ([screenshot](http://i.imgur.com/2JzMjDk.png)).


## Installation

1. First install **[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)** (Google Chrome) or **[Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/)** (Firefox).

2. Then **[click here to open the script](https://github.com/yogensia/gb-toolbox/raw/master/gb-userscripts.user.js)** and click the `install` button.

That's it!


## Known Bugs:

[Known bugs and planned improvements can be found here](https://github.com/yogensia/gb-toolbox/issues).


## Changelog:

- **v0.01:** Initial version with basic shortcode support.
- **v0.02:** Fix bug breaking things when a modal is closed and opened again.
- **v0.03:** Added Modlog, Modnotes and Send PM links to avatar tooltips, and minor general tweaks.
- **v0.04:** Added Blending Textures tutorial to shortcodes and Sublog to avatar tooltips.
- **v0.05:** Added Support link to shortcodes and changed tooltip link generation to avoid issues when hovering over several avatars very quickly.
- **v0.06:** Hide Send PM link in user's own avatar tooltip.
- **v0.07:** Added shortcode support on non-modal forms (ex: PM forms).
- **v0.08:** Refactored and optimized shortcodes code to work on pages with several forms (ex: submit pages).
- **v0.09:** Textarea size optimizations moved from JS to CSS.
- **v0.10:** Remove placeholder shortcodes.
- **v0.11:** Add a few optimizations to the Flagged Submissions table including links to submission profile, history and withhold conversation.
- **v0.12:** Switched Profile and Flags links in Flagged Submissions table. Main link will point to the submission's profile now, and a flag link will be added next to it instead.
- **v0.13:** Added optimizations to ModLog table to avoid layout stretching. Long username links are now truncated and have a title attribute to reveal full username on mouse hover.
- **v0.14:** Added support for shortcode names in the toolbar and the markdown link to be different.
- **v0.15:** Removed link to withhold conversation on submissions that are flagged but not withheld, and added tooltip tweaks to tooltips from the credits module in submissions.
- **v0.16:** Added "Clear and Organized Credits" tutorial to shortcodes.
- **v0.17:** Fix shortcodes and tooltips not working after submitting a comment or stamp (hopefully).
- **v0.18:** Added game icons to Flagged Submissions List.
- **v0.19:** Added section icons to Flagged Submissions List.
- **v0.20:** Added layout tweaks for Features admin page.
- **v0.21:** Highlight Features older than 3 days in Features admin page.
- **v0.22:** Added Quick Admin Menu with links to several sections frequently used by admins/mods.
- **v0.23:** Changed the Feedback link to point to the thread on GameBanana about the script.