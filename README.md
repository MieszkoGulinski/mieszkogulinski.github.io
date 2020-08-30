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
jekyll new blog --blank
cd blog
jekyll build
```

# 4. Start serving
`http-server` is a Node.js package, you can
```
cd _site
http-server
```
