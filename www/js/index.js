// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

const GAME_STATES = {
    SCREEN1: 0,
    SCREEN2: 1,
    SCREEN3: 2,
    SCREEN4: 3,
    FINISHED: 4 // To represent when the game ends
};

var gameState = GAME_STATES.SCREEN1; // Initial state

let pollingInterval;
var session

// > cordova <
document.addEventListener('deviceready', onDeviceReady, false);

function connectButtons() {
    document.getElementById('btn_start').addEventListener('click', clickedStartSession);
    document.getElementById('btn_join').addEventListener('click', clickedJoinSession);
    document.getElementById('btn_end').addEventListener('click', clickedEndSession);
    document.getElementById('btn_submit').addEventListener('click', clickedDoMove);
}

//#region "HeartBeat" 
//cordova does not have callback functions so we need to regularly check the game sadly
function startPolling() {
    pollingInterval = setInterval(checkGameState, 3000); // Poll every 3 seconds
}

function stopPolling() {
    clearInterval(pollingInterval);
}

function checkGameState() {
    let sessionId = window.localStorage.getItem('sessionId');
    let who = window.localStorage.getItem('whoami');

    cordova.plugin.http.get(`https://appdev.creat.li/session/get/${sessionId}`, {}, {},
        function (response) {
            console.log(response.status, response.data); //response log
            session = JSON.parse(response.data);
            console.log(session);                       //session log
            
            if (session.state.gameState !== gameState ) {
                gameState = session.state.gameState;
                displayGame({ gameState: gameState });
            }
        },
        function (error) {
            console.log(error);
        }
    );
}

//#endregion


function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    
    //restart game/session/application UI function?
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
    gameState = 0;
    //reset al de game blocks V
    document.getElementById('random-card').style.display = 'none'; 
    document.getElementById('pick-a-card').style.display = 'none'; 

}

function setStatePlayGame() {
    document.getElementById('init').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    // Make sure the gameState is passed correctly
    console.log("Current Game State:", gameState);

    // Call this in `setStatePlayGame` or similar to start polling when the game starts
    startPolling();
    
    // clickDoMove will handle the first panel
    displayGame({ gameState: gameState });
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
                

                // Set the session ID and update the UI
                document.getElementById('session-id').innerText = `Session ID: ${sessionId}`;
                console.log("Current Storage: ", window.localStorage.getItem('sessionId'), window.localStorage.getItem('whoami'));
                
                // Initialize the game and display the correct game state
                gameState = GAME_STATES.SCREEN1;

                // Now push the initial gameState to the server
                let initialState = { gameState: gameState };
                cordova.plugin.http.setDataSerializer('json');
                cordova.plugin.http.put('https://appdev.creat.li/session/' + sessionId + '?who=first', 
                    { "state": initialState }, 
                    { 'content-type': 'application/json' },
                    function (response) {
                        console.log(response.status, response.data);
                        // Update the UI after pushing the game state
                        document.getElementById('session-id').innerText = `Session ID: ${sessionId}`;
                        setStatePlayGame();
                    },
                    function (error) {
                        console.log(error);
                    }
                );
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
                document.getElementById('session-id').innerText = `Session ID: ${sessionId}`;
                console.log("Current Storage: ", window.localStorage.getItem('sessionId'), window.localStorage.getItem('whoami'));

                session = JSON.parse(response.data);

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
            stopPolling();
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
    let sessionId = window.localStorage.getItem('sessionId');
    let who = window.localStorage.getItem('whoami');

    cordova.plugin.http.get('https://appdev.creat.li/session/get/' + sessionId, {}, {},
        function (response) {
            console.log(response.status, response.data);
            session = JSON.parse(response.data);
            console.log(session);
            
            // Handle game state transition logic here
            switch (gameState) {
                case GAME_STATES.SCREEN1:
                    console.log("Game is in SCREEN1 state.");
                    // Update gameState or any variables based on the logic for SCREEN1
                    // Example: Proceed to SCREEN2
                    gameState = GAME_STATES.SCREEN2;
                    break;
                
                case GAME_STATES.SCREEN2:
                    console.log("Game is in SCREEN2 state.");
                    // Update logic for SCREEN2

                    gameState = GAME_STATES.SCREEN3;
                    break;
                
                case GAME_STATES.SCREEN3:
                    console.log("Game is in SCREEN3 state.");

                    gameState = GAME_STATES.SCREEN4;
                    break;
                
                case GAME_STATES.SCREEN4:
                    console.log("Game is in SCREEN4 state.");
                    // End the game or reset state, or proceed further

                    gameState = GAME_STATES.FINISHED;
                    break;

                case GAME_STATES.FINISHED:
                    console.log("Game is finished.");

                    // Handle the game-over state or reset
                    break;
            }

            displayGame({ gameState: gameState });

            // Optional: Push the new state to the session
            session.state.gameState = gameState;

            cordova.plugin.http.setDataSerializer('json');
            cordova.plugin.http.put('https://appdev.creat.li/session/' + sessionId + '?who=' + who,
                { "state": session.state },
                { 'content-type': 'application/json' },
                function (response) {
                    console.log(response.status, response.data);
                },
                function (error) {
                    console.log(error); //its not your turn?
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
    switch (state.gameState) {
        case GAME_STATES.SCREEN1:
            //whoami: "first" random card screen
            //whoami: "second" wait
            if(window.localStorage.getItem('whoami') === 'first'){
                document.getElementById('random-card').style.display = 'block';
            }
            else if(window.localStorage.getItem('whoami') === 'second'){
                document.getElementById('wait').style.display = 'block';
            }
            console.log("Displaying SCREEN1 elements");
            break;

        case GAME_STATES.SCREEN2:
            if(window.localStorage.getItem('whoami') === 'first'){
                document.getElementById('random-card').style.display = 'none';
                document.getElementById('wait').style.display = 'block';
            }

            else if(window.localStorage.getItem('whoami') === 'second'){
                document.getElementById('wait').style.display = 'none';
                document.getElementById('random-card').style.display = 'block';
            }
            //whoami: "first" wait
            //whoami: "second" pick a card 
            console.log("Displaying SCREEN2 elements");
            break;

        case GAME_STATES.SCREEN3:
            if(window.localStorage.getItem('whoami') === 'first'){
                document.getElementById('wait').style.display = 'none';
                document.getElementById('random-card').style.display = 'block';
            }

            else if(window.localStorage.getItem('whoami') === 'second'){
                document.getElementById('random-card').style.display = 'none';
                document.getElementById('wait').style.display = 'block';
            }
            //whoami: "first" higher lower
            //whoami: "second" wait
            console.log("Displaying SCREEN3 elements");
            break;

        case GAME_STATES.SCREEN4:
            if(window.localStorage.getItem('whoami') === 'first'){
                document.getElementById('random-card').style.display = 'none';
                document.getElementById('wait').style.display = 'block';
            }

            else if(window.localStorage.getItem('whoami') === 'second'){
                document.getElementById('wait').style.display = 'none';
                document.getElementById('random-card').style.display = 'block';
            }
            //whoami: "first" wait
            //whoami: "second" pick a card 
            console.log("Displaying SCREEN4 elements");
            break;

        case GAME_STATES.FINISHED:
            if(window.localStorage.getItem('whoami') === 'first'){
                document.getElementById('wait').style.display = 'none';
                document.getElementById('finished').style.display = 'block';
            }

            else if(window.localStorage.getItem('whoami') === 'second'){
                document.getElementById('wait').style.display = 'none';
                document.getElementById('finished').style.display = 'block';
            }
            // Finish
            //Card is guessed or Card is not guessed
            console.log("Game Finished. Display final screen.");
            break;
    }
}