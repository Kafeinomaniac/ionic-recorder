**Caveat:** This file is cryptical.  It's just used as a scrapbook for 
adding TODO items such that only the programmer who added the item
needs to understand it... i.e, do not attempt to try and understand 
anything written here, unless you wrote it.

* Connect library page with track page - when somebody clicks on a track
  page, bring up the track page - we may need to make sure the design is
  alright first
* start trying to work with nightly - simply can't wait for alerts and
  nav controller anymore ... we're better off making a branch for this
* we can do the other format later - it's a waste of time now. we don't
  need it.  more important to get the one format that we will always
  need done well.  we might as well add lossless compression before
  lossy.
* the idea in the next few bullets is to get webm to work and in the
  process improve the wav player too because we'll fix kinks that
  were in either player (in player.ts)
* make player / recorder of webm / ogg available in chrome / firefox
  and going into a single file (?)
* - split schedulePlay into play() and playLater()
  - add seek() and seekRelative() and make them respect paused state
  - base play() on the old way it was done so that we can easily add
    webm next
* set up a true Settings page and allow for changing the encoding,
  allow for deleting / resetting DB.
* fix the jumps in the display when jumping (seeking)
* move <ion-toolbar> out of your directives and back into the template
  that uses those directives (?)
* make it so that whatever file you save (first, so we'd have to
  clear the db every time we try this) then that is what track page
  loads, i.e. it loads from db a particular data node and reads its
  own saved info instead of hard-wiring it in there.
* the above TODO makes you want to fix the db init issues first...
* save files to app fs from record.ts, then work on audio player
  interface, then on web-audio-player - get playback to work.
* sliders
* fix library page issues
* merge app-state and idb-app-state?
* web-audio-common does not initialize db correctly - have it use
  idb-app-data
* library: get UNFILED_FOLDER_NAME FROM record.ts, use app-state
  to save (a) selected nodes, (b) last folder visited - every time
  we switch folders
* record: have UNFILED_FOLDER_NAME set there instead of app-state
* web-audio-recorder: do not use DB, use callbacks for that
* app-state: convert to idb use
* Compare the idb-fs bug with local-db, which tesets perfectly.
  For this, first make the folder names the same: 'unfiled1', 'folder1', ...
* Get the loading page to load localDB and appState and to push to the 
  rootpage after it's done loading what is needed
* style loading page properly - add a spinner
* fix progress slider not showing on record page
* Start putting the version number in About
  Places where version goes:
  - config.xml
  - about.html
* See intro page scss - there's a class automatically created for us for 
  each page we create - use that class in all scss to make them a bit 
  more manageable / readable / consistent throughout
* Allow skipping intro "forever", add it to side menu too, add a bunch
  of links to it (from about)
* Check scss and minimize it for each module
* make intro page a modal popped up from app?  try to pop a modal
  from app first.
* for new release: 0.0.5-alpha, we need:
  * intro slide show
  * incorporate the version file info into the app
  * release notes: new ionic2 build system (refer to forum)
* transfer record.ts to web-audio.ts stuff
* get rid of master clock, benchmark cpu & memory before you do that
* get rid of monitor on/off toggle switch, because after we get rid
of the master clock it will be cheap enough - but test it.  test to
see if (a) memory is less loaded, (b) cpu is less loaded after 
the step above
* first return-to-library feature to implement is share-to-device
* next is rename-file
* in web-audio.ts: relegate all time tracking to its code and away from its 
callers - this is more DRY and more accurate. the others use javascript clock, 
this new iteration will use the WebAudio clock, which is much more accurate...
this will eliminate a ton of code and make the masterClock redundant.  when 
we do all the fixes of this bullet, the program will be much better in terms
of having less event listeners, faster graphics, lighter memory overload, 
and much reduced CPU usage, the code will be smaller (no more timing code 
replicated in each web-audio caller) and more readable - this is a must!
  - recordingStartTime
  - recordingTotalPauseTime
  - recordingLastPauseTime
  - playbackStartTime
  - playbackTotalPauseTime
  - playbackLastPauseTime
  - getRecordingTime()
  - getPlaybackTime()
  - isRecording()
  - isPlaying()
    - ... then in record.ts and in audio-player.ts:
    - remove all time-related variables except for what you have to display
    - use seconds (double value) instead of msec (integers) for display time
    - ... then in record.ts and audio-player.ts and vu-gauge.ts and 
      master-clock.ts:
    - remove master-clock.ts entirely!!! carefully!  start with a small 
      experiment
    using audio-player as the first removal attempt
* Improve initialization of web audio - separate init-and-connect into
  record/playback two functions, run the playback one even when 
  record is not available (e.g. if you don't have a microphone 
  connected to your computer)
* Get rid of `<audio>` element and use web audio to play back
files and figure out the correct duration of blobs
* Stop using indexedDB for blobs, use files - the path will 
be what you display for them, perhaps.
* 1) Jump to next selection on clicking top right (library page)
* 2) move button (library page)
* 3) info button (library page)
* 4) share button - just to download (library page)
* 5) more button - just play selected (library page)
* 6) item more button1 - rename (library page)
* 7) item more button2 - item info (library page)
* 8) max peaks reset (record page)
* 9) monitor on or off toggle (record page)
* 10) report on last recorded file and a link to jump to it in record page
*     also report its duration and filename (record page)
* 11) settings page
* 12) about page
* Turn time monitor into a singleton class, use in record.ts, then use in 
  audio-player.ts - so that we are using the same clock, no extra events.
* NOT SURE IF TO DO THIS:
  Do not allow an invalid parentKey anymore in local-db - validate the
  parentKey in any high-level function that gets it in its args.  To make
  this change happen, we need to have a default root node in library.ts.
  There must be a root node in 'the tree'.  Instead of exporting DB_NO_KEY - which
  now should not be exported at all after this change, export the root key
  of the root node, which is created with readOrCreate() at the start.
  - this will require changes in the spec of local-db
  - this will require changes in app-state
  - this will require changes in library
* make sure ids everywhere are treated ok - keys in the db == ids - e.g. in
  dictionaries where the key is a db id - javascript requires its dictionary
  keys to be strings, but in the db they are ints. check this issue everywhere.
  esp. in library.ts
* We're doing childOrder - making it transparent and internal - it all happens 
  in local-db.ts automatically on node creation in parent
* stop using toString() on keys by making sure all keys are strings from
  the start (make them a string field in TreeNode)
* Make the scss classes more uniform - try to wrap each component html
  template with one class that has the component's name, then take it from
  there, always using things within that "namespace"
* start implementing the buttons, one by one, from top left to bottom right
* Create a class named LocalDBCache that has only the functions exported by
  LocalDB and used elsewhere in the app but wraps them with a cache layer
  that stores things in a local cache in memory.  We'll only need to replace
  calls to LocalDB with identical calls in LocalDBCache in order to use the
  cache.  This cache never expires and has no memory limit - assuming the
  entire tree can typically fit in memory with no problem.  Since we can
  add this class transparently at any time, we won't worry about cache (or
  creating this function) yet - but this is a super duper performance
  enhancer later on.  Right now we'll re-read from DB every time.  After
  using this enhancement, we'll only ever read an item from the DB once.
  It's best to write this later, after you've used the LocalDB API for a
  while and have defined the interface solidly - we're almost there.
* Instead of using tabs only for navigation now.  And we're not displaying them,
  ever.  We're only using them for navigtion.  So why not just use NavController?
  This way we'd "free" up a "real" tab bar to use in the library page.
  We'll also need another tab bar at the same page sometimes: sometimes we'll
  have two(?) - whether we display two or not, it's clear that we need two:
  * one tabs bar for normal library operations (select options, add folder,
  go to parent & folder info) - this tabs bar is hidden in the record page and
  is only visible in the library page
  * another tabs bar for when anything is selected
    * move-up/move-down - only enabled if a single thing is selected
    * move-up/move-down - only enabled if a single thing is selected
    * delete
    * move-to-folder
    * share
* one way to try the above is to create a blank tabs app that has a single 
button - clicking the button switches tabs.
  * create tabs blank app
  * get rid of tabs navigation in it
  * make all tabs when selected point to the same page
  * now add the button
  * now create a second tabs page
  * NO: don't do this. we can't have two separate pages and switch between
  them.  also - it would be useful to  have two tab bars on the same page at
  once: that's a better interface. while you are selecting, there is nothing
  that should prevent you from moving around the folder structure (using the
  other tab bar) to select more, for example.
  
  The way we're going to solve this problem of using tabs is:
  * stop using them now (use nav controller instead)
  * start using them now (for library page, figuring out when to turn them on 
  or off - turning them off at the record page, and if it's possible to have 
  them all point to the same page as their root)
  * perhaps you can use existing tabs: make record/library/settings/about existing
  tabs all hidden, add non-hidden tabs all with root pointing to library page and
  all belonging to the library page.  the library page itself is 
  * EXPERIMENT: sample tabs app, make one of its pages a tabs page - now play 
  TEST 1: multiple same root test
  TEST 2: make a tabs sub page a tabs page itself...
* [Excellent article](https://github.com/yeoman/yeoman/blob/master/contributing.md)
  on CONTRIBUTING.md
* once you start deploying, try this
  [page speed insights](http://developers.google.com/speed/pagespeed/insights/) 
* you will also need new gulp tasks, e.g.
  [optimizing assets with gulp](http://sahatyalkabov.com/jsrecipes/#!/backend/optimizing-assets-with-gulp)
* step 1: replace waitForAppState with waitForDB - just
          change the waitForAppState function at first to
          test
* step 2: in AppState, wrap the get function with waitForDB
          (assuming test in step 1 succeeded), wrap any
          function that it exposes with waitForDB, internally
* step 3: put private on whatever you can in local-db
* step 4: on the local-db public API, put a wait-for-db wrapper
*         everywhere
* step 5: remove wait-for-db / wait-for-api everywhere else
* add folder node to db when adding in library page now that it's
  verified
* compute path automatically at node creation (folder nodes only) in 
  local-db.ts
* refactoring: local-db calls wait db on all higher api functions,
  lower level api functions are made private, app-state calls 
  wait db, no need for app state to have a wait-app-state function
  anymore, every app-state call (getProperty or updateProperty)
  returns an observable that first waits for localDB.  this will 
  speed up initialization.  we can also set the interval to be 1/10
  of the max timeout, which will speed up things a lot during init.
  we can also disable preloadTabs to speed up init only in those
  cases where we go straight to the recording tab.  yeah, do that
  one now, since it's a tiny change... ---> just tried it and it
  didn't work!  it caused some weird event bug where i had to 
  click on every button twice (in the library page when the app
  did not preload it but went directly to it after a refresh
  using select()... go figure... i'm returning preload to ion-tabs
  it doesn't hurt much anyway and makes for a more even experience
  as the refresh time will be the same now regardless of which 
  page you land on (left off with last time)
* fix app state jumps - maybe we don't want that... maybe we want
  to jump more seamlessly into the library if we were there last?
* every folder in the tree will contain its children - the idea here
  is that while N can get very large for children for any individual
  user, it cannot get very large for folders - how many folders can 
  somebody create? thousands? that's not very large... so we can have
  a bit more overhead (space and time, mostly space) on each tree 
  node - we're going to store all its children -- this will simplify
  getting a node's child nodes -- need to rewrite some functions ...
  but it will also allow us to keep one more important piece of app
  state that we're not tracking yet: the ordering, inside each folder,
  of its children.
* add a folder in library.ts - design the add folder process
* only very few local-db.ts get called - they are all higher level
  api functions.  rewrite local-db.ts based on those higher level
  functions (use a top-down approach this time and get rid of 
  unneeded bottom-up code).  start hiding things from top-level.
  figure out how to make some functions private.
* add path tracking for tree nodes in local-db.ts
* never call waitForDB or waitForAppState again from main code that
  uses any of those classes.  Instead, turn every function that we 
  call, internally, in the local-db API, into a waitForDB promise
  wrapped function.
* library-page.ts:
  * implement add-folder button, so that we can traverse
    real trees - requires renaming it, do that first ...
* local-db.ts:
  * implement path on all folder nodes automatically computed
  * add TreeNode interface
  * add DataNode interface
  * type things with the above interfaces
  * create an initial folder item that has name '/' and is the root
  * addTreeItem - must add to a parent by parentkey, parent must 
    exist and be a folder   (check this first).  if you are adding a
    folder, make sure no other folder by that name exists in the
    same parent. if you're adding 
  * ... all of the above plus more so that we can call something in
    app-state.ts - we want to (a) check if the app-state has ever
    been stored in the db before.  if yes, get it and set the state
    to it. if no, then save yourself into it, i.e. create a new 
    one with default values.
  * create type definitions for app-state
  * now write the save() function of app-state
  * it may be good to load all pages on starting the app - if few
  * use save() to save state when switching pages, and see if you
    can restart to the library page, after hitting refresh, because
    you left off from there
  * now get to library page design
* Make LocalDB a singleton (see wiki for link to patterns examples)
* make db name, db version, db store name constants in localdb - unless we find out how
  to create a singleton that has constructor arguments
* Make LocalDB an observable, see
  * [this blog](http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html)
  * [this video](https://egghead.io/lessons/rxjs-rxjs-observables-vs-promises)
* Design Library Page all the way up with current functionality of
  only adding recordings, even though some buttons won't work.  We
  already have files and folders, so we have all we need to design
  a large part of the look.  We'll need to implement:
  * getFolderPath() - to display in <ion-item-divider>
  * isFolder(folder) - add a condition in html to pick the right
    icon name.
  * add a select checkbox
* for the 'Unfiled' object, we only allow one result.  the very first 
  time you run this app, the Unfiled object is created for you.
  if someone wants to create a new object, we never allow them to 
  either delete the 'Unfiled' folder or to overwrite it or to create
  a new folder by the same name.  folder name needs to be unique
  at each level, i.e. you can have unfiled->rock->unfiled path
  but at the same directory no two files can have the same name,
  nor do we allow any two folders to have the same name.  idea: allow
  it for files, but don't allow it for folders, perhaps. no. just add
  the unique constraint.
* listing a folder's contents
* record-page.ts:  fix gain control issue: gain control shows up correctly in the
  monitor, but does not seem to actually work in a recording test (not
  in real-time anyhow)
* record.ts: add a saturation indicator/detector
* record.ts: slider change must reset max peaks (when increased, not decreased)
* web-audio.ts: figure out if to chunk with a time interval
* vu-gauge.ts: dd red triangles showing max volume instead of the rectangle boundary
* app.ts: make highlight (clicked) color less bright, follow other dark apps; also,
  indicate the current selected tab with a different shade
