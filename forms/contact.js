// Handle form submission
document
  .getElementById("contact-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get form data
    const formData = {
      to: "sathish.routhu6@gmail.com", // Your email address
      subject: document.getElementById("subject").value,
      body: `
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f0f8ff; color: #333;">
                <div style="text-align: center; padding: 10px; background-color: #4CAF50; color: white;">
                    <h3>Someone want to connect with you</h3>
                </div>
                <div style="padding: 15px;">
                    <h3 style="color: #2c3e50;">👤 Name: ${
                      document.getElementById("name").value
                    }</h3>
                    <p><strong> 📧 Email:</strong> ${
                      document.getElementById("email").value
                    }</p>
                    <p><strong> 🗣️ Subject:</strong> ${
                      document.getElementById("subject").value
                    }</p>
                    <p style="background-color: #f4f4f4; padding: 10px; border-radius: 5px;"><strong>Message:</strong></p>
                    <p style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; font-size: 16px;">
                        ${document.getElementById("message").value}
                    </p>
                </div>
            </body>
        </html>
        `,
    };

    // Show loading message
    document.querySelector(".loading").style.display = "block";

    // Send data to Flask API via fetch (AJAX)
    fetch("https://portfolio-server-40hp.onrender.com/api/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Hide loading message
        document.querySelector(".loading").style.display = "none";

        // Show success message
        if (data.success) {
          document.querySelector(".sent-message").style.display = "block";
        } else {
          document.querySelector(".error-message").textContent =
            "Something went wrong. Please try again!";
          document.querySelector(".error-message").style.display = "block";
        }
      })
      .catch((error) => {
        // Hide loading message and show error
        document.querySelector(".loading").style.display = "none";
        document.querySelector(".error-message").textContent =
          "Error: " + error.message;
        document.querySelector(".error-message").style.display = "block";
      });
  });
