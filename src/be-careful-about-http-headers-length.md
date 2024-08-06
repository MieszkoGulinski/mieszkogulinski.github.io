---
layout: post.liquid
pageTitle: Be careful about HTTP headers length
date: 2024-07-02
tags: posts
pageDescription: Investigation of a bug caused by trying to cram too much CSP settings into HTTP headers.
---

[Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) settings help improving website security by allowing usage of resources only from specified origins. For example, it's possible to prevent the website from executing scripts not coming from our server, or prevent performing HTTP requests to addresses other than ours. When a website communicates with external services, for example analytics services, customer chat or login providers, allowing communications with these services while still preventing connection to other services requires adding these services to the CSP settings.

CSP settings are sent to the browser in the HTTP headers.

## The problem and investigation

Recently, we had an issue when trying to deploy a newer version of a website on Google App Engine. The deployment failed with the following error message:

```
Your deployment has failed to become healthy in the allotted time and therefore was rolled back. If you believe this was an error, try adjusting the 'app_start_timeout_sec' setting in the 'readiness_check' section.
```

The error message indicates that the deployment failed to start within the time limit. Google App Engine checks if the deployment is healthy by sending a request to the website and checking if the response is successful. If the response is not successful, the deployment is rolled back.

When checking logs in the Google Cloud logs viewer, in the logs of nginx (not in the logs of application), we found the following error message:

```
upstream sent too big header while reading response header from upstream
```

This error message indicates that the response headers from the application are too long.

Reviewing changes between the deployed versions, we found that we added a new external service to the CSP settings. This caused the CSP header, and thus the response headers, to be longer than before, exceeding the limit.

## Potential solutions

If you see that the CSP settings cause your HTTP headers to be too long, you can try the following solutions:

1. Check if you don't have no longer used external services in the CSP settings.
2. Shorten the CSP settings by removing `https://` from the URLs.
3. Shorten the CSP settings by merging URLs with multiple subdomains into one, for example `aaa.example.com` and `bbb.example.com` can be merged into `*.example.com`.
4. Check if you actually need to use some external service.

This way, it's possible to allow intentional connections to external services while still preventing attackers from connecting to arbitrary external servers and executing arbitrary scripts on the website.