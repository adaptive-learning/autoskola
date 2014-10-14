# Geography

[![Build Status](https://travis-ci.org/proso/geography.png)](https://travis-ci.org/proso/geography)


## Deployment

### Staging Server

[staging.autoskolachytre.cz](http://staging.autoskolachytre.cz)

Add git remote 
```
git@autoskolachytre.cz:autoskola-staging.git
```
and push to this remote

### Production Server

[www.autoskolachytre.cz](http://www.autoskolachytre.cz)

Add git remote 
```
git@autoskolachytre.cz:autoskola.git
```
and push to this remote

### Localhost

[localhost:8000](http://localhost:8000)

```
git clone https://github.com/proso/autoskola
cd autoskola
python setyp.py
npm install
grunt deploy
./manage.py runserver
```
When editing `*.sass` and `*.js` files you need to run also
```
grunt watch
```
in order to see the changes

