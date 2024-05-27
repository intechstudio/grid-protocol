const fs = require("fs");

// Read the package.json file
fs.readFile("package.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading package.json:", err);
    return;
  }

  // Parse JSON data
  const packageJson = JSON.parse(data);

  // Remove dependencies
  delete packageJson.dependencies;

  // Write modified package.json back to file
  fs.writeFile(
    "package.json",
    JSON.stringify(packageJson, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing package.json:", err);
        return;
      }
      console.log("Dependencies removed from package.json");
    }
  );
});
