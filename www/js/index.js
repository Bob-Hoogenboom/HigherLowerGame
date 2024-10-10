// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

var gameState;

let screen1 = 0;
let screen2 = 0;
let screen3 = 0;
let screen4 = 0;
let guessedRight = 0;
let guessedWrong = 0;

// > cordova <
document.addEventListener('deviceready', onDeviceReady, false);

function connectButtons() {
    document.getElementById('btn_start').addEventListener('click', clickedStartSession);
    document.getElementById('btn_join').addEventListener('click', clickedJoinSession);
    document.getElementById('btn_end').addEventListener('click', clickedEndSession);
    document.getElementById('btn_submit').addEventListener('click', clickedDoMove);
}

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    connectButtons();

    initGame();
}

function initGame() {
    const sessionId = window.localStorage.getItem('sessionId');


    if (!sessionId) { // hebben we nog geen sessie?
        SetStateMenu();
    } else { // sessie bestond al, hervat spel
        setStatePlayGame();

    }
}

function SetStateMenu() {
    document.getElementById('init').style.display = 'block';
    document.getElementById('game').style.display = 'none'; 
    //reset al de game blocks V
    document.getElementById('random-card').style.display = 'none'; 

}

function setStatePlayGame() {
    document.getElementById('init').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    if(window.localStorage.getItem('whoami') === 'first'){
        document.getElementById('random-card').style.display = 'block';
    }
    else if(window.localStorage.getItem('whoami') === 'first'){
        document.getElementById('wait').style.display = 'block';
    }
}

function clickedStartSession(ev) {
    cordova.plugin.http.get('https://appdev.creat.li/session/begin',
        {}, {},
        function (response) {
            console.log(response.status, response.data);

            if (response.status === 200) {
                const sessionId = response.data;
                console.log(`started new session ${sessionId}`);

                window.localStorage.setItem('sessionId', sessionId);
                window.localStorage.setItem('whoami', 'first');

                gameState = {
                    "turn1" : screen1, "turn2" : screen2, "turn3" : screen3, "turn4" : screen4, 
                    "guessed" : guessedRight, "guessedWrong" : guessedWrong
                };

                //duplicate code in join and start sesh
                if (sessionId) {
                    document.getElementById('session-id').innerText = `Session ID: ${sessionId}`;
                } else {
                    document.getElementById('session-id').innerText = "Session ID not found";
                }

                setStatePlayGame();
            }
        },
        function (error) {
            console.log(error);
        }
    );
}

function clickedJoinSession(ev) {
    const sessionId = document.getElementById('input_sessionid').value;

    console.log(`joining session ${sessionId}`);
    cordova.plugin.http.get(`https://appdev.creat.li/session/join/${sessionId}`,
        {}, {},
        function (response) {
            console.log(response.status, response.data);

            if (response.status === 200) {
                window.localStorage.setItem('sessionId', sessionId);
                window.localStorage.setItem('whoami', 'second');

                //duplicate code in join and start sesh
                if (sessionId) {
                    document.getElementById('session-id').innerText = `Session ID: ${sessionId}`;
                } else {
                    document.getElementById('session-id').innerText = "Session ID not found";
                }

                setStatePlayGame();
            }
        },
        function (error) {
            console.log(error);
        }
    );
}

function clickedEndSession(event) {
    const sessionId = window.localStorage.getItem('sessionId');

    if (sessionId) {
        cordova.plugin.http.get(`https://appdev.creat.li/session/end/${sessionId}`,
            {}, {},
            function (response) {
                console.log(response.status, response.data);
                window.localStorage.removeItem('sessionId');
                window.localStorage.removeItem('whoami');
                console.log("LocalStorage after removal:", window.localStorage.getItem('sessionId'), window.localStorage.getItem('whoami'));
                
                

            // Call SetStateMenu only after the items have been removed
            SetStateMenu();
        },
        function (error) {
            console.log(error);
        }
    );
    } else {
        console.log("No sessionId found in localStorage.");
        SetStateMenu(); // Fallback to menu if no sessionId found
    }
}

function clickedDoMove(event) {
    const sessionId = window.localStorage.getItem('sessionId');
    const who = window.localStorage.getItem('whoami');

    cordova.plugin.http.get('https://appdev.creat.li/session/get/' + sessionId, {}, {},
        function (response) {
            console.log(response.status, response.data);
            let session = JSON.parse(response.data);
            console.log(session);

            let gameState = session.state || {};

            // doe iets met de gamestate (dit is dus maar een voorbeeldje!)
            if (!gameState.moves) gameState.moves = [];
            gameState.moves.push("gameTurn" + gameState.moves.length);
            console.log(gameState + " " + gameState.moves);

            // en stuur de nieuwe state terug
            cordova.plugin.http.setDataSerializer('json');
            cordova.plugin.http.put('https://appdev.creat.li/session/' + sessionId + '?who=' + who + '',
                { "state": gameState },
                { 'content-type': 'application/json' },
                function (response) {
                    console.log(response.status, response.data);
                    // response.data is een text-string - maak er een JSON object van
                    const session = JSON.parse(response.data);
                    displayGame(session.state);
                },
                function (error) {
                    console.log(error);
                }
            );

        },
        function (error) {
            console.log(error);
        }
    );
}



// > Game Functions: <



let cards;

// Array of card filenames (assuming they are in a folder called 'cards')
document.addEventListener("DOMContentLoaded", function() {
        // Fetch the card paths from the JSON file
        fetch('../json/cards.json')
            .then(response => response.json()) // Convert the file content to a JavaScript object
            .then(data => {
                cards = data.cards; // Access the array of card paths
                console.log(cards); // Debugging: see if the paths were loaded correctly
                
                // Add event listener to the button
                document.getElementById("drawCardBtn").addEventListener("click", function() {
                    displayRandomCard(cards); // Pass the card array to the display function
                });
            })
            .catch(error => {
                console.error("Error loading card paths:", error);
            });
    });

    //will be removed in favor of updating the game at the bottom*
function displayRandomCard() {


        // Generate a random index from 0 to 51 (assuming 52 cards)
        const randomIndex = Math.floor(Math.random() * cards.length);
        const randomCard = cards[randomIndex];

        console.log(`Card Image: ${randomCard.image}`);
        console.log(`Card Value: ${randomCard.value}`);

        // Set the random card to the HTML block
        document.getElementById("card").src = "../img/Cards/" + randomCard.image;
}


function displayGame(state) {

    
}