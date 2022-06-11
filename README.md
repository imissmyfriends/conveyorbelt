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
- The
