# Smart Chat App Deployment Guide

## Prerequisites

Before deploying the application, ensure you have the following:

1. Node.js (v16 or higher)
2. npm or yarn package manager
3. Git
4. A hosting platform account (e.g., Vercel, Netlify, or your preferred platform)

## Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-chat-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add required environment variables:
```env
VITE_API_KEY=your_api_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

## Building for Production

1. Create a production build:
```bash
npm run build
# or
yarn build
```

2. Test the production build locally:
```bash
npm run preview
# or
yarn preview
```

## Deployment Options

### 1. Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Follow the prompts to:
   - Login to your Vercel account
   - Select your project
   - Configure project settings

4. Set up environment variables in Vercel:
   - Go to your project settings
   - Add the environment variables from your `.env` file

### 2. Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy to Netlify:
```bash
netlify deploy
```

3. Configure build settings:
   - Build command: `npm run build` or `yarn build`
   - Publish directory: `dist`

4. Set up environment variables in Netlify:
   - Go to Site settings > Build & deploy > Environment
   - Add your environment variables

### 3. GitHub Pages

#### Prerequisites
1. Node.js and npm installed
2. Git installed
3. GitHub account
4. Project pushed to GitHub repository

#### Step 1: Prepare Your Repository

1. Create a new repository on GitHub (if not already created)
2. Initialize git in your project (if not already done):
```bash
git init
```

3. Add your GitHub repository as remote:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

#### Step 2: Configure for GitHub Pages

1. Install gh-pages package:
```bash
npm install --save-dev gh-pages
```

2. Add homepage field to package.json:
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
}
```

3. Add deploy scripts to package.json:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. Create or update vite.config.ts:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/YOUR_REPO_NAME/',
})
```

#### Step 3: Build and Deploy

1. Commit all your changes:
```bash
git add .
git commit -m "Prepare for deployment"
```

2. Push to GitHub:
```bash
git push origin main
```

3. Run the deploy command:
```bash
npm run deploy
```

#### Step 4: Configure GitHub Pages

1. Go to your GitHub repository
2. Click on "Settings"
3. Scroll to "GitHub Pages" section
4. Under "Source", select:
   - Branch: gh-pages
   - Folder: / (root)
5. Click Save

#### Step 5: Verify Deployment

1. Wait a few minutes for deployment to complete
2. Visit your site at: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
3. Verify all features are working correctly

#### Common Issues and Solutions

### 1. Blank Page After Deployment
- Check if base in vite.config.ts matches your repository name
- Ensure all asset paths are relative
- Check browser console for errors

### 2. 404 Errors
- Verify GitHub Pages is enabled in repository settings
- Ensure gh-pages branch exists
- Check if homepage in package.json is correct

### 3. Routing Issues
- Add redirects for client-side routing
- Update router base path to match repository name
- Use HashRouter instead of BrowserRouter

### 4. Assets Not Loading
- Update asset paths to be relative
- Ensure assets are included in the build
- Check file paths case sensitivity

#### Updating Your Deployed Site

1. Make your changes locally
2. Test thoroughly
3. Commit changes:
```bash
git add .
git commit -m "Update description"
```

4. Push to GitHub:
```bash
git push origin main
```

5. Deploy:
```bash
npm run deploy
```

#### Environment Variables

1. Create .env file for local development
2. Add to .gitignore:
```
.env
```

3. Set up environment variables in GitHub repository:
   - Go to Settings > Secrets and variables > Actions
   - Add your environment variables

#### Security Considerations

1. Never commit sensitive data:
   - API keys
   - Passwords
   - Private tokens

2. Use environment variables for sensitive data
3. Add proper security headers
4. Implement CORS policies

#### Monitoring

1. Check GitHub Actions for deployment status
2. Monitor GitHub Pages build and deployment
3. Check browser console for errors
4. Use browser dev tools for debugging

#### Support

If you encounter issues:
1. Check GitHub Pages documentation
2. Review repository settings
3. Check browser console
4. Verify all paths and configurations

### 4. Manual Deployment

If you're deploying to your own server:

1. Build the project:
```bash
npm run build
```

2. Copy the contents of the `dist` folder to your web server

3. Configure your web server:
   - Set up URL rewriting for SPA
   - Configure HTTPS
   - Set up environment variables

## Post-Deployment Checklist

1. Verify environment variables are set correctly
2. Test all features in production environment
3. Check performance metrics
4. Verify PWA functionality if enabled
5. Test on different devices and browsers

## Monitoring and Maintenance

1. Set up error tracking (e.g., Sentry)
2. Configure performance monitoring
3. Set up automated backups if applicable
4. Plan for regular updates and maintenance

## Troubleshooting

Common issues and solutions:

1. Build fails:
   - Check Node.js version
   - Clear npm/yarn cache
   - Remove node_modules and reinstall

2. Environment variables not working:
   - Verify variable names start with `VITE_`
   - Check if variables are properly set in hosting platform
   - Rebuild after changing environment variables

3. Routing issues:
   - Verify hosting platform's redirect rules
   - Check if _redirects or vercel.json is properly configured

## Security Considerations

1. Always use HTTPS in production
2. Secure API keys and sensitive data
3. Implement proper CORS policies
4. Regular security audits
5. Keep dependencies updated

## Performance Optimization

1. Enable caching where appropriate
2. Optimize images and assets
3. Use CDN for static assets
4. Enable compression
5. Implement lazy loading

## Support

For additional support:
1. Check the project documentation
2. Visit the GitHub repository
3. Contact the development team

Remember to keep this document updated as deployment processes or requirements change.
