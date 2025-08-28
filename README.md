# Spin to Win - Clothing Store Promotion App

A beautiful, minimalist web application featuring a spin-the-wheel discount promotion for clothing stores. Built with vanilla HTML, CSS, and JavaScript with MongoDB Atlas integration for email storage.

## 🎯 Features

- **Elegant Design**: Minimalist white background with black cursive fonts
- **Email Collection**: Secure email storage in MongoDB Atlas
- **Spin Wheel Animation**: Engaging wheel with fixed outcomes (5% or 10% discount)
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Serverless Architecture**: No backend server required
- **Easy Deployment**: Configured for both Netlify and Heroku

## 🎨 Design Specifications

- **Theme**: Elegant and minimalist
- **Colors**: Clean white background with black accents
- **Typography**: Dancing Script (cursive) and Playfair Display fonts
- **Layout**: Single-page application with smooth transitions
- **Wheel Segments**: 6 segments (5%, 10%, 20%, 30%, 40%, 50%)
- **Fixed Outcome**: Always lands on 5% or 10% discount

## 🛠 Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: MongoDB Atlas
- **Functions**: Netlify Functions (Node.js)
- **Deployment**: Netlify (recommended) or Heroku
- **Fonts**: Google Fonts (Dancing Script, Playfair Display)

## 📋 Prerequisites

Before setting up the application, ensure you have:

1. **MongoDB Atlas Account**: [Sign up here](https://www.mongodb.com/cloud/atlas)
2. **Netlify Account**: [Sign up here](https://netlify.com) (recommended)
3. **Heroku Account**: [Sign up here](https://heroku.com) (alternative)
4. **Node.js**: Version 18+ (for local development)
5. **Git**: For version control and deployment

## 🚀 Setup Instructions

### Step 1: MongoDB Atlas Configuration

1. **Create a MongoDB Atlas Cluster**:
   - Log in to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new project (e.g., "Spin Wheel App")
   - Create a new cluster (M0 Sandbox tier is free)
   - Choose your preferred region

2. **Configure Database Access**:
   - Go to "Database Access" in the sidebar
   - Click "Add New Database User"
   - Create a user with "Read and write to any database" privileges
   - Note down the username and password

3. **Configure Network Access**:
   - Go to "Network Access" in the sidebar
   - Click "Add IP Address"
   - Add `0.0.0.0/0` (allow access from anywhere) for production
   - Or add specific IP addresses for better security

4. **Get Connection String**:
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<cluster>` with your cluster name

### Step 2: Environment Configuration

1. **Create Environment Variables**:
   - Copy `env.example` to `.env` (for Netlify) or configure in deployment platform
   - Update the MongoDB connection string:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=spin_wheel_app
COLLECTION_NAME=emails
NODE_ENV=production
```

### Step 3: Local Development (Optional)

1. **Install Dependencies**:
```bash
npm install
```

2. **Run Locally with Netlify Dev**:
```bash
npm run dev
```

3. **Or serve statically**:
```bash
npm start
```

## 🌐 Deployment Options

### Option 1: Netlify Deployment (Recommended)

Netlify provides the best experience with automatic serverless functions and easy MongoDB integration.

#### Automatic Deployment (Git-based):

1. **Connect Repository**:
   - Push your code to GitHub/GitLab/Bitbucket
   - Log in to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository

2. **Configure Build Settings**:
   - Build command: `echo "No build required"`
   - Publish directory: `.` (root)
   - Functions directory: `netlify/functions`

3. **Set Environment Variables**:
   - Go to Site settings → Environment variables
   - Add the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     DB_NAME=spin_wheel_app
     COLLECTION_NAME=emails
     NODE_ENV=production
     ```

4. **Deploy**:
   - Click "Deploy site"
   - Your app will be live at `https://your-app-name.netlify.app`

#### Manual Deployment:

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Login and Deploy**:
```bash
netlify login
netlify init
netlify env:set MONGODB_URI "your_mongodb_connection_string"
netlify env:set DB_NAME "spin_wheel_app"
netlify env:set COLLECTION_NAME "emails"
netlify deploy --prod
```

### Option 2: Heroku Deployment

Heroku deployment serves the static files but you'll need to modify the API endpoint to point to your Netlify function.

1. **Install Heroku CLI**: [Download here](https://devcenter.heroku.com/articles/heroku-cli)

2. **Login and Create App**:
```bash
heroku login
heroku create your-app-name
```

3. **Set Environment Variables** (for documentation):
```bash
heroku config:set MONGODB_URI="your_mongodb_connection_string"
heroku config:set DB_NAME="spin_wheel_app"
heroku config:set COLLECTION_NAME="emails"
```

4. **Deploy**:
```bash
git add .
git commit -m "Initial deployment"
git push heroku main
```

**Note**: For Heroku deployment, you'll need to modify the API endpoint in `script.js` to point to your Netlify function URL instead of the relative `/api/save-email` path.

## 🔧 Configuration

### API Endpoint Configuration

The application is configured to work with Netlify Functions by default. The API endpoint is set to `/api/save-email` in `script.js`.

For other deployment platforms, update the `apiUrl` in the `saveEmailToDatabase` function:

```javascript
// For Netlify (default)
const apiUrl = '/api/save-email';

// For custom serverless function
const apiUrl = 'https://your-function-url.netlify.app/.netlify/functions/save-email';
```

### Wheel Configuration

The wheel is configured to always land on either 5% or 10% discount. To modify this behavior, edit the `winningSegments` array in `script.js`:

```javascript
const winningSegments = [
    { discount: '5%', targetAngle: 30 },
    { discount: '10%', targetAngle: 90 }
];
```

## 📱 Testing

### Manual Testing Checklist:

1. **Email Input**:
   - [ ] Email validation works correctly
   - [ ] Invalid emails show error
   - [ ] Form submission triggers loading state

2. **Spin Wheel**:
   - [ ] Wheel spins smoothly
   - [ ] Always lands on 5% or 10%
   - [ ] Animation timing is appropriate

3. **Result Display**:
   - [ ] Correct discount is shown
   - [ ] User email is displayed
   - [ ] Action buttons work

4. **Database**:
   - [ ] Emails are saved to MongoDB
   - [ ] Duplicate emails are handled
   - [ ] Error states are managed

5. **Responsive Design**:
   - [ ] Works on mobile devices
   - [ ] Tablet compatibility
   - [ ] Desktop experience

### Database Verification:

1. **Check MongoDB Atlas**:
   - Go to your cluster → Browse Collections
   - Verify `spin_wheel_app` database exists
   - Check `emails` collection for saved entries

2. **Test Email Duplicates**:
   - Submit the same email twice
   - Verify no duplicate entries in database

## 🎨 Customization

### Styling:
- **Colors**: Modify CSS variables in `styles.css`
- **Fonts**: Update Google Fonts imports in `index.html`
- **Layout**: Adjust CSS Grid/Flexbox in section styles

### Functionality:
- **Wheel Segments**: Modify segment data in `script.js`
- **Animation**: Adjust timing and easing in CSS transitions
- **Email Storage**: Customize fields in the serverless function

### Branding:
- **Logo**: Update the "ELEGANTE" branding in `index.html`
- **Copy**: Modify promotional text and messaging
- **Images**: Add custom images or icons as needed

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **MongoDB Access**: Use strong passwords and limit IP access
3. **CORS**: Configure appropriate CORS headers for production
4. **Input Validation**: Email validation is implemented on both frontend and backend
5. **Rate Limiting**: Consider implementing rate limiting for the API endpoint

## 🐛 Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**:
   - Verify connection string is correct
   - Check network access settings in MongoDB Atlas
   - Ensure database user has proper permissions

2. **Function Not Found (404)**:
   - Verify `netlify.toml` configuration
   - Check function file path and name
   - Ensure Netlify CLI is properly configured

3. **CORS Errors**:
   - Check headers in the serverless function
   - Verify domain configuration in Netlify

4. **Wheel Not Spinning**:
   - Check browser console for JavaScript errors
   - Verify CSS animations are supported
   - Test in different browsers

### Debug Mode:

Enable debug logging by adding to your browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review MongoDB Atlas documentation
3. Check Netlify Functions documentation
4. Open an issue on GitHub

## 🔄 Updates and Maintenance

- **MongoDB Atlas**: Monitor usage and upgrade cluster if needed
- **Dependencies**: Regularly update npm packages
- **Security**: Keep environment variables secure
- **Performance**: Monitor function execution times
- **Analytics**: Consider adding analytics to track user engagement

---

**Happy Spinning! 🎰**
