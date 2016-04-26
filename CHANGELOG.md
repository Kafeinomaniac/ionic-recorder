### v0.0.7-alpha.1
* Both in `audio-player` and in `record`, the html now refers to `web-audio`
  functions directly.  This makes things simpler and makes `web-audio` more
  useful as a standalone module.  More separation of graphics & action.
* Got rid of many timing bugs.  Running in dev mode with no exceptions
  thrown.  More stable.

### v0.0.6-alpha.1
* Got rid of some record page timing / event issues that caused either
  the navbar to go blank or an error to be thrown

### v0.0.5-alpha.1
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

### v0.0.4-alpha
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

### v0.0.3-alpha.3
* Minor version cleanup, from this point on all tags pass all tests successfully

### v0.0.3-alpha.2
* Started tagging and started this ChangeLog
* Catch-all for app errors is in now
* Playback uses WebAudioApi:decodeAudioData() instead of the <audio> element
* Added master clock
* Improved on memory leaks w/NgZone
* Added initial functional player version
