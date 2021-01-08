# codewall

VS Code extension that checks if code goes past your rulers. Install it [here](https://marketplace.visualstudio.com/items?itemName=abhinavk99.codewall)!

## Features

Shows warnings at the specific locations where code goes past your rulers.

![](https://raw.githubusercontent.com/abhinavk99/codewall/master/images/window.PNG)

![](https://raw.githubusercontent.com/abhinavk99/codewall/master/images/message.PNG)

## Settings

This extension has the following settings:

- `codewall.openProblemsPane`: Determines whether to open the problems pane to show warnings when lines cross rulers. Is true by default.

## Usage

Add a rulers using the `editor.rulers` setting (`Command Palette -> Preferences: Open Settings (JSON)`).

Valid Values:

```json
"editor.rulers": [
  {"column": 90, "color": "#000000"},
  {"column": 105, "color": "#ff0000"}
]
```

```json
"editor.rulers": [90, 105]
```

## CodeWall for Atom

Don't use VS Code? Try [CodeWall](https://github.com/Oceanwall/CodeWall) for Atom, made by Oceanwall!
