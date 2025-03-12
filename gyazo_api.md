# Gyazo API Specification

## Overview
This document provides the specifications for the Gyazo API, including the Image, Search, and User APIs.

## Image API

### List
The API request to get a list of a user’s saved images.

**URL**
```
GET https://api.gyazo.com/api/images
```

**Parameters**

| Parameter    | Type    | Required | Default | Description                        |
|--------------|---------|----------|---------|------------------------------------|
| access_token | string  | ✓        | -       | User's access token                |
| page         | integer | -        | 1       | Page number for pagination         |
| per_page     | integer | -        | 20      | Number of results per page (1-100) |

**Response Header**

```
X-Total-Count:  350
X-Current-Page: 1
X-Per-Page:     20
X-User-Type:    lite
```

**Response Body**

```json
[
    {
        "image_id": "8980c52421e452ac3355ca3e5cfe7a0c",
        "permalink_url": "http://gyazo.com/8980c52421e452ac3355ca3e5cfe7a0c",
        "thumb_url": "https://i.gyazo.com/thumb/afaiefnaf.png",
        "url": "https://i.gyazo.com/8980c52421e452ac3355ca3e5cfe7a0c.png",
        "type": "png",
        "created_at": "2014-05-21 14:23:10+0900",
        "metadata": {
           "app": null,
           "title": null,
           "url": null,
           "desc": ""
        },
        "ocr": {
           "locale": "en",
           "description": "Gyazo\n"
        }
    }
]
```

### Image
The API request to get an image.

**URL**
```
GET https://api.gyazo.com/api/images/:image_id
```

**Parameters**

| Parameter    | Type   | Required | Default | Description         |
|--------------|--------|----------|---------|---------------------|
| access_token | string | ✓        | -       | User's access token |
| image_id     | string | ✓        | -       |                     |

**Response Body**

```json
{
  "image_id": "27a9dca98bcf5cafc0bd84a80ee9c0a1",
  "permalink_url": null,
  "thumb_url": null,
  "type": "png",
  "created_at": "2018-07-24T07:33:24.771Z",
  "metadata": {
    "app": null,
    "title": null,
    "url": null,
    "desc": ""
  },
  "ocr": {
    "locale": "en",
    "description": "Gyazo\n"
  }
}
```

### Upload
The API request to upload an image.

**URL**
```
POST https://upload.gyazo.com/api/upload
```

**Parameters**

| Parameter          | Type   | Required | Default | Description                                                                 |
|--------------------|--------|----------|---------|-----------------------------------------------------------------------------|
| access_token       | string | ✓        | -       | User's access token                                                         |
| imagedata          | binary | ✓        | -       | Specify `filename` directive in Content-Disposition part in multipart/form-data. |
| access_policy      | string | -        | anyone  | Access policy for images (`anyone` or `only_me`)                            |
| metadata_is_public | string | -        | -       | Boolean value about publish URL and title metadata                          |
| referer_url        | string | -        | -       | Referer site URL                                                            |
| app                | string | -        | -       | Application name                                                            |
| title              | string | -        | -       | Site title                                                                  |
| desc               | string | -        | -       | Comment                                                                     |
| created_at         | float  | -        | -       | Image's created time, Unix time                                             |
| collection_id      | string | -        | -       | Add image to collection                                                     |

**Response**

```json
{
    "image_id" : "8980c52421e452ac3355ca3e5cfe7a0c",
    "permalink_url": "http://gyazo.com/8980c52421e452ac3355ca3e5cfe7a0c",
    "thumb_url" : "https://i.gyazo.com/thumb/180/afaiefnaf.png",
    "url" : "https://i.gyazo.com/8980c52421e452ac3355ca3e5cfe7a0c.png",
    "type": "png"
}
```

### Delete
The API request to delete an image.

**URL**
```
DELETE https://api.gyazo.com/api/images/:image_id
```

**Parameters**

| Parameter | Type   | Required | Default | Description                  |
|-----------|--------|----------|---------|------------------------------|
| image_id  | string | ✓        | -       | You can only delete your own images |

**Response**

```json
{
   "image_id": "8980c52421e452ac3355ca3e5cfe7a0c",
   "type": "png"
}
```

### oEmbed
This API provides the image's raw URL.

**URL**
```
GET https://api.gyazo.com/api/oembed?url=:image_url
```

**Parameters**

| Parameter | Type   | Required | Default | Description                                      |
|-----------|--------|----------|---------|--------------------------------------------------|
| url       | string | ✓        | -       | URL of Gyazo image page (http://gyazo.com/XXXXXXXXXXXX) |

**Response**

```json
{
  "version":"1.0",
  "type":"photo",
  "provider_name":"Gyazo",
  "provider_url":"https://gyazo.com",
  "url":"http://i.gyazo.com/8c9d9c8ec14dec4631b6ec77d1c85450_1.png",
  "width":617,
  "height":597
}
```

## Search API

### Overview
The API request to search through a user's saved images.

**URL**
```
GET https://api.gyazo.com/api/search
```

**Parameters**

| Parameter    | Type    | Required | Default | Description                        |
|--------------|---------|----------|---------|------------------------------------|
| access_token | string  | ✓        | -       | User's access token                |
| query        | string  | ✓        | -       | Search query (max length: 200 characters) |
| page         | integer | -        | 1       | Page number for pagination         |
| per          | integer | -        | 20      | Number of results per page (max: 100) |

**Response**

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

## User API

### Overview
This API provides the information of the authenticated user.

**URL**
```
GET  https://api.gyazo.com/api/users/me
```

**Authentication required**

**Response**

```json
{
  "user": {
    "email": "gyazo@example.com",
    "name": "Gyazo Username",
    "profile_image": "https://thumb.gyazo.com/thumb/200/placeholder.jpg",
    "uid": "1234567890abcdefghijklmn"
  }
}
```

## Important Notes
- The Search API is only available for Ninja users
- The search query must be less than 200 characters
- The maximum number of results per page is 100
