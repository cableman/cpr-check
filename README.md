This is a simple web-crawler that tries to find CPR numbers in a given web-site. It's NodeJS base and uses node-crawler to index pages.


This is the first prototype of the project and is commandline only. An web-interface will be build into the project using Express later on.

# Installation
```
~$ npm install
```

# Usage
Simply execute the app with the start URL and the domain to stay within.

```
~$ ./app.js --url http://example.com --domain example.dk
```
