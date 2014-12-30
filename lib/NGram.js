var Messages = require('./Messages');

var NGram = function() {
    NGram.init();
    this.grams_       = "";
    this.capitalword_ = false;
};

NGram.N_GRAM      = 3;
NGram.initialized = false;
NGram.cjk_map     = {}; 
NGram.LATIN1_EXCLUDED = Messages.NGram_LATIN1_EXCLUDE;

NGram.CJK_CLASS = [
    Messages.NGram_KANJI_1_0,
    Messages.NGram_KANJI_1_2,
    Messages.NGram_KANJI_1_4,
    Messages.NGram_KANJI_1_8,
    Messages.NGram_KANJI_1_11,
    Messages.NGram_KANJI_1_12,
    Messages.NGram_KANJI_1_13,
    Messages.NGram_KANJI_1_14,
    Messages.NGram_KANJI_1_16,
    Messages.NGram_KANJI_1_18,
    Messages.NGram_KANJI_1_22,
    Messages.NGram_KANJI_1_27,
    Messages.NGram_KANJI_1_29,
    Messages.NGram_KANJI_1_31,
    Messages.NGram_KANJI_1_35,
    Messages.NGram_KANJI_2_0,
    Messages.NGram_KANJI_2_1,
    Messages.NGram_KANJI_2_4,
    Messages.NGram_KANJI_2_9,
    Messages.NGram_KANJI_2_10,
    Messages.NGram_KANJI_2_11,
    Messages.NGram_KANJI_2_12,
    Messages.NGram_KANJI_2_13,
    Messages.NGram_KANJI_2_15,
    Messages.NGram_KANJI_2_16,
    Messages.NGram_KANJI_2_18,
    Messages.NGram_KANJI_2_21,
    Messages.NGram_KANJI_2_22,
    Messages.NGram_KANJI_2_23,
    Messages.NGram_KANJI_2_28,
    Messages.NGram_KANJI_2_29,
    Messages.NGram_KANJI_2_30,
    Messages.NGram_KANJI_2_31,
    Messages.NGram_KANJI_2_32,
    Messages.NGram_KANJI_2_35,
    Messages.NGram_KANJI_2_36,
    Messages.NGram_KANJI_2_37,
    Messages.NGram_KANJI_2_38,
    Messages.NGram_KANJI_3_1,
    Messages.NGram_KANJI_3_2,
    Messages.NGram_KANJI_3_3,
    Messages.NGram_KANJI_3_4,
    Messages.NGram_KANJI_3_5,
    Messages.NGram_KANJI_3_8,
    Messages.NGram_KANJI_3_9,
    Messages.NGram_KANJI_3_11,
    Messages.NGram_KANJI_3_12,
    Messages.NGram_KANJI_3_13,
    Messages.NGram_KANJI_3_15,
    Messages.NGram_KANJI_3_16,
    Messages.NGram_KANJI_3_18,
    Messages.NGram_KANJI_3_19,
    Messages.NGram_KANJI_3_22,
    Messages.NGram_KANJI_3_23,
    Messages.NGram_KANJI_3_27,
    Messages.NGram_KANJI_3_29,
    Messages.NGram_KANJI_3_30,
    Messages.NGram_KANJI_3_31,
    Messages.NGram_KANJI_3_32,
    Messages.NGram_KANJI_3_35,
    Messages.NGram_KANJI_3_36,
    Messages.NGram_KANJI_3_37,
    Messages.NGram_KANJI_3_38,
    Messages.NGram_KANJI_4_0,
    Messages.NGram_KANJI_4_9,
    Messages.NGram_KANJI_4_10,
    Messages.NGram_KANJI_4_16,
    Messages.NGram_KANJI_4_17,
    Messages.NGram_KANJI_4_18,
    Messages.NGram_KANJI_4_22,
    Messages.NGram_KANJI_4_24,
    Messages.NGram_KANJI_4_28,
    Messages.NGram_KANJI_4_34,
    Messages.NGram_KANJI_4_39,
    Messages.NGram_KANJI_5_10,
    Messages.NGram_KANJI_5_11,
    Messages.NGram_KANJI_5_12,
    Messages.NGram_KANJI_5_13,
    Messages.NGram_KANJI_5_14,
    Messages.NGram_KANJI_5_18,
    Messages.NGram_KANJI_5_26,
    Messages.NGram_KANJI_5_29,
    Messages.NGram_KANJI_5_34,
    Messages.NGram_KANJI_5_39,
    Messages.NGram_KANJI_6_0,
    Messages.NGram_KANJI_6_3,
    Messages.NGram_KANJI_6_9,
    Messages.NGram_KANJI_6_10,
    Messages.NGram_KANJI_6_11,
    Messages.NGram_KANJI_6_12,
    Messages.NGram_KANJI_6_16,
    Messages.NGram_KANJI_6_18,
    Messages.NGram_KANJI_6_20,
    Messages.NGram_KANJI_6_21,
    Messages.NGram_KANJI_6_22,
    Messages.NGram_KANJI_6_23,
    Messages.NGram_KANJI_6_25,
    Messages.NGram_KANJI_6_28,
    Messages.NGram_KANJI_6_29,
    Messages.NGram_KANJI_6_30,
    Messages.NGram_KANJI_6_32,
    Messages.NGram_KANJI_6_34,
    Messages.NGram_KANJI_6_35,
    Messages.NGram_KANJI_6_37,
    Messages.NGram_KANJI_6_39,
    Messages.NGram_KANJI_7_0,
    Messages.NGram_KANJI_7_3,
    Messages.NGram_KANJI_7_6,
    Messages.NGram_KANJI_7_7,
    Messages.NGram_KANJI_7_9,
    Messages.NGram_KANJI_7_11,
    Messages.NGram_KANJI_7_12,
    Messages.NGram_KANJI_7_13,
    Messages.NGram_KANJI_7_16,
    Messages.NGram_KANJI_7_18,
    Messages.NGram_KANJI_7_19,
    Messages.NGram_KANJI_7_20,
    Messages.NGram_KANJI_7_21,
    Messages.NGram_KANJI_7_23,
    Messages.NGram_KANJI_7_25,
    Messages.NGram_KANJI_7_28,
    Messages.NGram_KANJI_7_29,
    Messages.NGram_KANJI_7_32,
    Messages.NGram_KANJI_7_33,
    Messages.NGram_KANJI_7_35,
    Messages.NGram_KANJI_7_37
];

NGram.init = function() {
    if (NGram.initialized) {
        return;
    }
    NGram.initialized = true;
    NGram.CJK_CLASS.forEach(itr);
    function itr(cjk_list){
        var representative = cjk_list.charAt(0);
        for (var i = 0; i < cjk_list.length; ++i) {
            NGram.cjk_map[cjk_list.charAt(i)] = representative;
        }
    }
};

NGram.normalize_vi = function (text) {
    var NORMALIZED_VI_CHARS =[
            Messages.NORMALIZED_VI_CHARS_0300,
            Messages.NORMALIZED_VI_CHARS_0301,
            Messages.NORMALIZED_VI_CHARS_0303,
            Messages.NORMALIZED_VI_CHARS_0309,
            Messages.NORMALIZED_VI_CHARS_0323
    ];
    var TO_NORMALIZE_VI_CHARS = Messages.TO_NORMALIZE_VI_CHARS;
    var DMARK_CLASS           = Messages.DMARK_CLASS;
    var ALPHABET_WITH_DMARK   = new RegExp("([" + TO_NORMALIZE_VI_CHARS + "])([" + DMARK_CLASS + "])","ig");

    return text.replace(ALPHABET_WITH_DMARK, r);

    function r(s, g1, g2) {
        var alphabet = TO_NORMALIZE_VI_CHARS.indexOf(g1);
        var dmark    = DMARK_CLASS.indexOf(g2);
        var alt      = NORMALIZED_VI_CHARS[dmark].substring(alphabet, alphabet + 1);
        return alt;
    }
    return text;
};

NGram.prototype = {
    add_char: function(ch) {
        ch = normalize(ch);
        var lastchar = this.grams_.substr(-1);
        if (lastchar === ' ') {
            this.grams_       = " ";
            this.capitalword_ = false;
            if (ch === ' ') {
                return; 
            }
        } else if (this.N_GRAM <= this.grams_.length) {
            this.grams_ = this.grams_.substr(1);
        }
        this.grams_ += ch;

        if (is_upper_case(ch)){
            if (is_upper_case(lastchar)) {
                this.capitalword_ = true;
            }
        } else {
            this.capitalword_ = false;
        }

        function is_upper_case(ch) {
            return ('A' <= ch && ch <= 'Z');
        }

        function normalize(ch) {
            //BASIC_LATIN
            if ("\u0000" <= ch && ch <= "\u007f") {
                if (ch < 'A' || (ch<'a' && ch >'Z') || ch>'z') { 
                    ch = ' ' ;
                }
            // LATIN_1_SUPPLEMENT
            } else if ("\u0080" <= ch && ch <= "\u00ff") {
                if (0 <= NGram.LATIN1_EXCLUDED.indexOf(ch)) { 
                    ch = ' ';
                }
            // LATIN_EXTENDED_B
            } else if ("\u0180" <= ch && ch <= "\u024F") {
                // normalization for Romanian
                if (ch == '\u0219') { ch = '\u015f'; } // Small S with comma below => with cedilla
                if (ch == '\u021b') { ch = '\u0163'; } // Small T with comma below => with cedilla
            // GENERAL_PUNCTUATION
            } else if ("\u2000" <= ch && ch <= "\u206f") {
                ch = ' ';
            // ARABIC
            } else if ("\u0600" <= ch && ch <= "\u06ff") {
                // Farsi yeh => Arabic yeh
                if (ch == '\u06cc') {
                    ch = '\u064a'; 
                }
            // LATIN_EXTENDED_ADDITIONAL
            } else if ("\u1e00" <= ch && ch <= "\u1eff") {
                if (ch >= '\u1ea0') {
                    ch = '\u1ec3';
                }
            // HIRAGANA
            } else if ("\u3040" <= ch && ch <= "\u309f") {
                ch = '\u3042';
            // KATAKANA
            } else if ("\u30a0" <= ch && ch <= "\u30ff") {
                ch = '\u30a2';
            // BOPOMOFO or BOPOMOFO_EXTENDED
            } else if ("\u3100" <= ch && ch <= "\u312f" || "\u31a0" <= ch && ch <= "\u31bf") {
                ch = '\u3105';
            // CJK_UNIFIED_IDEOGRAPHS
            } else if ("\u4e00" <= ch && ch <= "\u9fff") {
                if (ch in NGram.cjk_map) { 
                    ch = NGram.cjk_map[ch];
                }
            // HANGUL_SYLLABLES
            } else if ("\uac00" <= ch && ch <= "\ud7af") {
                ch = '\uac00';
            }
            return ch;
        }
    },

    get: function(n) {
        if (this.capitalword_) {
            return null;
        }
        var len = this.grams_.length; 
        if (n < 1 || n > 3 || len < n) {
            return null;
        }
        if (n == 1) {
            var ch = this.grams_.charAt(len - 1);
            if (ch == ' ') {
                return null;
            }
            return ch;
        } else {
            return this.grams_.substring(len - n, len);
        }
    }
};


module.exports = NGram;