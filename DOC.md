## Functions

<dl>
<dt><a href="#getGlobPromise">getGlobPromise(globMatch, errorText)</a> ⇒ <code>Promise</code></dt>
<dd><p>Wraps a <code>glob</code> call with a Promise.</p>
</dd>
<dt><a href="#checkGitExists">checkGitExists()</a> ⇒ <code>Promise</code></dt>
<dd><p>Checks if a <code>.git</code> exists where the script is being run</p>
</dd>
<dt><a href="#checkYYPFileExists">checkYYPFileExists()</a> ⇒ <code>Promise</code></dt>
<dd><p>Checks if a YYP file exists where the script is being run</p>
</dd>
<dt><a href="#checkSpritesDirExists">checkSpritesDirExists()</a> ⇒ <code>Promise</code></dt>
<dd><p>Checks if the sprites directory exists where the script is being run</p>
</dd>
<dt><a href="#getSpriteDirectories">getSpriteDirectories(ctx)</a> ⇒ <code>Promise</code></dt>
<dd><p>Goes through the sprites directory and puts all the <code>yy</code> files
in <code>files</code> inside of <code>ctx</code>.</p>
</dd>
<dt><a href="#collectSpriteData">collectSpriteData(ctx)</a> ⇒ <code>Listr</code></dt>
<dd><p>Collects sprites data for all the <code>files</code> in <code>ctx</code> and puts
it in <code>spriteDetails</code>.</p>
</dd>
<dt><a href="#getSpriteReader">getSpriteReader(ctx, file)</a> ⇒ <code>Promise</code></dt>
<dd><p>Reads the sprite file, parses it, gets its details and puts them
in the <code>ctx</code></p>
</dd>
<dt><a href="#parseSpriteJSON">parseSpriteJSON()</a> ⇒ <code>Object</code></dt>
<dd><p>Parses the <code>yy</code> JSON format and returns it</p>
</dd>
<dt><a href="#getSpriteDetails">getSpriteDetails()</a> ⇒ <code>Object</code></dt>
<dd><p>Gets the image and layer name details from a sprite.</p>
</dd>
<dt><a href="#getAsepriteFiles">getAsepriteFiles(ctx)</a> ⇒ <code>Promise</code></dt>
<dd><p>Looks into the <code>ART_DIR</code> and finds all Aseprite files</p>
</dd>
<dt><a href="#exportAllAsepriteToPng">exportAllAsepriteToPng()</a> ⇒ <code>Listr</code></dt>
<dd><p>Creates tasks to export all Aseprite files that are in the
<code>ctx</code>.</p>
</dd>
<dt><a href="#exportFromAseprite">exportFromAseprite(filePath)</a> ⇒ <code>Promise</code></dt>
<dd><p>Exports PNGs from an Aseprite file. The output differs
based on whether the file is an animation or has exportable
layers.</p>
</dd>
</dl>

<a name="getGlobPromise"></a>

## getGlobPromise(globMatch, errorText) ⇒ <code>Promise</code>
Wraps a `glob` call with a Promise.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| globMatch | <code>string</code> | The glob to match |
| errorText | <code>string</code> | The error that the Promise should return |

<a name="checkGitExists"></a>

## checkGitExists() ⇒ <code>Promise</code>
Checks if a `.git` exists where the script is being run

**Kind**: global function  
<a name="checkYYPFileExists"></a>

## checkYYPFileExists() ⇒ <code>Promise</code>
Checks if a YYP file exists where the script is being run

**Kind**: global function  
<a name="checkSpritesDirExists"></a>

## checkSpritesDirExists() ⇒ <code>Promise</code>
Checks if the sprites directory exists where the script is being run

**Kind**: global function  
<a name="getSpriteDirectories"></a>

## getSpriteDirectories(ctx) ⇒ <code>Promise</code>
Goes through the sprites directory and puts all the `yy` files
in `files` inside of `ctx`.

**Kind**: global function  

| Param | Description |
| --- | --- |
| ctx | This is where the files are added |

<a name="collectSpriteData"></a>

## collectSpriteData(ctx) ⇒ <code>Listr</code>
Collects sprites data for all the `files` in `ctx` and puts
it in `spriteDetails`.

**Kind**: global function  

| Param |
| --- |
| ctx | 

<a name="getSpriteReader"></a>

## getSpriteReader(ctx, file) ⇒ <code>Promise</code>
Reads the sprite file, parses it, gets its details and puts them
in the `ctx`

**Kind**: global function  

| Param | Description |
| --- | --- |
| ctx |  |
| file | to be read |

<a name="parseSpriteJSON"></a>

## parseSpriteJSON() ⇒ <code>Object</code>
Parses the `yy` JSON format and returns it

**Kind**: global function  
**Params**: <code>string</code> json - JSON of the yy file  
<a name="getSpriteDetails"></a>

## getSpriteDetails() ⇒ <code>Object</code>
Gets the image and layer name details from a sprite.

**Kind**: global function  
**Returns**: <code>Object</code> - Object with `imgName(s)` and `layerName(s)`  
**Params**: <code>Object</code> sprite - Parsed sprite data  
<a name="getAsepriteFiles"></a>

## getAsepriteFiles(ctx) ⇒ <code>Promise</code>
Looks into the `ART_DIR` and finds all Aseprite files

**Kind**: global function  

| Param |
| --- |
| ctx | 

<a name="exportAllAsepriteToPng"></a>

## exportAllAsepriteToPng() ⇒ <code>Listr</code>
Creates tasks to export all Aseprite files that are in the
`ctx`.

**Kind**: global function  
**Params**: ctx  
<a name="exportFromAseprite"></a>

## exportFromAseprite(filePath) ⇒ <code>Promise</code>
Exports PNGs from an Aseprite file. The output differs
based on whether the file is an animation or has exportable
layers.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | Path to aseprite file |

