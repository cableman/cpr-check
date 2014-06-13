/**
 * @file
 * Routes used by the client side off the proxy.
 */

exports.login = function login(req, res) {
  res.render('index', {
    sitename: 'CPR Crawler',
    footer: 'Copyright 2014 linuxdev.dk'
  });
}