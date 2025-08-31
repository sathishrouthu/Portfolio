function pingServer() {
  const url = "https://portfolio-server-40hp.onrender.com/api/health";

  // Call the health check API 3 times
  for (let i = 0; i < 3; i++) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(`Health check ${i + 1} successful:`, data);
      })
      .catch((error) => {
        console.log(`Error with health check ${i + 1}:`, error);
      });
  }
}

window.addEventListener("load", pingServer);


// Run the function when the page load
