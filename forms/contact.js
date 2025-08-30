// Handle form submission
document.getElementById("contact-form").addEventListener("submit", function(event) {
    event.preventDefault();  // Prevent default form submission

    // Get form data
    const formData = {
        to: "sathish.routhu6@gmail.com",  // Your email address
        subject: document.getElementById("subject").value,
        body: `Name: ${document.getElementById("name").value}\nEmail: ${document.getElementById("email").value}\nMessage: ${document.getElementById("message").value}`
    };

    // Show loading message
    document.querySelector(".loading").style.display = "block";

    // Send data to Flask API via fetch (AJAX)
    fetch('https://portfolio-server-40hp.onrender.com/api/mail/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading message
        document.querySelector(".loading").style.display = "none";

        // Show success message
        if (data.success) {
            document.querySelector(".sent-message").style.display = "block";
        } else {
            document.querySelector(".error-message").textContent = "Something went wrong. Please try again!";
            document.querySelector(".error-message").style.display = "block";
        }
    })
    .catch(error => {
        // Hide loading message and show error
        document.querySelector(".loading").style.display = "none";
        document.querySelector(".error-message").textContent = "Error: " + error.message;
        document.querySelector(".error-message").style.display = "block";
    });
});
