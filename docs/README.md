# form-design-lib Website

This is the official website for the form-design-lib project.

## Structure

- `index.html` - Main website page
- `styles.css` - Website styles
- `script.js` - Website interactivity

**Note:** This folder is named `docs` to be compatible with GitHub Pages, which requires the folder to be named `docs` (or `root`) when deploying from a branch.

## Deployment

### Option 1: GitHub Pages

1. Push the `docs` folder to your repository
2. Go to repository Settings > Pages
3. Set source to `/docs` directory
4. Your site will be available at `https://pfigueiredo.github.io/form-design-lib`

### Option 2: Netlify

1. Connect your repository to Netlify
2. Set build directory to `docs`
3. Set publish directory to `docs`
4. Deploy

### Option 3: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to `docs` directory
3. Run `vercel`
4. Follow the prompts

## Customization

### Update Links

1. GitHub username is already set to `pfigueiredo`
2. Update email address in the license section
3. Update repository URLs throughout the site

### Update Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* ... */
}
```

### Add More Sections

You can add additional sections by following the existing pattern in `index.html`.

## License

The website content is part of the form-design-lib project and is licensed under GPLv2.
