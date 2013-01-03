 (function(window, undefined) {
    'use strict'

    jQuery(document).ready(function() {
        window.alphabetSoup = new AlphabetSoup()
    })

    var AlphabetSoup = function() {
        this.init()

        this.buildAlphabet()
    }

    AlphabetSoup.prototype.init = function() {
        this.firebase = new Firebase('https://errmano.firebaseio-demo.com/v1/')

        var self = this

        this.firebase.once('value', function() { self.onAlphabetPositions.apply(self, Array.prototype.slice.call(arguments)) })
        this.firebase.on('child_changed', function() { self.onLetterPosition.apply(self, Array.prototype.slice.call(arguments)) })
    }

    AlphabetSoup.prototype.onAlphabetPositions = function(lettersSnapshot) {
        var lettersList = lettersSnapshot.val()

        for(var letterId in lettersList){
            var letter = lettersList[letterId]

            if(letter.zIndex > this.maxLetterZIndex){
                this.maxLetterZIndex = letter.zIndex
            }

            jQuery('#' + letterId).css({
                    'top': letter.posTop,
                    'left': letter.posLeft,
                    'z-index': letter.zIndex,
                    'background-color': letter.backgroundColor
                })
        }
    }

    AlphabetSoup.prototype.onLetterPosition = function(letterSnapshot) {
        var letterId = letterSnapshot.name()
          , letter = letterSnapshot.val()

        if(letter.zIndex > this.maxLetterZIndex){
            this.maxLetterZIndex = letter.zIndex
        }

        jQuery('#' + letterId)
            .css('z-index', letter.zIndex)
            .animate({
                    'top': letter.posTop,
                    'left': letter.posLeft
                })
    }

    AlphabetSoup.prototype.buildAlphabet = function() {
        this.maxLetterZIndex = 0

        var $alphabetBoard = jQuery('#alphabet-letter-container')

        jQuery.template('letterTemplate', jQuery('#alphabet-letter-template').html())

        for(var y = 0, yl = 6; y < yl; y += 1){
            for(var x = 0, xl = 26; x < xl; x += 1){
                var letter = String.fromCharCode(97 + x)
                  , letterId = 'alphabet-letter-' + (y * xl + x)
                  , letterHtml = jQuery.tmpl('letterTemplate', {
                            'letter': letter,
                            'id': letterId
                        })

                $alphabetBoard.append(letterHtml)

                var letterBackgroundColor = (Math.round(0xFFFFFF * Math.random()).toString(16) + "000000").replace(/([a-f0-9]{6}).+/, "#$1")
                  , letterPosLeft = x * 30 + 10
                  , letterPosTop = y * 30 + 10

                jQuery('#' + letterId).css({
                        'id': letterId,
                        'top': letterPosTop,
                        'left': letterPosLeft,
                        'zIndex': this.maxLetterZIndex,
                        'background-color': letterBackgroundColor
                    })

                this.maxLetterZIndex += 1
            }
        }

        var self = this

        jQuery('.alphabet-letter').draggable({
                'containment': '#alphabet-letter-container',
                'start': function() { self.letterDragStart.apply(self, Array.prototype.slice.call(arguments)) },
                'stop': function() { self.letterDragStop.apply(self, Array.prototype.slice.call(arguments)) }
            })
    }

    AlphabetSoup.prototype.letterDragStart = function(Event, ui) {
        var $letter = ui.helper

        this.maxLetterZIndex += 1

        $letter.css('z-index', this.maxLetterZIndex)
    }

    AlphabetSoup.prototype.letterDragStop = function(Event, ui) {
        var $letter = ui.helper
          , letter = {}
          , letterId = $letter.attr('id')

        letter.backgroundColor = $letter.css('background-color')
        letter.posLeft = $letter.css('left')
        letter.posTop = $letter.css('top')
        letter.zIndex = $letter.css('z-index')

        this.firebase.child(letterId).set(letter)
    }

    // populates the server with some data
    AlphabetSoup.prototype.populateLetterData = function() {
        var letterZIndex = 0

        for(var y = 0, yl = 6; y < yl; y += 1){
            for(var x = 0, xl = 26; x < xl; x += 1){
                var letterId = 'alphabet-letter-' + (y * xl + x)

                var letterBackgroundColor = (Math.round(0xFFFFFF * Math.random()).toString(16) + "000000").replace(/([a-f0-9]{6}).+/, "#$1")
                  , letterPosLeft = x * 30 + 10
                  , letterPosTop = y * 30 + 10

                var letterRecord = {
                        'posLeft': letterPosLeft,
                        'posTop': letterPosTop,
                        'backgroundColor': letterBackgroundColor,
                        'zIndex': letterZIndex
                    }

                letterZIndex += 1

                this.firebase.child(letterId).set(letterRecord)
            }
        }
    }
})(window) 
