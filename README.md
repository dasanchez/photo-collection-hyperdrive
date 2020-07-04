# photo-collection-hyperdrive

A Beaker-powered photo album app

![screenshot]

This app allows you to build a photo collection with several albums inside:

```
- photo-collection-hyperdrive
- albums
  - some_photos
      face.jpg
  - some_more_photos
      landscape.jpg
```

## Requirements

- Beaker 1.0

## Usage

This site relies on the user adding content to a local folder, which Beaker then syncs to a hyperdrive.

Inside Beaker:
- Create a hyperdrive with folder autosync on, and copy these files inside.

On your local drive:
- Inside the `albums` folder, add a folder for every album you want to create.
- Add images to the relevant folder.

Back in Beaker:
- Reload the site to verify your photos can be displayed!
