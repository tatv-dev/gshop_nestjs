# Deployment Guide

## Fixing 413 (Content Too Large) Error

If you encounter a `413 Content Too Large` error when uploading images, you need to configure your reverse proxy (Nginx) to allow larger request bodies.

### For Nginx

1. Edit your Nginx configuration file (usually at `/etc/nginx/sites-available/your-site` or `/etc/nginx/nginx.conf`)

2. Add or update the `client_max_body_size` directive:

```nginx
server {
    # ... other configuration ...

    # Allow uploads up to 50MB
    client_max_body_size 50M;

    # ... rest of configuration ...
}
```

3. Test the configuration:

```bash
sudo nginx -t
```

4. Reload Nginx:

```bash
sudo systemctl reload nginx
# or
sudo service nginx reload
```

### Quick Fix (Ubuntu/Debian)

If you're using the default Nginx setup, you can edit the main config:

```bash
# Edit nginx config
sudo nano /etc/nginx/nginx.conf

# Add this line inside the http block:
client_max_body_size 50M;

# Save and reload
sudo nginx -t && sudo systemctl reload nginx
```

### For Apache

If you're using Apache as a reverse proxy:

```apache
# Add to your VirtualHost configuration
LimitRequestBody 52428800
```

Then restart Apache:

```bash
sudo systemctl restart apache2
```

### Verification

After configuration:

1. Restart your application
2. Try uploading an image again
3. Check the browser console for any errors
4. Verify the upload completes successfully

### Notes

- The NestJS application is already configured to accept requests up to 50MB
- The 413 error typically comes from the reverse proxy layer (Nginx/Apache)
- Base64 encoded images are ~33% larger than the original file size
- A 2MB image becomes approximately 2.7MB when base64 encoded
- The 50MB limit allows for multiple large images in a single request

### Example Nginx Configuration

See `nginx.conf.example` in the project root for a complete Nginx configuration example.
