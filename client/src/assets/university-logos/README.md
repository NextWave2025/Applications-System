# University Logos Folder

This folder is for storing university logo images that will be displayed in the Partner Universities section of the landing page.

## Usage

1. Add your university logo images to this folder
2. Use standard image formats (png, jpg, svg)
3. Recommended size: 200x80 pixels
4. For best results, use transparent background (png/svg)
5. File naming convention: `university-[id].png` (example: `university-1.png`)

## Example

```javascript
// In your component
import universityLogo1 from "@assets/university-logos/university-1.png";

// Then use it
<img src={universityLogo1} alt="University Name" />
```

Or dynamically with university ID:

```javascript
// In your component
<img 
  src={`/src/assets/university-logos/university-${university.id}.png`} 
  alt={university.name} 
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/src/assets/placeholder-logo.png';
  }}
/>
```