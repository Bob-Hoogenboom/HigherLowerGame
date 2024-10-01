/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
//Game Functions:
document.getElementById("drawCardBtn").addEventListener("click", displayRandomCard);


// Array of card filenames (assuming they are in a folder called 'cards')
function displayRandomCard() {
const cards = [
        "CardsClub/card_clubs_02.png", // ...add all club cards
        "CardsDiamond/card_diamonds_02.png", // add all diamond cards
        "CardsHeart/card_hearts_02.png", // add all heart cards
        "CardsSpade/card_spades_02.png" // add all spade cards
    ];
    
    // Function to display a random card
        const cardImage = document.getElementById("card");
        
        // Generate a random index from 0 to 51 (assuming 52 cards)
        const randomIndex = Math.floor(Math.random() * cards.length);
        
        // Set the image source to the randomly chosen card
        cardImage.src = "../img/" + cards[randomIndex];
        console.log(cardImage.src);
}

document.addEventListener('deviceready', onDeviceReady, false);
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

    
}

cordova.plugin.http.get('https://google.com/', {
        id: '12',
        message: 'test'
      }, { Authorization: 'OAuth2: token' }, function(response) {
        console.log(response.status);
      }, function(response) {
        console.error(response.error);
      });

document.addEventListener('pause', onPause);
function onPause() 
{ 
    document.getElementById('Pausable') 
}

document.addEventListener('resume', onResume);
function onResume() 
{ 
    document.getElementById('Resumable') 
}
