# Pinocchio ==========>

### Running Locally

Make sure you have Node.js installed.

- `git clone https://github.com/ezy/pinocchio # or clone your own fork`
- `cd pinocchio`
- `npm install`

There's a cleaner file that will take an array of objects from a data source as
described in `data-raw/test.json` and generate output data in `data/test.json`.

Once you have your array of URLs in the same format as `data/test.json`, you can
add the file location string to `getEV('data/test.json');` in `app.js` and then run
the app using `npm start`.
