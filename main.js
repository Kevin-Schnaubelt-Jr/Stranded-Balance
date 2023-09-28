let gameState = JSON.parse(localStorage.getItem('gameState')) || {
    currentWood: 0,
    buildings: {
        WoodChopper: {
            name: 'WoodChopper',
            amount: 0,
            baseCost: 15,
            baseReturn: 0.5,
        },
        Sawmill: {
            name: 'Sawmill',
            amount: 0,
            baseCost: 50,
            baseReturn: 1,
        },
        DemoExtra: {
            name: 'DemoExtra',
            amount: 0,
            baseCost: 200,
            baseReturn: 2,
        },

      
    },
};

// Create empty object for storing adjusted buildings
let adjustedBuildings = {};
let totalcps = 0;
let efficiencies = [];
let currentWood = 0;



window.onload = function() {
    GoActionGo();
    addEventListeners();
    // Other onload tasks...
    console.log("adjusted", adjustedBuildings);
    console.log("gamestate", gameState);

};


function AdjustBuildings() {

    currentWood = gameState.currentWood;

    for (let building in gameState.buildings) {
        let buildingName = gameState.buildings[building].name;
        let amount = gameState.buildings[building].amount;
        let baseCost = gameState.buildings[building].baseCost;
        let baseReturn = gameState.buildings[building].baseReturn;
        let newCost = amount ? baseCost * Math.pow(1.5, amount) : baseCost;
        let cps = amount ? amount * baseReturn : baseReturn;

        adjustedBuildings[building] = {
            name: buildingName,
            amount: amount,
            cost: newCost,
            cps: cps,
            baseReturn: baseReturn,
        }

        // Add building's cps to totalcps
        totalcps += amount ? cps : 0;
    }
}

function CalculateBuyEfficiency() {   
    for (let building in adjustedBuildings) {
        let cost = adjustedBuildings[building].cost;
        let cpsIncrease = adjustedBuildings[building].baseReturn;

        adjustedBuildings[building].buyEfficiency = BuyEfficiency(cost, totalcps, cpsIncrease, currentWood);

        // Create an object with the building's name and efficiency, and add it to the array
        efficiencies.push({
            name: building,
            buyEfficiency: adjustedBuildings[building].buyEfficiency,
        });
    }

    // Sort the array by the efficiency values, from lowest to highest
    efficiencies.sort((a, b) => {
        return a.buyEfficiency - b.buyEfficiency;
    });

}



function BuyEfficiency(cost, totalcps, cpsIncrease, currentWood){
    let efficiency = Math.floor(cost) / cpsIncrease;
    
    // Calculate the remaining crystals needed for the purchase
    let remainingCost = cost - currentWood;
    if (remainingCost < 0) remainingCost = 0;

    let waitTime = totalcps ? remainingCost / totalcps : 0;
    
    let returnEfficiency = efficiency + waitTime;
    
    return Math.round(returnEfficiency * 10) / 10;
}


function Display() {
    for (let buildingKey in adjustedBuildings) {
        let building = adjustedBuildings[buildingKey];

        // console.log("debug ",building);
        document.getElementById(`${building.name}Number`).value = building.amount;
        document.getElementById(`${building.name}Cost`).innerHTML = Math.floor(building.cost),
        document.getElementById(`${building.name}CpS`).innerHTML = building.cps;
        document.getElementById(`${building.name}Buy`).innerHTML = building.buyEfficiency;
    }

    document.getElementById('totalCpS').innerHTML = `Total CpS: ${totalcps}`;
    document.getElementById('currentCrystals').value = `${currentCrystals}`;

    // loop through efficiencies array and place the buildings name in id="best-buy-1" through id="best-buy-5". stop after 5.
    for (let i = 0; i < 3; i++) {
        document.getElementById(`best-buy-${i+1}`).innerHTML = `${i+1}: ${efficiencies[i].name}`;
    }
    
}

function addEventListeners() {
    // For the buildings
    BuildingsEvent();

    // For Prod
    ProdEvent();

    
}

function BuildingsEvent() {
    for (let buildingKey in gameState.buildings) {
        let building = gameState.buildings[buildingKey];

        let amountInput = document.getElementById(`${building.name}Number`);

        // Add event listener for 'keyup' event
        [amountInput].forEach(inputElement => {
            if (inputElement) {
                inputElement.addEventListener('keyup', (event) => {
                    // Check for 'Enter' key
                    if (event.key === 'Enter') {
                        // Update gameState
                        if (inputElement === amountInput) {
                            gameState.buildings[buildingKey].amount = parseInt(inputElement.value, 10);
                        }
                        // Save to local storage
                        localStorage.setItem('gameState', JSON.stringify(gameState));

                        // Recalculate
                        GoActionGo();

                        // Lose focus from the input
                        event.target.blur();
                    }
                });
            }
        });
    }
}

function ProdEvent() {
    let prodInput = document.getElementById('currentCrystals');

    // Add event listener for 'keyup' event
    [prodInput].forEach(inputElement => {
        if (inputElement) {
            inputElement.addEventListener('keyup', (event) => {
                // Check for 'Enter' key
                if (event.key === 'Enter') {
                    // Update gameState
                    if (inputElement === prodInput) {
                        gameState.currentCrystals = parseInt(inputElement.value, 10);
                    }
                    // Save to local storage
                    localStorage.setItem('gameState', JSON.stringify(gameState));

                    // Recalculate
                    GoActionGo();

                    // Lose focus from the input
                    event.target.blur();
                }
            });
        }
    });
}

function GoActionGo() {
    adjustedBuildings = {};
    totalcps = 0;
    efficiencies = [];
    currentCrystals = 0;

    AdjustBuildings();
    CalculateBuyEfficiency();
    Display();
}

function clearStorage() {
    let confirmClear = confirm('Are you sure you want to clear all data?');
    if (confirmClear) {
        localStorage.clear();
        console.log('All data cleared from localStorage');
    }
}