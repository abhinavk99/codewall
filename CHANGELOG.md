# Changelog

## [1.2.2] - 2021-01-14

### Changed

- Switched from checking lines when getting onDidSaveTextDocument to onWillSaveTextDocument event for minor performance boost
- Refactored code

## [1.2.1] - 2021-01-12

### Added

- README badges
- Dev
  - Github Actions CI testing

## [1.2.0] - 2021-01-12

### Added

- Added support for ruler objects from configuration (e.g. {"column": 90, "color": "#000"})
- Added usage notes in README
- Dev
  - Switched from Yarn to NPM
  - Added and used linter and formatter

### Changed

- Changed extension activation event from `*` to `onStartupFinished` so it'll start after VS Code is done starting
- Ignore rulers that have a column number of <= 0
- Performance optimizations
  - Switched from linear search to binary search for determining whether a line crosses one of the rulers
  - Store rulers configuration and update it when configuration gets changed to avoid repetitive VS Code API calls
- Dev
  - Revamped test runner code and added unit tests

### Security

- Dev
  - Updated dev dependencies

## [1.1.0] - 2019-10-28

### Added

- Added setting `codewall.openProblemsPane` for whether to open it to show warnings

## [1.0.7] - 2019-07-22

### Changed

- Updated dev dependencies

## [1.0.6] - 2019-07-22

### Fixed

- Fixed repository link in package.json

## [1.0.5] - 2019-06-15

### Changed

- Updated dev dependencies

## [1.0.4] - 2018-03-09

### Changed

- Don't show the problems pane if there are no problems in the file

## [1.0.3] - 2018-11-16

### Fixed

- Added missing semicolon

## [1.0.2] - 2018-11-16

### Fixed

- Fixed images in README

## [1.0.1] - 2018-11-16

### Fixed

- Fixed description in package.json

## [1.0.0] - 2018-11-16

### Added

- Initial release
