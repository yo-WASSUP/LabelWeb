# Image Object Annotation Tool

A lightweight web-based tool for annotating objects in images with bounding boxes. Perfect for creating labeled datasets for object detection tasks.

## Features

- 🖼️ Support for JPG, JPEG, and PNG images
- 📦 Batch processing of images from a folder
- 🎯 Easy bounding box drawing with mouse
- 🏷️ Customizable object categories
- 💾 Auto-save annotations to localStorage
- 📤 Export annotations as JSON files
- 📥 Import existing annotations
- 🔍 Image zoom and pan capabilities
- ⌨️ Keyboard shortcuts for efficient labeling

## Quick Start

1. Clone the repository
2. Open `labelweb.html` in a modern browser
3. Click "Open Image Path" to select your image folder
4. Start annotating!

## Keyboard Shortcuts

- `S`: Confirm current box
- `F`: Complete current image
- `C`: Reset current image
- `A`: Previous image
- `D`: Next image

## Output Format

Annotations are saved in JSON format:
json
{
"imgName": "example.jpg",
"img-w": 800,
"img-h": 600,
"objs": [
{
"label": "car",
"xmin": 100,
"ymin": 150,
"xmax": 300,
"ymax": 400
}
]
}

## Browser Support

Works in all modern browsers that support HTML5 Canvas.

## License

MIT License

## Author

SpikeDon (spikedon8866@gmail.com)