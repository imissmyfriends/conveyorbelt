# conveyorbelt

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
- Aseprite file names need to match the sprite names in GameMaker (except the `PREFIX`, see configuration `TODO LINK`)

### Export convention
- If the sprite doesn't have any particular export layers or animations then a single PNG should be exported. For eg `UIBubble.aseprite` should make `sUIBubble.png`
- Files can have only particular layers exported by prefixing the layer name with an `x`. For eg `LightMonsoon.aseprite` with the layers `xBedroomMorning` and `xBedroomNight` will result in the following PNG - `sLightMonsoonBedroomMorning` and `sLightMonsoonBedroomNight`.
- Animations will have the frame number appended to the file name after a `-`. So `RainParticle.aseprite` would create `sRainParticle-001.png`, `sRainParticle-002.png` and so on.
- Files that have multiple animation tags


Might need to change how we find PNGs to put into GMS. When exporting from Aseprite we need a way to figure out which sprites need to be updated. Interpreting that from just the PNG filenames is going to make it tricky for no reason. Also its nicer to have clean PNG filenames maybe? No one needs to see them so I am not sure that is valid. I think the only consideration should be
- How to export from Aseprite
- How to make it easy to import to GMS

### Kinds of Aseprite files
- Single sprite `UIBubble.aseprite` -> `UIBubble.png` -> `sUIBubble`
- Single animation `AirConFan.aseprite` -> `AirConFan001.png`, `AirConFan002.png`... -> `sAirConFan`
- Multiple animations (tags) `Alo.aseprite` with tags (`WalkFront`, `WalkBack`)
  - `AloWalkFront001.png`, `AloWalkFront002.png`... -> `sAloWalkFront`
  - `AloWalkBack001.png`, `AloWalkBack002.png`... -> `sAloWalkBack`
- Multiple layers (some prefix to mark only those for export): `LightBedroom.aseprite` with layers `xWindowMorning` and `xLampNight`:
  - `LightBedroomWindowMorning.png` -> `sLightBedroomWindowMorning`
  - `LightBedroomLampNight.png` -> `sLightBedroomLampNight`
- Multiple layers + one animation for each `Window.aseprite` with layers `xOutside` and `xCurtains`:
  - `WindowOutside001.png`, `WindowOutside002.png`... -> `sWindowOutside`
  - `WindowCurtains001.png`, `WindowCurtains002.png`... -> `sWindowCurtains`
- Multiple layers + multiple tagged animation for each: `MomVideoCall.aseprite` with layers `xBackground` and `xPortrait`.
  - `xBackground` has animation with tags `Night` and `Day`
    - `MomVideoCallBackgroundNight001.png`, `MomVideoCallBackgroundNight002.png`... -> `sMomVideoCallBackgroundNight`
    - `MomVideoCallBackgroundDay001.png`, `MomVideoCallBackgroundDay002.png`... -> `sMomVideoCallBackgroundDay`
  - `xPortrait` has animation with tags `Happy` and `Sad`:
    - `MomVideoCallPortraitHappy001.png`, `MomVideoCallPortraitHappy002.png`... -> `sMomVideoCallPortraitHappy`
    - `MomVideoCallPortraitSad001.png`, `MomVideoCallPortraitSad002.png`... -> `sMomVideoCallPortraitSad`