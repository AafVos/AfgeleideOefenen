// Eigen ESLint-configuratie voor deze map: zonder dit bestand zoekt ESLint
// omhoog en pakt hij per ongeluk de configuratie van de site, die
// "mobiel/**" juist negeert (zie eslint.config.mjs in de hoofdmap).
const expoConfig = require('eslint-config-expo/flat')

module.exports = expoConfig
