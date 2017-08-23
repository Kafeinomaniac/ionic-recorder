## 0.2.0-alpha	
* Jumping to TrackPage from RecordPage after a recording, if desired

# 0.1.0-alpha
* Update to ionic-angular 2.0.0
* We are now making this beta

## 0.0.9-alpha
* Update to Ionic 2.0.0-alpha/.11 / Angular 2.0.0-rc.4
* Chunked playback of wav files is the main feature - no more is
  this recorder app a strain on you device's memory, it will expand
  to use as much as your hard disk (typically flash on mobile) as is
  allowed (for IndexedDB) or as is available (we need to monitor disk
  use for safety, later...).

## 0.0.8-alpha
* Update to Ionic 2.0.0-alpha/.9 / Angular 2.0.0-rc.1
  (numerous breaking changes were made since rc.1)
* Made karma / jasmine tests work after many breaking changes earlier
* Changed from using MediaRecorder to ScriptProcessorNode approach
  no longer recording webm but recording wav instead
* New chunking method that saves current recording one chunk at a
  time to IndexedDB. This allows for recording as large a wav file as
  your hard drive would allow, but with very little memory overhead.
  At this stage we're almost writing to DB but not quite. However,
  we're chunking and filling the temporary memory chunks and testing
  this and it runs for many days straight. We'll add the final save
  after some serious refactoring and testing of LocalDB, next, and
  we'll keep this feature in the 0.0.8-alpha.x series.  The 0.0.9
  series will start when we're playing thse DB files.

## 0.0.7-alpha
* Both in `audio-player` and in `record`, the html now refers to `web-audio`
  functions directly.  This makes things simpler and makes `web-audio` more
  useful as a standalone module.  More separation of graphics & action.
* Got rid of many timing bugs.  Running in dev mode with no exceptions
  thrown.  More stable.

## 0.0.6-alpha
* Got rid of some record page timing / event issues that caused either
  the navbar to go blank or an error to be thrown

## 0.0.5-alpha
* Returned to alpha.1, etc naming, because we're going to create a commit
  script that automatically increments that number on each commit
* Main change: got rid of master clock from record.ts, the app is 50% more
  efficient now!
* Many other changes: got rid of monitor toggle, because now the monitor
  takes very little resources and can run continously - how cool!
* Using WebAudio for playback and for recording, no more `<audio>` tag
* Using no more `<input type="range">` or `<progress>` tag - they were
  hard to style and limited in functionality and required lots of hacks,
  so now we have a progress-slider component that does both: (1)
  displays progress (of audio playback, in player) that can be
  modified in real time (with a finger or the mouse, it can be
  moved); (2) allows for input of a number - input slider functionality
  (used in recorder gain adjustment slider)
* Dropped '.x' extension on version numbers - the minor version number
  (rightmost) is enough
* Using WebAudio for playback now
* Split WebAudio class into two classes: WebAudioPlayer and WebAudioRecorder,
  made it completely independent
* Major changes that allow us to remove usage of MasterClock
* MasterClock removed from audio-player.ts progress bar updates, not yet
  removed from record.ts
* Many small improvements in UI/UX
* Custom progress slider that can be used as `<input type="range">` or
  as a progress indicator or both, used everywhere for a uniform feel
  and look, running smoothly and efficiently.
* Minor version cleanup, from this point on all tags pass all tests successfully
* Started tagging and started this ChangeLog
* Catch-all for app errors is in now
* Playback uses WebAudioApi:decodeAudioData() instead of the <audio> element
* Added master clock
* Improved on memory leaks w/NgZone
* Added initial functional player version
