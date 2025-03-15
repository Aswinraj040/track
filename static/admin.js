const apiUrl = "https://96wvqt69vk.execute-api.us-east-1.amazonaws.com/testingStage/YoTuhBackend";

document.addEventListener("DOMContentLoaded", () => {
    fetchUsers();
});

function logout() {
    // Remove only relevant keys instead of clearing everything
    localStorage.removeItem("isUserLoggedIn");
    localStorage.removeItem("isAdmin");

    window.location.href = "/track/index.html";
}


document.getElementById("userForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Username and Password are required.");
        return;
    }

    // Collect all IMEI and Vehicle No values dynamically
    const imeiVehicleDict = {};
    const imeiInputs = document.querySelectorAll("[id^='IMEI']");
    const vehicleInputs = document.querySelectorAll("[id^='VehicleNo']");

    if (imeiInputs.length !== vehicleInputs.length || imeiInputs.length === 0) {
        alert("Please enter at least one IMEI and Vehicle No pair.");
        return;
    }

    imeiInputs.forEach((imeiInput, index) => {
        const imei = imeiInput.value.trim();
        const vehicleNo = vehicleInputs[index].value.trim();

        if (imei && vehicleNo) {
            imeiVehicleDict[imei] = vehicleNo;
        }
    });

    if (Object.keys(imeiVehicleDict).length === 0) {
        alert("Please enter valid IMEI and Vehicle No values.");
        return;
    }

    const userData = {
        action: "createUser",
        username: username,
        password: password,
        description: imeiVehicleDict // Send IMEI & Vehicle No as a dictionary
    };

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    const result = await response.json();
    alert(result.message);

    // Clear table before fetching users again to prevent duplication
    document.getElementById("userTableBody").innerHTML = "";

    fetchUsers();
    resetForm();
});


async function fetchUsers() {
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getUsers" })
    });

    const data = await response.json();
    populateTable(data.users);
}

function populateTable(users) {
    const tableBody = document.getElementById("userTableBody");
    tableBody.innerHTML = "";

    users.forEach(user => {
        let description;
        try {
            description = JSON.parse(user.description); // Ensure it's displayed as JSON
        } catch (error) {
            console.error("Error parsing description:", error);
            description = user.description; // Fallback
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.password}</td>
            <td><pre>${JSON.stringify(description, null, 2)}</pre></td>
            <td class="actions">
                <button
                    onclick="editUser('${user.username}', '${user.password}', this.getAttribute('data-desc'))"
                    data-desc='${JSON.stringify(description)}'
                >Edit</button>
                <button class="delete-btn" onclick="deleteUser('${user.username}')">Delete</button>
                <button class="view-btn" onclick="viewUser('${user.username}')">View</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function viewUser(username) {
    // Find the user in the table
    const userRow = [...document.querySelectorAll("#userTableBody tr")].find(row =>
        row.children[0].textContent === username
    );

    if (!userRow) {
        alert("User not found!");
        return;
    }

    // Extract the description from the data attribute
    const description = userRow.querySelector(".actions button").getAttribute("data-desc");
    const descriptionString = JSON.stringify(description);
    console.log(descriptionString);

    // Encode the data for safe URL handling
    const queryParams = new URLSearchParams({
        username: username,
        description: descriptionString
    }).toString();

    // Open MainPageAdmin.html in a new tab with the encoded data
    window.open(`/track/MainPageAdmin.html?${queryParams}`, '_blank');
}

function editUser(username, password, description) {
    // Create popup container
    const popup = document.createElement("div");
    popup.classList.add("popup-container");

    popup.innerHTML = `
        <div class="popup">
            <button class="close-btn" onclick="closePopup()">X</button>
            <h2>Edit User</h2>
            <label>Username:</label>
            <input type="text" id="editUsername" value="${username}" readonly>

            <label>Password:</label>
            <input type="text" id="editPassword" value="${password}">

            <label>Description:</label>
            <textarea id="editDescription">${description}</textarea>

            <button onclick="updateUser()">Update</button>
        </div>
    `;

    document.body.appendChild(popup);
}

function closePopup() {
    const popup = document.querySelector(".popup-container");
    if (popup) popup.remove();
}

async function updateUser() {
    const username = document.getElementById("editUsername").value;
    const password = document.getElementById("editPassword").value;
    const description = document.getElementById("editDescription").value;

    const response = await fetch("https://96wvqt69vk.execute-api.us-east-1.amazonaws.com/testingStage/YoTuhBackend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "updateDescription",
            username: username,
            password: password,
            description: description
        })
    });

    const result = await response.json();
    alert(result.message);

    closePopup();
    fetchUsers(); // Refresh user list
}

async function deleteUser(username , desc) {
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteUser", username: username})
    });

    const result = await response.json();
    alert(result.message);

    document.getElementById("userTableBody").innerHTML = "";

    fetchUsers();
}

function resetForm() {
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("description").value = "";
}

function togglePasswordfun() {
    const passwordField = document.getElementById("password");
    const toggleIcon = document.getElementById("togglePassword");

    if (passwordField.type === "password") {
        passwordField.type = "text";
        toggleIcon.src = "/track/static/eyeopen.svg";
    } else {
        passwordField.type = "password";
        toggleIcon.src = "/track/static/eyeclosed.svg";
    }
}


let imeiCounter = 1;

function addIMEIVehicleRow() {
    imeiCounter++;

    const container = document.getElementById("imeiVehicleContainer");

    const newRow = document.createElement("div");
    newRow.classList.add("imei-vehicle-row");

    newRow.innerHTML = `
        <input type="text" id="IMEI${imeiCounter}" name="IMEI${imeiCounter}" placeholder="IMEI">
        <input type="text" id="VehicleNo${imeiCounter}" name="VehicleNo${imeiCounter}" placeholder="Vehicle No">
        <button type="button" class="remove-btn" onclick="removeIMEIVehicleRow(this)">❌</button>
    `;

    container.appendChild(newRow);
}

function removeIMEIVehicleRow(button) {
    button.parentElement.remove();
}

