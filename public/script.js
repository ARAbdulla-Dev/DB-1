
async function Run(){

    const userID = document.getElementById('userID').value;
    const userdata = `/data/${userID}.json`;
    console.log(userdata);
// script.js
document.addEventListener('DOMContentLoaded', function() {
    fetch(userdata)
        .then(response => response.json())
        .then(data => {
            // Set logo
            document.getElementById('logo').src = data.logo;

            // Set contact information
            const contactInfo = `
                <p><strong></strong> ${data.address.replace(/\n/g, '<br>')}<br><br>
                <strong>Phone (Sri Lanka):</strong> ${data.phone}<br>
                <strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a><br>
                <strong>Web:</strong> <a href="${data.web}">${data.web}</a></p>
            `;
            document.getElementById('contact-info').innerHTML = contactInfo;

            // Set itinerary cover
            const itineraryCover = `
                <img src="${data.imgCover}" alt="Cover Image" id="imageCover">
                <div class="daysandmap">
                <p><strong></strong> <b id="daysa">${data.tourDur}</b></p>
                <p><strong></strong> ${data.noOfNights}</p><br>
                <img src="${data.mapPlanImg}" alt="Map" id="map">
                <p><strong>Route:</strong> ${data.route}</p>
                </div>
                <br><br>
                <p><strong>Traveller Name:</strong> ${data.name}</p>
                <p><strong>Travellers:</strong> ${data.travellers}</p>
                <p><strong>Travel Date:</strong> ${data.travelDate}</p>
            `;
            document.getElementById('itinerary-cover').innerHTML = itineraryCover;

            // Generate travel days
            data.travelTb.travelDay.forEach((day, index) => {
                const activity = data.travelTb.activity[index];
                const dayData = data[`Day${index + 1}`];

                const daySection = document.createElement('div');
                daySection.classList.add('day-section');
                daySection.innerHTML = `
                    <h2>${day} ${dayData.date}</h2>
                    <p><strong>Activity:</strong> ${activity}</p>
                    <p>${dayData.description}</p>
                    <p><strong>Overnight Stay:</strong> ${dayData.overnightStay}</p>
                    <p><strong>Meals:</strong> ${dayData.meals}</p>
                `;

                document.body.insertBefore(daySection, document.getElementById('printBtn'));
            });
        });

    document.getElementById('printBtn').addEventListener('click', function() {
        window.print();
    });
});
}

