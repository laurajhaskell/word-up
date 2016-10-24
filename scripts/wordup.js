

// ----------------- MODEL -----------------

var GAME_DURATION = 60;

// all the stuff we need to keep track of
var model = {
    gameHasStarted: false,
    secondsRemaining: GAME_DURATION,
    allowedLetters: [],
    wordSubmissions: [],
    currentAttempt: ""
}

/*
 * Resets the model to a starting state, and then starts the timer
 */
function startGame() {
    endGame();
    model.gameHasStarted = true;
    model.secondsRemaining = GAME_DURATION;
    model.allowedLetters = generateAllowedLetters();
    model.wordSubmissions = [];
    model.currentAttempt = "";
    model.timer = startTimer();
}

/*
 * Wraps things up
 */
function endGame() {
    stopTimer();
}


/**
 * Given a word, adds a new wordSubmission to model.wordSubmissions.
 *
 * Refrains from adding a new entry if the model already contains
 * a wordSubmission whose word is the same
 */
function addNewWordSubmission(word) {
    // do we already have a wordSubmission with this word?
    var alreadyUsed = false; // TODO

    // if the word is valid and hasn't already been used, add it
    if (containsOnlyAllowedLetters(word) && alreadyUsed == false) {
        model.wordSubmissions.push({ word: word });
        // now we must also determine whether this is actually a real word
        checkIfWordIsReal(word);
    }

    // clear the current attempt
    model.currentAttempt = "";
}

/**
 * Given a word, checks to see if that word actually exists in the dictionary.
 *
 * Subsequently updates the .isRealWord property of
 * the corresponding wordSubmission in the model, and then re-renders.
 */
function checkIfWordIsReal(word) {
    // make an AJAX call to the Peason API
    $.ajax({
        url: "" // TODO
        success: function(response) {
            // we received an answer from Pearson
            console.log(response);

            // if there are any results, the word is legitimate. Otherwise, it's not.
            var isRealWord = true; // TODO

            // update the corresponding wordSubmission in the model
            // TODO

            // re-render
            render();
        },
        error: function(err) {
            console.log(err);
        }
    });
}

/*
 * Makes the timer start ticking.
 * On each tick, updates the .secondsRemaining property of the model and re-renders.
 * Stops when model.secondsRemaining reaches 0.
 */
function startTimer() {
    function tick() {
        return setTimeout(function() {
            model.secondsRemaining = Math.max(0, model.secondsRemaining - 1);
            render();
            var stillTimeLeft = model.gameHasStarted && model.secondsRemaining > 0
            if (stillTimeLeft) {
                model.timer = tick();
            }
        }, 1000);
    }
    return tick();
}

/*
 * Makes the timer stop ticking.
 */
function stopTimer() {
    clearTimeout(model.timer);
}


// ----------------- DOM EVENT HANDLERS -----------------

$(document).ready(function() {
    // when the new game button is clicked
    $("#new-game-button").click(function() {
        startGame();
        render();
    });

    // when the textbox content changes,
    // update the .currentAttempt property of the model and re-render
    // TODO

    // when the form is submitted
    $("#word-attempt-form").submit(function(evt) {
        evt.preventDefault();
        addNewWordSubmission(model.currentAttempt);
        render();
    });

    // initial render
    render();
});


// ----------------- VIEW -----------------

/**
 * Updates everything on screen based on the current state of the model
 */
function render() {

    // clear stuff
    $("#textbox").val("");
    $("#word-submissions").empty();
    $("#allowed-letters").empty();
    $("#disallowed-letters").empty();

    // update the scoreboard
    $("#current-score").text(currentScore());
    $("#time-remaining").text(model.secondsRemaining);

    // if the game has not started yet, just hide the #game container and exit
    if (model.gameHasStarted == false) {
        $("#game").hide();
        return;
    }

    // reveal the #game container
    $("#game").show();

    // render the letter tiles
    $("#allowed-letters").append(model.allowedLetters.map(letterElem));

    // render the word submissions
    // TODO

    // render the textbox
    // TODO

    // if the current word attempt contains disallowed letters,
    // restyle the textbox and show the disallowed letters underneath
    var disallowedLetters = disallowedLettersInWord(model.currentAttempt);
    if (disallowedLetters.length > 0) {
        $("#textbox").addClass("bad-attempt");
        $("#disallowed-letters")
            .append(disallowedLetters.map(disallowedLetterElem));
    }

    // if the game is over, disable the text box and clear its contents
    var gameOver = model.secondsRemaining <= 0
    if (gameOver) {
        // TODO
    }
}

/**
 * Given a wordSubmission, returns a DOM element
 * (one of the little chips below the text box)
 */
function submissionElem(wordSubmission) {
    var wordSubmissionTag = $("<span></span>")
        .text(wordSubmission.word)
        .attr("class", "tag tag-lg word-submission");

    // if we know the status of this word (real word or not), then add a green score or red X
    if (wordSubmission.hasOwnProperty("isRealWord")) {
        var scoreTag = $("<span></span>");
        // TODO style the scoreTag and give it content

        // TODO append the scoreTag to the wordSubmissionTag
    }

    return wordSubmissionTag;
}

/**
 * Given a letter, returns a DOM element
 * (one of the little chips above the text box)
 */
function letterElem(letter) {
    // a tag (little chip) to display the letter
    var letterTag = $("<span></span>")
        .text(letter)
        .attr("class", "tag tag-lg allowed-letter")

    // a smaller tag to indicate how many points this letter is worth
    var scoreTag = $("<span></span>")
        .text(letterScore(letter))
        .attr("class", "tag tag-default tag-sm");

    return letterTag.append(scoreTag);
}

/**
 * Given a disallowed letter, returns a little red chip to display the letter
 */
function disallowedLetterElem(letter) {
    return $("<span></span>").text(letter).addClass("tag tag-sm tag-danger");
}



// ----------------- GAME LOGIC -----------------

// borrowing Scrabble's point system
var scrabblePointsForEachLetter = {
    a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1, j: 8, k: 5, l: 1, m: 3,
    n: 1, o: 1, p: 3, q: 10, r: 1, s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4, z: 10
}

/**
 * Given a letter, checks whether that letter is one of the allowed letters from the current model
 */
function isAllowedLetter(letter) {
    return model.allowedLetters.indexOf(letter) !== -1
}

/**
 * The negation of isAllowedLetter (see above)
 */
function isDisallowedLetter(letter) {
    return isAllowedLetter(letter) == false;
}

/**
 * Given a word, returns a list of all the disallowed letters in that word
 * Note that the list might be empty, if it contains only allowed letters.
 */
function disallowedLettersInWord(word) {
    letters = word.split("");
    return letters.filter(isDisallowedLetter);
}

/**
 * Given a word, returns true if the word is "clean",
 * i.e. the word does not contain any disallowed letters
 */
function containsOnlyAllowedLetters(word) {
    return disallowedLettersInWord(word).length == 0;
}

/**
 * Returns a list of 7 randomly chosen letters
 * Each letter will be distinct (no repeats of the same letter)
 */
function generateAllowedLetters() {
    return chooseN(7, Object.keys(scrabblePointsForEachLetter));
}

/**
 * Given a letter, returns the score of that letter (case-insensitive)
 */
function letterScore(letter) {
    return scrabblePointsForEachLetter[letter.toLowerCase()];
}

/**
 * Given a word, returns its total score,
 * which is computed by summing the scores of each of its letters.
 *
 * Returns a score of 0 if the word contains any disallowed letters.
 */
function wordScore(word) {
    // TODO
    // if the word contains any disallowed letters, then just return 0 right away


    // split the word into letters and return the sum of the letters' scores
    var letters = word.split("");
    return letters.map(letterScore).reduce(add, 0);
}


/**
 * Returns the user's current total score,
 * which is the sum of the scores of all the wordSubmissions whose word is a real dictionary word
 */
function currentScore() {
    // TODO
    // replace the empty list below
    // wordScores should be an array of scores, one for each wordSubmission in the model
    // for each wordSubmission, if its word is not real, then the score should be 0
    // if its word is a real word, then the score should just be the score of its word
    var wordScores = [];

    return wordScores.reduce(add, 0);
}


// ----------------- UTILS -----------------

/**
 * randomly selects n items from a list,
 * and returns the selected items together in a smaller list
 */
function chooseN(n, items) {
    var selectedItems = [];
    var total = Math.min(n, items.length);
    for (var i = 0; i < total; i++) {
        index = Math.floor(Math.random() * items.length);
        selectedItems.push(items[index]);
        items.splice(index, 1);
    }
    return selectedItems;
}

/**
 * adds two numbers together
 */
function add(a, b) {
    return a + b;
}
