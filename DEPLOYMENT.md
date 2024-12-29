# Deployment Guide for Smart Chat AI

This guide will help you deploy the Smart Chat AI to GitHub Pages.

## Prerequisites
- Node.js and npm installed
- Git installed
- GitHub account (username: MuthuM3)

## Deployment Steps

### 1. GitHub Repository
The repository is already created at:
- Repository URL: https://github.com/MuthuM3/smart-chat-ai
- Deployment URL: https://MuthuM3.github.io/smart-chat-ai

### 2. Push Code to GitHub
Run these commands in your terminal:

```bash
# Add all files to git
git add .

# Commit the changes
git commit -m "Your update message"

# Push code to GitHub
git push origin main
```

### 3. Deploy to GitHub Pages
After pushing your code to GitHub:

1. Run the deployment command:
```bash
npm run deploy
```

2. Wait for the deployment to complete. The terminal will show a success message.

3. Go to your GitHub repository settings:
   - Navigate to https://github.com/MuthuM3/smart-chat-ai/settings/pages
   - Under "GitHub Pages", ensure:
     - Source is set to "Deploy from a branch"
     - Branch is set to "gh-pages" and "/(root)"
   - Click Save if you made any changes

### 4. Verify Deployment
- Visit https://MuthuM3.github.io/smart-chat-ai
- Your app should be live and working

## Updating the App
To update your deployed app:

1. Make your changes locally
2. Commit the changes:
```bash
git add .
git commit -m "Your update message"
```

3. Deploy the updates:
```bash
npm run deploy
```

## Troubleshooting
If you encounter any issues:

1. Make sure your repository is public
2. Check if the GitHub Pages source is set to gh-pages branch
3. Verify that all files are committed and pushed
4. Check the Actions tab in your GitHub repository for any deployment errors
5. After deployment, wait a few minutes for changes to propagate

## Additional Notes
- The deployment process might take a few minutes
- GitHub Pages provides free HTTPS
- You can add a custom domain in the GitHub Pages settings if needed
- Repository URL: https://github.com/MuthuM3/smart-chat-ai
- Live App URL: https://MuthuM3.github.io/smart-chat-ai
