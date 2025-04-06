# Butter Extension for VS Code

Butter is a powerful Visual Studio Code extension designed to simplify the creation and management of YAML-based form configurations. It provides intelligent suggestions, customizable snippets, and a live preview feature to streamline your workflow.

## Features

- **YAML Form Configuration Support**: Provides intelligent autocompletion and snippets for creating YAML-based form configurations.
- **Customizable Snippets**: Quickly insert predefined field templates such as textboxes, dropdowns, checkboxes, and more.
- **Field Properties Suggestions**: Context-aware suggestions for field properties like `displayType`, `dataType`, and `required`.
- **Live Preview**: View a real-time preview of your form configuration in a webview panel.
- **Trigger-Based Suggestions**: Automatically suggests field properties when typing `:` or working within nested fields.
- **Field Layout Support**: Includes support for advanced layouts like `section_break`, `tab_break`, `column_break`, and more.
- **Media Capture Fields**: Easily configure fields for photo and video capture.
- **Geolocation Support**: Add geolocation fields with latitude and longitude inputs.
- **Validation and Error Handling**: Highlights invalid YAML configurations in the live preview.

> Tip: Use the Butter extension to quickly prototype and validate form configurations without leaving your editor.

### Screenshots

\!\[YAML Autocompletion in Action\]\(images/yaml-autocomplete.png\)

\!\[Live Form Preview\]\(images/form-preview.png\)

## Requirements

This extension has no external dependencies. Simply install it from the VS Code Marketplace and start using it right away.

## Extension Settings

Butter contributes the following settings:

- `butter.enable`: Enable or disable the Butter extension.
- `butter.defaultTemplate`: Set the default file template for new YAML configurations.
- `butter.snippetPrefix`: Customize the prefix for Butter snippets.

## Usage

1. Open a `.yaml` file in VS Code.
2. Start typing your form configuration. Use the provided snippets and autocompletions to quickly add fields and properties.
3. Use the `Butter: Show Preview` command from the Command Palette (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux) to open a live preview of your form.
4. Modify your YAML configuration and see the changes reflected in real-time in the preview panel.

### Supported Field Types

- **Simple Fields**: `textbox`, `textarea`, `date`, `dropdown`, `checkbox`, `radio`, `file_upload`, `captcha`.
- **Compound Fields**: `info_pane`, `group`, `card`.
- **Layout Fields**: `section_break`, `tab_break`, `column_break`.
- **Media Fields**: `photo_capture`, `video_capture`.
- **Geolocation Fields**: `geolocation`.

## Known Issues

- Some features may not work as expected in older versions of VS Code. Please ensure you are using the latest version.
- If you encounter any issues, feel free to report them on the [GitHub Issues page](https://github.com/your-repo/butter/issues).

## Release Notes

### 1.0.0

- Initial release of Butter.
- Added support for YAML autocompletion, customizable snippets, and live form preview.

---

## Following Extension Guidelines

Ensure that you've read through the extension guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For More Information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy coding with Butter!**