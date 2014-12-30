var langdetect = require('../index.js');
var fs = require('fs');

function LangProfile(name, training) {
    var profile = { "name": name, "n_words": [], "freq": {}};
    training.split(" ").forEach(function(gram) { 
        var len = gram.length;
        var pos = len - 1;
        if (profile.n_words.length < len) {
            profile.n_words[pos] = 0;
        }
        profile.n_words[pos] += 1;
        if (gram in profile.freq) {
            profile.freq[gram] += 1;
        } else {
            profile.freq[gram] = 1;
        }
    });
    return profile;
}

var testcase = {
    setUp: function(next) {
        var TRAINING_EN = "a a a b b c c d e";
        var TRAINING_FR = "a b b c c c d d d";
        var TRAINING_JA = "\u3042 \u3042 \u3042 \u3044 \u3046 \u3048 \u3048";

        this.profiles = { wordLangProbMap: {}, langlist: [], seed: null };
        langdetect.add_profile(this.profiles, LangProfile("en",TRAINING_EN), 0, 3);
        langdetect.add_profile(this.profiles, LangProfile("fr",TRAINING_FR), 1, 3);
        langdetect.add_profile(this.profiles, LangProfile("ja",TRAINING_JA), 2, 3);
        next();
    },

    testDetector1:  function(t) {
        var detector = langdetect.create_detector(this.profiles);
        detector.append_text("a");
        t.equal(detector.detect(), "en");
        return t.done();
    },

    "testDetector2": function(t) {
        var detector = langdetect.create_detector(this.profiles);
        detector.append_text("b d");
        t.equal(detector.detect(), "fr");
        return t.done();
    },

    "testDetector3": function(t) {
        var detector = langdetect.create_detector(this.profiles);
        detector.append_text("d e");
        t.equal(detector.detect(), "en");
        return t.done();
    },

    "testDetector4": function(t) {
        var detector = langdetect.create_detector(this.profiles);
        detector.append_text("\u3042\u3042\u3042\u3042a");
        t.equal(detector.detect(), "ja");
        return t.done();
    },

    testLoadProfiles: function(t) {
        var path = langdetect.bundled_profiles("profiles");
        langdetect.load_profiles(path);
        return t.done();
    },

    testLoadProfiles2: function(t) {
        var path = langdetect.bundled_profiles("profiles.sm");
        langdetect.load_profiles(path);
        return t.done();
    },

    testEmpty: function(t) {
        var path     = langdetect.bundled_profiles("profiles");
        var profiles = langdetect.load_profiles(path);
        t.equal(langdetect.detect(":)", profiles), "unknown");
        t.equal(langdetect.detect("",   profiles), "unknown");
        return t.done();
    }

};

module.exports = require('nodeunit').testCase(testcase);
