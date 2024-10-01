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
