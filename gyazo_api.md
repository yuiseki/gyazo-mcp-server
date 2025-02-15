# Gyazo Search API Specification

## Overview
The API request to search through a user's saved images.

## Endpoint
```
GET https://api.gyazo.com/api/search
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| access_token | string | ✓ | - | User's access token |
| query | string | ✓ | - | Search query (max length: 200 characters) |
| page | integer | - | 1 | Page number for pagination |
| per | integer | - | 20 | Number of results per page (max: 100) |

## Response

The API returns an array of image objects with the following structure:

```json
[
    {
        "image_id": "xxxxx",
        "permalink_url": "https://gyazo.com/xxxxx",
        "url": "https://i.gyazo.com/xxxxx.png",
        "access_policy": null,
        "type": "png",
        "thumb_url": "https://thumb.gyazo.com/thumb/200/xxxxx.jpg",
        "created_at": "2025-02-14T12:04:26+0000",
        "alt_text": ""
    }
]
```

### Response Fields
- `image_id`: Unique identifier for the image
- `permalink_url`: Permanent URL to view the image on Gyazo
- `url`: Direct URL to the image file
- `access_policy`: Access policy settings for the image
- `type`: Image file format
- `thumb_url`: URL of the image thumbnail
- `created_at`: Timestamp of when the image was created (UTC)
- `alt_text`: Alternative text for the image

## Important Notes
- This API is only available for Ninja users
- The search query must be less than 200 characters
- The maximum number of results per page is 100
