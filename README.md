# Really Flatten Vectors

Figma plugin that flattens a vector into as few paths as possible. Overlapping
paths will be simplified so only the outer shape is defined. The flattening
happens in-place and "deletes" the old layers, so be careful!

## Usage

1. Select some layers
2. Run the plugin by going to `Plugins > Really Flatten Vectors` or pressing
   `⌘/` and searching for `Really Flatten Vectors`.

## How does it work?

Flattening vectors in Figma isn't entirely straightforward. Generally, Figma
simplifies paths when using the built-in flatten `⌘E` on a union layer. This
plugin simplifies the setup needed to get a pretty flatten output.

1. Deeply ungroup/unframe the selection. This keeps positioning simple for some
   of the later operations.
2. Outline all strokes. Since this plugin merges everything into one path,
   strokes cannot be preserved. All strokes and text are outlined.
3. Use the first valid fill paint data to use as the output fill.
4. Use Figma's built-in flatten to merge the layers. Figma is pretty
   intelligent and will place the resulting layer in the correct spot in the
   layer hierarchy.
5. Create a union layer that contains the resulting layer from the previous
   step, and a clone of that same layer. This is because running the built-in
   flatten on a union with just one layer won't simplify the paths. If there is
   an exact replica inside the union, then the resulting layer will have
   simplified paths.
6. Run the built-in flatten against the union.

## Development instructions

Check the [plugin docs](https://www.figma.com/plugin-docs/intro/) first for
details on how to load a plugin in development mode.

```bash
# Development mode
npm run watch

# Push to production
npm run build
```
