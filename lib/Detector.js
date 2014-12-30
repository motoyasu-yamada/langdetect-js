var NGram  = require('./NGram');
var Random = require('./random-gaussian');

var Detector = function(profiles, alpha) {
    this.langprob = null;
    this.n_trial = 7;
    this.max_text_length = 10000;
    this.priorMap = null;
    this.alpha = alpha || Detector.ALPHA_DEFAULT;
    this.wordLangProbMap = profiles.wordLangProbMap;
    this.langlist         = profiles.langlist;
    this.text  = "";
    this.seed  = null;
};
module.exports = Detector;

Detector.ALPHA_DEFAULT   = 0.5;
Detector.ALPHA_WIDTH     = 0.05;
Detector.ITERATION_LIMIT = 1000;
Detector.PROB_THRESHOLD  = 0.1;
Detector.CONV_THRESHOLD  = 0.99999;
Detector.BASE_FREQ       = 10000;
Detector.UNKNOWN_LANG    = "unknown";
Detector.URL_REGEX  = /https?:\/\/[-_.?&~;+=\/#0-9A-Za-z]{1,2076}/ig;
Detector.MAIL_REGEX = /[-_.0-9A-Za-z]{1,64}@[-_0-9A-Za-z]{1,255}[-_.0-9A-Za-z]{1,255}/ig;    
//Detector.HASH_REGEX = /#\w+/ig;

Detector.prototype = {
    append_text: function(text_to_append) {
        text_to_append.replace(Detector.URL_REGEX , " ");
        text_to_append.replace(Detector.MAIL_REGEX, " ");
        //text_to_append.replace(Detector.HASH_REGEX, " ");
        text_to_append = NGram.normalize_vi(text_to_append); 
        var buf = "";       
        str_each(text_to_append, itr);
        this.text = buf;

        function str_each(str, itr) {
            var l   = str.length;
            var pre = 0;
            for (var i = 0; i < l; i++) {
                var c = str.charAt(i);
                itr(c, pre);
                pre = c;
            }
        }
        function itr(c, pre) {
            if (c !== ' ' || pre !== ' ') {
                buf += c;
            }
        }
    },

    detect: function() {
        var probabilities = this.get_probabilities();
        var length = probabilities.length;
        if (0 < length) {
            return probabilities[0].lang;
        }
        return Detector.UNKNOWN_LANG;
    },

    get_probabilities: function() {
        if (this.langprob === null) {
            this.detect_block();
        }
        return this.sort_probability(this.langprob);
    },

    detect_block: function() {
        this.cleaning_text();
        var ngrams = this.extract_ngrams();
        if (!ngrams || ngrams.length === 0) {
            this.langprob = [];
            return;
            // throw "no features in text" + "(" + this.text + ")";
        }
        
        var len = this.langlist.length;
        var langprob = new Array(len);

        var rand = new Random();
        var n_trial = this.n_trial;
        for (var t = 0; t < n_trial; t++) {
            var prob  = this.init_probability();
            var rg    = rand.nextGaussian();
            var alpha = this.alpha + rg * Detector.ALPHA_WIDTH;
            for(var i = 0;; ++i) {
                var r = rand.integer(0, ngrams.length -1);
                this.update_lang_prob(prob, ngrams[r], alpha);
                if (i % 5 === 0) {
                    if (this.normalize_prob(prob) > Detector.CONV_THRESHOLD || i >= Detector.ITERATION_LIMIT) {
                        break;
                    }
                    // if (verbose) System.out.println("> " + sort_probability(prob));
                }
            }        
            for(var j = 0; j < len; ++j) { 
                var add = prob[j] / n_trial;
                langprob[j] = (langprob[j] || 0) + add;
            }
            // if (verbose) System.out.println("==> " + sort_probability(prob));
        }
        this.langprob = langprob;
    },

    init_probability: function() {
        if (this.priorMap !== null ) {
            return Array.from(this.priorMap);
        } else {
            var length = this.langlist.length;
            var fill = 1.0 / length;
            var prob = [];
            for (var i = 0; i < length; i++) {
                prob[i] = fill;
            }
            return prob;
        }
    },

    extract_ngrams: function() {
        var text   = this.text;
        var length = text.length;
        var list   = [];
        var ngram  = new NGram();
        for(var i = 0; i < length; ++i) {
            var c = text.charAt(i);
            ngram.add_char(c);
            for(var n = 1; n <= NGram.N_GRAM; ++n){
                var w = ngram.get(n);
                if (w !== null && w in this.wordLangProbMap) {
                    list.push(w);
                }
            }
        }
        return list;
    },

    sort_probability: function(prob) {
        var list = [];
        for(var j = 0; j < prob.length; ++j) {
            var p = prob[j];
            if (Detector.PROB_THRESHOLD < p) {
                var len2 = list.length;
                for (var i = 0; i <= len2; ++i) {
                    if (i === len2 || list[i].prob < p) {
                        list[i] = {"lang": this.langlist[j], "prob": p};
                        break;
                    }
                }
            }
        }
        return list;
    },

    cleaning_text: function() {
        var latinCount = 0, nonLatinCount = 0;
        var text    = this.text;
        var length  = this.text.length;
        var i, c;
        for(i = 0; i < length; ++i) {
            c = text.charAt(i);
            if (c <= 'z' && c >= 'A') {
                ++latinCount;
            //LATIN_EXTENDED_ADDITIONAL
            } else if (c >= '\u0300' && !("\u1E00" <= c && c <= "\u1EFF")) {
                ++nonLatinCount;
            }
        }
        if (latinCount * 2 < nonLatinCount) {
            var textWithoutLatin = "";
            for(i = 0; i < length; ++i) {
                c = text.charAt(i);
                if (c > 'z' || c < 'A') {
                    textWithoutLatin += c;
                }
            }
            text = textWithoutLatin;
        }
        this.text = text;
    },

    update_lang_prob: function(prob, word, alpha) {
        if (word === null || ! (word in this.wordLangProbMap)) {
            return false;
        }
        var langProbMap = this.wordLangProbMap[word];
        var weight      = alpha / Detector.BASE_FREQ;
        for (var i = 0; i < prob.length; i++) {
            var v = prob[i] || 0;
            var m = weight + (langProbMap[i] || 0);
            prob[i]  = v * m;
        }
        return true;
    },

    normalize_prob: function(prob) {
        var length = prob.length;
        var maxp = 0;
        var sump = prob.reduce(function(p,c) { return p + c; }, 0);
        prob.map(function(c, i) { 
            var p = c / sump;
            if (maxp < p) {
                maxp = p;
            }
            prob[i] = p;
        });
        return maxp;
    }

}; 

