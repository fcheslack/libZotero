# phpZotero

A simple PHP class for working with the [Zotero API](http://www.zotero.org/support/dev/server_api). phpZotero works with version 1 of the Zotero API.

## Usage

You must first require the phpZotero class.

    require_once '/path/to/phpZotero/phpZotero.php';

Replace '/path/to' to the path where you have placed phpZotero.

### Create a new phpZotero object

    $zotero = new phpZotero('YourAPIKey');

Using this object, you can access the Zotero API. You will need to pass your Zotero API key to the constructor. Zotero API keys can be managed on your Zotero.org user settings page.

## Changelog

### 0.1

First tagged release.

## Credits

Many thanks to the following folks for contributing to phpZotero.

* Faolan Cheslack-Postava
* Wayne Graham
* Jim Safley
