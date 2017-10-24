## ionic-recorder/src/services/web-audio/README.md

NOTE: This is future documentation. Some of what is in this file is
not yet implemented. This API is not yet stable and will change a lot.

### Player API

#### Methods

* `setSourceFile(path: string)`
* `jumpToRelativePosition(relativePosition: number)`
* `playFromRelativePosition(relativePosition: number)`
* `pauseAtRelativePosition(relativePosition: number)`
* `togglePlayPause()`
* `stop()`

#### Properties
* `isPlaying` - True if currently playing and not paused (changes in real time).
* `duration` - Total time in seconds of currently loaded track'
* `relativePosition` - 
* `displayTime`
* `displayDuration`
* `lastModified`
* `fileSize`
* `sampleRate`
* `nSamples`
* `filename`
* `folderPath`
