'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var Koa = require('koa');
var app = new Koa();
var promise = require('bluebird');
var Twitter = require('twitter');
var config = require('config');
var twitterConfig = config.get('twitter');
var _ = require('lodash');
var bodyParser = require('koa-bodyparser');

var client = new Twitter({
  consumer_key: twitterConfig.consumer_key,
  consumer_secret: twitterConfig.consumer_secret,
  access_token_key: twitterConfig.access_token_key,
  access_token_secret: twitterConfig.access_token_secret
});

var searchAsync = promise.promisify(client.get.bind(client));
app.use(bodyParser());

app.use(function () {
  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx) {
    var currentDate, twoDaysAgo, since, tweets, t;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (ctx.request.body.text) {
              _context.next = 3;
              break;
            }

            ctx.body = 'Send a keyword or phrase fool!';
            return _context.abrupt('return');

          case 3:
            currentDate = new Date();
            twoDaysAgo = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2);
            since = twoDaysAgo.getFullYear() + '-' + (twoDaysAgo.getMonth() + 1) + '-' + twoDaysAgo.getDate();
            _context.next = 8;
            return searchAsync('search/tweets', { q: '"' + ctx.request.body.text + '" since:' + since + ' filter:twimg min_retweets:25 exclude:replies', lang: 'en' });

          case 8:
            tweets = _context.sent;

            if (tweets.statuses.length) {
              _context.next = 13;
              break;
            }

            _context.next = 12;
            return searchAsync('search/tweets', { q: '"' + ctx.request.body.text + '" since:' + since + ' min_retweets:50 exclude:replies', lang: 'en' });

          case 12:
            tweets = _context.sent;

          case 13:
            t = _(tweets.statuses).orderBy(['retweet_count', 'favorite_count']).reverse().first();


            if (t) {
              ctx.body = {
                response_type: 'in_channel',
                text: 'https://twitter.com/' + t.user.screen_name + '/status/' + t.id_str
              };
            }

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return ref.apply(this, arguments);
  };
}());

app.listen(process.env.VCAP_APP_PORT || 8080, function () {
  return console.log('server started');
});

exports.default = app;

//# sourceMappingURL=app.js.map