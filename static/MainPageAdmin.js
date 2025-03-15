let username;
let description;

document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    username = params.get("username");
    description = params.get("description");

    if (username && description) {
        // Store in sessionStorage
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("description", description);
    }

    // Retrieve from sessionStorage in case data is missing in URL params
    username = sessionStorage.getItem("username") || "Guest";
    description = sessionStorage.getItem("description") || "No description found";

    document.getElementById("username").textContent = username;
});


document.addEventListener("DOMContentLoaded", function () {
    const dashboardBtn = document.getElementById("dashboard-btn");
    const overviewBtn = document.getElementById("overview-btn");
    const analysisBtn = document.getElementById("analysis-btn");
    const contactusBtn = document.getElementById("contactus-btn");
    const headerTitle = document.getElementById("header-title");

    const dashboardContent = document.getElementById("dashboard-content");
    const overviewContent = document.getElementById("overview-content");
    const analysisContent = document.getElementById("analysis-content");
    const contactusContent = document.getElementById("contactus-content");

    // Hide overview content on page load
    dashboardContent.style.display = "flex";
    overviewContent.style.display = "none";
    analysisContent.style.display = "none";
    contactusContent.style.display = "none";

    function setActive(button, title) {
        document.querySelectorAll(".nav-button").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        headerTitle.textContent = title;

        if (title === "Dashboard") {
            dashboardContent.style.display = "flex";  // Show Dashboard
            overviewContent.style.display = "none"; // Hide Overview
            analysisContent.style.display = "none";
            contactusContent.style.display = "none";
        } else if(title === "Overview") {
            console.log("Switching to Overview");
            dashboardContent.style.display = "none";  // Hide Dashboard
            overviewContent.style.display = "flex";  // Show Overview
            analysisContent.style.display = "none";
            contactusContent.style.display = "none";
        }
        else if(title === "Analysis"){
            dashboardContent.style.display = "none";  // Hide Dashboard
            overviewContent.style.display = "none";  // Show Overview
            analysisContent.style.display = "flex";
            contactusContent.style.display = "none";

        }
        else if(title === "Contact Us"){
            dashboardContent.style.display = "none";  // Hide Dashboard
            overviewContent.style.display = "none";  // Show Overview
            analysisContent.style.display = "none";
            contactusContent.style.display = "flex";
        }
    }

    dashboardBtn.addEventListener("click", function () {
        setActive(dashboardBtn, "Dashboard");
    });

    overviewBtn.addEventListener("click", function () {
        setActive(overviewBtn, "Overview");
    });
    analysisBtn.addEventListener("click", function () {
        setActive(analysisBtn, "Analysis");
    });
    contactusBtn.addEventListener("click", function () {
        setActive(contactusBtn, "Contact Us");
    });
});


let myMap , myMap2 , olaMaps;
document.addEventListener("DOMContentLoaded", function () {
    // Initialize the Ola Map
    olaMaps = new OlaMaps({
        apiKey: ["dI9XRtzWSxng4qSovSxvwMcSnWh9nZ5a0BFR73kQ"],
    });

    myMap = olaMaps.init({
        style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
        container: 'map',
        center: [80.169088, 13.090862], // Default center
        zoom: 11,
    });

    myMap2 = olaMaps.init({
        style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
        container: 'map2',
        center: [80.169088, 13.090862], // Default center
        zoom: 11,
    });

    let markers = {}; // Store markers for updating dynamically
    const scrollableContainer = document.querySelector(".scrollable-container");

    function updateMarkers(data, descriptionMap) {
        // Parse the descriptionMap from a JSON string to a JavaScript object
        let description;
        try {
            description = JSON.parse(descriptionMap);
        } catch (error) {
            console.error("Failed to parse descriptionMap:", error);
            alert("Failed to parse descriptionMap");
            return;
        }

        // Clear existing containers
        scrollableContainer.innerHTML = "";

        // Loop through the data and create/update markers and text containers
        Object.keys(data).forEach(deviceId => {
            // Get the vehicle number from the parsed description object
            const vehicleNumber = description[deviceId] || "Unknown";
            const { ts , latlng, boxtemp, soc, ttd_ttc, setpoint, drstate, errorstate, warningstate , ang} = data[deviceId];

            const [lat, lng] = latlng.split(",").map(Number);

            // Create text container for the vehicle
            const textContainer = document.createElement("div");
            textContainer.classList.add("input-container");

            // Add Vehicle ID

            const labelText = document.createElement("div");
            labelText.classList.add("label-text");
            labelText.textContent = `Vehicle ID: ${vehicleNumber}`;

            const labelTextLastfetched = document.createElement("div");
            labelTextLastfetched.classList.add("label-text");

            // Convert timestamp from string to number
            const timestampMs = Number(ts);

            // Convert to IST (GMT+5:30) and format as DD/MM/YYYY HH:MM:SS
            const istDate = new Date(timestampMs).toLocaleString("en-GB", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hourCycle: "h23" // 24-hour format
            }).replace(",", ""); // Remove extra comma for cleaner output

            labelTextLastfetched.textContent = `Last fetched: ${istDate}`;



            // Create a grid for the text fields
            const textGrid = document.createElement("div");
            textGrid.classList.add("input-grid");

            // Define the fields and their corresponding values
            const fields = [
                { label: "Temperature", value: `${boxtemp} °C` },
                { label: "Battery", value: `${soc} %` },
                { label: "Time to Discharge", value: `${ttd_ttc} hrs` },
                { label: "Set Point", value: `${setpoint} °C` },
                { label: "Cooling", value: drstate === "0" ? "Inactive" : "Active" },
                { label: "Error/Warning", value: `Error: ${errorstate}, Warning: ${warningstate}` }
            ];

            // Create text fields dynamically
            fields.forEach(field => {
                const textField = document.createElement("div");
                textField.classList.add("form-control");

                const label = document.createElement("span");
                label.textContent = `${field.label}: `;
                label.classList.add("text-label");

                const value = document.createElement("span");
                value.textContent = field.value;
                value.classList.add("text-value");

                textField.appendChild(label);
                textField.appendChild(value);
                textGrid.appendChild(textField);
            });

            // Append elements to the text container
            textContainer.appendChild(labelText);
            textContainer.appendChild(labelTextLastfetched);
            textContainer.appendChild(textGrid);
            scrollableContainer.appendChild(textContainer);

            // Create marker container
            const markerContainer = document.createElement('div');
            markerContainer.classList.add('marker-container');

            // Create the car marker div
            const olaIcon = document.createElement('div');
            olaIcon.classList.add('customMarkerClass');
            // Set the rotation based on 'ang' value
            olaIcon.style.transform = `rotate(${ang+90}deg)`;

            // Create the text label
            const markerText = document.createElement('span');
            markerText.classList.add('marker-text');
            markerText.textContent = vehicleNumber;

            // Append elements
            markerContainer.appendChild(olaIcon);
            markerContainer.appendChild(markerText);

            // Create a popup
            const popup = olaMaps.addPopup({ offset: [0, -30], anchor: 'bottom' })
                .setHTML(`<div>Temp: ${boxtemp} °C<br>Battery: ${soc} %</div>`);

            // Remove existing marker if it exists
            if (markers[deviceId]) {
                markers[deviceId].remove();
            }

            // Add new marker
            markers[deviceId] = olaMaps
                .addMarker({ element: markerContainer, offset: [0, -10], anchor: 'bottom' })
                .setLngLat([lng, lat])
                .addTo(myMap)
                .setPopup(popup);
        });
    }

    function sendRealTimeData() {
        let description = sessionStorage.getItem("description");
        console.log(`${description}`);
        if (!description) {
            console.warn("No description found in localStorage.");
            return;
        }

        try {
            description = JSON.parse(description);
        } catch (error) {
            console.error("Invalid JSON format in localStorage:", error);
            alert("Invalid JSON format in localStorage");
            return;
        }

        fetch("https://96wvqt69vk.execute-api.us-east-1.amazonaws.com/testingStage/YoTuhBackend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "realTimeData", description: description })
        })
       .then(response => response.json())
        .then(data => {
            console.log("API Response:", data); // Print the response
            if (data.success && data.data) {
                updateMarkers(data.data, description);
            } else {
                console.error("Invalid response from API:", data);
                alert("Invalid response from API");
            }
        })
        .catch(error => {
            console.error("Error fetching real-time data:", error);
            alert("Error fetching real-time data");
        });
    }

    sendRealTimeData();
    setInterval(sendRealTimeData, 5000);
});


document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("dropdown");
    const dropdownAnalysis = document.getElementById("dropdownAnalysis");
    const storedData = sessionStorage.getItem("description");

    console.log("Raw storedData:", storedData); // Debugging step

    if (storedData) {
        try {
            let parsedData = JSON.parse(storedData);

            // Check if parsedData is still a string (double stringification issue)
            if (typeof parsedData === "string") {
                console.warn("Double-encoded JSON detected! Parsing again...");
                parsedData = JSON.parse(parsedData);
            }

            console.log("Properly Parsed JSON:", parsedData);

            // Ensure it's a valid object
            if (typeof parsedData === "object" && parsedData !== null) {
                // Clear existing dropdown options
                dropdown.innerHTML = "";
                dropdownAnalysis.innerHTML = "";

                // Populate the dropdown with values from JSON
                Object.values(parsedData).forEach(value => {
                    let option = document.createElement("option");
                    let optionAnalysis = document.createElement("option");
                    option.value = value;
                    optionAnalysis.value = value;
                    option.textContent = value;
                    optionAnalysis.textContent = value;
                    dropdown.appendChild(option);
                    dropdownAnalysis.appendChild(optionAnalysis);
                });

                console.log("Dropdown successfully populated!");
            } else {
                console.error("Parsed data is not an object:", parsedData);
                alert("Parsed data is not an object");
            }
        } catch (error) {
            console.error("Error parsing JSON from localStorage:", error);
            alert("Error parsing JSON from localStorage");
        }
    } else {
        console.warn("No data found in localStorage for key: description");
    }
});

function getCombinedTimestamp(dateId, timeId) {
    const dateValue = document.getElementById(dateId).value; // Get date value
    const timeValue = document.getElementById(timeId).value || "00:00"; // Default to midnight if no time selected

    // Combine date and time values
    const combinedDateTime = `${dateValue}T${timeValue}`;

    // Convert combined value to Unix timestamp (milliseconds)
    return new Date(combinedDateTime).getTime();
}


document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("submitBtn");
    const dropdown = document.getElementById("dropdown");
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");

    submitBtn.addEventListener("click", async () => {
        // Get the selected dropdown value
        const selectedValue = dropdown.value;
        console.log("Selected Dropdown Value:", selectedValue);

        // Fetch and parse localStorage value for "description"
        const storedData = sessionStorage.getItem("description");

        if (!storedData) {
            console.error("No data found in localStorage for key: description");
            alert("No data found in localStorage for key: description");
            return;
        }

        let parsedData;
        try {
            parsedData = JSON.parse(storedData);
            if (typeof parsedData === "string") {
                parsedData = JSON.parse(parsedData); // Handle double stringification
            }
        } catch (error) {
            console.error("Error parsing JSON from localStorage:", error);
            alert("Error parsing JSON from localStorage");
            return;
        }

        console.log("Properly Parsed JSON:", parsedData);

        // Find the key for the selected dropdown value
        const keyForValue = Object.keys(parsedData).find(
            key => parsedData[key] === selectedValue
        );

        if (!keyForValue) {
            console.error("No matching key found for selected value:", selectedValue);
            alert("No matching key found for selected value");
            return;
        }

        console.log("Key for Selected Value:", keyForValue);

        // Get Start Date and End Date values

        const startTimestamp = getCombinedTimestamp("start-date", "start-time");
        const endTimestamp = getCombinedTimestamp("end-date", "end-time");

        if (!startTimestamp || !endTimestamp) {
            console.error("Start Date or End Date is missing.");
            alert("Start Date or End Date is missing");
            return;
        }


        console.log("Start Timestamp:", startTimestamp);
        console.log("End Timestamp:", endTimestamp);

        // Prepare request payload
        const requestBody = {
            action: "overview",
            id: keyForValue,
            startdate: startTimestamp,
            enddate: endTimestamp
        };

        try {
            // Send POST request
            const response = await fetch("https://96wvqt69vk.execute-api.us-east-1.amazonaws.com/testingStage/YoTuhBackend", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            // Parse and log response
            const responseData = await response.json();
            console.log("Response from server:", responseData);

            // Check if response contains data
            if (responseData.success && responseData.data) {
                addMarkersToMap(responseData.data);
            } else {
                console.error("No valid data received from server.");
                alert("No valid data received from server");
            }
        } catch (error) {
            console.error("Error sending POST request:", error);
            alert("Error sending POST request");
        }
    });

    function addMarkersToMap(data) {
        myMap2 = olaMaps.init({
        style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
        container: 'map2',
        center: [80.169088, 13.090862], // Default center
        zoom: 11,
    });
    const convertToIST = (utcTimestamp) => {
        const date = new Date(utcTimestamp); // Convert to Date object
        date.setMinutes(date.getMinutes() + 330); // Add 5 hours 30 minutes (330 minutes)

        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false // Ensures 24-hour format
        });
    };

        data.forEach(item => {
            const [lat, lng] = item.latlng.split(",").map(coord => parseFloat(coord.trim()));
            // Create a popup with the ts, and drstate
            const popupContent = `
                <strong>Timestamp (IST):</strong> ${convertToIST(item.ts)}<br>
                <strong>Box Temp:</strong> ${item.boxtemp}°C<br>
                <strong>Battery Level:</strong> ${item.soc}%<br>
                <strong>Cooling Status:</strong> ${item.drstate}
            `;

            // Create marker and attach popup
            const popup = olaMaps.addPopup({ offset: [0, -30], anchor: 'bottom' })
                .setHTML(popupContent);
            olaMaps
                .addMarker({ offset: [0, -20], anchor: "bottom" }) // Adjust offset for better visibility
                .setLngLat([lng, lat]) // Use longitude, latitude format
                .setPopup(popup) // Add popup with data
                .addTo(myMap2);
        });
    }
});

const dropdownContainer = document.querySelector('.dropdown-container');
const dropdownBtn = document.getElementById('dropdownBtn');
const dropdownContent = document.getElementById('dropdownContent');
const selectedValues = document.getElementById('selectedValues');
const checkboxes = dropdownContent.querySelectorAll('input[type="checkbox"]');

dropdownBtn.addEventListener('click', () => {
    dropdownContainer.classList.toggle('active');
});

// Update text box with selected items
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        let selectedItems = Array.from(checkboxes)
            .filter(i => i.checked)
            .map(i => i.value)
            .join(', ');
        selectedValues.value = selectedItems || 'Selected items...';
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!dropdownContainer.contains(e.target)) {
        dropdownContainer.classList.remove('active');
    }
});

document.getElementById("submitBtnAnalysis").addEventListener("click", async function() {


    const formattedStartDate = getCombinedTimestamp("start-dateAnalysis", "start-timeAnalysis");
    const formattedEndDate = getCombinedTimestamp("end-dateAnalysis", "end-timeAnalysis");


    const dropdownValue = document.getElementById("dropdownAnalysis").value;


    // Fetch and parse localStorage value for "description"
    const storedData = sessionStorage.getItem("description");

    if (!storedData) {
        console.error("No data found in localStorage for key: description");
        alert("No data found in localStorage for key: description");
        return;
    }

    let parsedData;
    try {
        parsedData = JSON.parse(storedData);
        if (typeof parsedData === "string") {
            parsedData = JSON.parse(parsedData); // Handle double stringification
        }
    } catch (error) {
        console.error("Error parsing JSON from localStorage:", error);
        alert("Error parsing JSON from localStorage");
        return;
    }

    console.log("Properly Parsed JSON:", parsedData);

    // Find the key for the selected dropdown value
    const keyForValue = Object.keys(parsedData).find(
        key => parsedData[key] === dropdownValue
    );

    if (!keyForValue) {
        console.error("No matching key found for selected value:", selectedValue);
        alert("No matching key found for selected value");
        return;
    }

    console.log("Key for Selected Value:", keyForValue);


    console.log(`${formattedStartDate}`);

    // Fetch selected items as a list
    const selectedItems = [];
    document.querySelectorAll("#dropdownContent input[type=checkbox]:checked").forEach((checkbox) => {
        selectedItems.push(checkbox.value);
    });

    // API Request Body
    const requestBody = {
        action: "chartData",
        id: keyForValue,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        items: selectedItems
    };

    try {
        // Send API request
        const response = await fetch("https://96wvqt69vk.execute-api.us-east-1.amazonaws.com/testingStage/YoTuhBackend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const responseData = await response.json();

        if (responseData.success) {
            plotApexChart(responseData.data);
        } else {
            console.error("API Error:", responseData.message);
            alert("API Error:", responseData.message);
        }
    } catch (error) {
        console.error("Request failed:", error);
        alert("Request failed:", error);
    }
});
// Function to plot ApexChart
function plotApexChart(data) {
    if (!data.length) {
        console.error("No data available for chart.");
        alert("No data available for chart");
        return;
    }

    const series = [];

    // Convert "ts" to Unix timestamps (milliseconds) and adjust for IST (GMT+5:30)
    const timestamps = data.map(item => {
        const [day, month, year, hour, minute, second] = item.ts.match(/\d+/g).map(Number);
        let utcTimestamp = new Date(year, month - 1, day, hour, minute, second).getTime();
        let istTimestamp = utcTimestamp + (5.5 * 60 * 60 * 1000); // Convert to IST
        return istTimestamp;
    });

    // Extract keys dynamically, excluding "ts"
    const keys = Object.keys(data[0]).filter(key => key !== "ts");
    keys.forEach((key) => {
        series.push({
            name: key,
            data: data.map((item, index) => [timestamps[index], item[key]]) // Use IST timestamps
        });
    });

    const options = {
        chart: {
            type: "line",
            height: 350,
            zoom: {
                enabled: true // Enable zoom for expanding values
            }
        },
        series: series,
        xaxis: {
            labels: {
                datetimeUTC: false, // Ensure it uses local timezone (IST)
                formatter: (value) => {
                    let date = new Date(value);
                    return date.toLocaleString("en-GB", {
                        timeZone: "Asia/Kolkata",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hourCycle: "h23" // 24-hour format
                    }).replace(",", ""); // Remove comma for cleaner display
                }
            },
            tickAmount: 5 // Show only 5 labels initially
        },
        tooltip: {
            x: {
                format: "dd/MM/yyyy HH:mm:ss" // Format tooltip timestamps in IST
            }
        }
    };

    // Render chart
    document.getElementById("chart").innerHTML = ""; // Clear previous chart
    const chart = new ApexCharts(document.getElementById("chart"), options);
    chart.render();
}
