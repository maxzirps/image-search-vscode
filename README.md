# ![Banner](images/banner.png)

Search and download images from Pixabay directly in VS Code

![Feature Screenshot](images/feature.gif)

Using the [Pixabay API](https://pixabay.com/api/)

Check their [Content license](https://pixabay.com/service/terms/)

While the preview images are low resolution, the downloaded images are medium-sized, ready for web development.

## Requirements

- **API Key Required**: The extension requires a valid Pixabay API key.

## Commands

- **Image-Search: Set Pixabay API key**: Set your Pixabay API key for image searches.
- **Image-Search: Set resolution of downloaded images**: Choose the resolution for the images you download.
- **Image-Search: Search Image**: Search for images on Pixabay.

## Extension Settings

- **`image-search.pixabayAPIKey`**:

  - **Type**: `string`
  - **Default**: `""`
  - **Description**: Your Pixabay API key for searching images.

- **`image-search.downloadedImageResolution`**:
  - **Type**: `string`
  - **Enum**:
    - `"webformat"`: Medium sized image with a maximum width or height of 640 px (webformatWidth x webformatHeight).
    - `"largeImage"`: Scaled image with a maximum width/height of 1280px.
    - `"fullHD"`: Full HD scaled image with a maximum width/height of 1920px.
    - `"image"`: URL to the original image (imageWidth x imageHeight).
  - **Default**: `"webformat"`
  - **Description**: You can choose between 4 predefined resolutions. FullHD and Image only work if your account has been approved for full access. Check their website for more information.

## Known Issues

- **Needs caching**
- **Needs Testing**
- **No Workspace Folder Open**: If no workspace folder is open, the extension will not be able to save downloaded images.

## License

This extension is licensed under the [MIT License](LICENSE).

---

Icon generated with Microsoft Bing ∙ 17 September 2024 at 8:55 pm
