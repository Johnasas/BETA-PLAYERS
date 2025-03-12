let teams = [];
let matches = [];
let standings = {};

// Step 1: Create input fields for team names
function createTeamInputs() {
    let numTeams = parseInt(document.getElementById("numTeams").value);
    const teamInputsDiv = document.getElementById("teamInputs");
    teamInputsDiv.innerHTML = "";

    for (let i = 0; i < numTeams; i++) {
        let inputField = `<input type="text" id="team${i}" placeholder="Enter team name">`;
        teamInputsDiv.innerHTML += inputField + "<br>";
    }
}

// Step 2: Generate teams from input fields
function generateLeague() {
    teams = [];
    let numTeams = parseInt(document.getElementById("numTeams").value);

    for (let i = 0; i < numTeams; i++) {
        let teamName = document.getElementById(`team${i}`).value.trim();
        if (teamName === "") {
            alert("All teams must have a name!");
            return;
        }
        teams.push(teamName);
    }

    // Initialize standings
    standings = {};
    teams.forEach(team => {
        standings[team] = { P: 0, W: 0, D: 0, L: 0, GS: 0, GC: 0, GD: 0, points: 0 };
    });

    generateFixtures();
    updateTable();
}

// Step 3: Generate Double Round-Robin Fixtures
function generateFixtures() {
    matches = [];
    let numTeams = teams.length;

    for (let i = 0; i < numTeams; i++) {
        for (let j = i + 1; j < numTeams; j++) {
            matches.push({ home: teams[i], away: teams[j], homeGoals: null, awayGoals: null });
            matches.push({ home: teams[j], away: teams[i], homeGoals: null, awayGoals: null });
        }
    }

    renderFixtures();
}

// Step 4: Render Match Fixtures
function renderFixtures() {
    const tableBody = document.querySelector("#matchesTable tbody");
    tableBody.innerHTML = "";
    matches.forEach((match, index) => {
        let row = `<tr>
            <td>${match.home}</td>
            <td>${match.away}</td>
            <td><input type="number" id="home${index}" min="0"></td>
            <td><input type="number" id="away${index}" min="0"></td>
            <td><button onclick="submitResult(${index})">Submit</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Step 5: Submit Match Results
function submitResult(index) {
    let homeGoals = parseInt(document.getElementById(`home${index}`).value);
    let awayGoals = parseInt(document.getElementById(`away${index}`).value);

    if (isNaN(homeGoals) || isNaN(awayGoals)) {
        alert("Please enter valid scores!");
        return;
    }

    matches[index].homeGoals = homeGoals;
    matches[index].awayGoals = awayGoals;

    updateStandings();
}

// Step 6: Update League Standings
function updateStandings() {
    // Reset standings
    Object.keys(standings).forEach(team => {
        standings[team] = { P: 0, W: 0, D: 0, L: 0, GS: 0, GC: 0, GD: 0, points: 0 };
    });

    // Calculate new standings
    matches.forEach(match => {
        if (match.homeGoals === null || match.awayGoals === null) return;

        let home = match.home;
        let away = match.away;
        let homeGoals = match.homeGoals;
        let awayGoals = match.awayGoals;

        standings[home].P++;
        standings[away].P++;
        standings[home].GS += homeGoals;
        standings[home].GC += awayGoals;
        standings[away].GS += awayGoals;
        standings[away].GC += homeGoals;

        standings[home].GD = standings[home].GS - standings[home].GC;
        standings[away].GD = standings[away].GS - standings[away].GC;

        if (homeGoals > awayGoals) {
            standings[home].W++;
            standings[home].points += 3;
            standings[away].L++;
        } else if (homeGoals < awayGoals) {
            standings[away].W++;
            standings[away].points += 3;
            standings[home].L++;
        } else {
            standings[home].D++;
            standings[away].D++;
            standings[home].points += 1;
            standings[away].points += 1;
        }
    });

    updateTable();
}

// Step 7: Update League Table UI
function updateTable() {
    let sortedTeams = Object.keys(standings).sort((a, b) => {
        let A = standings[a];
        let B = standings[b];

        return (
            B.points - A.points || 
            B.GD - A.GD || 
            B.GS - A.GS || 
            A.GC - B.GC
        );
    });

    const tableBody = document.querySelector("#leagueTable tbody");
    tableBody.innerHTML = "";
    sortedTeams.forEach((team, index) => {
        let row = `<tr>
            <td>${index + 1}</td>
            <td>${team}</td>
            <td>${standings[team].P}</td>
            <td>${standings[team].W}</td>
            <td>${standings[team].D}</td>
            <td>${standings[team].L}</td>
            <td>${standings[team].GS}</td>
            <td>${standings[team].GC}</td>
            <td>${standings[team].GD}</td>
            <td>${standings[team].points}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Step 8: Export League Table as JPG
function exportTableAsImage() {
    html2canvas(document.querySelector("#leagueTable")).then(canvas => {
        let link = document.createElement("a");
        link.href = canvas.toDataURL("image/jpeg");
        link.download = "league_table.jpg";
        link.click();
    });
}


// Step 9: Function to export fixture list as JPG
function exportFixturesAsImage() {
    html2canvas(document.querySelector("#matchesTable")).then(canvas => {
        let link = document.createElement("a");
        link.href = canvas.toDataURL("image/jpeg");
        link.download = "fixture_list.jpg";
        link.click();
    });
}