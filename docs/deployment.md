# Deployment Guide

This guide covers different deployment options for Captain's Log.

## Prerequisites

Before deploying, ensure you have:

1. Node.js v14 or higher installed
2. All tests passing (`npm test`)
3. A successful production build (`npm run build`)
4. Required environment variables set up

## Environment Variables

Copy `.env.example` to `.env.production` and configure:

```
REACT_APP_API_URL=your-production-api-url
REACT_APP_ENABLE_OFFLINE_MODE=true
REACT_APP_ENABLE_CLOUD_SYNC=true
REACT_APP_ENCRYPTION_KEY=your-production-key
```

## Deployment Options

### 1. Static Hosting (Recommended)

#### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Configure environment variables in Netlify dashboard

#### Vercel

1. Import your GitHub repository
2. Build command will be auto-detected
3. Configure environment variables in Vercel dashboard

#### GitHub Pages

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   {
     "homepage": "https://yourusername.github.io/captains-log",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```
3. Deploy: `npm run deploy`

### 2. Traditional Web Servers

#### Apache

1. Build the project: `npm run build`
2. Copy the contents of the `build` directory to your Apache web root
3. Create `.htaccess`:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

#### Nginx

1. Build the project: `npm run build`
2. Copy the contents of the `build` directory to your Nginx web root
3. Configure Nginx:
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     root /path/to/build;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

#### IIS

1. Build the project: `npm run build`
2. Copy the contents of the `build` directory to your IIS web root
3. Create `web.config`:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>
     <system.webServer>
       <rewrite>
         <rules>
           <rule name="React Routes" stopProcessing="true">
             <match url=".*" />
             <conditions logicalGrouping="MatchAll">
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
               <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
             </conditions>
             <action type="Rewrite" url="/" />
           </rule>
         </rules>
       </rewrite>
     </system.webServer>
   </configuration>
   ```

## Post-Deployment Checklist

1. Verify all environment variables are correctly set
2. Test microphone permissions work correctly
3. Verify speech recognition functions
4. Check all UI elements render properly
5. Test export functionality
6. Verify SSL certificate is valid (required for microphone access)
7. Test in all supported browsers

## Troubleshooting

### Common Issues

1. **Microphone Not Working**
   - Check SSL certificate
   - Verify browser permissions
   - Test in incognito mode

2. **Build Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check Node.js version

3. **Environment Variables**
   - Ensure all required variables are set
   - Variables must start with REACT_APP_
   - Rebuild after changing variables

For additional support, please open an issue on GitHub. 