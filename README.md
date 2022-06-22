# conveyorbelt

> This tool is being developed for 🐟 Fishbowl, you can follow along on [Twitter](https://twitter.com/imissmy_friends).

> **⚠️ Warning**: The tool doesn't work when the number of frames in an animation changes. 

> **⚠️ Warning**: The tool isn't able to update the bounding box (collision map) of sprites that have a non-default bounding box. If you run the tool in `--verbose` it'll warn you about the sprites whose bounding box wasn't changed.


![conveyorbelt](https://user-images.githubusercontent.com/9491/174024453-55c428ad-69f7-48c0-b0c3-7943f82de76b.gif)


## CLI Help
```
% conveyorbelt run --help
Usage: conveyorbelt run [options]

Options:
  -sd, --sprites-dir <string>    Directory of GMS sprites (default: "sprites/")
  -ad, --art-dir <string>        Directory of Aseprite art (default: "art/")
  -ap, --aseprite-path <string>  Path to Aseprite executable (default: "~/Library/Application\\ Support/Steam/steamapps/common/Aseprite/Aseprite.app/Contents/MacOS/aseprite")
  -p, --prefix <string>          String prefix for GMS sprites (default: "s")
  -v, --verbose                  Whether or not to use the verbose renderer (default: false)
  -ne, --no-export               Whether or not to export all Aseprite files on first run
  -h, --help                     display help for command
  ```

## Configuration
- `SPRITES_DIR` defaults to `sprites/`: GameMaker sprites
- `ART_DIR` defaults to `art/`: Aseprite sprites
- `PREFIX` defaults to `s`: The prefix that'll be used to find the sprite in GameMaker. For example if the aseprite is called `Player.aseprite` the sprite this script will try to update would be `sPlayer`.
- `ASEPRITE_PATH` defaults to `TODO`. You will need to change this based on your [platform](https://www.aseprite.org/docs/cli/#platform-specific-details) and how you [installed](https://www.aseprite.org/docs/cli/#in-the-case-of-steam) Aseprite. Possible paths
  - C:\Program Files (x86)\Aseprite\Aseprite.exe
  - C:\Program Files\Aseprite\Aseprite.exe
  - C:\Program Files (x86)\Steam\steamapps\common\Aseprite\Aseprite.exe (Steam)
  - /Applications/Aseprite.app/Contents/MacOS/aseprite
  - ~/Library/ApplicationSupport/Steam/steamapps/common/Aseprite/Aseprite.app/Contents/MacOS/aseprite (Steam)

## Convention
- Aseprite file names need to match the sprite names in GameMaker (except the `PREFIX`, see Configuration above)
- If the sprite doesn't have any particular export layers or animations then a single PNG should be exported. For eg `UIBubble.aseprite` should make `sUIBubble.png`
- Files can have only particular layers exported by prefixing the layer name with `-x` or `-xt` (if you want the PNG to be trimmed). For eg `LightMonsoon.aseprite` with the layers `-xBedroomMorning` and `-xtBedroomNight` will result in the following PNG - `sLightMonsoonBedroomMorning` and `sLightMonsoonBedroomNight`.
- Animations will have the frame number appended to the file name after a `-`. So `RainParticle.aseprite` would create `sRainParticle-001.png`, `sRainParticle-002.png` and so on.
- Files that have multiple animation tags will have the tag added at the end.

### Example Aseprite files and how they'll be exported
- Single sprite `UIBubble.aseprite` -> `UIBubble.png` -> `sUIBubble`
- Single animation `AirConFan.aseprite` -> `AirConFan001.png`, `AirConFan002.png`... -> `sAirConFan`
- Multiple animations (tags) `Alo.aseprite` with tags (`WalkFront`, `WalkBack`)
  - `AloWalkFront001.png`, `AloWalkFront002.png`... -> `sAloWalkFront`
  - `AloWalkBack001.png`, `AloWalkBack002.png`... -> `sAloWalkBack`
- Multiple layers (some prefix to mark only those for export): `LightBedroom.aseprite` with layers `xWindowMorning` and `xLampNight`:
  - `LightBedroomWindowMorning.png` -> `sLightBedroomWindowMorning`
  - `LightBedroomLampNight.png` -> `sLightBedroomLampNight`
- Multiple layers + one animation for each `Window.aseprite` with layers `-xtOutside` and `-xCurtains`:
  - `WindowOutside001.png`, `WindowOutside002.png`... -> `sWindowOutside`
  - `WindowCurtains001.png`, `WindowCurtains002.png`... -> `sWindowCurtains`
- Multiple layers + multiple tagged animation for each: `MomVideoCall.aseprite` with layers `-xBackground` and `-xPortrait`.
  - `-xBackground` has animation with tags `Night` and `Day`
    - `MomVideoCallBackgroundNight001.png`, `MomVideoCallBackgroundNight002.png`... -> `sMomVideoCallBackgroundNight`
    - `MomVideoCallBackgroundDay001.png`, `MomVideoCallBackgroundDay002.png`... -> `sMomVideoCallBackgroundDay`
  - `-xPortrait` has animation with tags `Happy` and `Sad`:
    - `MomVideoCallPortraitHappy001.png`, `MomVideoCallPortraitHappy002.png`... -> `sMomVideoCallPortraitHappy`
    - `MomVideoCallPortraitSad001.png`, `MomVideoCallPortraitSad002.png`... -> `sMomVideoCallPortraitSad`