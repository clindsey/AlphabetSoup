 (function(window, undefined) {
    'use strict'

    jQuery(document).ready(function() {
        window.alphabetSoup = new AlphabetSoup()
    })

    var AlphabetSoup = function() {
        this.buildAlphabet()

        this.initPersistance()
    }

    AlphabetSoup.prototype.initPersistance = function() {
        this.firebase = new Firebase('https://errmano.firebaseio-demo.com/v1/')

        var self = this

        this.firebase.once('value', function() { self.onAllLetterPositions.apply(self, Array.prototype.slice.call(arguments))  })
        this.firebase.on('child_changed', function() { self.onLetterPosition.apply(self, Array.prototype.slice.call(arguments)) })
    }

    AlphabetSoup.prototype.onLetterPosition = function(letterSnapshot) {
        this.setLetterPosition(letterSnapshot.name(), letterSnapshot.val())
    }

    AlphabetSoup.prototype.onAllLetterPositions = function(allLettersSnapshot) {
        this.setAlphabetPositions(allLettersSnapshot.val())
    }

    AlphabetSoup.prototype.sendLetterPosition = function(letterId, letter) {
        this.firebase.child(letterId).set(letter)
    }

    AlphabetSoup.prototype.setAlphabetPositions = function(lettersList) {
        for(var letterId in lettersList){
            var letter = lettersList[letterId]

            jQuery('#' + letterId).css({
                    'top': letter.posTop,
                    'left': letter.posLeft,
                    'z-index': letter.zIndex,
                    'background-color': letter.backgroundColor
                })
        }
    }

    AlphabetSoup.prototype.setLetterPosition = function(letterId, letter) {
        jQuery('#' + letterId)
            .css('z-index', letter.zIndex)
            .animate({
                    'top': letter.posTop,
                    'left': letter.posLeft
                })

        this.letterToTop(letterId)
    }

    AlphabetSoup.prototype.buildAlphabet = function() {
        this.alphabetLetters = []

        var $alphabetBoard = jQuery('#alphabet-letter-container')

        jQuery.template('letterTemplate', jQuery('#alphabet-letter-template').html())

        for(var y = 0, yl = 6; y < yl; y += 1){
            for(var x = 0, xl = 26; x < xl; x += 1){
                var index = y * xl + x
                  , letter = String.fromCharCode(97 + x)
                  , letterId = 'alphabet-letter-' + index
                  , letterHtml = jQuery.tmpl('letterTemplate', {
                            'letter': letter,
                            'id': letterId
                        })

                $alphabetBoard.append(letterHtml)

                this.alphabetLetters[index] = letterId

                var letterBackgroundColor = (Math.round(0xFFFFFF * Math.random()).toString(16) + "000000").replace(/([a-f0-9]{6}).+/, "#$1")
                  , letterPosLeft = x * 30 + 10
                  , letterPosTop = y * 30 + 10

                jQuery('#' + letterId).css({
                        'id': letterId,
                        'top': letterPosTop,
                        'left': letterPosLeft,
                        'zIndex': index,
                        'background-color': letterBackgroundColor
                    })
            }
        }

        var self = this

        jQuery('.alphabet-letter').draggable({
                'containment': '#alphabet-letter-container',
                'start': function() { self.letterDragStart.apply(self, Array.prototype.slice.call(arguments)) },
                'stop': function() { self.letterDragStop.apply(self, Array.prototype.slice.call(arguments)) }
            })
    }

    AlphabetSoup.prototype.letterDragStart = function(_event, ui) {
        var $letter = ui.helper

        this.letterToTop($letter.attr('id'))
    }

    AlphabetSoup.prototype.letterDragStop = function(_event, ui) {
        var $letter = ui.helper
          , letter = {}
          , letterId = $letter.attr('id')

        letter.backgroundColor = $letter.css('background-color')
        letter.posLeft = $letter.css('left')
        letter.posTop = $letter.css('top')
        letter.zIndex = $letter.css('z-index')

        this.sendLetterPosition(letterId, letter)
    }

    AlphabetSoup.prototype.letterToTop = function(letterId) {
        var lettersToAdjust = []
          , newAlphabetLetters = []

        for(var i = 0, il = this.alphabetLetters.length; i < il; i += 1){
            if(this.alphabetLetters[i] === letterId){
                lettersToAdjust = this.alphabetLetters.slice(i)

                break
            } else{
                newAlphabetLetters.push(this.alphabetLetters[i])
            }
        }

        var letterToBringToTop = lettersToAdjust.shift()
        jQuery('#' + letterToBringToTop).css('z-index', this.alphabetLetters.length - 1)

        for(i = 0, il = lettersToAdjust.length; i < il; i += 1){
            newAlphabetLetters.push(lettersToAdjust[i])

            jQuery('#' + lettersToAdjust[i]).css('z-index', lettersToAdjust.length - 1)
        }
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

                var letter = {
                        'posLeft': letterPosLeft,
                        'posTop': letterPosTop,
                        'backgroundColor': letterBackgroundColor,
                        'zIndex': letterZIndex
                    }

                letterZIndex += 1

                this.sendLetterPosition(letterId, letter)
            }
        }
    }
})(window) 
