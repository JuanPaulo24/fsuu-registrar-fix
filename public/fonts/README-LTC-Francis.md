# Francis Regular Font Setup

## Current Status
The Francis Regular font file is located in `/resources/fonts/FrancisRegular/Francis Regular.otf` but needs to be copied to the public fonts directory.

## Required Action
1. Copy the font file from `/resources/fonts/FrancisRegular/Francis Regular.otf` to `/public/fonts/FrancisRegular.otf`
2. Run this command in your project root:
   ```bash
   cp "resources/fonts/FrancisRegular/Francis Regular.otf" "public/fonts/FrancisRegular.otf"
   ```

## Font Registration
The font is already registered in the DiplomaPDF component as:
```javascript
Font.register({
  family: 'FrancisRegular',
  src: '/fonts/FrancisRegular.otf',
  fontWeight: 'normal',
  fontStyle: 'normal'
});
```

## Font Usage
The Francis Regular font is used for the `diplomaText` style to provide an elegant, formal appearance suitable for academic documents:
```javascript
diplomaText: {
  fontFamily: 'FrancisRegular'
}
```

## Fallback
If the font file is not available, the PDF will fall back to the default font (Helvetica).
