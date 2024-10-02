// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

// > Game Functions: <
// Array of card filenames (assuming they are in a folder called 'cards')
let cards;

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

function displayRandomCard() {
    // Function to display a random card
        const cardImage = document.getElementById("card");
        
        // Generate a random index from 0 to 51 (assuming 52 cards)
        const randomIndex = Math.floor(Math.random() * cards.length);
        
        // Set the image source to the randomly chosen card
        cardImage.src = "../img/Cards/" + cards[randomIndex];
        console.log(cardImage.src);
}


// > cordova <
document.addEventListener('deviceready', onDeviceReady, false);

//Session Variables
let sessionID; //stores ID of the session
let whenJoined; // stores who joined first
let currentTurn; // stores who's turn it is
let gameOver;
var gameState;
var serverState;

let turnRandomCard = 0;
let turnGuessCard = 0;
let turnHigherLower = 0;
let TurnGuessCardAgain = 0;

function onDeviceReady() 
{
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
    
    cordova.plugin.http.get('https://appdev.creat.li/ping',
        {}, {},
        function (response) {
            document.getElementById('session_response').innerHTML = response.data;
            console.log(response.status, response.data);
        },
        function (response) {
            console.error(response.error);
        });
        
        document.addEventListener('pause', onPause);
        document.addEventListener('resume', onResume);
        
    }
    
    function onPause() 
    { 
        //save game
    }
    
    function onResume() 
    { 
        //load game
    }

    function onClickHandler(){
        cordova.plugin.http.get('https://appdev.creat.li/ping',
            {}, {},
            function (response) {
                //document.getElementById('session_response').innerHTML = response.data;
                console.log(response.status, response.data);
            },
            function (response) {
                console.error(response.error);
            });
    }

    function onStartSession(){


        cordova.plugin.http.get('https://appdev.creat.li/session/begin', 
            {}, {}, 
              
                function(response) {
                    console.log(response.status, response.data);
                    sessionId = response.data;                    
 
                    whenJoined = "first";
                    currentTurn = "second";

                    
            gameState = {
                "turn_1" : turnRandomCard, "turn_2" : turnGuessCard, "turn_3" : turnHigherLower, "turn_4" : TurnGuessCardAgain, 
                "currentTurn" : currentTurn , "gameOver" : gameOver, 
            };

            //doesn't work yet
            cordova.plugin.http.put('https://appdev.creat.li/session/' + sessionID + '?who=' + whenJoined + '', {
                "turn" : currentTurn,
                "joined" : whenJoined,
                "state" : gameState
            }, {},
            function(response){
                console.log(response.status, response.data);
                serverState = JSON.parse(response.data);

                document.getElementById('continue_bttn').hidden = false;
            },
            function(error){
                document.getElementById('tryagain_bttn').hidden = false;
            }

        );
    },
    function(error){
        console.log(error);
        document.getElementById('tryagain_btn').hidden = false;
    });

    document.getElementById('continue_btn').addEventListener('click', startGame);

    document.getElementById('continue_btn').addEventListener('click', onStartSession);

}



