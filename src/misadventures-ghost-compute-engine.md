---
layout: post.liquid
pageTitle: (Mis)adventures when installing Ghost CMS on Google Compute Engine
date: 2023-03-08
tags: posts
---

# Installing Ghost

At work, I was installing [Ghost CMS](https://ghost.org/) on Google Compute Engine. Simply following [the instructions](https://ghost.org/docs/install/ubuntu/) wasn't 100% enough. Here are the some of the things that needed to be adjusted. I hope it'll be helpful in troubleshooting of other installations :)

- Ghost version is 5.45.1, installed through Ghost CLI. 
- Operating system is Ubuntu 22.04
- Node.js version is 16.20.0 (as Node 16 is recommended in Ghost documentation). 
- Compute Engine instance type is [e2-micro](https://cloud.google.com/compute/docs/general-purpose-machines#e2-shared-core), with 10 GB of [Balanced type](https://cloud.google.com/compute/docs/disks#pdspecs) storage.

## Compute Engine settings

If the instance is going to be a regular Web server (for example serving URL `blog.mysitename.com`), it needs a [static external IP](https://cloud.google.com/compute/docs/ip-addresses) (not ephemeral). Also, during Compute Engine instance setup, the firewall needs to be configured to pass HTTP and HTTPS.

## MySQL

[The instructions](https://ghost.org/docs/install/ubuntu/) tell us to install MySQL:
```
sudo apt-get install mysql-server
```

But after installing MySQL, running `ghost install` and providing an empty password didn't work. I had to set a MySQL root password using mostly [these instructions](https://phoenixnap.com/kb/how-to-reset-mysql-root-password-windows-linux), and then paste the password when running the setup script.

## Setting up SSL

Initially I set up Ghost without SSL (during `ghost install`). Then, after adding instance IP to DNS settings in our DNS provider page, I had to re-run `ghost setup ssl` **several times** to make it work without error.

## Install library to communicate with Google Cloud Storage

Because we decided to use Google Cloud Storage for storing attached files, I needed to install a plugin for communication with GCS.

As of writing that (April 2023), a library that works is `@danmasta/ghost-gcs-adapter`, and it needs to be installed using **exactly** the commands from its documentation, which is [here](https://github.com/danmasta/ghost-gcs-adapter#installation), not as a part of a Dockerfile, but directly in the shell:

```
export GHOST_INSTALL=/var/www/mysitename-ghost
mkdir -p /tmp/gcs ${GHOST_INSTALL}/current/core/server/adapters/storage/gcs
curl -s "$(npm view @danmasta/ghost-gcs-adapter dist.tarball)" | tar xz -C /tmp/gcs
npm install --prefix /tmp/gcs/package --silent --only=production --no-optional --no-progress
mv /tmp/gcs/package/* ${GHOST_INSTALL}/current/core/server/adapters/storage/gcs
```

For authentication with Google Cloud Storage, upload the key file in JSON format to `/var/www/mysitename-ghost`. Then, in the Ghost configuration file, specify connection parameters:
```
  "storage": {
    "active": "gcs",
    "gcs": {
      "storageOptions": {
        "keyFilename": "mysitename-key-13245314252345.json"
      },
      "bucket": "mysitename-bucket"
    }
  }
```

## RAM

Running `ghost doctor` says that the instance doesn't have enough RAM, even though everything is installed on a VM with 1 GB of RAM, [which is enough according to Ghost documentation](https://ghost.org/docs/install/ubuntu/#prerequisites). I don't know if it's going to cause problems.
