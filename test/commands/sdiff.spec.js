var assert = require("assert");
var config = require("../lib/config");
var helper = require("../helper");
var redis = config.redis;

describe("The 'sdiff' method", function () {

    function allTests(parser, ip) {
        var args = config.configureClient(parser, ip);

        describe("using " + parser + " and " + ip, function () {
            var client;

            beforeEach(function (done) {
                client = redis.createClient.apply(redis.createClient, args);
                client.once("error", done);
                client.once("connect", function () {
                    client.flushdb(done);
                });
            });

            it('returns set difference', function (done) {
                client.sadd('foo', 'x', helper.isNumber(1));
                client.sadd('foo', 'a', helper.isNumber(1));
                client.sadd('foo', 'b', helper.isNumber(1));
                client.sadd('foo', 'c', helper.isNumber(1));

                client.sadd('bar', 'c', helper.isNumber(1));

                client.sadd('baz', 'a', helper.isNumber(1));
                client.sadd('baz', 'd', helper.isNumber(1));

                client.sdiff('foo', 'bar', 'baz', function (err, values) {
                    values.sort();
                    assert.equal(values.length, 2);
                    assert.equal(values[0], 'b');
                    assert.equal(values[1], 'x');
                    return done(err);
                });
            });

            afterEach(function () {
                client.end();
            });
        });
    }

    ['javascript', 'hiredis'].forEach(function (parser) {
        allTests(parser, "/tmp/redis.sock");
        ['IPv4', 'IPv6'].forEach(function (ip) {
            allTests(parser, ip);
        })
    });
});
