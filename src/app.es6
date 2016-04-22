const Koa = require('koa');
const app = new Koa();
const promise = require('bluebird');
const Twitter = require('twitter');
const config = require('config');
const twitterConfig = config.get('twitter');
const _ = require('lodash');
const bodyParser = require('koa-bodyparser');

const client = new Twitter({
  consumer_key: twitterConfig.consumer_key,
  consumer_secret: twitterConfig.consumer_secret,
  access_token_key: twitterConfig.access_token_key,
  access_token_secret: twitterConfig.access_token_secret
});

const searchAsync = promise.promisify(client.get.bind(client));
app.use(bodyParser());

app.use(async (ctx) => {
  if(!ctx.request.body.text) {
    ctx.body = 'Send a keyword or phrase fool!';
    return;
  }

  const currentDate = new Date();
  const twoDaysAgo = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 2);
  const since = `${twoDaysAgo.getFullYear()}-${twoDaysAgo.getMonth()}-${twoDaysAgo.getDate()}`;

  let tweets = await searchAsync('search/tweets', {q: `${ctx.request.body.text} since:${since} filter:twimg`, lang : 'en'});

  if(!tweets.statuses.length){
    tweets = await searchAsync('search/tweets', {q: `${ctx.request.body.text} since:${since}`, lang : 'en'});
  }
  const t =  _(tweets.statuses).orderBy(['retweet_count', 'favorite_count']).reverse().first();

  if(t){
    ctx.body = {
      response_type: 'in_channel',
      text : `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`
    };
  }
});

app.listen(process.env.VCAP_APP_PORT || 8080, () => console.log('server started'));

export default app