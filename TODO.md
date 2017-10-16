## Misc

11111111112222222222333333333344444444445555555555666666666677777777778888888888

**Caveat:** This file is cryptical.  It's just used as a scrapbook for 
adding TODO items such that only the programmer who added the item
needs to understand it... i.e, do not attempt to try and understand 
anything written here, unless you wrote it.

* We now turn to the player itself. First question is how to organize the
  function calls related to playback. AudioPlayer component calls
  jumpToPosition(). jumpToPosition() does not need to load the buffer
  immediately, because it does not know if we're paused or playing. If we're
  paused, there's no reason to load things if we're paused.
* Get rid of the progress bar jumpiness when you seek: hypothesis =
  it sometimes does a double-event. you can prevent a double-
  event by allowing a debounce period!  add a debounce to the
  progressbar events!
* Good progress. Next: if the player is paused, and you move around
  the progress slider via touch, then right now we just stay where 
  the player was previously paused at.
* OK, let's define more precisely the audio player requirements:
  * if player playing & you move progress bar around manually -->
    * we want to move the time around as the finger moves.
  vs.
  * player NOT playing, move progress bar around manually -->
    * we want to move the time around as the finger moves.
  i.e. same behavior - we want to show the moving time.
  * but ideally, we'd show both times when playing: the current,
  changing, playback time, and the manual seek-to time
  * IDEA: put a bubble and a new time around when moving the 
  handle on the progressbar.
  * instead of a tooltip/bubble and fancy graphics, let's try
    to piggyback on the displayed filename, just replace the
    filename (which is conveniently located above the moving
    finger and is also relevant as a filename when you're moving
    your finger, and it's also very large text - so this may be
    a good design idea, let's try...)
* NO: we broke the progress bar setting time when you manually move
  it, we need to bring that back again. When we're dragging the progress bar
  around, we need to take control of the time variable and display only
  that time that we're dragging. one way to do this is to change the 
  player's displayTime variable. So part of the player's API is that
  whenever you want to override what the player is telling you, you
  can always change the player's displayTime to show something else.
  That's fine, as long as you make it very clear in the player's API - we
  need to work a whole lot on the player's API, but much later...

  For now: we simply change player's displayTime when we are shifting
  the progress bar around - in onChange() of AudioPlayer as opposed to
  in onChangeEnd().

* next goal: if we're paused (default start state is not playing) then
  even when we click into the progress bar, it should not start
  playing.  Try to reach that set of states.

* next goal: completely stop previously played 

* the goal, right now, is to get a single chunk to play right - that
  means (a) we should have clicked 'play' button first and only then
  jumped to a point in the middle of the track; (b) we should be
  seeing time advance by 1 second, or the duration of the chunk.
  let's make the duration of the chunk 2 seconds.  

* wav-player.ts - issues...
  - if we're paused you don't want to start playing.
  - just deal with that later.  you'd still need jumpToRelativeTime()
    so continue writing that.
  - in jumpToRelativeTime() we need to take all precautions:
    - typically we load in two buffers but sometimes there is only one
    available, what do you do then? 

* wav-player.ts - the recursive function.
  loadAndDecode(audioBuffer) =>
      - start playing
      RECURSE w/scheduled time
  - so the recursive function needs to know
  NO: above is not good. The reason is that it will end up loading
  many and scheduling many all at once.  It needs to do so in
  sequence.  We basically need to repeat what we did before.
  - just base it on previous implementation.
* In debugging wav-player, go back to original plan and first do the step
  where we show the track page track info - let's make sure we can read the
  states properly first - they may reveal something...

* get rid of master clock in player.ts - no longer needed?

* audio-player.ts - when there's a change in filename, get the duration,
  set it only then, never need to change it again, communicate it to the
  template via a variable. forget getters or a method - no need.
  then, in the get position (change) event method onProgressChange(),
  you just divide by this.duration or this. player.duration.
* refactor: audio-player / progress-slider / player / wav-player
* player.ts and wav-player.ts -- no displayTime and no displayDuration:
  you can do those when needed

* player.ts - eliminate use of member variables (everywhere, actually, but
  start in player.ts for now only). use getter and setter methods to get and
  set member variables.  
* player.ts - get rid of relativeTime and make it a computed entity
* audio-player.html - update here and everywhere else that uses player
  (record-page.ts)
* create a mock player that moves time along and pretends to be playing
  audio

* problem with time keeping:
  1) audio-player.html, we use progress-slider and link it with 
     player.relativeTime ---- this updates the progress bar and vice versa
     (two-directional).
     - so when you change progress bar by touch/mouse, relativeTime changes
     - or when relativeTime changes via other internal logic, the progress
       bar moves
  2) to display the time in audio player, we use displayTime, which is
     derived from 'time' - it is computed by looking at this.pausedAt and
     this.startedAt and AUDIO_CONTEXT.currentTime  -- those are changed by
     the audio player and they also change relativeTime

* refactoring / renaming:
  * wav.ts - we need to put this somewhere else, together with other wav stuff
  * write a class, near double-buffer.ts, called double-file-reader.ts, that
    allows you to alternate file readers among two, every time you call it
  * utils.ts ---> misc-utils.ts
  * app-fs.ts ---> app-filesystem.ts
  * app-state.ts ---> app-storage.ts
  * filesystem.ts - no need to wrap with a class and make functions
    static, just export them as functions. that's because the class
    has no constructor - it is a totally meaningless useless class -
    put filesystem.ts under utils
  * play-wav.ts ---> wav-player.ts
  * play.ts ---> player.ts
  * record.ts ---> recorder.ts
  * record-wav.ts ---> wav-recorder.ts

* save file being recorded by using creation date - the time at which
  you clicked 'record' - as the filename
* implement a limited memory player: chunked player, using slice()
  as described here:
      https://www.html5rocks.com/en/tutorials/file/dndfiles/
  you'll need to schedule via web-audio api and for that look
  and how you did it previously with multi-files
* get rid of previous chunked player
* before refactoring, you just need to rewrite player-wav.ts
* get rid of idb uses
* refactor all else
* add tests

* redo the append in a smarter way via seek & write operations, it's
* that easy. so do a special wav append where you seek first to 0,
* which is where you'll be anyway so you do not need to seek there at all,
* just start by rewriting the header there, then 

* app-state.spec.fs
* app-fs.spec.fs

* Refactor: 
  Functions shared between moveto & organizer:
  - switch folder() / this.entries / this.directoryEntry / atHome()
  - make above a class called DirWalker
  - give this class a cache layer?

1 services/app-filesystem/ - keeps this.fileSystem, only asks once,
  injectable singleton
2 use it in selection-page
3 use it in organizer-page and have organizer-page extend selection-page

1 selected-page - bottom-buttons
2 move-to-page - only show folders, no files, or show files disabled
  which is a much better solution
  top-buttons: (1) Move items here, (2) Go home, (3) Go to parent
3 create a link and have it start an in-app-browser if clicked
4 implement the info button
5 add a setting in settings page which designates where we 
  try to record files into - which directory - the default
  save directory for recordings
6 add button can add a recording - jumps to recording page which
  now but only this time will record in the current dir rather
  than in /Unfiled


* when deleting an entry you must check (in organizer page) whether
  that entry is in the selected - actually it is in the selected
  nodes, right now the only way to delete something is to select it
  first. but we may later want to have a track page where we allow
  deleting right away.
* Organizer: remember orderings per entry per restart
* remember selectedNodes per restart
* delete a set or an array of paths
* go into a folder (switch folder, didn't we write that already?)

* change filenames to be record, not record-page, etc. 
* For last recording, store only the key of the recorded node.
  * Also: make track page start with only the key info, and have it deduce
    all other values (e.g. parent name, parent key) by doing DB reads.
  * Then we'll need to spawn the track page properly from the library page
  * We'll also need to spawn the track page properly from the record page
  * search for ***TODO*** in both record-page.ts and library-page.ts
* We will now remember the specific track page we were on, if we 
  were on one when we quit the app.  NOTE: this can either be
  implemented via deep link routing, which is useful for later
  sharing - but the kind of sharing that requires the app to 
  be installed.
  - method 1 = save treenode of track page
  - method 2 = save url of deeplink
  for now we'll use method 1, just because it does not require deep
  links. we'll use deep links later if we see that method 1 is no good
  or lacking in some way.
  
  one idea:
  ---------
  track page is still part of the library, so if we jump back to it we 
  need to (a) jump back to its parent folder, the storage property
  'lastViewedFolder' will continue to serve as always and in ionViewWillEnter()
  we'll still switch to that folder. but we will also check if the
  (new) storage property 'lastTrack'

[
  so essentially we use storage to pass around information - not great

  it's better to use links and do it in a RESTful way

  no but it's good to go through storage. let's just continue for a bit to
  think this through before criticizing.
]
  so in ionViewWillEnter, after you've called switchFolder, you do another
  getProperty('playingTrack') - if it is not null and looks like a TreeNode,
  then you .

  NOTE: for this, we will need to make switchFolder return an observable
  first, because we want to sequentially run after it because in order
  to push the track page, we have to first have this.folderNode, which
  is only computed at the end of switchFolder.

  ----
  For RecordPage, when you click on last recording, it will ...

  The other idea is to make track page only take a node as a single parameter.
  Not depend on this.folderNode - it can figure out the parent name from
  its own node, maybe we'll even store it.

  For RecordPage, when you click on stop button and it saves a recording,
  it will also set in storage 'playingTrack' to the node of what you are
  saving.  If track page only depends on the node, your'e done.

  RecordPage:clickPlay-> just do a nav.push(TrackPage, lastRecordingNode)
  THis way, when you click back button on this track page, it will not
  return to the library, it will return to where you were, the record
  page! This is better.

* We're going to implement 'move selected items'
  1) UI/UX - use a full-page modal that looks just like
  library page, except: (a) no bottom button bar,
  (b) no selection boxes, (c) left 'select' button is
  gone. so you only have three buttons on top: 
  - home
  - to parent
  - new folder
  as soon as you hit a folder it will display a confirmation alert
  before doing anything because this is pretty destructive an operation
  2) engine: with CRUD this is just looping through the selected nodes,
  and, because they are so small in size (they are just pointers to the
  data just like UNIX nodes) you do: step 1 = create all selected nodes
  anew (a new copy) at the destination location, step 2 = delete all 
  of the original ones, if everything went perfectly well in step 1 -
  perhaps even adding a verification; but if things did not go well,
  then delete the new ones you've just created and report the error.
* when you click the 'N selected' badge on the top right, it pops up
  an alert (not full size window, with a backdrop) that has a scrolling
  list of all files and folders (items) that are selected. 
* do some e2e tests - destroy db from settings page,
  then reload browser page and go to
  library tab. or just destroy db 
* remember gain value - it doesn't remember it currently
* settings page - delete db - why need it twice? fix!
  NOTE: you have to do it twice only if going to record page first
  and then clicking 'delete db' after that - the record page somehow
  keeps hold of the db and that blocks the deletion, probably
* why is readOrCreateNode in idb-fs, shouldn't it be idb?  also check the
  read-or-create startup of idb-fs because we still get complaints that
  the key is already in the db when it is...  we want to make sure that
  we can reset the db when necessary and not reset it when unnecessary and
  no crashes - for any situation, regardless of versions in the past that
  you may or may not have installed
* add splash screen to ionic-recorder
* we got rid of idb-app-state now we get rid of idb-app-fs
  use cordova-file plugin!
  * write a blog about how you build the file browser app
  * write an entire file-browser app (library-tab)
* Use ionic storage instead of indexed-db for app-state:
  a) rename idb-app-state to app-state
  b) use storage: but be 100% compatible with current API, which 
     means app-state class has only two methods: getProperty and
     updateProperty - rename those to get and set 
* Add missing tests
* OK: major decision: only wav from now on.
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
  * [this blog](http://blog.thoughtram.io/angular/2017/01/06/taking-advantage-of-observables-in-angular2.html)
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
