// instagram.js

document.getElementById('showInstructionsLink').addEventListener('click', function(event) {
    event.preventDefault();
    var instructionsDiv = document.getElementById('instructions');
    instructionsDiv.style.display = (instructionsDiv.style.display === 'none' || instructionsDiv.style.display === '') ? 'block' : 'none';
  });
  

  document.getElementById("instagramForm").addEventListener("submit", async function(event) {
    event.preventDefault();
  
    const zipFile = document.getElementById("zipFile").files[0];
    const resultsDiv = document.getElementById("results");
  
    if (!zipFile) {
      alert("Please upload the Instagram data ZIP file.");
      return;
    }
  
    resultsDiv.innerHTML = `<p>Processing your ZIP file...</p>`;
  
    try {
      // Load the ZIP file using JSZip
      const zip = await JSZip.loadAsync(zipFile);
  
      // Define the expected paths for the JSON files
      const followersPath = "connections/followers_and_following/followers_1.json";
      const followingPath = "connections/followers_and_following/following.json";
      
      const followersFile = zip.file(followersPath);
      const followingFile = zip.file(followingPath);
      
      if (!followersFile || !followingFile) {
        resultsDiv.innerHTML = `<p>Error: Could not find the required JSON files in the uploaded ZIP. Please ensure the folder "connections/followers_and_following" contains "followers_1.json" and "following.json".</p>`;
        return;
      }
      
      // Read the JSON files as text
      const [followersText, followingText] = await Promise.all([
        followersFile.async("string"),
        followingFile.async("string")
      ]);
      
      // Parse the JSON files.
      // Followers file: an array of objects.
      const followersArray = JSON.parse(followersText);
      // Following file: an object with a key "relationships_following" which is an array.
      const followingJSON = JSON.parse(followingText);
      const followingArray = followingJSON.relationships_following || [];
      
      // Extract usernames from the followers file
      const followersUsernames = followersArray.map(item => {
        if (item.string_list_data && item.string_list_data.length > 0) {
          return item.string_list_data[0].value;
        }
        return null;
      }).filter(Boolean);
      
      // Extract usernames from the following file
      const followingUsernames = followingArray.map(item => {
        if (item.string_list_data && item.string_list_data.length > 0) {
          return item.string_list_data[0].value;
        }
        return null;
      }).filter(Boolean);
      
      // Compute unfollowers: accounts in following that are not in followers
      const unfollowers = followingUsernames.filter(username => !followersUsernames.includes(username));
      
      // Display results
      if (unfollowers.length === 0) {
        resultsDiv.innerHTML = `<p>Great news, everyone you follow follows you back!</p>`;
      } else {
        let listHTML = `<p>These accounts don't follow you back:</p><ul>`;
        unfollowers.forEach(user => {
          listHTML += `<li>@${user}</li>`;
        });
        listHTML += `</ul>`;
        resultsDiv.innerHTML = listHTML;
      }
    } catch (err) {
      console.error("Error processing ZIP file:", err);
      resultsDiv.innerHTML = `<p>Error processing the ZIP file. Please ensure it's the correct Instagram data download and try again.</p>`;
    }
  });
  