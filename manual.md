# 1. Install Ruby with rbenv (may be different depending on system)
```
rbenv install 2.6.3
rbenv local 2.6.3
gem install bundler
gem install jekyll
```

# 2. Create a repo
```
git init
git remote add origin ... .... ...
git add .
git commit -m "..."
```

# 3. Create a blog page
```
mkdir docs
jekyll new blog --blank
cd blog
```

# 4. Set destination
Add line `destination: "../docs"` to `blog/_config.yml`. It means that the built page will go to `/docs` directory.

# 5. Start building
```
jekyll build --watch
```

# 6. Serve the page locally
You can use lots of things, but http-server is a Node package
```
cd ..
cd docs
http-server
```
By default, it serves at `localhost:8080`.

# 7. Upload to GitHub
In the repo home directory, use:
```
git add .
git commit -m "..."
git push
```
