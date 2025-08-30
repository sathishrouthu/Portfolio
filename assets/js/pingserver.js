function hitHealthCheck() {
  fetch("https://portfolio-server-40hp.onrender.com/api/health")
    .then((response) => response.json())
    .then((data) => {
      console.log("Health check successful:", data);
    })
    .catch((error) => {
      console.log("Error with health check:", error);
    });
}

// Hit the health check API every 15 minutes (900,000 ms)
setInterval(hitHealthCheck, 895000); // 15 minutes
