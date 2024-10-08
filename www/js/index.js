// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready



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
    console.log(`stored sessionId=${sessionId}`);

    if (!sessionId) { // hebben we nog geen sessie?
        SetStateMenu();
    } else { // sessie bestond al, hervat spel
        setStatePlayGame();

    }
}

function SetStateMenu() {
    document.getElementById('init').style.display = 'block';
    document.getElementById('game').style.display = 'none';
}

function setStatePlayGame() {
    document.getElementById('init').style.display = 'none';
    document.getElementById('game').style.display = 'block';
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
    cordova.plugin.http.get(`https://appdev.creat.li/session/end/${sessionId}`,
        {}, {},
        function (response) {
            console.log(response.status, response.data);
            window.localStorage.removeItem('sessionId');
            window.localStorage.removeItem('whoami');
        },
        function (error) {
            console.log(error);
        }
    );

    SetStateMenu();
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
            gameState.moves.push("move" + gameState.moves.length);
            gameState.score = Math.floor(Math.random() * 100);

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


let cards;

// > Game Functions: <
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


    // Function to display a random card
        const cardImage = document.getElementById("card");
        
        // Generate a random index from 0 to 51 (assuming 52 cards)
        const randomIndex = Math.floor(Math.random() * cards.length);
        
        // Set the image source to the randomly chosen card
        cardImage.src = "../img/Cards/" + cards[randomIndex];
        console.log(cardImage.src);
}


function displayGame(state) {

    document.getElementById('session-id').innerText = `Session ID: ${state}`;
    // Function to display a random card
        const cardImage = document.getElementById("card");
        
        // Generate a random index from 0 to 51 (assuming 52 cards)
        const randomIndex = Math.floor(Math.random() * cards.length);
        
        // Set the image source to the randomly chosen card
        cardImage.src = "../img/Cards/" + cards[randomIndex];
        console.log(cardImage.src);
}