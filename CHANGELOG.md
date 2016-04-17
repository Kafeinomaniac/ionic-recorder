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
